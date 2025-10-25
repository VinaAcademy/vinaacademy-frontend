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
import {ConversationList} from "@/components/chat/ConversationList";
import ConversationsPageHeader from "@/components/chat/ConversationsPageHeader";
import ConversationsSearchBar from "@/components/chat/ConversationsSearchBar";

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
            // Search by title (for groups)
            if (conv.title?.toLowerCase().includes(query)) return true;

            // Search by member names
            return conv.members.some(member =>
                (member.fullName ?? '').toLowerCase().includes(query) ||
                (member.username ?? '').toLowerCase().includes(query)
            );
        });
    }, [conversations, searchQuery]);

    // Handle conversation click
    const handleConversationClick = (conversation: ConversationDto) => {
        router.push(`/conversations/${conversation.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
            <div className="container max-w-4xl mx-auto px-4 py-6">
                {/* Header with gradient */}
                <ConversationsPageHeader
                    connected={connected}
                    connecting={connecting}
                />

                {/* Enhanced Search Bar */}
                <ConversationsSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* List Component with shadow */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ConversationList
                        conversations={filteredConversations}
                        user={user}
                        handleConversationClick={handleConversationClick}
                        loading={conversationsLoading}
                        searchQuery={searchQuery}
                        clearSearch={() => setSearchQuery('')}
                    />
                </div>
            </div>
        </div>
    );
}
