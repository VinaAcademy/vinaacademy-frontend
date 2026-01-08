'use client'

import { use, useEffect, useState } from 'react'
import CourseGridView from '@/components/instructor/courses/CourseGridView'
import CourseListView from '@/components/instructor/courses/CourseListView'
import SearchAndFilterBar from '@/components/instructor/courses/SearchAndFilterBar'
import { Spinner } from '@/components/common/spinner'
import { useAuth } from '@/context/AuthContext'
import { CoursesPagination } from '@/components/courses/all-courses/CoursesPagination'
import { useRouter } from 'next/navigation'
import { createSuccessToast } from '@/components/ui/toast-cus'
import { useInstructorCourses } from '@/hooks/useInstructorCourses'
import { useDebounce } from '@/hooks/useDebounce'

export default function InstructorCoursesPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    courses,
    pagination,
    loading,
    error,
    page,
    keyword,
    handlePageChange,
    handleKeywordChange,
    refreshCourses,
  } = useInstructorCourses(0, 8)

  // Kiểm tra nếu user có role là instructor
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      !user.roles.some((role) => role.code === 'INSTRUCTOR')
    ) {
      router.push('/instructor/courses')
    }
  }, [isAuthenticated, user, router])

  // Kiểm tra thông báo tạo khóa học thành công
  useEffect(() => {
    const toastData = sessionStorage.getItem('createdCourse')
    if (toastData) {
      const { title, id } = JSON.parse(toastData)
      sessionStorage.removeItem('createdCourse')

      createSuccessToast(`Khóa học "${title}" đã được tạo thành công.`)

      // Làm mới danh sách khóa học
      refreshCourses()
    }
  }, [refreshCourses])

  // Update search keyword when debounced search term changes
  useEffect(() => {
    handleKeywordChange(debouncedSearchTerm)
  }, [debouncedSearchTerm, handleKeywordChange])

  // Simple search handler - just update local state
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục.</p>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Khóa học của tôi
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <SearchAndFilterBar
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
          ) : courses.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <p className="text-gray-600 mb-4">
                {keyword
                  ? 'Không tìm thấy khóa học nào phù hợp.'
                  : 'Bạn chưa có khóa học nào.'}
              </p>
              {!keyword && (
                <button
                  onClick={() => router.push('/instructor/courses/new')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Tạo khóa học mới
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <CourseGridView courses={courses} />
              ) : (
                <CourseListView courses={courses} />
              )}

              {/* Phân trang */}
              {pagination && pagination.totalPages > 1 && (
                <CoursesPagination
                  currentPage={page + 1}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => handlePageChange(p - 1)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
