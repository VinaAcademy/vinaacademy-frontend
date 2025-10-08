'use client';

import { useWebSocketNotification } from '@/context/WebSocketContext';

/**
 * Custom hook to access notification functionality
 * This is a convenience wrapper around useWebSocketNotification
 * 
 * @example
 * ```tsx
 * const { notifications, unreadCount, markAsRead } = useNotification();
 * ```
 */
export function useNotification() {
  return useWebSocketNotification();
}
