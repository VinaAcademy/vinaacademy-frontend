import { useEffect, useState } from 'react'
import { AlertCircle, Bookmark, Loader2, X } from 'lucide-react'
import { createSection, updateSection } from '@/services/sectionService'
import { toast } from 'react-toastify'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionDto } from '@/types/course'

interface SectionEditModalProps {
  section?: SectionDto
  courseId: string
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export const SectionEditModal = ({
  section,
  courseId,
  isOpen,
  onClose,
  onSave,
}: SectionEditModalProps) => {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Cập nhật title khi section thay đổi
  useEffect(() => {
    if (section) {
      setTitle(section.title)
    } else {
      setTitle('')
    }
    setError('')
  }, [section])

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setIsSubmitting(false)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho phần học')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Đảm bảo courseId không phải undefined
      if (!courseId) {
        throw new Error('Không tìm thấy thông tin khóa học')
      }

      const sectionData = {
        title: title.trim(),
        courseId: courseId, // Đảm bảo courseId đã được truyền vào
        orderIndex: section ? section.orderIndex : 0,
      }

      let result
      if (section) {
        // Cập nhật section hiện có
        result = await updateSection(section.id, sectionData)
        if (!result) {
          throw new Error('Không thể cập nhật phần học')
        }
        toast.success('Đã cập nhật phần học thành công')
      } else {
        // Tạo section mới
        result = await createSection(sectionData)
        if (!result) {
          throw new Error('Không thể tạo phần học mới')
        }
        toast.success('Đã tạo phần học mới thành công')
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Lỗi khi lưu phần học:', error)
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-500" />
              {section ? 'Chỉnh sửa phần học' : 'Thêm phần học mới'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-5">
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tiêu đề phần học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (error) setError('')
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'} focus:border-transparent outline-none transition-all duration-200`}
                  placeholder="Ví dụ: Phần 1: Giới thiệu về khóa học"
                  disabled={isSubmitting}
                  autoFocus
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {error}
                  </p>
                )}
              </div>

              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p>
                  <span className="font-medium">Mẹo:</span> Đặt tên phần học rõ
                  ràng giúp học viên hiểu được nội dung sẽ học.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-lg shadow-sm text-sm font-medium text-white transition-all ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </span>
                ) : (
                  'Lưu'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
