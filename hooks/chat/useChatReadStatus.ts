/**
 * Chat Read Status Hook
 * Manages message read status for conversations
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { markConversationAsRead } from '@/services/chatService';
import {CHAT_KEYS} from "@/config/query-keys.config";

/**
 * Read status hook return type
 */
interface UseChatReadStatusReturn {
  markAsRead: (conversationId: string) => Promise<void>;
}

/**
 * Hook for managing conversation read status
 */
export function useChatReadStatus(): UseChatReadStatusReturn {
  const queryClient = useQueryClient();

  // Mark conversation as read
  const markAsRead = useCallback(
    async (conversationId: string) => {
      const success = await markConversationAsRead(conversationId);
      if (success) {
        await queryClient.invalidateQueries({ queryKey: CHAT_KEYS.all });
      }
    },
    [queryClient]
  );

  return {
    markAsRead,
  };
}
