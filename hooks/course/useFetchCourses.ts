import { LearningCourse } from '@/types/navbar'
import {
  getUserEnrollments,
  EnrollmentResponse,
} from '@/services/enrollmentService'
import { useQuery } from '@tanstack/react-query'
import { COURSE_KEYS } from '@/config/query-keys.config'

type TabType = 'all' | 'inProgress' | 'completed'

export function useFetchCourses(
  activeTab: TabType,
  currentPage: number,
  pageSize: number = 10,
) {
  // Convert activeTab to API status format
  const getStatusFromTab = ():
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'PAUSED'
    | undefined => {
    switch (activeTab) {
      case 'inProgress':
        return 'IN_PROGRESS'
      case 'completed':
        return 'COMPLETED'
      default:
        return undefined
    }
  }

  const status = getStatusFromTab()

  // Use useQuery to fetch and cache data
  const { data, error, isLoading, isPending, isError, refetch } = useQuery({
    queryKey: COURSE_KEYS.byTab({ activeTab, currentPage, pageSize, status }),
    queryFn: async () => {
      try {
        return await getUserEnrollments(currentPage, pageSize, status)
      } catch (err) {
        console.error('Lỗi khi tải danh sách khóa học:', err)
        return {
          content: [],
          totalPages: 1,
          currentPage: 0,
        }
      }
    },
  })

  // Process the data
  const courses: LearningCourse[] = data?.content
    ? data.content.map((enrollment: EnrollmentResponse) => ({
        id: String(enrollment.courseId),
        name: enrollment.courseName,
        slug: enrollment.courseSlug,
        image: enrollment.courseImage || '/images/course-placeholder.jpg',
        instructor: enrollment.instructorName || enrollment.instructor || '',
        progress: enrollment.progressPercentage?.toFixed(0) || 0,
        completedLessons: enrollment.completedLessons || 0,
        totalLessons: enrollment.totalLessons || 0,
        category: enrollment.category || '',
        lastAccessed: enrollment.lastAccessedAt || '',
        enrollmentId: enrollment.id,
      }))
    : []

  const totalPages = data?.totalPages || 1

  return {
    courses,
    totalPages,
    isLoading: isLoading || isPending,
    isError,
    error,
    refetch,
  }
}
