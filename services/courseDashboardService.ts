import apiClient from '@/lib/apiClient'

export interface MonthlyGrowth {
  courses: number
  published: number
  pending: number
  revenue: number
}

export interface CourseDashboardStats {
  totalCourses: number
  publishedCourses: number
  pendingCourses: number
  avgRevenuePerCourse: number
  monthlyGrowth: MonthlyGrowth
}

export interface CategoryStats {
  categoryId: string
  categoryName: string
  categorySlug: string
  count: number
  percentage: number
}

export interface CategoryDistribution {
  categories: CategoryStats[]
  totalCourses: number
}

export interface MonthlyTrend {
  month: string
  created: number
  published: number
}

export interface CourseTrend {
  trends: MonthlyTrend[]
}

export interface TopCourse {
  id: string
  title: string
  instructor: string
  thumbnail: string
  students: number
  rating: number
  revenue: number
}

export interface TopCourses {
  courses: TopCourse[]
}

export interface TopInstructor {
  instructorId: string
  name: string
  courseCount: number
  totalStudents: number
  avgRating: number
  revenue: number
}

export interface TopInstructors {
  instructors: TopInstructor[]
}

export interface RecentCourse {
  id: string
  title: string
  instructor: string
  thumbnail: string
  publishedDate: string
  category: string
}

export interface RecentCourses {
  courses: RecentCourse[]
}

export interface Metrics {
  approvalRate: number
  avgApprovalTime: number
  rejectionRate: number
}

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  count: number
  action?: string
  link?: string
}

export interface AlertsAndMetrics {
  metrics: Metrics
  alerts: Alert[]
}

/**
 * Get dashboard statistics for admin course management
 * Includes total counts, revenue, and monthly growth percentages
 */
export async function getDashboardStats(): Promise<CourseDashboardStats> {
  const response = await apiClient.get('/v1/courses/dashboard/stats')
  // Backend returns ApiResponse wrapper, extract data
  const data = response.data?.data || response.data

  console.log('Dashboard stats response:', data)

  return data as CourseDashboardStats
}

/**
 * Get category distribution statistics
 * Includes course counts and percentages per category
 */
export async function getCategoryDistribution(): Promise<CategoryDistribution> {
  const response = await apiClient.get(
    '/v1/courses/dashboard/category-distribution',
  )
  const data = response.data?.data || response.data

  console.log('Category distribution response:', data)

  return data as CategoryDistribution
}

/**
 * Get course trend statistics
 * Includes monthly data for courses created and published
 */
export async function getCourseTrend(months: number = 6): Promise<CourseTrend> {
  const response = await apiClient.get('/v1/courses/dashboard/trend', {
    params: { months },
  })
  const data = response.data?.data || response.data

  console.log('Course trend response:', data)

  return data as CourseTrend
}

/**
 * Get top courses statistics
 * Includes ranking of top performing courses
 */
export async function getTopCourses(limit: number = 10): Promise<TopCourses> {
  const response = await apiClient.get('/v1/courses/dashboard/top-courses', {
    params: { limit },
  })
  const data = response.data?.data || response.data

  console.log('Top courses response:', data)

  return data as TopCourses
}

/**
 * Get top instructors statistics
 * Includes ranking of top performing instructors
 */
export async function getTopInstructors(
  limit: number = 10,
): Promise<TopInstructors> {
  const response = await apiClient.get(
    '/v1/courses/dashboard/top-instructors',
    {
      params: { limit },
    },
  )
  const data = response.data?.data || response.data

  console.log('Top instructors response:', data)

  return data as TopInstructors
}

/**
 * Get recent published courses
 * Includes recently published courses ordered by publish date
 */
export async function getRecentCourses(
  limit: number = 12,
): Promise<RecentCourses> {
  const response = await apiClient.get('/v1/courses/dashboard/recent-courses', {
    params: { limit },
  })
  const data = response.data?.data || response.data

  console.log('Recent courses response:', data)

  return data as RecentCourses
}

/**
 * Get alerts and performance metrics
 * Includes approval rate, average approval time, rejection rate, and dynamic alerts
 */
export async function getAlertsAndMetrics(): Promise<AlertsAndMetrics> {
  const response = await apiClient.get('/v1/courses/dashboard/alerts-metrics')
  const data = response.data?.data || response.data

  console.log('Alerts and metrics response:', data)

  return data as AlertsAndMetrics
}
