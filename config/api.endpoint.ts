/**
 * API Endpoints Configuration
 * Centralized configuration for all API endpoints used in the application
 * All endpoints are relative to the API base URL (configured in next.config.ts rewrite rules)
 */

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    RESEND_VERIFICATION: '/auth/resend-verification-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CHECK_RESET_TOKEN: '/auth/check-reset-password-token',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // ==================== USER ====================
  USER: {
    ME: '/users/me',
    UPDATE_INFO: '/users/update-info',
    SEARCH: '/users/search',
    VIEW: (userId: string) => `/users/view/${userId}`,
  },

  // ==================== COURSE ====================
  COURSE: {
    // Public queries
    LIST: '/courses',
    DETAILS: '/courses/details',
    BY_SLUG: (slug: string) => `/courses/by-slug/${slug}`,
    BY_ID: (id: string) => `/courses/by-id/${id}`,
    DETAILS_BY_ID: (id: string) => `/courses/details/by-id/${id}`,
    LEARNING: (slug: string) => `/courses/by-slug/${slug}/learning`,

    // CRUD operations
    CREATE: '/courses',
    UPDATE: (id: string) => `/courses/by-id/${id}`,
    DELETE: (id: string) => `/courses/by-id/${id}`,

    // Status & workflow
    SUBMIT_FOR_REVIEW: (id: string) => `/courses/by-id/${id}/submit-for-review`,
    UPDATE_STATUS: (id: string) => `/courses/by-id/${id}/status`,
    STATUS_COUNT: '/courses/statuscount',

    // Progress
    PROGRESS: (courseId: string) => `/courses/${courseId}/progress`,

    // Instructor operations
    INSTRUCTOR_COURSES: '/courses/instructor/courses',
    INSTRUCTOR_PUBLISHED: (instructorId: string) =>
      `/courses/instructor/${instructorId}/published`,
    INSTRUCTOR_PUBLISHED_COUNT: (instructorId: string) =>
      `/courses/instructor/${instructorId}/published/count`,
  },

  // ==================== CATEGORY ====================
  CATEGORY: {
    LIST: '/categories',
    BY_SLUG: (slug: string) => `/categories/${slug}`,
    CREATE: '/categories',
    UPDATE: (slug: string) => `/categories/${slug}`,
    DELETE: (slug: string) => `/categories/${slug}`,
  },

  // ==================== SECTION ====================
  SECTION: {
    BY_COURSE: (courseId: string) => `/sections/course/${courseId}`,
    BY_ID: (id: string) => `/sections/${id}`,
    CREATE: '/sections',
    UPDATE: (id: string) => `/sections/${id}`,
    DELETE: (id: string) => `/sections/${id}`,
  },

  // ==================== LESSON ====================
  LESSON: {
    BY_ID: (id: string) => `/lessons/${id}`,
    BY_SECTION: (sectionId: string) => `/lessons/section/${sectionId}`,
    CREATE: '/lessons',
    UPDATE: (id: string) => `/lessons/${id}`,
    DELETE: (id: string) => `/lessons/${id}`,
    PROGRESS: (lessonId: string) => `/lessons/${lessonId}/progress`,

    // Attachments
    ATTACHMENTS: (lessonId: string) => `/lessons/${lessonId}/attachments`,
    ATTACH_DOCUMENTS: (lessonId: string) => `/lessons/${lessonId}/attachments`,
    REMOVE_ATTACHMENT: (lessonId: string, fileId: string) =>
      `/lessons/${lessonId}/attachments/${fileId}`,
    ATTACHMENT_DOWNLOAD_URL: (lessonId: string, attachmentId: string) =>
      `/lessons/${lessonId}/attachments/${attachmentId}/download-url`,
  },

  // ==================== LESSON PROGRESS ====================
  LESSON_PROGRESS: {
    BY_COURSE: (courseId: string) => `/lesson-progress/${courseId}`,
  },

  // ==================== VIDEO ====================
  VIDEO: {
    UPLOAD: '/videos/upload',
    PROCESS: '/videos/process',
    MASTER_PLAYLIST: (videoId: string) => `/videos/${videoId}/master.m3u8`,
    THUMBNAIL: (videoId: string) => `/videos/${videoId}/thumbnail`,
  },

  // ==================== VIDEO PROGRESS ====================
  VIDEO_PROGRESS: {
    SAVE: (videoId: string) => `/video-progress/${videoId}`,
    GET: (videoId: string) => `/video-progress/${videoId}`,
  },

  // ==================== VIDEO NOTES ====================
  VIDEO_NOTE: {
    BY_VIDEO: (videoId: string) => `/video-notes/video/${videoId}`,
    CREATE: '/video-notes',
    UPDATE: (noteId: string) => `/video-notes/${noteId}`,
    DELETE: (noteId: string) => `/video-notes/${noteId}`,
  },

  // ==================== QUIZ (Student) ====================
  QUIZ: {
    BY_ID: (id: string) => `/quiz/${id}`,
    START: (quizId: string) => `/quiz/${quizId}/start`,
    SUBMIT: '/quiz/submit',
    LATEST_SUBMISSION: (quizId: string) => `/quiz/${quizId}/submission/latest`,
    SUBMISSION_HISTORY: (quizId: string) => `/quiz/${quizId}/submissions`,
    CACHE_ANSWER: (quizId: string) => `/quiz/${quizId}/cache-answer`,
    GET_CACHED_ANSWERS: (quizId: string, sessionId: string) =>
      `/quiz/${quizId}/cached-answers?sessionId=${sessionId}`,
    STUDENT_ATTEMPTS: (quizId: string) =>
      `/instructor/quiz/${quizId}/student-attempts`,
  },

  // ==================== QUIZ INSTRUCTOR ====================
  QUIZ_INSTRUCTOR: {
    BY_ID: (id: string) => `/instructor/quiz/${id}`,
    BY_COURSE: (courseId: string) => `/instructor/quiz/course/${courseId}`,
    BY_SECTION: (sectionId: string) => `/instructor/quiz/section/${sectionId}`,
    SUBMISSIONS: (quizId: string) => `/instructor/quiz/${quizId}/submissions`,

    // Question management
    CREATE_QUESTION: (quizId: string) => `/instructor/quiz/${quizId}/questions`,
    UPDATE_QUESTION: (questionId: string) =>
      `/instructor/quiz/questions/${questionId}`,
    DELETE_QUESTION: (questionId: string) =>
      `/instructor/quiz/questions/${questionId}`,

    // Answer management
    CREATE_ANSWER: (questionId: string) =>
      `/instructor/quiz/questions/${questionId}/answers`,
    UPDATE_ANSWER: (answerId: string) => `/instructor/quiz/answers/${answerId}`,
    DELETE_ANSWER: (answerId: string) => `/instructor/quiz/answers/${answerId}`,
  },

  // ==================== ENROLLMENT ====================
  ENROLLMENT: {
    ENROLL: '/enrollments',
    CHECK: '/enrollments/check',
    LIST: '/enrollments',
    BY_ID: (enrollmentId: number) => `/enrollments/${enrollmentId}`,
    CANCEL: (enrollmentId: number) => `/enrollments/${enrollmentId}`,
    UPDATE_STATUS: (enrollmentId: number) =>
      `/enrollments/${enrollmentId}/status`,
  },

  // ==================== INSTRUCTOR ====================
  INSTRUCTOR: {
    BY_ID: (instructorId: string) => `/instructor/${instructorId}`,
    REGISTER: '/instructor/register',
    COURSE_INSTRUCTOR: '/courseinstructor',
  },

  // ==================== STUDENT PROGRESS ====================
  STUDENT_PROGRESS: {
    ALL: '/instructor/courses/students-progress',
    BY_COURSE: (courseId: string) =>
      `/instructor/courses/${courseId}/students-progress`,
  },

  // ==================== CART ====================
  CART: {
    GET: '/cart',
    UPDATE: '/cart',
    ITEMS: {
      LIST: (userId: string) => `/cart/${userId}/items`,
      ADD: '/cart/items',
      UPDATE: '/cart/items',
      BY_ID: (itemId: number) => `/cart/items/${itemId}`,
      DELETE: (itemId: number) => `/cart/items/${itemId}`,
    },
  },

  // ==================== ORDER ====================
  ORDER: {
    CREATE: '/order',
    LIST: '/order/list',
    APPLY_COUPON: '/order/coupon',
  },

  // ==================== PAYMENT ====================
  PAYMENT: {
    CREATE: (orderId: string) => `/payment/${orderId}`,
    VALIDATE: '/payment/valid',
  },

  // ==================== COUPON ====================
  COUPON: {
    LIST: '/coupon/list',
  },

  // ==================== COURSE REVIEW ====================
  COURSE_REVIEW: {
    CREATE_OR_UPDATE: '/course-reviews',
    BY_COURSE: (courseId: string) => `/course-reviews/course/${courseId}`,
    USER_REVIEW: (courseId: string) =>
      `/course-reviews/user/course/${courseId}`,
    STATISTICS: (courseId: string) =>
      `/course-reviews/statistics/course/${courseId}`,
    CHECK: (courseId: string) => `/course-reviews/check/course/${courseId}`,
  },

  // ==================== DISCUSSION ====================
  DISCUSSION: {
    ROOT_COMMENTS: (lessonId: string) => `/discussions/${lessonId}`,
    REPLIES: (parentId: string) => `/discussions/${parentId}/replies`,
    CREATE: '/discussions',
    DELETE: (discussionId: string) => `/discussions/delete/${discussionId}`,
  },

  // ==================== FAVORITE ====================
  FAVORITE: {
    TOGGLE: '/favorites',
    DELETE: (commentId: string) => `/favorites/${commentId}`,
  },

  // ==================== NOTIFICATION ====================
  NOTIFICATION: {
    PAGINATED: '/notifications/paginated',
    MARK_AS_READ: (notificationId: string) =>
      `/notifications/${notificationId}/read`,
    DELETE: (notificationId: string) => `/notifications/${notificationId}`,
    MARK_ALL_AS_READ: '/notifications/readall',
  },

  // ==================== IMAGE ====================
  IMAGE: {
    UPLOAD: '/images/upload',
  },

  // ==================== DOCUMENT ====================
  DOCUMENT: {
    UPLOAD: '/documents/upload',
    BY_ID: (id: string) => `/documents/${id}`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
  },

  // ==================== CHUNK UPLOAD ====================
  CHUNK_UPLOAD: {
    INITIATE: '/storage/chunk-upload/initiate',
    UPLOAD: '/storage/chunk-upload',
    STATUS: (sessionId: string) => `/storage/chunk-upload/status/${sessionId}`,
  },

  // ==================== CHAT ====================
  CHAT: {
    // Conversation endpoints
    CONVERSATIONS: {
      LIST: '/conversations',
      BY_ID: (conversationId: string) => `/conversations/${conversationId}`,
      DIRECT: (userId: string) => `/conversations/direct/${userId}`,
      CREATE_GROUP: '/conversations/groups',
      MARK_READ: (conversationId: string) =>
        `/conversations/${conversationId}/mark-read`,
    },

    // Message endpoints
    MESSAGES: {
      BY_RECIPIENT: (recipientId: string) =>
        `/messages/recipient/${recipientId}`,
      BY_CONVERSATION: (conversationId: string) =>
        `/messages/conversation/${conversationId}`,
    },

    // Online users
    ONLINE_USERS: '/chat/online-users',
  },

  // ==================== AI ====================
  AI: {
    GENERATE_QUIZ: '/ai/quiz/create',
    QUIZ_PROGRESS: (quizId: string) => `/ai/quiz/progress/${quizId}`,
  },

  // ==================== CHATBOT ====================
  CHATBOT: {
    CHAT_STREAM: '/chatbot/chat/stream',
  },
} as const

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'

export const WS_ENDPOINTS = {
  NOTIFICATION: {
    URL: `${WS_BASE_URL}/notification`,
    USER_QUEUE: '/user/queue/notifications',
  },
  CHAT: {
    URL: `${WS_BASE_URL}/chat`,
    PRIVATE_MESSAGE_QUEUE: '/user/queue/pm',
    GROUP_MESSAGE_WEBSOCKET_TOPIC: (conversationId: string) =>
      `/topic/group/${conversationId}`,
    ONLINE_USERS_WEBSOCKET_TOPIC: '/topic/online-users',
    SEND_PRIVATE_MESSAGE: '/app/pm',
    SEND_GROUP_MESSAGE: '/app/group',
  },
}

/**
 * Helper function to build query parameters
 */
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

/**
 * Helper function to build Spring-style sort parameter
 */
export const buildSort = (
  sortBy: string,
  sortDirection: 'asc' | 'desc',
): string => {
  return `${sortBy},${sortDirection}`
}

/**
 * Type-safe endpoint builder with params
 */
export const buildEndpoint = (
  endpoint: string,
  params?: Record<string, any>,
): string => {
  if (!params) return endpoint
  const queryString = buildQueryParams(params)
  return queryString ? `${endpoint}?${queryString}` : endpoint
}
