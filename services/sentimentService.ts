/**
 * Sentiment Analysis Service
 * Handles API calls to backend sentiment analysis endpoints
 */

import apiClient from '@/lib/apiClient'
import {
  ProsConsResponse,
  ReviewWithSentimentDto,
  SentimentDashboardResponse,
  FlaggedReviewDto,
  ModerationStatistics,
  ModerationActionRequest,
  SentimentType,
  ModerationStatus,
  ApiResponse,
  PageResponse,
} from '@/types/sentiment'

const BASE_PATH = '/reviews/sentiment'

// ========== STUDENT APIs ==========

/**
 * Lấy tóm tắt điểm cộng/điểm trừ của khóa học
 * @param courseId ID khóa học
 * @param limit Số lượng pros/cons tối đa (default: 10)
 */
export const getProsConsSummary = async (
  courseId: string,
  limit: number = 10,
): Promise<ProsConsResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<ProsConsResponse>>(
      `${BASE_PATH}/course/${courseId}/pros-cons`,
      { params: { limit } },
    )
    return response.data.data
  } catch (error) {
    console.error('Error getting pros/cons summary:', error)
    throw error
  }
}

/**
 * Lấy danh sách đánh giá theo cảm xúc với phân trang
 * @param courseId ID khóa học
 * @param sentiment Loại sentiment để filter (optional)
 * @param page Số trang (bắt đầu từ 0)
 * @param size Kích thước trang
 */
export const getReviewsBySentiment = async (
  courseId: string,
  sentiment?: SentimentType,
  page: number = 0,
  size: number = 10,
): Promise<PageResponse<ReviewWithSentimentDto>> => {
  try {
    const params: any = { page, size }
    if (sentiment) {
      params.sentiment = sentiment
    }

    const response = await apiClient.get<
      ApiResponse<PageResponse<ReviewWithSentimentDto>>
    >(`${BASE_PATH}/course/${courseId}`, { params })
    return response.data.data
  } catch (error) {
    console.error('Error getting reviews by sentiment:', error)
    throw error
  }
}

// ========== INSTRUCTOR APIs ==========

/**
 * Lấy dashboard phân tích sentiment cho giảng viên
 * @param courseId ID khóa học
 * @param startDate Ngày bắt đầu (optional, ISO format)
 * @param endDate Ngày kết thúc (optional, ISO format)
 */
export const getInstructorDashboard = async (
  courseId: string,
  startDate?: string,
  endDate?: string,
): Promise<SentimentDashboardResponse> => {
  try {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await apiClient.get<
      ApiResponse<SentimentDashboardResponse>
    >(`${BASE_PATH}/course/${courseId}/dashboard`, { params })
    return response.data.data
  } catch (error) {
    console.error('Error getting instructor dashboard:', error)
    throw error
  }
}

// ========== ADMIN APIs ==========

/**
 * Lấy danh sách đánh giá bị flag cần kiểm duyệt
 * @param status Trạng thái moderation (optional)
 * @param page Số trang
 * @param size Kích thước trang
 */
export const getFlaggedReviews = async (
  status?: ModerationStatus,
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<FlaggedReviewDto>> => {
  try {
    const params: any = { page, size }
    if (status) {
      params.status = status
    }

    const response = await apiClient.get<
      ApiResponse<PageResponse<FlaggedReviewDto>>
    >(`${BASE_PATH}/admin/flagged`, { params })
    return response.data.data
  } catch (error) {
    console.error('Error getting flagged reviews:', error)
    throw error
  }
}

/**
 * Xử lý kiểm duyệt đánh giá bị flag (approve/reject)
 * @param flagId ID của flag
 * @param request Yêu cầu moderation (action, notes, deleteReview)
 */
export const moderateFlag = async (
  flagId: number,
  request: ModerationActionRequest,
): Promise<void> => {
  try {
    await apiClient.post<ApiResponse<void>>(
      `${BASE_PATH}/admin/flags/${flagId}/moderate`,
      request,
    )
  } catch (error) {
    console.error('Error moderating flag:', error)
    throw error
  }
}

/**
 * Lấy thống kê kiểm duyệt tổng quan
 */
export const getModerationStatistics =
  async (): Promise<ModerationStatistics> => {
    try {
      const response = await apiClient.get<ApiResponse<ModerationStatistics>>(
        `${BASE_PATH}/admin/moderation-stats`,
      )
      return response.data.data
    } catch (error) {
      console.error('Error getting moderation statistics:', error)
      throw error
    }
  }

/**
 * Lấy danh sách đánh giá toxic cần ưu tiên xử lý
 * @param page Số trang
 * @param size Kích thước trang
 */
export const getCriticalFlags = async (
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<FlaggedReviewDto>> => {
  try {
    const response = await apiClient.get<
      ApiResponse<PageResponse<FlaggedReviewDto>>
    >(`${BASE_PATH}/admin/flagged/critical`, { params: { page, size } })
    return response.data.data
  } catch (error) {
    console.error('Error getting critical flags:', error)
    throw error
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Format date to ISO string for API
 */
export const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Get date range for common periods
 */
export const getDateRange = (
  period: 'week' | 'month' | 'quarter' | 'year',
): { startDate: string; endDate: string } => {
  const endDate = new Date()
  const startDate = new Date()

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(endDate.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  }
}
