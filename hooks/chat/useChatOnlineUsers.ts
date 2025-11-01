import {useState, useEffect, useCallback} from 'react';
import type {ChatWebSocketClient} from '@/lib/chatWebSocket';
import {getOnlineUsers} from '@/services/chatService';


interface UserChatOnlineUsers {
    client: ChatWebSocketClient;
    connected: boolean;
    autoRefresh?: boolean; // Tự động refresh khi mount
}

interface ChatOnlineUsersReturn {
    onlineUserIds: Set<string>;
    isLoading: boolean;
    refreshOnlineUsers: () => Promise<void>;
    isUserOnline: (userId: string) => boolean;
}

export function useChatOnlineUsers(config: UserChatOnlineUsers): ChatOnlineUsersReturn {
    const {client, connected, autoRefresh = true} = config;
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * Fetch online users from REST API
     */
    const refreshOnlineUsers = useCallback(async () => {
        if (!connected) return;

        setIsLoading(true);
        try {
            const userIds = await getOnlineUsers();
            if (userIds) {
                setOnlineUserIds(new Set(userIds));
            }
        } catch (error) {
            console.error('[useChatOnlineUsers] Failed to fetch online users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [connected]);

    /**
     * Check if specific user is online
     */
    const isUserOnline = useCallback((userId: string): boolean => {
        return onlineUserIds.has(userId);
    }, [onlineUserIds]);


    /**
     * Subscribe to WebSocket updates
     */
    useEffect(() => {
        if (!connected) return;

        const handleOnlineUsersUpdate = (userIds: Set<string>) => {
            console.log('[useChatOnlineUsers] Received online users update via WebSocket:', userIds);
            setOnlineUserIds(new Set(userIds));
        };

        // Register handler
        client.onOnlineUsersUpdate(handleOnlineUsersUpdate);

        // Initial fetch from REST API
        if (autoRefresh) {
            refreshOnlineUsers().then(r => r);
        }

        // Cleanup
        return () => {
            client.removeOnlineUsersHandler(handleOnlineUsersUpdate);
        };
    }, [connected, client, autoRefresh, refreshOnlineUsers]);

    return {
        onlineUserIds,
        isLoading,
        refreshOnlineUsers,
        isUserOnline
    };
}
