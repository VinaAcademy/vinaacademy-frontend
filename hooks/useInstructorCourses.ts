import { useState, useEffect, useCallback } from 'react'
import { getInstructorCourses } from '@/services/courseService'
import { PaginatedResponse } from '@/types/api-response'
import { CourseDto } from '@/types/course'
import { CourseType } from '@/types/instructor-course'
import { useAuth } from '@/context/AuthContext'
import { mapCoursesToUiModels } from '@/utils/courseMapper'

export function useInstructorCourses(
  initialPage = 0,
  initialSize = 10,
  initialKeyword = '',
) {
  const { isAuthenticated } = useAuth()
  const [courses, setCourses] = useState<CourseType[]>([])
  const [pagination, setPagination] = useState<Omit<
    PaginatedResponse<CourseDto>,
    'content'
  > | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(initialPage)
  const [size, setSize] = useState<number>(initialSize)
  const [keyword, setKeyword] = useState<string>(initialKeyword)
  const [sortBy, setSortBy] = useState<string>('createdDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const fetchCourses = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getInstructorCourses(
        page,
        size,
        sortBy,
        sortDirection,
        keyword,
      )

      if (response) {
        // Use the mapper to transform CourseDto to CourseType
        const transformedCourses = mapCoursesToUiModels(response.content)
        setCourses(transformedCourses)

        // Save pagination info
        const { content, ...paginationInfo } = response
        setPagination(paginationInfo)
      } else {
        setCourses([])
        setPagination(null)
        setError('Không thể tải danh sách khóa học')
      }
    } catch (err) {
      console.error('Error fetching instructor courses:', err)
      setError('Đã xảy ra lỗi khi tải danh sách khóa học')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, page, size, keyword, sortBy, sortDirection])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0) // Reset to first page when changing page size
  }

  const handleSortChange = (
    newSortBy: string,
    newSortDirection: 'asc' | 'desc',
  ) => {
    setSortBy(newSortBy)
    setSortDirection(newSortDirection)
  }

  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword)
    setPage(0) // Reset to first page when searching
  }

  const refreshCourses = () => {
    fetchCourses()
  }

  return {
    courses,
    pagination,
    loading,
    error,
    page,
    size,
    keyword,
    sortBy,
    sortDirection,
    handlePageChange,
    handleSizeChange,
    handleKeywordChange,
    handleSortChange,
    refreshCourses,
  }
}
