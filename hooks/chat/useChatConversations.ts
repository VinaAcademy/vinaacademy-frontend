/**
 * Chat Conversations Hook
 * Manages conversation list and operations
 */

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getConversations,
  getConversationById,
  getOrCreateDirectConversation,
} from '@/services/chatService';
import type { ConversationDto } from '@/types/chat';

/**
 * Conversations hook configuration
 */
interface UseChatConversationsConfig {
  connected: boolean;
}

/**
 * Conversations hook return type
 */
interface UseChatConversationsReturn {
  // Conversations state
  conversations: ConversationDto[];
  conversationsLoading: boolean;
  conversationsError: Error | null;
  
  // Conversation operations
  refetchConversations: () => void;
  getConversation: (conversationId: string) => ConversationDto | undefined;
  startDirectConversation: (userId: string) => Promise<ConversationDto | null>;
}

/**
 * Hook for managing conversations
 * @param config - Conversations configuration
 */
export function useChatConversations(
  config: UseChatConversationsConfig
): UseChatConversationsReturn {
  const { connected } = config;
  const queryClient = useQueryClient();

  // Query: Get all conversations
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const result = await getConversations();
      return result || [];
    },
    enabled: connected, // Only fetch after WebSocket connects
  });

  // Get specific conversation by ID
  const getConversation = useCallback(
    (conversationId: string) => {
      return conversations.find(conv => conv.id === conversationId);
    },
    [conversations]
  );

  // Start or get direct conversation with a user
  const startDirectConversation = useCallback(
    async (userId: string) => {
      const conversation = await getOrCreateDirectConversation(userId);
      if (conversation) {
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
      return conversation;
    },
    [queryClient]
  );

  return {
    // Conversations state
    conversations,
    conversationsLoading,
    conversationsError: conversationsError as Error | null,

    // Conversation operations
    refetchConversations,
    getConversation,
    startDirectConversation,
  };
}

/**
 * Hook for loading a specific conversation
 * @param conversationId - Conversation ID to load
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      return await getConversationById(conversationId);
    },
    enabled: !!conversationId,
  });
}

/**
 * Hook for loading messages of a conversation (paginated query)
 * @param conversationId - Conversation ID
 * @param page - Page number (0-indexed)
 * @param size - Number of messages per page
 */
export function useConversationMessages(
  conversationId: string | null,
  page = 0,
  size = 50
) {
  const { getMessagesByConversation } = require('@/services/chatService');
  
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: async () => {
      if (!conversationId) return [];
      const result = await getMessagesByConversation(conversationId, page, size);
      return result || [];
    },
    enabled: !!conversationId,
  });
}
