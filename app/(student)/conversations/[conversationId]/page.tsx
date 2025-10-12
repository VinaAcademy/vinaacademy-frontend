/**
 * Conversation Detail Page
 * Displays messages for a specific conversation with real-time updates
 */

'use client';

import React, {useEffect, useState, useRef, useCallback} from 'react';
import {useRouter, useParams} from 'next/navigation';
import {useChat} from '@/context/ChatContext';
import {useAuth} from '@/context/AuthContext';
import {useChatNotification} from '@/hooks/useChatNotification';
import {MessageDto} from '@/types/chat';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {Avatar} from '@/components/ui/avatar';
import {
    ArrowLeft,
    Send,
    User,
    Users,
    Paperclip,
    Smile,
    MoreVertical
} from 'lucide-react';
import {cn} from '@/lib/utils';

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

    // Get current conversation
    const conversation = getConversation(conversationId);
    const conversationMessages = messages[conversationId] || [];

    // Check if conversation is a group
    const isGroup = conversation?.type === 'GROUP';

    // Get recipient for direct conversations
    const recipient = isGroup || !conversation
        ? null
        : (conversation.members.find(m => m.memberId !== user?.id));

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
            markAsRead(conversationId);
        }
    }, [conversationId, connected, markAsRead]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (conversationMessages.length > 0) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }, [conversationMessages.length]);

    // Format message time
    const formatMessageTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return date.toLocaleTimeString('vi-VN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        if (diffDays < 7) return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return date.toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Handle send message
    const handleSendMessage = useCallback(async () => {
        if (!messageInput.trim() || !conversationId || !connected) return;

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
    }, [messageInput, conversationId, connected, sendTextMessage, isGroup, recipient]);

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Render message item
    const renderMessage = (message: MessageDto, index: number) => {
        const isOwn = message.senderId === user?.id;
        const sender = conversation?.members.find(m => m.memberId === message.senderId);

        // Check if we should show sender info (for groups)
        const showSender = isGroup && !isOwn;

        // Check if we should show timestamp (first message or different day)
        const prevMessage = index > 0 ? conversationMessages[index - 1] : null;
        const showTimestamp = !prevMessage ||
            new Date(message.createdAt).toDateString() !== new Date(prevMessage.createdAt).toDateString();

        return (
            <div key={message.id}>
                {/* Date separator */}
                {showTimestamp && (
                    <div className="flex items-center justify-center my-4">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </div>
                    </div>
                )}

                {/* Message */}
                <div
                    className={cn(
                        'flex gap-2 mb-4',
                        isOwn ? 'justify-end' : 'justify-start'
                    )}
                >
                    {/* Avatar for received messages */}
                    {!isOwn && (
                        <Avatar
                            src={sender?.avatarUrl}
                            alt={sender?.fullName || 'User'}
                            size={32}
                            className="flex-shrink-0"
                        />
                    )}

                    {/* Message content */}
                    <div
                        className={cn(
                            'flex flex-col',
                            isOwn ? 'items-end' : 'items-start'
                        )}
                    >
                        {/* Sender name (for groups) */}
                        {showSender && (
                            <span className="text-xs text-muted-foreground mb-1 px-1">
                                {sender?.fullName}
                            </span>
                        )}

                        {/* Message bubble */}
                        <div
                            className={cn(
                                'rounded-2xl px-4 py-2 max-w-md break-words',
                                isOwn
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-muted rounded-bl-sm'
                            )}
                        >
                            {message.type === 'TEXT' && (
                                <p className="text-sm whitespace-pre-wrap">
                                    {message.textContent}
                                </p>
                            )}
                            {message.type === 'IMAGE' && (
                                <div className="text-sm">📷 Image</div>
                            )}
                            {message.type === 'FILE' && (
                                <div className="text-sm">
                                    📎 {message.fileName}
                                </div>
                            )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-muted-foreground mt-1 px-1">
                            {formatMessageTime(message.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (conversationsLoading) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)]">
                {/* Header skeleton */}
                <div className="border-b p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full"/>
                        <div className="flex-1">
                            <Skeleton className="h-5 w-40 mb-2"/>
                            <Skeleton className="h-3 w-24"/>
                        </div>
                    </div>
                </div>

                {/* Messages skeleton */}
                <div className="flex-1 p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex gap-2',
                                i % 2 === 0 ? 'justify-start' : 'justify-end'
                            )}
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
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Không tìm thấy cuộc trò chuyện</h2>
                    <p className="text-muted-foreground mb-4">
                        Cuộc trò chuyện này có thể đã bị xóa hoặc bạn không có quyền truy cập vào nó.
                    </p>
                    <Button onClick={() => router.push('/conversations')}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Back button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/conversations')}
                        >
                            <ArrowLeft className="h-5 w-5"/>
                        </Button>

                        {/* Avatar */}
                        <Avatar
                            src={conversation.avatarUrl || recipient?.avatarUrl || user?.avatarUrl}
                            alt={conversation.name}
                            size={40}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold truncate">
                                {isGroup ? conversation.title : recipient?.fullName || conversation.name || user?.fullName}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {isGroup ? (
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3"/>
                                        {conversation.members.length} members
                                    </span>
                                ) : (
                                    <span>@{recipient?.username || user?.username}</span>
                                )}
                            </p>
                        </div>

                        {/* Actions */}
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5"/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Connection status */}
            {!connected && (
                <div className="bg-destructive/10 text-destructive px-4 py-2 text-center text-sm">
                    Disconnected. Messages may not be sent or received.
                </div>
            )}

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto bg-background"
            >
                <div className="container max-w-4xl mx-auto px-4 py-4">
                    {conversationMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                            <div className="bg-muted rounded-full p-6 mb-4">
                                {isGroup ? (
                                    <Users className="h-12 w-12 text-muted-foreground"/>
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground"/>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {isGroup ? 'Bắt đầu cuộc trò chuyện nhóm' : 'Bắt đầu cuộc trò chuyện'}
                            </h3>
                            <p className="text-muted-foreground">
                                Gửi tin nhắn để bắt đầu
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Reverse order for newest first from backend */}
                            {[...conversationMessages].reverse().map((message, index) =>
                                renderMessage(message, index)
                            )}
                            <div ref={messagesEndRef}/>
                        </>
                    )}
                </div>
            </div>

            {/* Message input */}
            <div className="border-t bg-card">
                <div className="container max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2">
                        {/* Attachment button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Coming soon"
                        >
                            <Paperclip className="h-5 w-5"/>
                        </Button>

                        {/* Input */}
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!connected || isSending}
                            className="flex-1"
                        />

                        {/* Emoji button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Coming soon"
                        >
                            <Smile className="h-5 w-5"/>
                        </Button>

                        {/* Send button */}
                        <Button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || !connected || isSending}
                            size="icon"
                        >
                            <Send className="h-5 w-5"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
