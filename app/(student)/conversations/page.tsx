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
            // Search by title (for groups)
            if (conv.title?.toLowerCase().includes(query)) return true;

            // Search by member names
            return conv.members.some(member =>
                member.fullName.toLowerCase().includes(query) ||
                member.username.toLowerCase().includes(query)
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
                <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20"></div>
                            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-md">
                                <MessageCircle className="h-6 w-6 text-white"/>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                Tin nhắn
                            </h1>
                            <p className="text-gray-600 text-sm mt-0.5">
                                Kết nối với giảng viên, sinh viên và nhóm học tập của bạn.
                            </p>
                        </div>
                    </div>

                    {/* Connection Status with better styling */}
                    {!connected && !connecting && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="font-medium">Chat đang bị ngắt kết nối. Hệ thống sẽ tự động thử lại...</span>
                        </div>
                    )}
                    {connecting && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="font-medium">Đang kết nối để trò chuyện...</span>
                        </div>
                    )}
                    {connected && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                            <span className="font-medium">Đã kết nối</span>
                        </div>
                    )}
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative mb-5 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300"/>
                        <Input
                            type="text"
                            placeholder="Tìm kiếm cuộc trò chuyện, người dùng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 h-11 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-lg">×</span>
                            </button>
                        )}
                    </div>
                </div>

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
