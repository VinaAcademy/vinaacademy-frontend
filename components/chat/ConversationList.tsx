import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MessageCircle } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { ConversationDto } from '@/types/chat';

interface ConversationListProps {
    conversations: ConversationDto[];
    user: { id: string, fullName: string } | null;
    getUnreadCount: (conversation: ConversationDto) => number;
    handleConversationClick: (conversation: ConversationDto) => void;
    loading?: boolean;
    searchQuery?: string;
    clearSearch?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
                                                                      conversations,
                                                                      user,
                                                                      getUnreadCount,
                                                                      handleConversationClick,
                                                                      loading,
                                                                      searchQuery = '',
                                                                      clearSearch,
                                                                  }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-4">
                        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    {searchQuery ? (
                        <>
                            <div className="rounded-full bg-gray-100 p-6 mb-4">
                                <Search className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Không tìm thấy cuộc trò chuyện nào
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-sm">
                                Không có cuộc trò chuyện nào phù hợp với từ khóa tìm kiếm của bạn
                            </p>
                            <Button 
                                variant="outline" 
                                onClick={clearSearch}
                                className="hover:bg-gray-50"
                            >
                                Xóa tìm kiếm
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="rounded-full bg-gray-100 p-6 mb-4">
                                <MessageCircle className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Chưa có cuộc trò chuyện nào
                            </h3>
                            <p className="text-gray-600 max-w-sm">
                                Bắt đầu trò chuyện bằng cách truy cập hồ sơ của người dùng hoặc tham gia nhóm học tập
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
            {conversations.map((conversation) => (
                <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    user={user}
                    getUnreadCount={getUnreadCount}
                    handleConversationClick={handleConversationClick}
                />
            ))}
        </div>
    );
};