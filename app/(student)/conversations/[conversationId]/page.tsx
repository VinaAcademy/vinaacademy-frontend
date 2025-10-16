/**
 * Conversation Detail Page
 * Displays messages for a specific conversation with real-time updates
 *
 * Performance optimizations:
 * - Debounced send to prevent spam
 * - flex-col-reverse in MessageList to avoid array cloning
 * - Ready for virtualization when message count > 100
 */

'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useChat} from '@/context/ChatContext';
import {useAuth} from '@/context/AuthContext';
import {useChatNotification} from '@/hooks/useChatNotification';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {ArrowLeft} from 'lucide-react';
import {cn} from '@/lib/utils';
import ConversationHeader from '@/components/chat/messages/ConversationHeader';
import MessageList from '@/components/chat/messages/MessageList';
import MessageInput from '@/components/chat/messages/MessageInput';

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const {user} = useAuth();
    const conversationId = params?.conversationId as string;

    const {
        connected,
        conversationsLoading,
        messages,
        loadMessages,
        sendTextMessage,
        markAsRead,
        getConversation,
    } = useChat();

    // Use chat notification hook for auto-marking as read
    useChatNotification({
        currentConversationId: conversationId,
    });

    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [hasLoadedInitialMessages, setHasLoadedInitialMessages] = useState(false);

    // Debounce for Enter key press to prevent spam
    const lastSendTime = useRef<number>(0);
    const SEND_DEBOUNCE_MS = 500; // 500ms debounce

    // Get current conversation
    const conversation = getConversation(conversationId);
    const conversationMessages = messages[conversationId] || [];

    // Check if conversation is a group
    const isGroup = conversation?.type === 'GROUP';

    // Get recipient for direct conversations
    const recipient = isGroup || !conversation
        ? null
        : (conversation.members.find(m => m.memberId !== user?.id));

    // Get the current user's member data to access lastReadMsgId
    const currentUserMember = conversation?.members.find(m => m.memberId === user?.id);
    const lastReadMessageId = currentUserMember?.lastReadMsgId;

    // Load initial messages
    useEffect(() => {
        if (conversationId && connected && !hasLoadedInitialMessages) {
            loadMessages(conversationId, 0).then(() => {
                setHasLoadedInitialMessages(true);
            });
        }
    }, [conversationId, connected, loadMessages, hasLoadedInitialMessages]);

    // Mark conversation as read when viewing
    useEffect(() => {
        if (conversationId && connected) {
            markAsRead(conversationId).then();
        }
    }, [conversationId, connected, markAsRead]);

    // Handle send message with debounce protection
    const handleSendMessage = useCallback(async () => {
        if (!messageInput.trim() || !conversationId || !connected) return;

        // Debounce check
        const now = Date.now();
        if (now - lastSendTime.current < SEND_DEBOUNCE_MS) {
            return; // Ignore rapid sends
        }
        lastSendTime.current = now;

        try {
            setIsSending(true);

            // For direct conversations, we need the recipient ID
            const recipientId = isGroup ? undefined : (recipient?.memberId ?? user?.id);

            sendTextMessage(
                conversationId,
                messageInput.trim(),
                isGroup,
                recipientId
            );

            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    }, [messageInput, conversationId, connected, sendTextMessage, isGroup, recipient, user?.id]);

    // Handle key press with debounce
    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage().then(r => r);
        }
    }, [handleSendMessage]);

    if (conversationsLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-300">
                {/* Header skeleton */}
                <div className="border-b p-4 bg-gradient-to-r from-card via-card to-card/95">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full"/>
                        <Skeleton className="h-12 w-12 rounded-full"/>
                        <div className="flex-1">
                            <Skeleton className="h-5 w-40 mb-2"/>
                            <Skeleton className="h-3 w-24"/>
                        </div>
                    </div>
                </div>

                {/* Messages skeleton */}
                <div className="flex-1 p-4 space-y-4 bg-gradient-to-b from-background via-background to-muted/10">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex gap-2 animate-pulse',
                                i % 2 === 0 ? 'justify-start' : 'justify-end'
                            )}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full"/>}
                            <Skeleton className="h-16 w-64 rounded-2xl"/>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4 animate-in fade-in zoom-in duration-500">
                <div className="text-center max-w-md">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-full p-8 mb-6 mx-auto w-fit shadow-lg">
                        <ArrowLeft className="h-16 w-16 text-red-500 dark:text-red-400"/>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        Không tìm thấy cuộc trò chuyện
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Cuộc trò chuyện này có thể đã bị xóa hoặc bạn không có quyền truy cập vào nó.
                    </p>
                    <Button
                        onClick={() => router.push('/conversations')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-background overflow-hidden">
            {/* Header - Fixed at top, flex-shrink-0 prevents it from shrinking */}
            <div className="flex-shrink-0">
                <ConversationHeader
                    conversation={conversation}
                    recipient={recipient}
                    isGroup={isGroup}
                    userAvatarUrl={user?.avatarUrl}
                    userFullName={user?.fullName}
                    userUsername={user?.username}
                    onBack={() => router.push('/conversations')}
                />
            </div>

            {/* Connection status - Fixed below header, flex-shrink-0 prevents it from shrinking */}
            {!connected && (
                <div className="flex-shrink-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 text-center text-sm border-b border-amber-200 dark:border-amber-800 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"/>
                        <span>Mất kết nối. Tin nhắn có thể không được gửi hoặc nhận.</span>
                    </div>
                </div>
            )}

            {/* Messages - Scrollable area (flex-1 with min-h-0 to allow shrinking) */}
            <div className="flex-1 min-h-0">
                <MessageList
                    messages={conversationMessages}
                    isGroup={isGroup}
                    userId={user?.id}
                    members={conversation?.members || []}
                    messagesEndRef={messagesEndRef}
                    messagesContainerRef={messagesContainerRef}
                    lastReadMessageId={lastReadMessageId}
                />
            </div>

            {/* Message input - Fixed at bottom, flex-shrink-0 prevents it from shrinking */}
            <div className="flex-shrink-0">
                <MessageInput
                    messageInput={messageInput}
                    isSending={isSending}
                    connected={connected}
                    onMessageChange={setMessageInput}
                    onSendMessage={handleSendMessage}
                    onKeyPress={handleKeyPress}
                />
            </div>
        </div>
    );
}
