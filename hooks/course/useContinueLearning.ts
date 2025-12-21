import { LearningCourse } from '@/types/navbar'
import {
  EnrollmentResponse,
  getUserEnrollments,
} from '@/services/enrollmentService'
import { useQuery } from '@tanstack/react-query'
import { COURSE_KEYS } from '@/config/query-keys.config'

interface UseContinueLearningOptions {
  limit?: number
  enabled?: boolean
}

export function useContinueLearning({
  limit = 3,
  enabled = true,
}: UseContinueLearningOptions = {}) {
  // Hàm định dạng thời gian truy cập gần nhất
  const formatLastAccessed = (lastAccessed: string | undefined): string => {
    if (!lastAccessed) return 'Chưa truy cập'

    try {
      const date = new Date(lastAccessed)
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        // Thử chuyển đổi từ định dạng DD/MM/YYYY
        if (lastAccessed.includes('/')) {
          const [day, month, year] = lastAccessed.split('/')
          const newDate = new Date(`${year}-${month}-${day}`)
          if (!isNaN(newDate.getTime())) {
            return newDate.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          }
        }
        return 'Định dạng ngày không hợp lệ'
      }

      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error, lastAccessed)
      return 'Lỗi định dạng'
    }
  }

  // Sử dụng React Query để tải và quản lý danh sách khóa học đang học
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: COURSE_KEYS.continueLearning(limit),
    queryFn: async () => {
      try {
        return await getUserEnrollments(0, limit, 'IN_PROGRESS')
      } catch (err) {
        console.error('Lỗi khi tải khóa học đang học:', err)
        // Sử dụng dữ liệu giả nếu API bị lỗi
        return {
          content: [],
          totalPages: 1,
          totalElements: 0,
        }
      }
    },
    enabled, // Chỉ tải khi component đã sẵn sàng
  })

  // Chuyển đổi dữ liệu thành định dạng LearningCourse
  const continueLearningCourses: LearningCourse[] = data?.content
    ? data.content.map((enrollment: EnrollmentResponse) => {
        const lastAccessedDate = enrollment.lastAccessedAt || ''
        return {
          id: String(enrollment.courseId),
          name: enrollment.courseName,
          slug: enrollment.courseSlug,
          courseStatus: enrollment.courseStatus,
          image: enrollment.courseImage || '/images/course-placeholder.jpg',
          instructor: formatLastAccessed(lastAccessedDate), // Thời gian truy cập thay vì tên giảng viên
          progress: enrollment.progressPercentage || 0,
          completedLessons: enrollment.completedLessons || 0,
          totalLessons: enrollment.totalLessons || 0,
          category: enrollment.category || '',
          lastAccessed: lastAccessedDate,
          enrollmentId: enrollment.id,
        }
      })
    : []

  // Hàm hỗ trợ chuyển đổi các định dạng ngày khác nhau thành timestamp
  const getTimestamp = (dateStr: string | undefined): number => {
    if (!dateStr) return 0

    try {
      if (dateStr.includes('/')) {
        // Định dạng DD/MM/YYYY
        const [day, month, year] = dateStr.split('/')
        return new Date(`${year}-${month}-${day}`).getTime()
      } else {
        // Định dạng ISO hoặc định dạng khác
        return new Date(dateStr).getTime()
      }
    } catch (error) {
      console.error('Lỗi chuyển đổi ngày tháng:', error, dateStr)
      return 0
    }
  }

  // Sắp xếp khóa học theo thời gian truy cập gần nhất
  const sortedCourses = [...continueLearningCourses]
    .sort((a, b) => getTimestamp(b.lastAccessed) - getTimestamp(a.lastAccessed))
    .slice(0, limit) // Chỉ lấy đúng số lượng khóa học theo limit (mặc định là 3)

  return {
    courses: sortedCourses,
    isLoading,
    error,
    refetch,
  }
}
