/**
 * Conversations List Page
 * Displays all conversations with search functionality
 */

'use client';

import React, {useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {useChat} from '@/context/ChatContext';
import {useAuth} from '@/context/AuthContext';
import {ConversationDto} from '@/types/chat';
import {Input} from '@/components/ui/input';
import {Search, MessageCircle} from 'lucide-react';
import {ConversationList} from "@/components/chat/ConversationList";

export default function ConversationsPage() {
    const router = useRouter();
    const {user} = useAuth();
    const {
        conversations,
        conversationsLoading,
        connected,
        connecting,
    } = useChat();

    // Use chat notification hook (on list page, don't show popup notifications)
    const [searchQuery, setSearchQuery] = useState('');

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;

        const query = searchQuery.toLowerCase();
        return conversations.filter(conv => {
            // Search by conversation name
            if (conv.name.toLowerCase().includes(query)) return true;

            // Search by title (for groups)
            if (conv.title?.toLowerCase().includes(query)) return true;

            // Search by member names
            return conv.members.some(member =>
                member.fullName.toLowerCase().includes(query) ||
                member.username.toLowerCase().includes(query)
            );
        });
    }, [conversations, searchQuery]);

    // Get unread count for a conversation
    const getUnreadCount = (conversation: ConversationDto): number => {
        if (!user || !conversation.lastMessage) return 0;

        const member = conversation.members.find(m => m.memberId === user.id);
        if (!member) return 0;

        // If user hasn't read any messages
        if (!member.lastReadMsgId) {
            return conversation.lastMessage.seq;
        }

        // If last message is from someone else and user hasn't read it
        if (conversation.lastMessage.senderId !== user.id) {
            if (member.lastReadAt) {
                const lastMsgTime = new Date(conversation.lastMessage.createdAt);
                const lastReadTime = new Date(member.lastReadAt);
                return lastMsgTime > lastReadTime ? 1 : 0;
            }
            return 1;
        }

        return 0;
    };

    // Handle conversation click
    const handleConversationClick = (conversation: ConversationDto) => {
        router.push(`/conversations/${conversation.id}`);
    };

    return (
        <div className="container max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <MessageCircle className="h-8 w-8"/>
                    Tin nhắn
                </h1>
                <p className="text-muted-foreground">
                    Kết nối với giảng viên, sinh viên và nhóm học tập của bạn.
                </p>
            </div>

            {/* Connection Status */}
            {!connected && !connecting && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
                    Chat đang bị ngắt kết nối. Hệ thống sẽ tự động thử lại...
                </div>
            )}
            {connecting && (
                <div className="bg-blue-500/10 text-blue-600 px-4 py-3 rounded-lg mb-4">
                    Đang kết nối để trò chuyện...
                </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện, người dùng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* List Component */}
            <ConversationList
                conversations={filteredConversations}
                user={user}
                getUnreadCount={getUnreadCount}
                handleConversationClick={handleConversationClick}
                loading={conversationsLoading}
                searchQuery={searchQuery}
                clearSearch={() => setSearchQuery('')}
            />
        </div>
    );
}
