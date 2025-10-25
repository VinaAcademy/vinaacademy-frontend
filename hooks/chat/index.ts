/**
 * Chat Hooks Index
 * Exports all chat-related hooks
 */

// Main facade hook (recommended for most use cases)
export { useChat } from './useChat';

// Individual specialized hooks (for advanced use cases)
export { useChatConnection } from './useChatConnection';
export { useChatMessages } from './useChatMessages';
export { useChatConversations, useConversation, useConversationMessages } from './useChatConversations';
export { useChatGroups } from './useChatGroups';
export { useChatReadStatus } from './useChatReadStatus';
export { useChatOnlineUsers } from './useChatOnlineUsers';

// Types (re-export for convenience)
export type {
  ConversationDto,
  MessageDto,
  CreateGroupRequest,
  MemberDto,
  WebSocketStatus,
} from '@/types/chat';

