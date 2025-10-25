/**
 * Conversations List Page
 * Displays all conversations with search functionality
 * Supports searching by conversation or by user
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchUsers } from '@/hooks/useSearchUsers';
import { ConversationDto } from '@/types/chat';
import { User } from '@/types/auth';
import { ConversationList } from "@/components/chat/ConversationList";
import { UserSearchResults } from "@/components/chat/UserSearchResults";
import ConversationsPageHeader from "@/components/chat/ConversationsPageHeader";
import ConversationsSearchBar from "@/components/chat/ConversationsSearchBar";
import { createSuccessToast, createErrorToast } from '@/components/ui/toast-cus';

type SearchType = 'conversation' | 'user';

export default function ConversationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        conversations,
        conversationsLoading,
        connected,
        connecting,
        startDirectConversation,
    } = useChat();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('conversation');

    // Debounce search query to avoid excessive API calls
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Query for searching users
    const { data: userSearchResults, isLoading: userSearchLoading } = useSearchUsers(
        debouncedSearchQuery,
        searchType === 'user'
    );

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (searchType !== 'conversation' || !debouncedSearchQuery.trim()) {
            return conversations;
        }

        const query = debouncedSearchQuery.toLowerCase();
        return conversations.filter(conv => {
            // Search by title (for groups)
            if (conv.title?.toLowerCase().includes(query)) return true;

            // Search by member names
            return conv.members.some(member =>
                (member.fullName ?? '').toLowerCase().includes(query) ||
                (member.username ?? '').toLowerCase().includes(query)
            );
        });
    }, [conversations, debouncedSearchQuery, searchType]);

    // Handle conversation click
    const handleConversationClick = (conversation: ConversationDto) => {
        router.push(`/conversations/${conversation.id}`);
    };

    // Handle start chat with user from search results
    const handleStartChatWithUser = useCallback(async (userId: string, selectedUser: User) => {
        try {
            const conversation = await startDirectConversation(userId);
            if (conversation) {
                createSuccessToast(`Đã bắt đầu cuộc trò chuyện với ${selectedUser.fullName || selectedUser.username}`);
                router.push(`/conversations/${conversation.id}`);
            } else {
                createErrorToast('Không thể bắt đầu cuộc trò chuyện');
            }
        } catch (error) {
            console.error('Error starting direct conversation:', error);
            createErrorToast('Lỗi khi bắt đầu cuộc trò chuyện');
        }
    }, [startDirectConversation, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
            <div className="container max-w-4xl mx-auto px-4 py-6">
                {/* Header with gradient */}
                <ConversationsPageHeader
                    connected={connected}
                    connecting={connecting}
                />

                {/* Enhanced Search Bar with Filter */}
                <ConversationsSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchType={searchType}
                    setSearchType={setSearchType}
                />

                {/* Conditional rendering based on search type */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {searchType === 'conversation' ? (
                        <ConversationList
                            conversations={filteredConversations}
                            user={user}
                            handleConversationClick={handleConversationClick}
                            loading={conversationsLoading}
                            searchQuery={debouncedSearchQuery}
                            clearSearch={() => setSearchQuery('')}
                        />
                    ) : (
                        <UserSearchResults
                            results={userSearchResults}
                            loading={userSearchLoading}
                            onStartChat={handleStartChatWithUser}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
