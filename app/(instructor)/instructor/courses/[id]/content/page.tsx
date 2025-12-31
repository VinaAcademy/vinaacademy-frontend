'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'
import { CourseContentHeader } from '@/components/instructor/courses/edit-course-content/CourseContentHeader'
import { CourseContentBody } from '@/components/instructor/courses/edit-course-content/CourseContentBody'
import { useCourseContent } from '@/components/instructor/courses/edit-course-content/hooks/useCourseContent'
import { SectionEditModal } from '@/components/instructor/courses/SectionEditModal'
import { getCourseById } from '@/services/courseService'
import { CourseDto } from '@/types/course'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from '@/components/shared/ErrorFallback'
import { getImageUrl } from '@/utils/imageUtils'
import '@/components/instructor/courses/edit-course-content/drag-drop.css'

export default function CourseContentPage() {
  const params = useParams()
  const courseId = params.id as string
  const [isAddSectionModalOpen, setAddSectionModalOpen] = useState(false)
  const [courseInfo, setCourseInfo] = useState<CourseDto | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch course info for header
  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const course = await getCourseById(courseId)
        setCourseInfo(course)
      } catch (error) {
        console.error('Error fetching course info:', error)
      }
    }

    fetchCourseInfo()
  }, [courseId])

  const {
    sections,
    expandedSections,
    isDragging,
    isLoading,
    error,
    setIsDragging,
    toggleSection,
    addSection,
    deleteSection,
    addLecture,
    deleteLecture,
    saveAllChanges,
    fetchSections,
    handleDragEnd,
  } = useCourseContent(courseId)

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true)
      await saveAllChanges()
      toast.success('Tất cả thay đổi đã được lưu thành công!', {
        position: 'bottom-right',
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Lỗi khi lưu thay đổi:', error)
      toast.error('Đã xảy ra lỗi khi lưu thay đổi. Vui lòng thử lại!', {
        position: 'bottom-right',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSection = () => {
    setAddSectionModalOpen(true)
  }

  const handleSectionAdded = () => {
    fetchSections()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Đang tải nội dung khóa học...
          </h3>
          <p className="text-gray-500 text-center">
            Hệ thống đang tải nội dung khóa học của bạn. Quá trình này sẽ chỉ
            mất vài giây.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center max-w-md w-full">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không thể tải nội dung
          </h3>
          <p className="text-gray-500 text-center mb-4">
            Đã xảy ra lỗi khi tải nội dung khóa học. Vui lòng thử lại sau.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-50">
        {/* Header Component with course info */}
        <CourseContentHeader
          courseId={courseId}
          courseName={courseInfo?.name}
          courseImage={getImageUrl(courseInfo?.image || '')}
          courseStatus={courseInfo?.status}
          onAddSection={handleAddSection}
        />

        {/* Main Content Component */}
        <CourseContentBody
          sections={sections}
          courseId={courseId}
          expandedSections={expandedSections}
          isDragging={isDragging}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          toggleSection={toggleSection}
          deleteSection={deleteSection}
          addLecture={addLecture}
          deleteLecture={deleteLecture}
          onSectionUpdated={fetchSections}
          onLectureUpdated={fetchSections}
        />

        {/* Footer Component */}
        {/* <CourseContentFooter
                    onSaveDraft={handleSaveDraft}
                    isSaving={isSaving}
                    hasChanges={true}
                /> */}

        {/* Modal thêm phần học mới */}
        <SectionEditModal
          courseId={courseId}
          isOpen={isAddSectionModalOpen}
          onClose={() => setAddSectionModalOpen(false)}
          onSave={handleSectionAdded}
        />
      </div>
    </ErrorBoundary>
  )
}
