import { useQuery } from '@tanstack/react-query'
import { CourseSearchRequest } from '@/types/course'
import { aiSearchCourses, searchCourses } from '@/services/courseService'
import { COURSE_KEYS } from '@/config/query-keys.config'

interface UseCoursesProps {
  keyword?: string
  categorySlug?: string
  categorieSlugs?: string[] // Support multiple categories filter
  instructorId?: string
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  language?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  status?: 'PUBLISHED' | 'PENDING' | 'DRAFT' | 'REJECTED'
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  aiSearchEnabled?: boolean
}

export const useCourses = ({
  keyword,
  categorySlug,
  categorieSlugs,
  instructorId,
  level,
  language,
  minPrice,
  maxPrice,
  minRating,
  status = 'PUBLISHED', // Default: only published courses
  page = 0,
  size = 8,
  sortBy = 'createdDate',
  sortDirection = 'desc',
  aiSearchEnabled = false,
}: UseCoursesProps = {}) => {
  const searchRequest: CourseSearchRequest = {
    keyword,
    categorySlug,
    categorieSlugs,
    instructorId,
    level,
    language,
    minPrice,
    maxPrice,
    minRating,
    status,
  }
  console.log('useCourses - AI Search Enabled:', aiSearchEnabled)
  console.log('useCourses - Keyword:', keyword)
  console.log('useCourses - Page:', page)
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: COURSE_KEYS.list({
      keyword,
      categorySlug,
      categorieSlugs,
      instructorId,
      level,
      language,
      minPrice,
      maxPrice,
      minRating,
      status,
      page,
      size,
      sortBy,
      sortDirection,
      aiSearchEnabled,
    }),
    queryFn: () => {
      console.log('QueryFn executing with aiSearchEnabled:', aiSearchEnabled)
      if (aiSearchEnabled) {
        console.log('Fetching courses with AI search...')
        return aiSearchCourses(searchRequest, page, size)
      } else {
        console.log('Fetching courses with standard search...')
        return searchCourses(searchRequest, page, size, sortBy, sortDirection)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
   
  })

  return {
    courses: data?.content || [],
    loading: isLoading,
    error: isError
      ? error instanceof Error
        ? error.message
        : 'Đã xảy ra lỗi khi tải dữ liệu khóa học.'
      : null,
    totalItems: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    refetch,
  }
}
