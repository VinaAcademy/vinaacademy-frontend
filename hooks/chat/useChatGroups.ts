/**
 * Chat Groups Hook
 * Manages group conversation creation and subscriptions
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroupConversation } from '@/services/chatService';
import type { ChatWebSocketClient } from '@/lib/chatWebSocket';
import type { ConversationDto, CreateGroupRequest } from '@/types/chat';

/**
 * Groups hook configuration
 */
interface UseChatGroupsConfig {
  client: ChatWebSocketClient;
  connected: boolean;
}

/**
 * Groups hook return type
 */
interface UseChatGroupsReturn {
  // Group operations
  subscribeToGroup: (conversationId: string) => void;
  unsubscribeFromGroup: (conversationId: string) => void;
  createGroup: (request: CreateGroupRequest) => Promise<ConversationDto | null>;
}

/**
 * Hook for managing group conversations
 * @param config - Groups configuration
 */
export function useChatGroups(config: UseChatGroupsConfig): UseChatGroupsReturn {
  const { client, connected } = config;
  const queryClient = useQueryClient();

  // Subscribe to group conversation updates
  const subscribeToGroup = useCallback(
    (conversationId: string) => {
      if (!connected) {
        console.error('[useChatGroups] Cannot subscribe: not connected');
        return;
      }
      client.subscribeToGroup(conversationId);
    },
    [connected, client]
  );

  // Unsubscribe from group conversation
  const unsubscribeFromGroup = useCallback(
    (conversationId: string) => {
      client.unsubscribeFromGroup(conversationId);
    },
    [client]
  );

  // Mutation: Create group conversation
  const createGroupMutation = useMutation({
    mutationFn: createGroupConversation,
    onSuccess: (data) => {
      if (data) {
        // Invalidate conversations list
        queryClient.invalidateQueries({ queryKey: ['conversations'] }).then(r => r);
        // Subscribe to the new group
        client.subscribeToGroup(data.id);
      }
    },
  });

  // Create a new group conversation
  const createGroup = useCallback(
    async (request: CreateGroupRequest) => {
      return createGroupMutation.mutateAsync(request);
    },
    [createGroupMutation]
  );

  return {
    // Group operations
    subscribeToGroup,
    unsubscribeFromGroup,
    createGroup,
  };
}
