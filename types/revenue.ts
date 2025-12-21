import { BaseDto } from './api-response'

// ==================== INSTRUCTOR REVENUE & WALLET ====================

export interface WalletBalanceDto {
  balance: number // BigDecimal -> number for frontend
  totalEarnings: number
  totalWithdrawn: number
  pendingWithdraw: number
  availableBalance: number
}

export interface WalletTransactionDto extends BaseDto {
  id: number
  instructorId: string // UUID as string
  type: WalletTransactionType
  amount: number
  balanceAfter: number
  referenceId?: number
  referenceType?: string
  description: string
}

export interface RevenueRecordDto extends BaseDto {
  id: number
  courseId: string // UUID as string
  enrollmentId: number
  paymentId: string // UUID as string
  instructorId: string // UUID as string
  studentId: string // UUID as string
  totalAmount: number
  instructorEarning: number
  platformFee: number
  status: RevenueStatus
}

// ==================== PAYOUT REQUEST & TRANSACTION ====================

export interface PayoutRequestDto {
  amount: number
  bankName: string
  bankAccount: string
  accountHolder: string
  note?: string
}

export interface PayoutRequestResponseDto extends BaseDto {
  id: number
  instructorId: string // UUID as string
  amount: number
  bankName: string
  bankAccount: string
  accountHolder: string
  note?: string
  status: PayoutStatus
  rejectionReason?: string
  processedAt?: string // ISO datetime string
}

export interface PayoutApprovalRequest {
  payoutRequestId: number
  approved: boolean
  rejectionReason?: string
  note?: string
}

export interface PayoutTransactionDto extends BaseDto {
  id: number
  payoutRequestId: number
  instructorId: string // UUID as string
  amount: number
  transactionRef?: string
  bankName: string
  bankAccount: string
  accountHolder: string
  processedBy: string // UUID as string
  note?: string
}

// ==================== DASHBOARD & STATISTICS (ADMIN) ====================

export interface RevenueDashboardDto {
  totalRevenue: number
  totalPlatformFee: number
  totalInstructorEarnings: number
  totalPendingPayouts: number
  totalCompletedPayouts: number
  pendingPayoutRequests: number
  totalInstructors: number
  totalTransactions: number
}

export interface RefundRequest {
  paymentId: string // UUID as string
  instructorId: string // UUID as string
  courseId: string // UUID as string
  reason: string
}

// ==================== ENUMS ====================

export enum PayoutStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum RevenueStatus {
  ACTIVE = 'ACTIVE',
  REFUNDED = 'REFUNDED',
}

export enum WalletTransactionType {
  EARNING = 'EARNING',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

// ==================== UI HELPERS ====================

export const PayoutStatusLabels: Record<PayoutStatus, string> = {
  [PayoutStatus.PENDING]: 'Chờ xử lý',
  [PayoutStatus.REVIEWING]: 'Đang xem xét',
  [PayoutStatus.APPROVED]: 'Đã duyệt',
  [PayoutStatus.PROCESSING]: 'Đang xử lý',
  [PayoutStatus.PAID]: 'Đã thanh toán',
  [PayoutStatus.REJECTED]: 'Từ chối',
  [PayoutStatus.CANCELLED]: 'Đã hủy',
}

export const RevenueStatusLabels: Record<RevenueStatus, string> = {
  [RevenueStatus.ACTIVE]: 'Hoạt động',
  [RevenueStatus.REFUNDED]: 'Đã hoàn tiền',
}

export const WalletTransactionTypeLabels: Record<
  WalletTransactionType,
  string
> = {
  [WalletTransactionType.EARNING]: 'Thu nhập',
  [WalletTransactionType.PAYOUT]: 'Rút tiền',
  [WalletTransactionType.REFUND]: 'Hoàn tiền',
  [WalletTransactionType.ADJUSTMENT]: 'Điều chỉnh',
}

// ==================== UI STATE INTERFACES ====================

export interface PayoutRequestFormData {
  amount: string // Form input as string, convert to number when submitting
  bankName: string
  bankAccount: string
  accountHolder: string
  note: string
}

export interface PayoutApprovalFormData {
  approved: boolean
  rejectionReason: string
  note: string
}

/**
 * Form data for processing refunds
 * Updated to use composite key (paymentId, instructorId, courseId)
 */
export interface RefundFormData {
  paymentId: string // UUID
  instructorId: string // UUID
  courseId: string // UUID
  reason: string
}
