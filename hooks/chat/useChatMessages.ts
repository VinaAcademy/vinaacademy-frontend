/**
 * Chat Messages Hook
 * Manages message loading, sending, and real-time updates
 */

import {useState, useCallback, useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {getMessagesByConversation} from '@/services/chatService';
import type {ChatWebSocketClient} from '@/lib/chatWebSocket';
import type {MessageDto} from '@/types/chat';
import CHAT_CONFIG from "@/config/chat.config";
import {CHAT_KEYS} from "@/config/query-keys.config";

/**
 * Messages hook configuration
 */
interface UseChatMessagesConfig {
    client: ChatWebSocketClient;
    connected: boolean;
}

/**
 * Messages hook return type
 */
interface UseChatMessagesReturn {
    // Messages state
    messages: Record<string, MessageDto[]>;

    // Message operations
    loadMessages: (conversationId: string, page?: number) => Promise<void>;
    clearMessages: (conversationId: string) => void;
    sendTextMessage: (
        conversationId: string,
        content: string,
        isGroup: boolean,
        recipientId?: string
    ) => void;
}

/**
 * Hook for managing chat messages
 * @param config - Messages configuration
 */
export function useChatMessages(config: UseChatMessagesConfig): UseChatMessagesReturn {
    const {client, connected} = config;
    const queryClient = useQueryClient();

    // Messages state (conversationId -> messages array)
    const [messages, setMessages] = useState<Record<string, MessageDto[]>>({});
    const [maxPages, setMaxPages] = useState<Record<string, number>>({});

    // Handle incoming messages from WebSocket
    useEffect(() => {
        if (!connected) return;

        const handleMessage = (message: MessageDto) => {
            console.log('[useChatMessages] Received message:', message);

            // Add message to local state (prevent duplicates)
            setMessages(prev => {
                const existingMessages = prev[message.conversationId] || [];
                const messageExists = existingMessages.some(m => m.id === message.id);

                if (messageExists) {
                    console.log('[useChatMessages] Duplicate message ignored:', message.id);
                    return prev;
                }

                return {
                    ...prev,
                    [message.conversationId]: [message, ...existingMessages],
                };
            });

            // Update conversation list to reflect new message
            queryClient.invalidateQueries({queryKey: CHAT_KEYS.all}).then(r => r);
        };

        client.onMessage(handleMessage);

        return () => {
            client.removeMessageHandler(handleMessage);
        };
    }, [connected, client, queryClient]);

    // Load message history from server
    const loadMessages = useCallback(
        async (conversationId: string, page = 0) => {
            if (maxPages[conversationId] !== undefined && page >= maxPages[conversationId]) {
                console.log('[useChatMessages] Reached max pages, not loading more');
                return;
            }
            const result = await getMessagesByConversation(conversationId, page,
                CHAT_CONFIG.MESSAGES_PAGE_SIZE);
            if (result) {
                setMessages(prev => {
                    const existingMessages = prev[conversationId] || [];
                    const existingIds = new Set(existingMessages.map(m => m.id));

                    // Filter out messages that already exist
                    const newMessages = result.content.filter(m => !existingIds.has(m.id));

                    if (newMessages.length === 0) {
                        console.log('[useChatMessages] No new messages to add (all duplicates)');
                        return prev;
                    }

                    console.log(
                        `[useChatMessages] Adding ${newMessages.length} new messages to conversation ${conversationId}`
                    );

                    return {
                        ...prev,
                        [conversationId]: [...existingMessages, ...newMessages],
                    };
                });
                setMaxPages(prev => ({
                    ...prev,
                    [conversationId]: result.totalPages,
                }));
            }
        },
        []
    );

    // Clear messages for a conversation
    const clearMessages = useCallback((conversationId: string) => {
        setMessages(prev => {
            const newMessages = {...prev};
            delete newMessages[conversationId];
            return newMessages;
        });
        setMaxPages(prev => {
            const newMaxPages = {...prev};
            delete newMaxPages[conversationId];
            return newMaxPages;
        });
    }, []);

    // Send text message via WebSocket
    const sendTextMessage = useCallback(
        (
            conversationId: string,
            content: string,
            isGroup: boolean,
            recipientId?: string
        ) => {
            if (!connected) {
                console.error('[useChatMessages] Cannot send message: not connected');
                return;
            }

            try {
                client.sendTextMessage(conversationId, content, isGroup, recipientId);
            } catch (error) {
                console.error('[useChatMessages] Failed to send message:', error);
                throw error;
            }
        },
        [connected, client]
    );

    return {
        // Messages state
        messages,

        // Message operations
        loadMessages,
        clearMessages,
        sendTextMessage,
    };
}
