import { BaseDto } from './api-response'
import { LessonType } from './course'
import { QuestionDto } from './quiz'
import { VideoStatus } from './video'

// Media File Types
export type FileType = 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER'

export interface MediaFileDto extends BaseDto {
  id: string // UUID
  userId: string // UUID
  fileName: string
  fileType: FileType
  mimeType?: string
  fileSize?: number
  filePath?: string // Not exposed to frontend for security
}

export interface LessonDto extends BaseDto {
  id: string // UUID
  title: string
  type: LessonType
  free: boolean
  orderIndex: number
  sectionId: string // UUID
  sectionTitle: string
  authorId: string // UUID
  authorName: string
  courseId: string // UUID
  courseName: string
  description?: string // HTML content for reading lessons

  // progress
  currentUserProgress?: LessonProgressDto

  // For Video lessons
  thumbnailUrl?: string
  status?: VideoStatus
  videoUrl?: string
  videoDuration?: number

  // For Reading lessons
  content?: string

  // For Quiz lessons
  passPoint?: number
  totalPoint?: number
  duration?: number

  // Attachments (documents for download)
  attachments?: MediaFileDto[]
}

export interface LessonRequest {
  title: string
  sectionId: string // UUID
  type: LessonType
  description?: string
  free?: boolean
  orderIndex?: number // Thêm orderIndex

  // For Video lessons
  thumbnailUrl?: string
  videoUrl?: string
  videoDuration?: number
  status?: VideoStatus

  // For Reading lessons
  content?: string

  // For Quiz lessons
  passPoint?: number
  totalPoint?: number
  duration?: number

  // Quiz settings
  settings?: Record<string, any>

  // List of questions for quizzes
  questions?: QuestionDto[]

  // Attachment IDs (for create/update)
  attachmentIds?: string[]
}

export interface LessonProgressDto {
  lessonId: string // UUID
  completed: boolean
}
