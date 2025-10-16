/**
 * Chat Hook
 * React hook for managing chat state and WebSocket connection
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getChatWebSocketClient} from '@/lib/chatWebSocket';
import {
    getConversations,
    getConversationById,
    getOrCreateDirectConversation,
    createGroupConversation,
    markConversationAsRead,
    getMessagesByConversation,
} from '@/services/chatService';
import type {
    ConversationDto,
    MessageDto,
    CreateGroupRequest,
    WebSocketStatus,
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
 * Chat hook return type
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
}

/**
 * React hook for chat functionality
 * @param config - Hook configuration
 */
export function useChat(config: UseChatConfig): UseChatReturn {
    const {accessToken, debug = false, autoConnect = true} = config;
    const queryClient = useQueryClient();

    // WebSocket client with token refresh callback
    const clientRef = useRef(getChatWebSocketClient({
        debug,
        onTokenExpired: async () => {
            // Import dynamically to avoid circular dependencies
            const {getAccessToken} = await import('@/lib/apiClient');
            const {refreshToken: refreshAuthToken} = await import('@/services/authService');
            
            try {
                console.log('[useChat] Token expired, refreshing...');
                const refreshedUser = await refreshAuthToken();
                
                if (refreshedUser) {
                    const newToken = getAccessToken();
                    console.log('[useChat] Token refreshed successfully');
                    return newToken || null;
                }
                
                console.error('[useChat] Failed to refresh token');
                return null;
            } catch (error) {
                console.error('[useChat] Token refresh error:', error);
                return null;
            }
        }
    }));
    const client = clientRef.current;

    // Connection state
    const [wsStatus, setWsStatus] = useState<WebSocketStatus>({
        connected: false,
        connecting: false,
        error: null,
    });

    // Messages state (conversationId -> messages array)
    const [messages, setMessages] = useState<Record<string, MessageDto[]>>({});

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
        enabled: wsStatus.connected, // Only fetch after WebSocket connects
    });

    // ==================== CONNECTION MANAGEMENT ====================

    const connect = useCallback(async () => {
        if (!accessToken) {
            console.error('[useChat] No access token provided');
            return;
        }

        if (wsStatus.connected) {
            console.log('[useChat] Already connected');
            return;
        }

        try {
            setWsStatus({connected: false, connecting: true, error: null});
            await client.connect(accessToken);
            setWsStatus({connected: true, connecting: false, error: null});
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            setWsStatus({connected: false, connecting: false, error: errorMessage});
            console.error('[useChat] Connection error:', error);
        }
    }, [accessToken, client, wsStatus.connected]);

    const disconnect = useCallback(() => {
        client.disconnect();
        setWsStatus({connected: false, connecting: false, error: null});
    }, [client]);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect && accessToken && !wsStatus.connected && !wsStatus.connecting) {
            connect().then(r => r);
        }

        return () => {
            if (autoConnect) {
                disconnect();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoConnect, accessToken]);

    // Watch for token changes and update WebSocket connection
    useEffect(() => {
        if (accessToken && wsStatus.connected) {
            // Update token in WebSocket client when it changes
            client.updateToken(accessToken).catch(error => {
                console.error('[useChat] Failed to update token:', error);
            });
        }
    }, [accessToken, wsStatus.connected, client]);

    // ==================== MESSAGE HANDLING ====================

    // Handle incoming messages
    useEffect(() => {
        if (!wsStatus.connected) return;

        const handleMessage = (message: MessageDto) => {
            console.log('[useChat] Received message:', message);

            // Add message to local state (prevent duplicates)
            setMessages(prev => {
                const existingMessages = prev[message.conversationId] || [];
                const messageExists = existingMessages.some(m => m.id === message.id);
                
                if (messageExists) {
                    console.log('[useChat] Duplicate message ignored:', message.id);
                    return prev;
                }
                
                return {
                    ...prev,
                    [message.conversationId]: [
                        message,
                        ...existingMessages,
                    ],
                };
            });

            // Update conversation list
            queryClient.invalidateQueries({queryKey: ['conversations']}).then(r => r);
        };

        client.onMessage(handleMessage);

        return () => {
            client.removeMessageHandler(handleMessage);
        };
    }, [wsStatus.connected, client, queryClient]);

    // Subscribe to all group conversations after loading
    // useEffect(() => {
    //     if (!wsStatus.connected || conversations.length === 0) return;
    //
    //     const groupConversations = conversations.filter(conv => conv.type === 'GROUP');
    //     groupConversations.forEach(conv => {
    //         client.subscribeToGroup(conv.id);
    //     });
    //
    //     console.log(`[useChat] Subscribed to ${groupConversations.length} group conversations`);
    // }, [wsStatus.connected, conversations, client]);

    // ==================== MESSAGE OPERATIONS ====================

    const loadMessages = useCallback(async (conversationId: string, page = 0) => {
        const result = await getMessagesByConversation(conversationId, page, 50);
        if (result) {
            setMessages(prev => {
                const existingMessages = prev[conversationId] || [];
                const existingIds = new Set(existingMessages.map(m => m.id));
                
                // Filter out messages that already exist
                const newMessages = result.filter(m => !existingIds.has(m.id));
                
                if (newMessages.length === 0) {
                    console.log('[useChat] No new messages to add (all duplicates)');
                    return prev;
                }
                
                console.log(`[useChat] Adding ${newMessages.length} new messages to conversation ${conversationId}`);
                
                return {
                    ...prev,
                    [conversationId]: [
                        ...existingMessages,
                        ...newMessages,
                    ],
                };
            });
        }
    }, []);

    const clearMessages = useCallback((conversationId: string) => {
        setMessages(prev => {
            const newMessages = {...prev};
            delete newMessages[conversationId];
            return newMessages;
        });
    }, []);

    const sendTextMessage = useCallback(
        (
            conversationId: string,
            content: string,
            isGroup: boolean,
            recipientId?: string
        ) => {
            if (!wsStatus.connected) {
                console.error('[useChat] Cannot send message: not connected');
                return;
            }

            try {
                client.sendTextMessage(conversationId, content, isGroup, recipientId);
            } catch (error) {
                console.error('[useChat] Failed to send message:', error);
                throw error;
            }
        },
        [wsStatus.connected, client]
    );

    // ==================== GROUP MANAGEMENT ====================

    const subscribeToGroup = useCallback(
        (conversationId: string) => {
            if (!wsStatus.connected) {
                console.error('[useChat] Cannot subscribe: not connected');
                return;
            }
            client.subscribeToGroup(conversationId);
        },
        [wsStatus.connected, client]
    );

    const unsubscribeFromGroup = useCallback(
        (conversationId: string) => {
            client.unsubscribeFromGroup(conversationId);
        },
        [client]
    );

    const createGroupMutation = useMutation({
        mutationFn: createGroupConversation,
        onSuccess: (data) => {
            if (data) {
                // Invalidate conversations list
                queryClient.invalidateQueries({queryKey: ['conversations']}).then(r => r);
                // Subscribe to the new group
                client.subscribeToGroup(data.id);
            }
        },
    });

    const createGroup = useCallback(
        async (request: CreateGroupRequest) => {
            return createGroupMutation.mutateAsync(request);
        },
        [createGroupMutation]
    );

    // ==================== DIRECT CONVERSATIONS ====================

    const startDirectConversation = useCallback(async (userId: string) => {
        const conversation = await getOrCreateDirectConversation(userId);
        if (conversation) {
            await queryClient.invalidateQueries({queryKey: ['conversations']});
        }
        return conversation;
    }, [queryClient]);

    // ==================== READ STATUS ====================

    const markAsRead = useCallback(async (conversationId: string) => {
        const success = await markConversationAsRead(conversationId);
        if (success) {
            await queryClient.invalidateQueries({queryKey: ['conversations']});
        }
    }, [queryClient]);

    // ==================== UTILITY ====================

    const getConversation = useCallback(
        (conversationId: string) => {
            return conversations.find(conv => conv.id === conversationId);
        },
        [conversations]
    );

    return {
        // Connection state
        connected: wsStatus.connected,
        connecting: wsStatus.connecting,
        connectionError: wsStatus.error,
        connect,
        disconnect,

        // Conversations
        conversations,
        conversationsLoading,
        conversationsError: conversationsError as Error | null,
        refetchConversations,
        getConversation,

        // Messages
        messages,
        loadMessages,
        clearMessages,

        // Sending messages
        sendTextMessage,

        // Group management
        subscribeToGroup,
        unsubscribeFromGroup,
        createGroup,

        // Direct conversations
        startDirectConversation,

        // Read status
        markAsRead,
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
 * Hook for loading messages of a conversation
 * @param conversationId - Conversation ID
 * @param page - Page number (0-indexed)
 * @param size - Number of messages per page
 */
export function useConversationMessages(
    conversationId: string | null,
    page = 0,
    size = 50
) {
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
