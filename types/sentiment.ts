/**
 * Types for Sentiment Analysis Feature
 * Matches backend DTOs from ReviewSentiment API
 */

export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  MIXED = 'MIXED',
}

export enum PhraseType {
  PRO = 'PRO',
  CON = 'CON',
  NEUTRAL = 'NEUTRAL',
  ASPECT = 'ASPECT',
}

export enum AspectCategory {
  CONTENT = 'CONTENT',
  INSTRUCTOR = 'INSTRUCTOR',
  TECHNICAL = 'TECHNICAL',
  SUPPORT = 'SUPPORT',
  DIFFICULTY = 'DIFFICULTY',
  PACING = 'PACING',
  MATERIALS = 'MATERIALS',
  VALUE = 'VALUE',
  GENERAL = 'GENERAL',
}

export enum ModerationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AUTO_APPROVED = 'AUTO_APPROVED',
}

export enum FlagType {
  TOXIC = 'TOXIC',
  SPAM = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  EXTREME_NEGATIVE = 'EXTREME_NEGATIVE',
  ABUSIVE = 'ABUSIVE',
  OTHER = 'OTHER',
}

// ========== Basic DTOs ==========

export interface SentimentScoresDto {
  positive: number
  neutral: number
  negative: number
}

export interface ReviewSentimentDto {
  sentiment: SentimentType
  confidenceScores: SentimentScoresDto
  isToxic: boolean
  toxicityScore?: number
  analyzedAt: string
}

export interface KeyPhraseDto {
  phrase: string
  phraseType: PhraseType
  sentiment: SentimentType
  confidence: number
  category?: AspectCategory
}

// ========== Student Response DTOs ==========

export interface KeyPhraseItem {
  phrase: string
  count: number
  category?: string // AspectCategory as string
  averageConfidence?: number
}

export interface ProsConsResponse {
  courseId: string
  courseName: string
  pros: KeyPhraseItem[]
  cons: KeyPhraseItem[]
  totalReviews: number
}

// Response structure from backend GET /api/v1/sentiment/reviews
export interface ReviewWithSentimentDto {
  review: {
    id: number
    courseId: string
    courseName: string
    rating: number
    review: string // Nội dung đánh giá
    userId: string
    userFullName: string // Tên đầy đủ của người dùng
    createdDate: string // Format: "YYYY-MM-DD HH:mm:ss"
    updatedDate: string // Format: "YYYY-MM-DD HH:mm:ss"
  }
  sentiment: ReviewSentimentDto
  keyPhrases: KeyPhraseDto[]
  isFlagged: boolean
  sentimentType: SentimentType
}

// ========== Instructor Dashboard DTOs ==========

export interface PeriodInfo {
  periodType: string
  startDate: string
  endDate: string
}

export interface OverviewStats {
  totalReviews: number
  sentimentDistribution: Record<SentimentType, number> // Map from backend
  sentimentPercentages: Record<SentimentType, number> // Map from backend
  overallSentimentScore: number // -1 to 1, renamed from overallScore
  toxicReviewsCount: number

  // Helper computed properties (optional, for backward compatibility)
  positiveCount?: number
  neutralCount?: number
  negativeCount?: number
  mixedCount?: number
  positivePercentage?: number
  neutralPercentage?: number
  negativePercentage?: number
  mixedPercentage?: number
  overallScore?: number
}

export interface TrendDataPoint {
  date: string
  positiveCount: number
  neutralCount: number
  negativeCount: number
  mixedCount: number
  avgPositiveScore: number
  avgNegativeScore: number
}

export interface AspectAnalysis {
  category: string // Backend returns string, not enum
  totalMentions: number // Backend field name
  topPros: string[] // Backend field name
  topCons: string[] // Backend field name
  avgSentimentScore: number
  trend: string // "improving", "declining", "stable"

  // Optional for backward compatibility
  displayName?: string
  mentionCount?: number
  positiveCount?: number
  negativeCount?: number
  topPhrases?: string[]
}

export interface SentimentDashboardResponse {
  courseId?: string
  courseName?: string
  period: PeriodInfo
  overview: OverviewStats
  sentimentTrend: TrendDataPoint[] // Backend field name
  topAspects: AspectAnalysis[] // Backend field name
  recentImprovements: string[]
  recentConcerns: string[]
}

// ========== Admin Moderation DTOs ==========

export interface FlaggedReviewDto {
  flagId: number
  review: {
    id: number
    courseId: string
    courseName: string
    rating: number
    review: string // Nội dung đánh giá
    userId: string
    userFullName: string // Tên người dùng
    createdDate: string
    updatedDate: string
  }
  sentiment: ReviewSentimentDto
  flagType: FlagType
  severity: number // 1-5
  confidence: number // Backend returns BigDecimal as number
  reason: string
  status: ModerationStatus
  reviewedBy?: string
  reviewedByName?: string // Tên người xử lý (moderator name)
  reviewedAt?: string
  moderatorNotes?: string
  flaggedAt: string
}

export interface ModerationActionRequest {
  action: 'approve' | 'reject'
  notes: string
  deleteReview?: boolean
  userId: string
  reviewId: number
}

export interface ModerationStatistics {
  pending: number
  reviewed: number
  approved: number
  rejected: number
  autoApproved: number
  totalFlags: number
  criticalPending: number // severity >= 4
}

// ========== API Response Wrappers ==========

export interface ApiResponse<T> {
  status: string
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// ========== Helper Functions ==========

export const getSentimentColor = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case SentimentType.POSITIVE:
      return 'text-green-600'
    case SentimentType.NEGATIVE:
      return 'text-red-600'
    case SentimentType.NEUTRAL:
      return 'text-gray-600'
    case SentimentType.MIXED:
      return 'text-yellow-600'
    default:
      return 'text-gray-500'
  }
}

export const getSentimentBgColor = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case SentimentType.POSITIVE:
      return 'bg-green-100'
    case SentimentType.NEGATIVE:
      return 'bg-red-100'
    case SentimentType.NEUTRAL:
      return 'bg-gray-100'
    case SentimentType.MIXED:
      return 'bg-yellow-100'
    default:
      return 'bg-gray-50'
  }
}

export const getSentimentLabel = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case SentimentType.POSITIVE:
      return 'Tích cực'
    case SentimentType.NEGATIVE:
      return 'Tiêu cực'
    case SentimentType.NEUTRAL:
      return 'Trung lập'
    case SentimentType.MIXED:
      return 'Hỗn hợp'
    default:
      return 'Không xác định'
  }
}

export const getAspectCategoryLabel = (category: AspectCategory): string => {
  const labels: Record<AspectCategory, string> = {
    [AspectCategory.CONTENT]: 'Nội dung',
    [AspectCategory.INSTRUCTOR]: 'Giảng viên',
    [AspectCategory.TECHNICAL]: 'Kỹ thuật',
    [AspectCategory.SUPPORT]: 'Hỗ trợ',
    [AspectCategory.DIFFICULTY]: 'Độ khó',
    [AspectCategory.PACING]: 'Tốc độ',
    [AspectCategory.MATERIALS]: 'Tài liệu',
    [AspectCategory.VALUE]: 'Giá trị',
    [AspectCategory.GENERAL]: 'Chung',
  }
  return labels[category]
}

export const getModerationStatusLabel = (status: ModerationStatus): string => {
  const labels: Record<ModerationStatus, string> = {
    [ModerationStatus.PENDING]: 'Chờ xử lý',
    [ModerationStatus.REVIEWED]: 'Đã xem',
    [ModerationStatus.APPROVED]: 'Đã duyệt',
    [ModerationStatus.REJECTED]: 'Từ chối',
    [ModerationStatus.AUTO_APPROVED]: 'Tự động duyệt',
  }
  return labels[status]
}

export const getFlagTypeLabel = (flagType: FlagType): string => {
  const labels: Record<FlagType, string> = {
    [FlagType.TOXIC]: 'Độc hại',
    [FlagType.SPAM]: 'Spam',
    [FlagType.INAPPROPRIATE]: 'Không phù hợp',
    [FlagType.EXTREME_NEGATIVE]: 'Cực kỳ tiêu cực',
    [FlagType.ABUSIVE]: 'Lăng mạ',
    [FlagType.OTHER]: 'Khác',
  }
  return labels[flagType]
}

export const getSeverityColor = (severity: number): string => {
  if (severity >= 4) return 'text-red-600 bg-red-100'
  if (severity === 3) return 'text-orange-600 bg-orange-100'
  if (severity === 2) return 'text-yellow-600 bg-yellow-100'
  return 'text-gray-600 bg-gray-100'
}
