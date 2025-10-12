/**
 * Chat Notification Hook
 * Handles integration between chat messages and notification system
 */

import {useEffect, useCallback} from 'react';
import {useWebSocketNotification} from '@/context/NotificationContext';
import {NotificationType} from '@/types/notification';
import {usePathname} from 'next/navigation';

interface UseChatNotificationOptions {
    /**
     * Current conversation ID being viewed
     * If provided, notifications for this conversation will be auto-marked as read
     */
    currentConversationId?: string | null;

    /**
     * Callback when a chat notification is received
     */
    onChatNotification?: (notification: {
        conversationId: string;
        title: string;
        content: string;
    }) => void;
}

/**
 * Hook to handle chat message notifications
 * Auto-marks notifications as read when viewing the conversation
 */
export function useChatNotification(options: UseChatNotificationOptions = {}) {
    const {currentConversationId, onChatNotification} = options;
    const {notifications, markAsRead} = useWebSocketNotification();
    const pathname = usePathname();

    // Extract conversation ID from notification target URL
    const extractConversationId = useCallback((targetUrl: string | null): string | null => {
        if (!targetUrl) return null;
        const match = targetUrl.match(/\/conversations\/([a-f0-9-]+)/);
        return match ? match[1] : null;
    }, []);

    // Handle message notifications
    useEffect(() => {
        // Filter unread message notifications
        const messageNotifications = notifications.filter(
            notif => notif.type === NotificationType.MESSAGE && !notif.isRead
        );

        if (messageNotifications.length === 0) return;

        messageNotifications.forEach(notif => {
            const conversationId = extractConversationId(notif.targetUrl);
            if (!conversationId) return;

            // If viewing this conversation, mark notification as read
            if (currentConversationId === conversationId) {
                markAsRead(notif.id);
                return;
            }

            // If on conversations list page, don't show notification popup
            // (the conversation list will update automatically)
            if (pathname === '/conversations') {
                return;
            }

            // Otherwise, trigger callback for notification display
            if (onChatNotification) {
                onChatNotification({
                    conversationId,
                    title: notif.title,
                    content: notif.content,
                });
            }
        });
    }, [
        notifications,
        currentConversationId,
        pathname,
        markAsRead,
        extractConversationId,
        onChatNotification,
    ]);

    // Get unread chat notifications count
    const getUnreadChatCount = useCallback((): number => {
        return notifications.filter(
            notif => notif.type === NotificationType.MESSAGE && !notif.isRead
        ).length;
    }, [notifications]);

    // Mark all chat notifications as read
    const markAllChatNotificationsAsRead = useCallback(async (): Promise<void> => {
        const messageNotifications = notifications.filter(
            notif => notif.type === NotificationType.MESSAGE && !notif.isRead
        );

        await Promise.all(
            messageNotifications.map(notif => markAsRead(notif.id))
        );
    }, [notifications, markAsRead]);

    return {
        unreadChatCount: getUnreadChatCount(),
        markAllChatNotificationsAsRead,
    };
}

/**
 * Hook to get chat notifications for a specific conversation
 */
export function useConversationNotifications(conversationId: string | null) {
    const {notifications} = useWebSocketNotification();

    if (!conversationId) return [];

    const targetUrl = `/conversations/${conversationId}`;
    return notifications.filter(
        notif =>
            notif.type === NotificationType.MESSAGE &&
            notif.targetUrl === targetUrl
    );
}
