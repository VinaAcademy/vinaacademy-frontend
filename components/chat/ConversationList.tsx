'use client';

import React from 'react';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {Search, MessageCircle} from 'lucide-react';
import {ConversationItem} from './ConversationItem';
import {ConversationDto} from '@/types/chat';

interface ConversationListProps {
    conversations: ConversationDto[];
    user: { id: string, fullName: string } | null;
    handleConversationClick: (conversation: ConversationDto) => void;
    loading?: boolean;
    searchQuery?: string;
    clearSearch?: () => void;
}

export class ConversationList extends React.Component<ConversationListProps> {
    static defaultProps = {searchQuery: ''}

    render() {
        let {
            conversations,
            user,
            handleConversationClick,
            loading,
            searchQuery,
            clearSearch,
        } = this.props;
        if (loading) {
            return (
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 divide-y divide-gray-100 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
                            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0"/>
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/3 rounded"/>
                                <Skeleton className="h-3 w-2/3 rounded"/>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (conversations.length === 0) {
            return (
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        {searchQuery ? (
                            <>
                                <div className="relative mb-5">
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                                    <div
                                        className="relative rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-6 shadow-inner">
                                        <Search className="h-10 w-10 text-gray-400"/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Không tìm thấy cuộc trò chuyện nào
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md text-sm leading-relaxed">
                                    Không có cuộc trò chuyện nào phù hợp với từ khóa tìm kiếm của bạn
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={clearSearch}
                                    className="hover:bg-gray-50 border hover:border-blue-500 hover:text-blue-600 transition-all duration-300 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow"
                                >
                                    Xóa tìm kiếm
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="relative mb-5">
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                                    <div
                                        className="relative rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6 shadow-inner">
                                        <MessageCircle className="h-10 w-10 text-blue-600"/>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Chưa có cuộc trò chuyện nào
                                </h3>
                                <p className="text-gray-600 max-w-md text-sm leading-relaxed">
                                    Bắt đầu trò chuyện bằng cách truy cập hồ sơ của người dùng hoặc tham gia nhóm học
                                    tập
                                </p>
                            </>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {conversations.map((conversation, index) => (
                        <div
                            key={conversation.id}
                            className="animate-in fade-in slide-in-from-left-2 duration-300"
                            style={{animationDelay: `${index * 30}ms`}}
                        >
                            <ConversationItem
                                conversation={conversation}
                                user={user}
                                handleConversationClick={handleConversationClick}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}