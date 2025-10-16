/**
 * Chat Context
 * Provides global chat state and WebSocket connection management
 */

'use client';

import React, {createContext, useContext, ReactNode} from 'react';
import {useAuth} from './AuthContext';
import {getAccessToken} from '@/lib/apiClient';
import {useChat as useChatHook} from '@/hooks/useChat';
import type {
    ConversationDto,
    MessageDto,
    CreateGroupRequest,
} from '@/types/chat';

/**
 * Chat Context type
 */
interface ChatContextType {
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
 * Chat Context
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Chat Provider Props
 */
interface ChatProviderProps {
    children: ReactNode;
    debug?: boolean;
    autoConnect?: boolean;
}

/**
 * Chat Provider
 * Provides global chat functionality using WebSocket
 *
 * @example
 * ```tsx
 * <ChatProvider debug={false} autoConnect={true}>
 *   <App />
 * </ChatProvider>
 * ```
 */
export function ChatProvider({
                                 children,
                                 debug = false,
                                 autoConnect = true
                             }: ChatProviderProps) {
    const {user} = useAuth();
    const accessToken = getAccessToken();

    // Only initialize chat if user is logged in
    const chat = useChatHook({
        accessToken: accessToken || '',
        debug,
        autoConnect: autoConnect && !!user && !!accessToken,
    });

    // Don't render provider if no user (prevents unnecessary WebSocket attempts)
    if (!user || !accessToken) {
        return <>{children}</>;
    }

    return (
        <ChatContext.Provider value={chat}>
            {children}
        </ChatContext.Provider>
    );
}

/**
 * Hook to use Chat context
 * Must be used within ChatProvider
 *
 * @example
 * ```tsx
 * const { 
 *   connected, 
 *   conversations, 
 *   sendTextMessage 
 * } = useChat();
 * ```
 */
export function useChat(): ChatContextType {
    const context = useContext(ChatContext);

    if (context === undefined) {
        const {isAuthenticated} = useAuth();
        if (isAuthenticated) {
            throw new Error('useChat must be used within a ChatProvider when authenticated');
        } else {
            throw new Error('Redirecting to login');
        }
    }

    return context;
}

/**
 * Hook to check if chat is available
 * Returns false if not within ChatProvider
 *
 * @example
 * ```tsx
 * const isChatAvailable = useChatAvailable();
 * if (isChatAvailable) {
 *   // Show chat UI
 * }
 * ```
 */
export function useChatAvailable(): boolean {
    const context = useContext(ChatContext);
    return context !== undefined;
}

/**
 * Hook to get a specific conversation
 * @param conversationId - ID of the conversation to get
 */
export function useChatConversation(conversationId: string | null) {
    const {conversations} = useChat();

    if (!conversationId) return null;

    return conversations.find(conv => conv.id === conversationId) || null;
}

/**
 * Hook to get messages for a specific conversation
 * @param conversationId - ID of the conversation
 */
export function useChatMessages(conversationId: string | null) {
    const {messages} = useChat();

    if (!conversationId) return [];

    return messages[conversationId] || [];
}

/**
 * Hook to get unread conversations count
 * Note: This is a simplified version - you may want to implement proper unread tracking
 */
export function useUnreadCount(): number {
    const {conversations} = useChat();
    const {user} = useAuth();

    if (!user) return 0;

    // Count conversations where last message is not from current user
    // and is newer than user's last read time
    return conversations.filter(conv => {
        if (!conv.lastMessage) return false;

        const member = conv.members.find(m => m.memberId === user.id);
        if (!member) return false;

        // If user hasn't read any messages
        if (!member.lastReadMsgId) return true;

        // If last message is from someone else
        if (conv.lastMessage.senderId !== user.id) {
            // Check if it's newer than last read
            if (member.lastReadAt) {
                return new Date(conv.lastMessage.createdAt) > new Date(member.lastReadAt);
            }
            return true;
        }

        return false;
    }).length;
}
