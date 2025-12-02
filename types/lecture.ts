// Cập nhật interface Lecture
import { CourseDto, LessonDto, SectionDto } from './course'
import { VideoStatus } from './video'
import { MediaFileDto } from './lesson'

export interface Resource {
  id: string
  title: string
  type: string
  url: string
}

// Quiz related types
export interface QuizOption {
  id?: string
  text: string
  isCorrect: boolean
}

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'text'

export interface QuizQuestion {
  id?: string
  text: string
  type: QuestionType
  options: QuizOption[]
  explanation?: string
  points: number
  isRequired: boolean
}

export interface QuizSettings {
  randomizeQuestions: boolean
  showCorrectAnswers: boolean
  allowRetake: boolean
  requirePassingScore: boolean
  passingScore: number // Percentage
  timeLimit?: number // Minutes
}

export interface Quiz {
  title?: string
  questions: QuizQuestion[]
  settings: QuizSettings
  totalPoints: number
  timeLimit?: number // Minutes
}

// Cập nhật LectureType và Lesson để đảm bảo bao gồm tất cả các field cần thiết
export type LectureType = 'video' | 'reading' | 'quiz' | 'assignment'

export interface Lecture {
  id: string
  title: string
  type: LectureType
  description: string
  duration: string
  isPublished?: boolean
  free?: boolean

  // Các trường tùy chọn cho mọi loại bài học
  isCompleted?: boolean
  isCurrent?: boolean
  resources?: Resource[]
  attachments?: MediaFileDto[] // Tài liệu đính kèm từ backend

  // Các trường cho video
  transcript?: string
  status?: VideoStatus

  // Các trường cho reading
  textContent?: string

  // Các trường cho quiz
  quiz?: Quiz

  // Các trường cho assignment
  assignmentDetails?: {
    instructions: string
    deadline: string
    maxPoints: number
    submissionType: string
    allowedFileTypes: string[]
    resources: Resource[]
  }
}

// Phần (Section) trong khóa học
export interface Section {
  id: string
  title: string
  lectures: Lecture[]
}

// Using CourseDto from course.ts rather than defining a separate Course type
// The following interfaces are for internal frontend representation that maps
// from the API response types (CourseDto, SectionDto, LessonDto)
export interface LearningCourse {
  id: string
  slug: string
  title: string // Maps to course.name
  currentLecture: Lecture | null
  sections: Section[]
  progress: number // Phần trăm hoàn thành khóa học
}

export interface Course {
  id: string
  title: string
  slug: string
  currentLecture: Lecture
  sections: Section[]
  progress: number // Phần trăm hoàn thành khóa học
}
