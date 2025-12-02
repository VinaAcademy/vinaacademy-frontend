// components/LectureEditModal.tsx
import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Video,
  FileText,
  LayoutList,
  AlertCircle,
  CheckCircle,
  Info,
  Paperclip,
} from 'lucide-react'
import { LectureDisplay } from '@/components/instructor/courses/edit-course-content/hooks/useCourseContent'
import { createLesson, updateLesson } from '@/services/lessonService'
import { LessonType } from '@/types/course'
import { MediaFileDto } from '@/types/lesson'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import AttachmentUploader from '@/components/instructor/lesson/AttachmentUploader'
import AttachmentList from '@/components/instructor/lesson/AttachmentList'

interface LectureEditModalProps {
  lecture?: LectureDisplay
  sectionId: string
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export const LectureEditModal = ({
  lecture,
  sectionId,
  isOpen,
  onClose,
  onSave,
}: LectureEditModalProps) => {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<LessonType>('VIDEO')
  const [description, setDescription] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [attachments, setAttachments] = useState<MediaFileDto[]>([])

  // Cập nhật state khi lecture thay đổi
  useEffect(() => {
    if (lecture) {
      setTitle(lecture.title)
      setType(lecture.type.toUpperCase() as LessonType)
      setDescription(lecture.description || '')
      setIsFree(lecture.free || false)
      setContent(lecture.content || '')
      setAttachments(lecture.attachments || [])
    } else {
      // Giá trị mặc định cho bài giảng mới
      setTitle('')
      setType('VIDEO')
      setDescription('')
      setIsFree(false)
      setContent('')
      setAttachments([])
    }
    setError('')
  }, [lecture])

  // Reset form khi modal đóng
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false)
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho bài giảng')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Tạo đối tượng lectureData theo cấu trúc LessonRequest
      const lectureData = {
        title: title.trim(),
        sectionId: sectionId,
        type: type,
        description: description.trim(),
        free: isFree,
        orderIndex: lecture ? lecture.order : 0,
        attachmentIds: attachments.map((att) => att.id), // Thêm attachment IDs
      }

      // Thêm các trường tùy theo loại bài giảng
      if (type === 'VIDEO') {
        Object.assign(lectureData, {
          status: 'PROCESSING',
        })
      } else if (type === 'READING' || type === 'QUIZ') {
        Object.assign(lectureData, {
          content: content,
        })
      }
      if (type === 'QUIZ') {
        Object.assign(lectureData, {
          passPoint: 60,
          totalPoint: 100,
          duration: 60 * 30, // 30 phút
        })
      }

      let result
      if (lecture) {
        // Cập nhật bài giảng hiện có
        result = await updateLesson(lecture.id, lectureData)
        if (!result) {
          throw new Error('Không thể cập nhật bài giảng')
        }
        toast.success('Đã cập nhật bài giảng thành công')
      } else {
        // Tạo bài giảng mới
        result = await createLesson(lectureData)
        if (!result) {
          throw new Error('Không thể tạo bài giảng mới')
        }
        toast.success('Đã tạo bài giảng mới thành công')
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Lỗi khi lưu bài giảng:', error)
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeIcon = (lessonType: LessonType) => {
    switch (lessonType) {
      case 'VIDEO':
        return <Video className="h-6 w-6 text-blue-500" />
      case 'READING':
        return <FileText className="h-6 w-6 text-green-500" />
      case 'QUIZ':
        return <LayoutList className="h-6 w-6 text-purple-500" />
      default:
        return <FileText className="h-6 w-6 text-gray-500" />
    }
  }

  const getTypeStyle = (lessonType: LessonType, selectedType: LessonType) => {
    const isSelected = lessonType === selectedType
    switch (lessonType) {
      case 'VIDEO':
        return isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      case 'READING':
        return isSelected
          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
      case 'QUIZ':
        return isSelected
          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
      default:
        return isSelected
          ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4" // Increased z-index to 100
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {getTypeIcon(type)}
              {lecture ? 'Chỉnh sửa bài giảng' : 'Thêm bài giảng mới'}
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

          <div className="overflow-y-auto flex-grow">
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-5">
                {/* Tiêu đề bài giảng */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tiêu đề bài giảng <span className="text-red-500">*</span>
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
                    placeholder="Nhập tiêu đề bài giảng"
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

                {/* Loại bài giảng */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bài giảng <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => !lecture && setType('VIDEO')}
                      disabled={!!lecture}
                      className={`flex flex-col items-center p-4 rounded-lg border transition-all ${getTypeStyle('VIDEO', type)} ${!!lecture ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Video
                        className={`h-7 w-7 ${type === 'VIDEO' ? 'text-blue-600' : 'text-gray-400'} mb-2`}
                      />
                      <span
                        className={`text-sm font-medium ${type === 'VIDEO' ? 'text-blue-700' : 'text-gray-600'}`}
                      >
                        Video
                      </span>
                      {type === 'VIDEO' && (
                        <CheckCircle className="h-5 w-5 text-blue-500 mt-2" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => !lecture && setType('READING')}
                      disabled={!!lecture}
                      className={`flex flex-col items-center p-4 rounded-lg border transition-all ${getTypeStyle('READING', type)} ${!!lecture ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <FileText
                        className={`h-7 w-7 ${type === 'READING' ? 'text-green-600' : 'text-gray-400'} mb-2`}
                      />
                      <span
                        className={`text-sm font-medium ${type === 'READING' ? 'text-green-700' : 'text-gray-600'}`}
                      >
                        Bài đọc
                      </span>
                      {type === 'READING' && (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-2" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => !lecture && setType('QUIZ')}
                      disabled={!!lecture}
                      className={`flex flex-col items-center p-4 rounded-lg border transition-all ${getTypeStyle('QUIZ', type)} ${!!lecture ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <LayoutList
                        className={`h-7 w-7 ${type === 'QUIZ' ? 'text-purple-600' : 'text-gray-400'} mb-2`}
                      />
                      <span
                        className={`text-sm font-medium ${type === 'QUIZ' ? 'text-purple-700' : 'text-gray-600'}`}
                      >
                        Kiểm tra
                      </span>
                      {type === 'QUIZ' && (
                        <CheckCircle className="h-5 w-5 text-purple-500 mt-2" />
                      )}
                    </button>
                  </div>
                  {lecture && (
                    <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                      <Info className="h-3.5 w-3.5 mr-1" />
                      Loại bài giảng không thể thay đổi sau khi đã tạo
                    </p>
                  )}
                </div>

                {/* Mô tả */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mô tả bài giảng
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Mô tả ngắn gọn về nội dung bài giảng"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Tùy chọn miễn phí */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="free-lesson"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="free-lesson"
                      className="ml-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <span className="font-medium">Bài giảng miễn phí</span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Học viên chưa mua khóa học vẫn xem được nội dung này
                      </span>
                    </label>
                  </div>
                </div>

                {/* Tài liệu đính kèm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Tài liệu đính kèm
                  </label>

                  {/* Hiển thị danh sách attachments hiện có */}
                  {attachments.length > 0 && (
                    <div className="mb-3">
                      <AttachmentList
                        attachments={attachments}
                        onRemove={(fileId) => {
                          setAttachments((prev) =>
                            prev.filter((att) => att.id !== fileId),
                          )
                        }}
                        editable={!isSubmitting}
                      />
                    </div>
                  )}

                  {/* Uploader */}
                  <AttachmentUploader
                    onFileUploaded={(file) => {
                      setAttachments((prev) => [...prev, file])
                    }}
                    disabled={isSubmitting}
                    maxSizeMB={50}
                  />
                </div>

                {/* Nội dung cho Reading/Quiz */}
                {type === 'READING' && (
                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung bài học
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                      rows={6}
                      placeholder="Nhập nội dung bài đọc hoặc mô tả chi tiết bài kiểm tra"
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Bạn có thể chỉnh sửa chi tiết nội dung sau khi tạo bài
                      giảng
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex justify-end mt-2">
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
                    'Lưu bài giảng'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
