'use client';

import React from 'react';
import {cn} from '@/lib/utils';
import {Badge} from '@/components/ui/badge';
import {Avatar} from '@/components/ui/avatar';
import {Users, Image as ImageIcon, Paperclip} from 'lucide-react';
import {formatMessageTime} from '@/utils/dateUtils';
import {ConversationDto, MessageDto} from '@/types/chat';

// Props interface
interface ConversationItemProps {
    conversation: ConversationDto;
    user: { id: string, fullName: string } | null;
    getUnreadCount: (conversation: ConversationDto) => number;
    handleConversationClick: (conversation: ConversationDto) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
                                                                      conversation,
                                                                      user,
                                                                      getUnreadCount,
                                                                      handleConversationClick,
                                                                  }) => {
    const unreadCount = getUnreadCount(conversation);
    const isGroup = conversation.type === 'GROUP';
    const lastMessage = conversation.lastMessage as MessageDto | undefined;

    // Get recipient for direct conversations
    const recipient = isGroup
        ? null
        : conversation.members.find((m) => m.memberId !== user?.id) ?? user;

    // Render last message preview
    const renderLastMessagePreview = () => {
        if (!lastMessage) {
            return <span className="italic text-gray-400">Chưa có tin nhắn nào</span>;
        }

        const isSender = lastMessage.senderId === user?.id;
        const senderPrefix = isSender ? 'Bạn: ' : '';

        switch (lastMessage.type) {
            case 'TEXT':
                return (
                    <span>
                        {senderPrefix}{lastMessage.textContent}
                    </span>
                );
            case 'IMAGE':
                return (
                    <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {senderPrefix}Hình ảnh
                    </span>
                );
            case 'FILE':
                return (
                    <span className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {senderPrefix}{lastMessage.fileName || 'Tệp đính kèm'}
                    </span>
                );
            default:
                return <span>{senderPrefix}Tin nhắn</span>;
        }
    };

    return (
        <div
            onClick={() => handleConversationClick(conversation)}
            className={cn(
                'flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200',
                unreadCount > 0 && 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500'
            )}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                <Avatar
                    src={conversation.avatarUrl}
                    alt={conversation.name}
                    size={48}
                    className="border-2 border-gray-200"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3
                            className={cn(
                                'font-semibold text-gray-900 truncate',
                                unreadCount > 0 && 'text-blue-900'
                            )}
                        >
                            {isGroup
                                ? conversation.title
                                : recipient?.fullName || conversation.name}
                        </h3>
                        {isGroup && (
                            <Badge 
                                variant="outline" 
                                className="flex-shrink-0 bg-gray-100 text-gray-700 border-gray-300"
                            >
                                <Users className="h-3 w-3 mr-1"/>
                                {conversation.members.length}
                            </Badge>
                        )}
                    </div>
                    {lastMessage && conversation.lastMessageAt && (
                        <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap ml-2">
                            {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                    )}
                </div>

                {/* Last message preview */}
                <div className="flex items-center justify-between gap-2">
                    <p
                        className={cn(
                            'text-sm text-gray-600 truncate',
                            unreadCount > 0 && 'font-medium text-gray-900'
                        )}
                    >
                        {renderLastMessagePreview()}
                    </p>
                    {unreadCount > 0 && (
                        <Badge
                            className="flex-shrink-0 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-600 text-white text-xs font-semibold"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
};