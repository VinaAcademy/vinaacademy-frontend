/**
 * Chatbot Types
 * Types for the AI chatbot assistant feature with SSE streaming support
 */

// ==================== SSE Event Types ====================

/**
 * Types of events received from the SSE stream
 */
export type ChatbotEventType =
  | 'text'
  | 'tool_call'
  | 'tool_call_chunk'
  | 'error'

/**
 * SSE Event structure from the chatbot API
 */
export interface ChatbotSSEEvent {
  type: ChatbotEventType
  text: string
}

// ==================== Message Types ====================

/**
 * Role of the message sender
 */
export type ChatbotMessageRole = 'user' | 'assistant'

/**
 * A single message in the conversation
 */
export interface ChatbotMessage {
  id: string
  role: ChatbotMessageRole
  content: string
  timestamp: Date
  isStreaming?: boolean
  isToolCall?: boolean
}

/**
 * Conversation history item for API request
 */
export interface ConversationHistoryItem {
  role: ChatbotMessageRole
  content: string
}

// ==================== Request/Response Types ====================

/**
 * Request body for the chatbot API
 */
export interface ChatbotRequest {
  message: string
  conversation_history?: ConversationHistoryItem[]
  lesson_id?: string | null
  course_id?: string | null
}

// ==================== State Types ====================

/**
 * Current status of the chatbot
 */
export type ChatbotStatus = 'idle' | 'connecting' | 'streaming' | 'error'

/**
 * Tool activity indicator shown during tool calls
 */
export interface ToolActivity {
  id: string
  text: string
  timestamp: Date
}

/**
 * Chatbot state interface for the hook
 */
export interface ChatbotState {
  messages: ChatbotMessage[]
  status: ChatbotStatus
  error: string | null
  currentToolActivity: ToolActivity | null
  isOpen: boolean
}

// ==================== Context Types ====================

/**
 * Context for the chatbot (current page context)
 */
export interface ChatbotContext {
  lessonId?: string | null
  courseId?: string | null
}

// ==================== Hook Types ====================

/**
 * Return type for the useChatbot hook
 */
export interface UseChatbotReturn {
  // State
  messages: ChatbotMessage[]
  status: ChatbotStatus
  error: string | null
  currentToolActivity: ToolActivity | null
  isOpen: boolean

  // Actions
  sendMessage: (message: string) => Promise<void>
  clearMessages: () => void
  setIsOpen: (open: boolean) => void
  setContext: (context: ChatbotContext) => void

  // Computed
  isStreaming: boolean
  canSend: boolean
}
