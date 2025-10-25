// hooks/useConversationLogic.ts
import {useEffect, useState, useRef, useCallback} from 'react';
import {useChat} from '@/context/ChatContext';
import {useAuth} from '@/context/AuthContext';
import {useChatNotification} from '@/hooks/useChatNotification';
import CHAT_CONFIG from "@/config/chat.config";

export function useConversationLogic(conversationId: string) {
    const {user} = useAuth();
    const {
        connected,
        conversationsLoading,
        messages,
        loadMessages,
        sendTextMessage,
        markAsRead,
        getConversation,
    } = useChat();

    useChatNotification({currentConversationId: conversationId});

    const [isSending, setIsSending] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const lastSendTime = useRef<number>(0);
    const loadingRef = useRef(false);

    const conversation = getConversation(conversationId);
    const conversationMessages = messages[conversationId] || [];
    const isGroup = conversation?.type === 'GROUP';
    const recipient = isGroup ? null : conversation?.members.find(m => m.memberId !== user?.id);
    const currentUserMember = conversation?.members.find(m => m.memberId === user?.id);
    const lastReadMessageId = currentUserMember?.lastReadMsgId;

    useEffect(() => {
        setHasLoaded(false);
        setCurrentPage(0);
    }, [conversationId]);

    // Load messages
    useEffect(() => {
        if (conversationId && connected && !hasLoaded) {
            loadMessages(conversationId, 0).then(() => setHasLoaded(true));
        }
    }, [conversationId, connected, hasLoaded, loadMessages]);

    // Auto mark as read
    useEffect(() => {
        if (conversationId && connected) {
            const timer = setTimeout(() => markAsRead(conversationId), CHAT_CONFIG.SEND_DEBOUNCE_MS);
            return () => clearTimeout(timer);
        }
    }, [conversationId, connected, markAsRead]);

    // Handle send
    const handleSendMessage = useCallback(async (message: string) => {
        if (!message || !conversationId || !connected) return;
        const now = Date.now();
        if (now - lastSendTime.current < CHAT_CONFIG.SEND_DEBOUNCE_MS) return;
        lastSendTime.current = now;

        try {
            setIsSending(true);
            const recipientId = isGroup ? undefined : (recipient?.memberId ?? user?.id);
            sendTextMessage(conversationId, message, isGroup, recipientId);
        } finally {
            setIsSending(false);
        }
    }, [conversationId, connected, isGroup, recipient, user?.id, sendTextMessage]);

    // Load more messages - Facebook Messenger style
    const loadMoreMessages = useCallback(async () => {
        if (loadingRef.current || !hasLoaded) return;

        loadingRef.current = true;

        try {
            // Load next page
            await loadMessages(conversationId, currentPage + 1);
            setCurrentPage(prev => prev + 1);
        } catch (error) {
            console.error('[useConversationLogic] Error loading more messages:', error);
        } finally {
            loadingRef.current = false;
        }
    }, [conversationId, currentPage, hasLoaded, loadMessages]);

    return {
        user,
        connected,
        conversationsLoading,
        conversation,
        conversationMessages,
        recipient,
        isGroup,
        lastReadMessageId,
        isSending,
        handleSendMessage,
        loadMoreMessages,
        currentPage
    };
}