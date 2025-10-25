'use client';

import React from 'react';
import {cn} from '@/lib/utils';
import {Badge} from '@/components/ui/badge';
import {Avatar} from '@/components/ui/avatar';
import {Users, Image as ImageIcon, Paperclip} from 'lucide-react';
import {formatMessageTime} from '@/utils/dateUtils';
import {ConversationDto, MessageDto} from '@/types/chat';
import OnlineIndicator from "@/components/chat/OnlineIndicator";


// Props interface
interface ConversationItemProps {
    conversation: ConversationDto;
    user: { id: string, fullName: string } | null;
    handleConversationClick: (conversation: ConversationDto) => void;
    isOnline?: boolean;
}

export class ConversationItem extends React.Component<ConversationItemProps> {
    render() {
        let {
            conversation,
            user,
            handleConversationClick,
            isOnline = false
        } = this.props;

        const unreadChatCount = conversation.unreadCount || 0;
        const isGroup = conversation.type === 'GROUP';
        const lastMessage = conversation.lastMessage as MessageDto | undefined;

        // Get recipient for direct conversations
        const recipient = isGroup
            ? null
            : conversation.members.find((m) => m.memberId !== user?.id)
            ?? {
                memberId: user?.id || '',
                fullName: user?.fullName || 'Người dùng ẩn danh',
                username: '',
                avatarUrl: ''
            };

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
                        <ImageIcon className="h-3 w-3"/>
                            {senderPrefix}Hình ảnh
                    </span>
                    );
                case 'FILE':
                    return (
                        <span className="flex items-center gap-1">
                        <Paperclip className="h-3 w-3"/>
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
                    'group relative flex items-start gap-3 p-4 cursor-pointer transition-all duration-300',
                    'hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-sky-50/30',
                    'active:scale-[0.99]',
                    unreadChatCount > 0 && 'bg-gradient-to-r from-cyan-50/60 to-transparent border-l-4 border-l-cyan-500'
                )}
            >
                {/* Hover effect overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-sky-500/0 group-hover:from-cyan-500/5 group-hover:to-sky-500/5 transition-all duration-300 pointer-events-none"></div>

                {/* Avatar with ring effect */}
                <div className="relative flex-shrink-0 z-10">
                    <div className={cn(
                        "absolute inset-0 rounded-full transition-all duration-300",
                        unreadChatCount > 0
                            ? "ring-2 ring-cyan-400 ring-offset-2 animate-pulse"
                            : "group-hover:ring-2 group-hover:ring-cyan-300/50 group-hover:ring-offset-2"
                    )}>
                    </div>
                    <Avatar
                        src={conversation.avatarUrl}
                        alt={conversation?.title || 'Avatar'}
                        size={48}
                        className="border-2 border-white shadow-sm group-hover:shadow-md transition-all duration-300"
                    />
                    {/* Online indicator */}
                    {!isGroup && (
                        <OnlineIndicator
                            isOnline={isOnline}
                            size={12}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3
                                className={cn(
                                    'font-semibold text-sm truncate transition-colors duration-300',
                                    unreadChatCount > 0 ? 'text-gray-900' : 'text-gray-800 group-hover:text-cyan-900'
                                )}
                            >
                                {isGroup
                                    ? conversation.title
                                    : recipient?.fullName || conversation?.title || 'Người dùng ẩn danh'}
                            </h3>
                            {isGroup && (
                                <Badge
                                    variant="outline"
                                    className="flex-shrink-0 bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 border-cyan-200 text-xs font-medium px-1.5 py-0"
                                >
                                    <Users className="h-3 w-3 mr-0.5"/>
                                    {conversation.members.length}
                                </Badge>
                            )}
                        </div>
                        {lastMessage && conversation.lastMessageAt && (
                            <span className={cn(
                                "text-xs flex-shrink-0 whitespace-nowrap ml-2 font-medium transition-colors duration-300",
                                unreadChatCount > 0 ? "text-cyan-600" : "text-gray-500 group-hover:text-gray-700"
                            )}>
                            {formatMessageTime(conversation.lastMessageAt)}
                        </span>
                        )}
                    </div>

                    {/* Last message preview */}
                    <div className="flex items-center justify-between gap-2">
                        <p
                            className={cn(
                                'text-xs truncate transition-colors duration-300',
                                unreadChatCount > 0
                                    ? 'font-semibold text-gray-900'
                                    : 'text-gray-600 group-hover:text-gray-800'
                            )}
                        >
                            {renderLastMessagePreview()}
                        </p>
                        {unreadChatCount > 0 && (
                            <Badge
                                className="flex-shrink-0 h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-600 hover:to-sky-500 text-white text-xs font-bold shadow-md animate-in zoom-in duration-300"
                            >
                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}