// WebSocket Notification System - Main Exports

// Context and Provider
export {
  NotificationProvider,
  useWebSocketNotification,
} from './NotificationContext'

// Types
export type { NotificationDTO } from '@/types/notification'
export { NotificationType } from '@/types/notification'

// Chat System - Main Exports
export {
  ChatProvider,
  useChat,
  useChatAvailable,
  useChatConversation,
  useChatMessages,
  useUnreadCount,
} from './ChatContext'
export { ChatbotProvider, useChatbotContext } from './ChatbotContext'

// Lecture Edit Context - For instructor lecture editing
export { LectureEditProvider, useLectureEdit } from './LectureEditContext'

// Quiz Edit Context - For quiz question editing
export { QuizEditProvider, useQuizEdit } from './QuizEditContext'

// Chat Types
export type {
  ConversationDto,
  MessageDto,
  ConversationType,
  MessageType,
  MemberRole,
  MemberDto,
  CreateGroupRequest,
  PrivateMessageRequest,
  GroupMessageRequest,
} from '@/types/chat'
