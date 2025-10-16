import React from 'react';
import {cn} from '@/lib/utils';
import {MemberDto, MessageDto} from "@/types/chat";
import {formatDate, formatMessageTime} from '@/utils/dateUtils';
import {Avatar} from "@/components/ui/avatar";
import {CheckCheck} from 'lucide-react';

interface MessageItemProps {
    message: MessageDto;
    index: number;
    userId?: string;
    isGroup: boolean;
    conversationMessages: MessageDto[];
    members: MemberDto[];
    isFirstOfDay?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
                                                     message,
                                                     index,
                                                     userId,
                                                     isGroup,
                                                     conversationMessages,
                                                     members,
                                                        isFirstOfDay = false,
                                                 }) => {
    const isOwn = message.senderId === userId;
    const sender = members.find(m => m.memberId === message.senderId);
    const showSender = isGroup && !isOwn;

    const prevMessage = index > 0 ? conversationMessages[index - 1] : null;
    let showTimestamp =
        !prevMessage ||
        new Date(message.createdAt).toDateString() !==
        new Date(prevMessage.createdAt).toDateString();
    showTimestamp = showTimestamp && (isFirstOfDay || index % 15 === 0);

    return (
        <div
            key={message.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{animationDelay: `${Math.min(index * 30, 300)}ms`}}
        >
            {/* Date separator */}
            {showTimestamp && (
                <div className="flex items-center justify-center my-6">
                    <div className="relative">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-sky-500/20 blur-xl rounded-full"/>
                        <div
                            className="relative bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/50 dark:to-sky-950/50 px-4 py-1.5 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-cyan-200/50 dark:border-cyan-800/50">
                            {formatDate(message.createdAt)}
                        </div>
                    </div>
                </div>
            )}

            {/* Message */}
            <div
                className={cn(
                    'flex gap-2 mb-3 group',
                    isOwn ? 'justify-end' : 'justify-start'
                )}
            >
                {/* Avatar for received messages */}
                {!isOwn && (
                    <Avatar
                        src={sender?.avatarUrl}
                        alt={sender?.fullName || 'User'}
                        size={32}
                        className="flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
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
                        <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
                            {sender?.fullName}
                        </span>
                    )}

                    {/* Message bubble */}
                    <div
                        className={cn(
                            'rounded-2xl px-4 py-2.5 max-w-md break-words transition-all duration-200 shadow-sm',
                            isOwn
                                ? 'bg-gradient-to-br from-cyan-500 to-sky-600 text-white rounded-br-sm hover:shadow-lg hover:scale-[1.02]'
                                : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-bl-sm hover:shadow-md border border-gray-200/50 dark:border-gray-700/50'
                        )}
                    >
                        {message.type === 'TEXT' && (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.textContent}
                            </p>
                        )}
                        {message.type === 'IMAGE' && (
                            <div className="text-sm flex items-center gap-2">
                                <span>📷</span>
                                <span>Image</span>
                            </div>
                        )}
                        {message.type === 'FILE' && (
                            <div className="text-sm flex items-center gap-2">
                                <span>📎</span>
                                <span>{message.fileName}</span>
                            </div>
                        )}
                    </div>

                    {/* Timestamp and read status */}
                    <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-xs text-muted-foreground">
                            {formatMessageTime(message.createdAt)}
                        </span>
                        {isOwn && (
                            <CheckCheck className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                message.deletedAt ? "text-gray-400" : "text-cyan-500"
                            )}/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageItem;