/**
 * Discussion Moderation Types
 * For staff/admin to moderate flagged discussions
 */

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type FlagType = 'TOXIC' | 'EXTREME_NEGATIVE' | 'SPAM'

/**
 * Flagged discussion DTO from backend
 */
export interface FlaggedDiscussionDto {
  flagId: number
  discussionId: string
  comment: string
  userId: string
  userFullName: string
  avatarUrl?: string
  lessonId: string
  lessonTitle?: string
  courseId: string
  courseTitle?: string
  flagType: FlagType
  flagSeverity: number
  flaggedAt: string
  moderationStatus: ModerationStatus
  moderatedAt?: string
  moderatorId?: string
  moderatorName?: string
  moderationNotes?: string
  flagCount: number // Number of times this discussion has been flagged
}

/**
 * Request to moderate a flagged discussion
 */
export interface DiscussionModerationActionRequest {
  action: 'approve' | 'reject'
  notes?: string
  hideDiscussion?: boolean // If approve, should we also hide the discussion?
}

/**
 * Statistics for moderation dashboard
 */
export interface DiscussionModerationStatisticsDto {
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  totalFlaggedCount: number
  criticalCount: number // TOXIC flags
  toxicCount: number
  extremeNegativeCount: number
  spamCount: number
}

/**
 * Paginated response from backend
 */
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
