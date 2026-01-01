import apiClient from '@/lib/apiClient'

// ==================== Type Definitions ====================

export interface PlatformStats {
  totalUsers: number
  userChange: number
  totalCourses: number
  courseChange: number
  totalInstructors: number
  instructorChange: number
  totalRevenue: number
  revenueChange: number
  timeRange: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  courses: number
}

export interface RevenueDistribution {
  categoryName: string
  percentage: number
  amount: number
}

export interface RevenueOverview {
  monthlyRevenue: MonthlyRevenue[]
  distribution: RevenueDistribution[]
  yearlyRevenue: number
  platformFee: number
  instructorEarnings: number
  averageOrderValue: number
}

export interface MonthlyUsers {
  month: string
  activeUsers: number
  newUsers: number
}

export interface DevicePlatform {
  mobilePercentage: number
  desktopPercentage: number
  tabletPercentage: number
}

export interface ActiveUsers {
  monthlyData: MonthlyUsers[]
  totalUsers: number
  userGrowth: number
  studentCount: number
  studentPercentage: number
  instructorCount: number
  instructorPercentage: number
  retentionRate: number
  deviceStats: DevicePlatform
}

export interface RecentCourse {
  id: string
  title: string
  thumbnail: string
  enrollmentCount: number
  status: string
  createdAt: string
}

export interface RecentInstructor {
  userId: string
  name: string
  initials: string
  expertise: string
  joinedAt: string
}

export interface RecentReview {
  studentName: string
  studentInitials: string
  rating: number
  comment: string
  courseTitle: string
  createdAt: string
}

export interface RecentActivities {
  recentCourses: RecentCourse[]
  recentInstructors: RecentInstructor[]
  recentReviews: RecentReview[]
}

export interface QuickActions {
  pendingCourses: number
  pendingWithdrawals: number
  reportedViolations: number
  pendingSupports: number
}

// ==================== API Service Functions ====================

/**
 * Get platform statistics
 *
 * @param timeRange - 'week', 'month', or 'year'
 * @returns Platform statistics including users, courses, instructors, revenue
 */
export async function getPlatformStats(
  timeRange: 'week' | 'month' | 'year' = 'month',
): Promise<PlatformStats> {
  try {
    const response = await apiClient.get('/v1/admin/dashboard/platform-stats', {
      params: { timeRange },
    })
    const data = response.data?.data || response.data
    console.log('Platform stats response:', data)
    return data as PlatformStats
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    throw error
  }
}

/**
 * Get revenue overview with monthly data and category distribution
 *
 * @returns Revenue overview for the last 12 months
 */
export async function getRevenueOverview(): Promise<RevenueOverview> {
  try {
    const response = await apiClient.get('/v1/admin/dashboard/revenue-overview')
    const data = response.data?.data || response.data
    console.log('Revenue overview response:', data)
    return data as RevenueOverview
  } catch (error) {
    console.error('Error fetching revenue overview:', error)
    throw error
  }
}

/**
 * Get active users statistics with monthly trends
 *
 * @returns Active users data including monthly trends and demographics
 */
export async function getActiveUsers(): Promise<ActiveUsers> {
  try {
    const response = await apiClient.get('/v1/admin/dashboard/active-users')
    const data = response.data?.data || response.data
    console.log('Active users response:', data)
    return data as ActiveUsers
  } catch (error) {
    console.error('Error fetching active users:', error)
    throw error
  }
}

/**
 * Get recent activities including courses, instructors, and reviews
 *
 * @returns Recent activities data (last 5 items each)
 */
export async function getRecentActivities(): Promise<RecentActivities> {
  try {
    const response = await apiClient.get(
      '/v1/admin/dashboard/recent-activities',
    )
    const data = response.data?.data || response.data
    console.log('Recent activities response:', data)
    return data as RecentActivities
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    throw error
  }
}

/**
 * Get quick actions counts (pending items)
 *
 * @returns Counts of items requiring admin attention
 */
export async function getQuickActions(): Promise<QuickActions> {
  try {
    const response = await apiClient.get('/v1/admin/dashboard/quick-actions')
    const data = response.data?.data || response.data
    console.log('Quick actions response:', data)
    return data as QuickActions
  } catch (error) {
    console.error('Error fetching quick actions:', error)
    throw error
  }
}
