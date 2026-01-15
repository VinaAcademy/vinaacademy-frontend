export type CourseFile = File | null

export interface CourseData {
  title: string
  subtitle: string
  description: string
  category: string
  level: string
  language: string
  price: number
  // oldPrice: number;
  thumbnail: CourseFile
  estimatedTime: number
  // promo_video: CourseFile;
  slug: string
  // discounted: boolean;
  // subscription: boolean;
}

export interface Course {
  id: number
  title: string
  instructor: string
  department: string
  submittedDate: string
  thumbnail: string
  status: 'pending' | 'approved' | 'rejected'
  level: CourseLevel
  slug: string
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  hasMore: boolean
}

export interface CoursesResponse {
  courses: Course[]
  pagination: PaginationData
}

export enum CourseStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface UserDto {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

export interface SectionDto {
  id: string
  title: string
  order: number
  lessons: LessonDto[]
}

export interface LessonDto {
  id: string
  title: string
  order: number
  duration: number
  type: string
}

export interface CourseReviewDto {
  id: string
  rating: number
  comment: string
  user: UserDto
  createdAt: string
}

interface BaseDto {
  createdAt: string
  updatedAt: string
}

export interface CourseDetailsResponse extends BaseDto {
  id: string
  image: string
  name: string
  description: string
  slug: string
  price: number
  level: CourseLevel
  status: CourseStatus
  language: string
  categorySlug: string
  categoryName: string
  rating: number
  totalRating: number
  totalStudent: number
  totalSection: number
  totalLesson: number
  instructors: UserDto[]
  ownerInstructor: UserDto
  sections: SectionDto[]
  reviews: CourseReviewDto[]
}

export type SortOption = 'newest' | 'oldest' | 'normal'

export type CourseSortOption = SortOption | string

export type CourseSection = 'basic' | 'media' | 'pricing'

export type CourseStatusOption = CourseStatus | string
