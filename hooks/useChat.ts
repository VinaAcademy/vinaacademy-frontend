/**
 * Chat Hook (Legacy Export)
 * 
 * This file re-exports the new modular chat hooks for backward compatibility.
 * All chat functionality has been split into specialized hooks in the `chat/` directory:
 * 
 * - useChatConnection.ts: WebSocket connection management
 * - useChatMessages.ts: Message loading and sending
 * - useChatConversations.ts: Conversation list and operations
 * - useChatGroups.ts: Group conversation management
 * - useChatReadStatus.ts: Read status tracking
 * - useChat.ts: Main facade hook (recommended)
 * 
 * @deprecated Import from 'hooks/chat' instead for better tree-shaking
 */

// Re-export all hooks from the chat directory
export {
  useChat,
  useConversation,
  useConversationMessages,
  useChatConnection,
  useChatMessages,
  useChatConversations,
  useChatGroups,
  useChatReadStatus,
} from './chat';

// Re-export types for convenience
export type {
  ConversationDto,
  MessageDto,
  CreateGroupRequest,
  MemberDto,
  WebSocketStatus,
} from '@/types/chat';
