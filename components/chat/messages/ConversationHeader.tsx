import React from 'react';
import {Button} from '@/components/ui/button';
import {Avatar} from '@/components/ui/avatar';
import {ArrowLeft, Users, Phone, Video, Info} from 'lucide-react';
import {ConversationDto, MemberDto} from '@/types/chat';
import {getImageUrl} from "@/utils/imageUtils";
import {useChat} from "@/context";
import OnlineIndicator from "@/components/chat/OnlineIndicator";

interface ConversationHeaderProps {
    conversation: ConversationDto;
    recipient: MemberDto | null | undefined;
    isGroup: boolean;
    userAvatarUrl?: string;
    userFullName?: string;
    userUsername?: string;
    onBack: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
                                                                   conversation,
                                                                   recipient,
                                                                   isGroup,
                                                                   userAvatarUrl,
                                                                   userFullName,
                                                                   userUsername,
                                                                   onBack,
                                                               }) => {
    // Mock online status - in production, this should come from real-time presence data
    const {isUserOnline} = useChat();

    return (
        <div className="border-b bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-sm shadow-sm">
            <div className="container max-w-4xl mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5"/>
                    </Button>

                    {/* Avatar with online indicator */}
                    <div className="relative">
                        <Avatar
                            src={getImageUrl(conversation.avatarUrl || recipient?.avatarUrl || userAvatarUrl || '')}
                            alt={conversation.title || 'Avatar'}
                            size={48}
                            className="border-2 border-white dark:border-gray-800 shadow-sm"
                        />
                        {!isGroup && (
                            <OnlineIndicator
                                isOnline={isUserOnline(recipient?.memberId || '')}
                                size={14}
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold truncate text-base">
                            {isGroup ? conversation.title : recipient?.fullName || userFullName}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {isGroup ? (
                                <>
                                    <Users className="h-3 w-3"/>
                                    <span>{conversation.members.length} thành viên</span>
                                </>
                            ) : (
                                <>
                                    <span>@{recipient?.username || userUsername || 'Người dùng ẩn danh'}</span>
                                    {recipient && (
                                        <>
                                            {isUserOnline(recipient.memberId) ? (
                                                <>
                                                    <span className="text-green-500">•</span>
                                                    <span className="text-green-600 dark:text-green-400 font-medium">Đang hoạt động</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-500 dark:text-gray-400">Ngoại tuyến</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Coming soon"
                            className="hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                        >
                            <Phone className="h-5 w-5"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Coming soon"
                            className="hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                        >
                            <Video className="h-5 w-5"/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Info className="h-5 w-5"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationHeader;
