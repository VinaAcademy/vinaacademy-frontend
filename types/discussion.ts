export interface DiscussionDto {
  id: string
  lessonId: string
  userId: string
  userFullName: string
  avatarUrl?: string
  comment: string
  parentCommentId?: string
  replyCount: number
  favoriteCount: number
  likedByCurrentUser: boolean
  createdDate: string
  updatedAt?: string
  isInstructor?: boolean
  // Moderation fields
  flagType?: 'TOXIC' | 'EXTREME_NEGATIVE' | 'SPAM' | null
  moderationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  flagSeverity?: number | null
}

export interface DiscussionRequest {
  lessonId: string
  comment: string
  parentCommentId?: string
  courseId: string
}

export interface FavoriteRequest {
  commentId: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  code?: number
}
