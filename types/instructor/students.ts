export interface StudentStats {
  count: number
  growthRate: number
}

export interface CompletionStats {
  inProgress: number
  completed: number
  notStarted: number
  averageCompletionRate: number
}

export interface CourseStudentCount {
  courseId: string
  courseTitle: string
  courseThumbnail: string
  studentCount: number
}

export interface StudentsOverview {
  totalStudents: StudentStats
  newStudents: StudentStats
  completionStats: CompletionStats
  topCoursesByStudents: CourseStudentCount[]
}

export interface CourseEnrollment {
  enrollmentId: number
  courseId: string
  courseName: string
  courseImage: string
  progressPercentage: number
  status: 'IN_PROGRESS' | 'COMPLETED'
  startDate: string
  completeDate?: string
}

export interface StudentDetail {
  userId: string
  fullName: string
  email: string
  avatarUrl?: string
  totalEnrollments: number
  averageProgress: number
  lastActive?: string
  enrollments: CourseEnrollment[]
}

export interface ProgressDataPoint {
  name: string
  inProgress: number
  completed: number
  newEnrollments: number
}

export interface StudentsProgressChart {
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'
  data: ProgressDataPoint[]
}

export type TimeRange = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL'
export type ProgressStatus = 'IN_PROGRESS' | 'COMPLETED'

export interface StudentsFilters {
  courseId?: string
  status?: ProgressStatus
  minProgress?: number
  maxProgress?: number
  keyword?: string
  page?: number
  size?: number
}
