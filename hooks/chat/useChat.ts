/**
 * Chat Hook (Facade)
 * Main entry point that composes all chat-related hooks
 * 
 * This is the public API that components should use.
 * It combines functionality from:
 * - useChatConnection: WebSocket connection management
 * - useChatMessages: Message loading, sending, and real-time updates
 * - useChatConversations: Conversation list and operations
 * - useChatGroups: Group conversation management
 * - useChatReadStatus: Read status tracking
 */

import { useChatConnection } from './useChatConnection';
import { useChatMessages } from './useChatMessages';
import { useChatConversations } from './useChatConversations';
import { useChatGroups } from './useChatGroups';
import { useChatReadStatus } from './useChatReadStatus';
import { useChatOnlineUsers } from './useChatOnlineUsers';
import type {
  ConversationDto,
  MessageDto,
  CreateGroupRequest,
} from '@/types/chat';

/**
 * Chat hook configuration
 */
interface UseChatConfig {
  accessToken: string;
  debug?: boolean;
  autoConnect?: boolean;
}

/**
 * Chat hook return type (Facade interface)
 */
interface UseChatReturn {
  // Connection state
  connected: boolean;
  connecting: boolean;
  connectionError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;

  // Conversations
  conversations: ConversationDto[];
  conversationsLoading: boolean;
  conversationsError: Error | null;
  refetchConversations: () => void;
  getConversation: (conversationId: string) => ConversationDto | undefined;

  // Messages
  messages: Record<string, MessageDto[]>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  clearMessages: (conversationId: string) => void;

  // Sending messages
  sendTextMessage: (
    conversationId: string,
    content: string,
    isGroup: boolean,
    recipientId?: string
  ) => void;

  // Group management
  subscribeToGroup: (conversationId: string) => void;
  unsubscribeFromGroup: (conversationId: string) => void;
  createGroup: (request: CreateGroupRequest) => Promise<ConversationDto | null>;

  // Direct conversations
  startDirectConversation: (userId: string) => Promise<ConversationDto | null>;

  // Read status
  markAsRead: (conversationId: string) => Promise<void>;

  // Online users - PHASE 4
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;
  refreshOnlineUsers: () => Promise<void>;
}

/**
 * Main chat hook that combines all chat functionality
 * 
 * @example
 * ```tsx
 * const chat = useChat({ accessToken, debug: true });
 * 
 * // Connection
 * if (!chat.connected) {
 *   await chat.connect();
 * }
 * 
 * // Send message
 * chat.sendTextMessage(conversationId, "Hello!", false, recipientId);
 * 
 * // Load messages
 * await chat.loadMessages(conversationId);
 * 
 * // Create group
 * const group = await chat.createGroup({ name: "Team", memberIds: [...] });
 * ```
 * 
 * @param config - Chat configuration
 */
export function useChat(config: UseChatConfig): UseChatReturn {
  // 1. Connection management
  const connection = useChatConnection(config);

  // 2. Messages management
  const messages = useChatMessages({
    client: connection.client,
    connected: connection.connected,
  });

  // 3. Conversations management
  const conversations = useChatConversations({
    connected: connection.connected,
  });

  // 4. Groups management
  const groups = useChatGroups({
    client: connection.client,
    connected: connection.connected,
  });

  // 5. Read status management
  const readStatus = useChatReadStatus();

  // 6. Online users management - PHASE 4
  const onlineUsers = useChatOnlineUsers({
    client: connection.client,
    connected: connection.connected,
    autoRefresh: true,
  });

  // Compose and return the complete API
  return {
    // From useChatConnection
    connected: connection.connected,
    connecting: connection.connecting,
    connectionError: connection.connectionError,
    connect: connection.connect,
    disconnect: connection.disconnect,

    // From useChatConversations
    conversations: conversations.conversations,
    conversationsLoading: conversations.conversationsLoading,
    conversationsError: conversations.conversationsError,
    refetchConversations: conversations.refetchConversations,
    getConversation: conversations.getConversation,
    startDirectConversation: conversations.startDirectConversation,

    // From useChatMessages
    messages: messages.messages,
    loadMessages: messages.loadMessages,
    clearMessages: messages.clearMessages,
    sendTextMessage: messages.sendTextMessage,

    // From useChatGroups
    subscribeToGroup: groups.subscribeToGroup,
    unsubscribeFromGroup: groups.unsubscribeFromGroup,
    createGroup: groups.createGroup,

    // From useChatReadStatus
    markAsRead: readStatus.markAsRead,

    // From useChatOnlineUsers - PHASE 4
    onlineUserIds: onlineUsers.onlineUserIds,
    isUserOnline: onlineUsers.isUserOnline,
    refreshOnlineUsers: onlineUsers.refreshOnlineUsers,
  };
}

// Re-export utility hooks for convenience
export { useConversation, useConversationMessages } from './useChatConversations';
