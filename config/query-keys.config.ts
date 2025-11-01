/**
 * React Query Keys Configuration
 * Centralized query keys for TanStack Query (React Query)
 * 
 * Benefits:
 * - Type safety for query keys
 * - Easy refactoring and maintenance
 * - Consistent naming across the application
 * - Better cache invalidation control
 * - Prevent typos and key mismatches
 */

/**
 * Course-related query keys
 */
const COURSE_KEYS = {
  all: ['courses'] as const,
  
  // Course list with filters
  list: (params: {
    keyword?: string;
    categorySlug?: string;
    level?: string;
    language?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }) => [
    'courses',
    params.keyword,
    params.categorySlug,
    params.level,
    params.language,
    params.minPrice,
    params.maxPrice,
    params.minRating,
    params.status,
    params.page,
    params.size,
    params.sortBy,
    params.sortDirection,
  ] as const,
  
  // Course list with active tab and pagination
  byTab: (params: {activeTab: string; currentPage: number; pageSize: number; status?: string}) =>
    ['courses', params.activeTab, params.currentPage, params.pageSize, params.status] as const,
  
  // Single course by slug
  bySlug: (slug: string) => [...COURSE_KEYS.all, 'by-slug', slug] as const,
  
  // Single course by ID
  byId: (id: string) => [...COURSE_KEYS.all, 'by-id', id] as const,
  
  // Continue learning courses
  continueLearning: (limit: number) => ['continue-learning', limit] as const,
} as const;

/**
 * Lesson-related query keys (instructor view)
 */
const LESSON_KEYS = {
  all: ['lessons'] as const,
  
  // Single lesson by ID
  byId: (lessonId: string) => ['lesson', lessonId] as const,
  
  // Lessons by section ID
  bySection: (sectionId: string) => ['lessons', 'section', sectionId] as const,


  // Lesson by course slug and lecture ID
  byCourse: (courseSlug: string, lectureId: string) =>
      ['lesson', courseSlug, lectureId] as const,

  // Lesson list for a course (used in learning interface)
  listByCourse: (courseSlug: string) => ['lessons', courseSlug] as const,
} as const;

/**
 * Section-related query keys
 */
const SECTION_KEYS = {
  all: ['sections'] as const,
  
  // Sections by course ID
  byCourse: (courseId: string) => ['sections', courseId] as const,
} as const;

/**
 * Quiz-related query keys
 */
const QUIZ_KEYS = {
  all: ['quizzes'] as const,
  
  // Single quiz by ID
  quiz: (id: string) => [...QUIZ_KEYS.all, id] as const,
  
  // Questions for a quiz
  questions: (quizId: string) => [...QUIZ_KEYS.quiz(quizId), 'questions'] as const,
  
  // Single question
  question: (quizId: string, questionId: string) =>
    [...QUIZ_KEYS.questions(quizId), questionId] as const,
  
  // Answers for a question
  answers: (questionId: string) => ['question', questionId, 'answers'] as const,
  
  // Quiz submissions
  submissions: (quizId: string) => [...QUIZ_KEYS.quiz(quizId), 'submissions'] as const,
} as const;

/**
 * Chat/Conversation-related query keys
 */
const CHAT_KEYS = {
  all: ['conversations'] as const,
  
  // All conversations for current user
  conversations: () => ['conversations'] as const,
  
  // Single conversation by ID
  conversation: (conversationId: string | null) =>
    ['conversation', conversationId] as const,
  
  // Messages for a conversation (paginated)
  messages: (conversationId: string | null, page: number, size: number) =>
    ['messages', conversationId, page, size] as const,
} as const;

/**
 * Category-related query keys
 */
const CATEGORY_KEYS = {
  all: ['categories'] as const,
  
  // Single category by slug
  bySlug: (slug: string) => [...CATEGORY_KEYS.all, slug] as const,
} as const;

/**
 * User-related query keys
 */
const USER_KEYS = {
  all: ['users'] as const,
  
  // Single user by ID
  byId: (userId: string) => ['user', userId] as const,
  
  // Current user profile
  profile: () => [...USER_KEYS.all, 'profile'] as const,
  
  // Search users by keywords
  search: (keywords: string) => ['users', 'search', keywords] as const,
} as const;

/**
 * Enrollment-related query keys
 */
const ENROLLMENT_KEYS = {
  all: ['enrollments'] as const,
  
  // User enrollments with filters
  byUser: (page: number, size: number, status?: string) =>
    ['enrollments', 'user', page, size, status] as const,
  
  // Single enrollment by course
  byCourse: (courseId: string) => [...ENROLLMENT_KEYS.all, 'course', courseId] as const,
} as const;

/**
 * Video/Media-related query keys
 */
const VIDEO_KEYS = {
  all: ['videos'] as const,
  
  // Video progress
  progress: (videoId: string) => [...VIDEO_KEYS.all, 'progress', videoId] as const,
} as const;

/**
 * Notification-related query keys
 */
const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  
  // Unread notifications
  unread: () => [...NOTIFICATION_KEYS.all, 'unread'] as const,
  
  // Notification count
  count: () => [...NOTIFICATION_KEYS.all, 'count'] as const,
} as const;

/**
 * Cart-related query keys
 */
const CART_KEYS = {
  all: ['cart'] as const,
  
  // User cart
  items: () => [...CART_KEYS.all, 'items'] as const,
} as const;

/**
 * Review-related query keys
 */
const REVIEW_KEYS = {
  all: ['reviews'] as const,
  
  // Reviews for a course
  byCourse: (courseId: string, page?: number, size?: number) =>
    [...REVIEW_KEYS.all, 'course', courseId, page, size] as const,
  
  // User's review for a course
  userReview: (courseId: string, userId: string) =>
    [...REVIEW_KEYS.all, 'course', courseId, 'user', userId] as const,
} as const;

/**
 * Discussion-related query keys
 */
const DISCUSSION_KEYS = {
  all: ['discussions'] as const,
  
  // Discussions for a course
  byCourse: (courseId: string, page?: number, size?: number) =>
    [...DISCUSSION_KEYS.all, 'course', courseId, page, size] as const,
  
  // Single discussion thread
  thread: (discussionId: string) => [...DISCUSSION_KEYS.all, 'thread', discussionId] as const,
} as const;

/**
 * Progress-related query keys
 */
const PROGRESS_KEYS = {
  all: ['progress'] as const,
  
  // Course progress
  byCourse: (courseId: string) => [...PROGRESS_KEYS.all, 'course', courseId] as const,
  
  // Lesson progress
  byLesson: (lessonId: string) => [...PROGRESS_KEYS.all, 'lesson', lessonId] as const,
} as const;

/**
 * Payment-related query keys
 */
const PAYMENT_KEYS = {
  all: ['payments'] as const,
  
  // Payment history
  history: (page?: number, size?: number) =>
    [...PAYMENT_KEYS.all, 'history', page, size] as const,
  
  // Single payment
  byId: (paymentId: string) => [...PAYMENT_KEYS.all, paymentId] as const,
} as const;

/**
 * Instructor-related query keys
 */
const INSTRUCTOR_KEYS = {
  all: ['instructors'] as const,
  
  // Single instructor
  byId: (instructorId: string) => [...INSTRUCTOR_KEYS.all, instructorId] as const,
  
  // Instructor courses
  courses: (instructorId: string) => [...INSTRUCTOR_KEYS.all, instructorId, 'courses'] as const,
  
  // Instructor earnings
  earnings: (instructorId: string) => [...INSTRUCTOR_KEYS.all, instructorId, 'earnings'] as const,
  
  // Instructor students
  students: (instructorId: string) => [...INSTRUCTOR_KEYS.all, instructorId, 'students'] as const,
} as const;

/**
 * Admin-related query keys
 */
const ADMIN_KEYS = {
  all: ['admin'] as const,
  
  // Dashboard stats
  dashboard: () => [...ADMIN_KEYS.all, 'dashboard'] as const,
  
  // Course approval requests
  courseApprovals: (page?: number, size?: number) =>
    [...ADMIN_KEYS.all, 'course-approvals', page, size] as const,
  
  // User management
  users: (page?: number, size?: number) =>
    [...ADMIN_KEYS.all, 'users', page, size] as const,
} as const;

/**
 * Helper function to invalidate related queries
 * Usage: queryClient.invalidateQueries({ queryKey: COURSE_KEYS.all })
 */
export const getInvalidationKey = (key: readonly unknown[]) => key;

/**
 * Export all query keys as a single object
 */
export const QUERY_KEYS = {
  COURSE: COURSE_KEYS,
  LESSON: LESSON_KEYS,
  SECTION: SECTION_KEYS,
  QUIZ: QUIZ_KEYS,
  CHAT: CHAT_KEYS,
  CATEGORY: CATEGORY_KEYS,
  USER: USER_KEYS,
  ENROLLMENT: ENROLLMENT_KEYS,
  VIDEO: VIDEO_KEYS,
  NOTIFICATION: NOTIFICATION_KEYS,
  CART: CART_KEYS,
  REVIEW: REVIEW_KEYS,
  DISCUSSION: DISCUSSION_KEYS,
  PROGRESS: PROGRESS_KEYS,
  PAYMENT: PAYMENT_KEYS,
  INSTRUCTOR: INSTRUCTOR_KEYS,
  ADMIN: ADMIN_KEYS,
} as const;

// Export individual key groups for convenience
export {
  COURSE_KEYS,
  LESSON_KEYS,
  SECTION_KEYS,
  QUIZ_KEYS,
  CHAT_KEYS,
  CATEGORY_KEYS,
  USER_KEYS,
  ENROLLMENT_KEYS,
  VIDEO_KEYS,
  NOTIFICATION_KEYS,
  CART_KEYS,
  REVIEW_KEYS,
  DISCUSSION_KEYS,
  PROGRESS_KEYS,
  PAYMENT_KEYS,
  INSTRUCTOR_KEYS,
  ADMIN_KEYS,
};
