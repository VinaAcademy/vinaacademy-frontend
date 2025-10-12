'use client';

import React, {createContext, useContext, useEffect, useState, useCallback, useRef} from 'react';
import {Client, IMessage} from '@stomp/stompjs';
import {createWebSocketClient} from '@/lib/websocket';
import {NotificationDTO} from '@/types/notification';
import {getAccessToken} from '@/lib/apiClient';
import {playNotificationSound} from '@/utils/notificationSound';
import {
    markNotificationAsRead as apiMarkAsRead,
    deleteNotification as apiDeleteNotification,
    markAllNotificationsAsRead as apiMarkAllAsRead,
    fetchUserNotifications
} from '@/services/notificationService';
import {useAuth} from './AuthContext';
import {WS_ENDPOINTS} from "@/config/api.endpoint";

interface NotificationContextType {
    isConnected: boolean;
    notifications: NotificationDTO[];
    addNotification: (notification: NotificationDTO) => void;
    clearNotifications: () => void;
    markAsRead: (notificationId: string) => Promise<boolean>;
    markAllAsRead: () => Promise<boolean>;
    deleteNotification: (notificationId: string) => Promise<boolean>;
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: React.ReactNode;
    wsUrl?: string;
    debug?: boolean;
}

export function NotificationProvider({
                                         children,
                                         wsUrl = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL || 'http://localhost:8080/ws/notification',
                                         debug = false
                                     }: WebSocketProviderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);

    // Add notification to the list
    const addNotification = useCallback((notification: NotificationDTO) => {
        setNotifications(prev => [notification, ...prev]);
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Mark notification as read (with API sync)
    const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
        try {
            // Call API to mark as read on server
            const success = await apiMarkAsRead(notificationId);

            if (success) {
                // Update local state
                setNotifications(prev =>
                    prev.map(notif =>
                        notif.id === notificationId
                            ? {...notif, isRead: true, readAt: new Date().toISOString()}
                            : notif
                    )
                );

                if (debug) {
                    console.log('[WebSocket] Notification marked as read:', notificationId);
                }
            }

            return success;
        } catch (error) {
            console.error('[WebSocket] Error marking notification as read:', error);
            return false;
        }
    }, [debug]);

    // Mark all notifications as read (with API sync)
    const markAllAsRead = useCallback(async (): Promise<boolean> => {
        try {
            // Call API to mark all as read on server
            const success = await apiMarkAllAsRead();

            if (success) {
                // Update local state
                const now = new Date().toISOString();
                setNotifications(prev =>
                    prev.map(notif => ({...notif, isRead: true, readAt: now}))
                );

                if (debug) {
                    console.log('[WebSocket] All notifications marked as read');
                }
            }

            return success;
        } catch (error) {
            console.error('[WebSocket] Error marking all notifications as read:', error);
            return false;
        }
    }, [debug]);

    // Delete notification (with API sync)
    const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
        try {
            // Call API to delete on server
            const success = await apiDeleteNotification(notificationId);

            if (success) {
                // Remove from local state
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

                if (debug) {
                    console.log('[WebSocket] Notification deleted:', notificationId);
                }
            }

            return success;
        } catch (error) {
            console.error('[WebSocket] Error deleting notification:', error);
            return false;
        }
    }, [debug]);

    // Refresh notifications from API
    const refreshNotifications = useCallback(async (): Promise<void> => {
        try {
            const response = await fetchUserNotifications({
                type: null,
                isRead: null,
                page: 0,
                size: 50, // Get recent 50 notifications
                sortBy: 'createdAt',
                direction: 'desc',
            });

            if (response.content) {
                // Convert from API type to WebSocket type
                const convertedNotifications: NotificationDTO[] = response.content.map(apiNotif => ({
                    id: apiNotif.id,
                    title: apiNotif.title,
                    content: apiNotif.content,
                    isRead: apiNotif.isRead,
                    createdAt: apiNotif.createdAt,
                    readAt: apiNotif.readAt,
                    targetUrl: apiNotif.targetUrl,
                    type: apiNotif.type,
                    email: '', // Not available in API response
                    userId: '', // Not available in API response
                }));

                setNotifications(convertedNotifications);

                if (debug) {
                    console.log('[WebSocket] Notifications refreshed from API:', convertedNotifications.length);
                }
            }
        } catch (error) {
            console.error('[WebSocket] Error refreshing notifications:', error);
        }
    }, [debug]);

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Handle incoming notification message
    const handleNotificationMessage = useCallback((message: IMessage) => {
        try {
            const notification: NotificationDTO = JSON.parse(message.body);

            if (debug) {
                console.log('[WebSocket] Received notification:', notification);
            }

            addNotification(notification);

            playNotificationSound();

            // Optional: Show browser notification if permission granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.content,
                    icon: '/logo.png',
                    badge: '/logo.png',
                });
            }
        } catch (error) {
            console.error('[WebSocket] Error parsing notification:', error);
        }
    }, [addNotification, debug]);

    const {isAuthenticated, isLoading} = useAuth();

    // Initialize WebSocket connection
    useEffect(() => {
        let mounted = true;

        const initWebSocket = async () => {
            try {
                // Get access token from cookies
                const token = getAccessToken();

                if (!token) {
                    if (debug) {
                        console.log('[WebSocket] No access token found, skipping connection');
                    }
                    return;
                }

                if (debug) {
                    console.log('[WebSocket] Initializing connection...');
                }

                // Create WebSocket client
                const client = createWebSocketClient({
                    url: wsUrl,
                    token,
                    debug,
                    onConnect: () => {
                        if (!mounted) return;

                        setIsConnected(true);

                        // Subscribe to user-specific notification queue
                        if (client.connected) {
                            subscriptionRef.current = client.subscribe(
                                WS_ENDPOINTS.NOTIFICATION.USER_QUEUE,
                                handleNotificationMessage
                            );

                            if (debug) {
                                console.log('[WebSocket] Subscribed to /user/queue/notifications');
                            }

                            // Load existing notifications from API on connect
                            refreshNotifications();
                        }
                    },
                    onDisconnect: () => {
                        if (!mounted) return;
                        setIsConnected(false);
                    },
                    onError: (error) => {
                        console.error('[WebSocket] Connection error:', error);
                        if (!mounted) return;
                        setIsConnected(false);
                    },
                });

                // Activate the client
                client.activate();
                clientRef.current = client;

                // Request browser notification permission
                if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'default') {
                        Notification.requestPermission().then(permission => {
                            if (debug) {
                                console.log('[WebSocket] Notification permission:', permission);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('[WebSocket] Initialization error:', error);
            }
        };

        initWebSocket().then(r => r)
            .catch(error => {
                    console.error('[WebSocket] Initialization error:', error);
                }
            );

        // Cleanup function
        return () => {
            mounted = false;

            if (subscriptionRef.current) {
                try {
                    subscriptionRef.current.unsubscribe();
                } catch (error) {
                    console.error('[WebSocket] Error unsubscribing:', error);
                }
            }

            if (clientRef.current) {
                try {
                    clientRef.current.deactivate().then(r => r);
                } catch (error) {
                    console.error('[WebSocket] Error deactivating client:', error);
                }
            }
        };
    }, [wsUrl, debug, handleNotificationMessage, refreshNotifications, isAuthenticated, isLoading]);

    const value: NotificationContextType = {
        isConnected,
        notifications,
        addNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

/**
 * Custom hook to access WebSocket notification context
 * @throws Error if used outside WebSocketProvider
 */
export function useWebSocketNotification() {
    const context = useContext(NotificationContext);

    if (context === undefined) {
        throw new Error('useWebSocketNotification must be used within WebSocketProvider');
    }

    return context;
}
