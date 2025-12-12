'use client'

import apiClient from '@/lib/apiClient'
import { AxiosResponse } from 'axios'
import { ApiResponse } from '@/types/api-response'

/**
 * Interface cho Dashboard Statistics Response
 */
export interface DashboardStatisticsDto {
  revenue: RevenueStats
  newStudents: StudentStats
  averageRating: RatingStats
  totalCourses: number
  completionRate: number
}

export interface RevenueStats {
  current: number
  change: number
  isIncrease: boolean
}

export interface StudentStats {
  current: number
  change: number
  isIncrease: boolean
}

export interface RatingStats {
  current: number
  totalReviews: number
}

/**
 * Interface cho Course Overview Response
 */
export interface CourseOverviewDto {
  summary: CourseSummary
  courses: CourseDetail[]
}

export interface CourseSummary {
  totalCourses: number
  averageCompletionRate: number
  totalStudents: number
  totalRevenue: number
}

export interface CourseDetail {
  id: string
  name: string
  students: number
  rating: number
  totalReviews: number
  revenue: number
  price: number
  completionRate: number
  lastUpdated: string // ISO date string
  status: string
}

/**
 * Interface cho Recent Activities Response
 */
export interface RecentActivitiesDto {
  recentEnrollments: EnrollmentActivity[]
  recentReviews: ReviewActivity[]
}

export interface EnrollmentActivity {
  id: number
  studentName: string
  studentAvatar?: string
  courseName: string
  enrolledAt: string // ISO date string
}

export interface ReviewActivity {
  id: number
  studentName: string
  studentAvatar?: string
  courseName: string
  rating: number
  comment?: string
  reviewedAt: string // ISO date string
}

/**
 * Interface cho Revenue Chart Response
 */
export interface RevenueChartDto {
  data: RevenueDataPoint[]
}

export interface RevenueDataPoint {
  name: string
  revenue: number
}

/**
 * Interface cho Students Chart Response
 */
export interface StudentsChartDto {
  data: StudentDataPoint[]
}

export interface StudentDataPoint {
  name: string
  students: number
}

/**
 * Lấy thống kê dashboard cho giảng viên
 * @param timeRange - Khoảng thời gian: 'WEEK' | 'MONTH' | 'YEAR'
 * @returns Dashboard statistics hoặc null nếu có lỗi
 */
export const getDashboardStatistics = async (
  timeRange: 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH',
): Promise<DashboardStatisticsDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<DashboardStatisticsDto>> =
      await apiClient.get('/instructor/dashboard/statistics', {
        params: { timeRange },
      })
    return response.data.data
  } catch (error) {
    console.error('getDashboardStatistics error:', error)
    return null
  }
}

/**
 * Lấy tổng quan các khóa học của giảng viên
 * @param sortBy - Sắp xếp theo: 'POPULAR' | 'RECENT' | 'REVENUE'
 * @returns Course overview hoặc null nếu có lỗi
 */
export const getCourseOverview = async (
  sortBy: 'POPULAR' | 'RECENT' | 'REVENUE' = 'POPULAR',
): Promise<CourseOverviewDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<CourseOverviewDto>> =
      await apiClient.get('/instructor/dashboard/courses-overview', {
        params: { sortBy },
      })
    return response.data.data
  } catch (error) {
    console.error('getCourseOverview error:', error)
    return null
  }
}

/**
 * Lấy các hoạt động gần đây (đăng ký mới, đánh giá mới)
 * @param limit - Số lượng items tối đa cho mỗi loại hoạt động (default: 5)
 * @returns Recent activities hoặc null nếu có lỗi
 */
export const getRecentActivities = async (
  limit: number = 5,
): Promise<RecentActivitiesDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<RecentActivitiesDto>> =
      await apiClient.get('/instructor/dashboard/recent-activities', {
        params: { limit },
      })
    return response.data.data
  } catch (error) {
    console.error('getRecentActivities error:', error)
    return null
  }
}

/**
 * Lấy dữ liệu biểu đồ doanh thu theo thời gian
 * @param period - Khoảng thời gian: 'WEEK' | 'MONTH' | 'YEAR' (default: MONTH)
 * @returns Revenue chart data hoặc null nếu có lỗi
 */
export const getRevenueChart = async (
  period: 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH',
): Promise<RevenueChartDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<RevenueChartDto>> =
      await apiClient.get('/instructor/dashboard/revenue-chart', {
        params: { period },
      })
    return response.data.data
  } catch (error) {
    console.error('getRevenueChart error:', error)
    return null
  }
}

/**
 * Lấy dữ liệu biểu đồ số lượng học viên theo thời gian
 * @param period - Khoảng thời gian: 'WEEK' | 'MONTH' | 'YEAR' (default: MONTH)
 * @returns Students chart data hoặc null nếu có lỗi
 */
export const getStudentsChart = async (
  period: 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH',
): Promise<StudentsChartDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<StudentsChartDto>> =
      await apiClient.get('/instructor/dashboard/students-chart', {
        params: { period },
      })
    return response.data.data
  } catch (error) {
    console.error('getStudentsChart error:', error)
    return null
  }
}
