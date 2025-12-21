'use client'

import apiClient from '@/lib/apiClient'
import { AxiosResponse } from 'axios'
import { ApiResponse, PaginatedResponse } from '@/types/api-response'
import {
  WalletBalanceDto,
  WalletTransactionDto,
  RevenueRecordDto,
  PayoutRequestDto,
  PayoutRequestResponseDto,
  PayoutApprovalRequest,
  RevenueDashboardDto,
  RefundRequest,
  WalletTransactionType,
} from '@/types/revenue'

// ==================== INSTRUCTOR REVENUE SERVICES ====================

/**
 * Get instructor's wallet balance and statistics
 * @returns Wallet balance data or null if error
 */
export const getWalletBalance = async (): Promise<WalletBalanceDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<WalletBalanceDto>> =
      await apiClient.get('/instructor/revenue/wallet/balance')
    return response.data.data
  } catch (error) {
    console.error('getWalletBalance error:', error)
    return null
  }
}

/**
 * Get instructor's wallet transaction history
 * @param page Page number (0-based)
 * @param size Page size
 * @param type Optional transaction type filter
 * @returns Paginated wallet transactions or null if error
 */
export const getWalletTransactions = async (
  page = 0,
  size = 10,
  type?: WalletTransactionType,
): Promise<PaginatedResponse<WalletTransactionDto> | null> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    if (type) {
      params.append('type', type)
    }

    const response: AxiosResponse<
      ApiResponse<PaginatedResponse<WalletTransactionDto>>
    > = await apiClient.get(
      `/instructor/revenue/wallet/transactions?${params.toString()}`,
    )

    // Ensure we return a proper paginated response even if backend returns null/undefined
    const data = response.data.data
    if (!data) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        first: true,
        last: true,
      }
    }

    return data
  } catch (error) {
    console.error('getWalletTransactions error:', error)
    return null
  }
}

/**
 * Get instructor's revenue history from courses
 * @param page Page number (0-based)
 * @param size Page size
 * @returns Paginated revenue records or null if error
 */
export const getRevenueHistory = async (
  page = 0,
  size = 10,
): Promise<PaginatedResponse<RevenueRecordDto> | null> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    const response: AxiosResponse<
      ApiResponse<PaginatedResponse<RevenueRecordDto>>
    > = await apiClient.get(`/instructor/revenue/history?${params.toString()}`)

    // Ensure we return a proper paginated response even if backend returns null/undefined
    const data = response.data.data
    if (!data) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        first: true,
        last: true,
      }
    }

    return data
  } catch (error) {
    console.error('getRevenueHistory error:', error)
    return null
  }
}

// ==================== PAYOUT REQUEST SERVICES ====================

/**
 * Create a new payout request
 * @param payoutData Payout request data
 * @returns Created payout request or null if error
 */
export const createPayoutRequest = async (
  payoutData: PayoutRequestDto,
): Promise<PayoutRequestResponseDto | null> => {
  try {
    const response: AxiosResponse<ApiResponse<PayoutRequestResponseDto>> =
      await apiClient.post('/instructor/revenue/payout/request', payoutData)
    return response.data.data
  } catch (error) {
    console.error('createPayoutRequest error:', error)
    return null
  }
}

/**
 * Get instructor's payout requests
 * @param page Page number (0-based)
 * @param size Page size
 * @returns Paginated payout requests or null if error
 */
export const getPayoutRequests = async (
  page = 0,
  size = 10,
): Promise<PaginatedResponse<PayoutRequestResponseDto> | null> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    const response: AxiosResponse<
      ApiResponse<PaginatedResponse<PayoutRequestResponseDto>>
    > = await apiClient.get(
      `/instructor/revenue/payout/requests?${params.toString()}`,
    )

    // Ensure we return a proper paginated response even if backend returns null/undefined
    const data = response.data.data
    if (!data) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        first: true,
        last: true,
      }
    }

    return data
  } catch (error) {
    console.error('getPayoutRequests error:', error)
    return null
  }
}

/**
 * Cancel a pending payout request
 * @param requestId Payout request ID
 * @returns true if successful, false if error
 */
export const cancelPayoutRequest = async (
  requestId: number,
): Promise<boolean> => {
  try {
    await apiClient.put(
      `/instructor/revenue/payout/requests/${requestId}/cancel`,
    )
    return true
  } catch (error) {
    console.error('cancelPayoutRequest error:', error)
    return false
  }
}

// ==================== ADMIN REVENUE SERVICES ====================

/**
 * Get revenue dashboard statistics (Admin only)
 * @returns Revenue dashboard data or null if error
 */
export const getRevenueDashboard =
  async (): Promise<RevenueDashboardDto | null> => {
    try {
      const response: AxiosResponse<ApiResponse<RevenueDashboardDto>> =
        await apiClient.get('/admin/revenue/dashboard')
      return response.data.data
    } catch (error) {
      console.error('getRevenueDashboard error:', error)
      return null
    }
  }

/**
 * Get pending payout requests for admin review
 * @param page Page number (0-based)
 * @param size Page size
 * @returns Paginated pending payout requests or null if error
 */
export const getPendingPayouts = async (
  page = 0,
  size = 10,
): Promise<PaginatedResponse<PayoutRequestResponseDto> | null> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    const response: AxiosResponse<
      ApiResponse<PaginatedResponse<PayoutRequestResponseDto>>
    > = await apiClient.get(
      `/admin/revenue/payout/pending?${params.toString()}`,
    )

    // Ensure we return a proper paginated response even if backend returns null/undefined
    const data = response.data.data
    if (!data) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: size,
        number: page,
        first: true,
        last: true,
      }
    }

    return data
  } catch (error) {
    console.error('getPendingPayouts error:', error)
    return null
  }
}

/**
 * Approve or reject a payout request (Admin only)
 * @param approvalData Payout approval data
 * @returns true if successful, false if error
 */
export const approvePayoutRequest = async (
  approvalData: PayoutApprovalRequest,
): Promise<boolean> => {
  try {
    await apiClient.put('/admin/revenue/payout/approve', approvalData)
    return true
  } catch (error) {
    console.error('approvePayoutRequest error:', error)
    return false
  }
}

/**
 * Process a refund for a specific course (Admin only)
 * @param refundData Refund request data with paymentId, instructorId, courseId
 * @returns true if successful, false if error
 */
export const processRefund = async (
  refundData: RefundRequest,
): Promise<boolean> => {
  try {
    const params = new URLSearchParams({
      paymentId: refundData.paymentId,
      instructorId: refundData.instructorId,
      courseId: refundData.courseId,
      reason: refundData.reason,
    })

    await apiClient.put(`/admin/revenue/refund?${params.toString()}`)
    return true
  } catch (error) {
    console.error('processRefund error:', error)
    return false
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format currency amount for display
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format date for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

/**
 * Validate payout amount
 * @param amount Amount to validate
 * @param availableBalance Available balance for withdrawal
 * @param minAmount Minimum withdrawal amount (default: 100,000 VND)
 * @returns Validation result and error message
 */
export const validatePayoutAmount = (
  amount: number,
  availableBalance: number,
  minAmount = 100000,
): { isValid: boolean; error?: string } => {
  if (amount <= 0) {
    return { isValid: false, error: 'Số tiền phải lớn hơn 0' }
  }

  if (amount < minAmount) {
    return {
      isValid: false,
      error: `Số tiền rút tối thiểu là ${formatCurrency(minAmount)}`,
    }
  }

  if (amount > availableBalance) {
    return {
      isValid: false,
      error: 'Số tiền rút vượt quá số dư khả dụng',
    }
  }

  return { isValid: true }
}
