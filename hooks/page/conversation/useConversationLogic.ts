// hooks/useConversationLogic.ts
import {useEffect, useState, useRef, useCallback} from 'react';
import {useChat} from '@/context/ChatContext';
import {useAuth} from '@/context/AuthContext';
import {useChatNotification} from '@/hooks/useChatNotification';

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
    const lastSendTime = useRef<number>(0);
    const SEND_DEBOUNCE_MS = 500;

    const conversation = getConversation(conversationId);
    const conversationMessages = messages[conversationId] || [];
    const isGroup = conversation?.type === 'GROUP';
    const recipient = isGroup ? null : conversation?.members.find(m => m.memberId !== user?.id);
    const currentUserMember = conversation?.members.find(m => m.memberId === user?.id);
    const lastReadMessageId = currentUserMember?.lastReadMsgId;

    // Load messages
    useEffect(() => {
        if (conversationId && connected && !hasLoaded) {
            loadMessages(conversationId, 0).then(() => setHasLoaded(true));
        }
    }, [conversationId, connected, hasLoaded]);

    // Auto mark as read
    useEffect(() => {
        if (conversationId && connected) {
            const timer = setTimeout(() => markAsRead(conversationId), 500);
            return () => clearTimeout(timer);
        }
    }, [conversationId, connected]);

    // Handle send
    const handleSendMessage = useCallback(async (message: string) => {
        if (!message || !conversationId || !connected) return;
        const now = Date.now();
        if (now - lastSendTime.current < SEND_DEBOUNCE_MS) return;
        lastSendTime.current = now;

        try {
            setIsSending(true);
            const recipientId = isGroup ? undefined : (recipient?.memberId ?? user?.id);
            sendTextMessage(conversationId, message, isGroup, recipientId);
        } finally {
            setIsSending(false);
        }
    }, [conversationId, connected, isGroup, recipient, user?.id]);

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
    };
}