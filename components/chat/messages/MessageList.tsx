import React, {useEffect, useMemo, useRef} from 'react'
import {User, Users, MessageSquareOff} from 'lucide-react'
import {MessageDto, MemberDto} from '@/types/chat'
import MessageItem from './MessageItem'
import UnreadDivider from '@/components/chat/messages/UnreadDivider'
import LoadOlderButton from "@/components/chat/messages/LoadOlderButton";

interface MessageListProps {
    messages: MessageDto[],
    isGroup: boolean,
    userId?: string,
    members: MemberDto[],
    lastReadMessageId?: string | null,
    loadMoreMessages?: () => void,
    currentPage: number,
}

const MessageList: React.FC<MessageListProps> = ({
                                                     messages,
                                                     isGroup,
                                                     userId,
                                                     members,
                                                     lastReadMessageId,
                                                     loadMoreMessages,
                                                     currentPage = 0
                                                 }) => {

    const uniqueMessages = useMemo(() => {
        const seen = new Set<string>()
        const unique: MessageDto[] = []
        for (const message of messages) {
            if (!seen.has(message.id)) {
                seen.add(message.id)
                unique.push(message)
            } else {
                console.warn('[MessageList] Duplicate message detected and filtered:', message.id)
            }
        }
        return unique
    }, [messages])

    const lastReadIndex = useMemo(() => {
        if (!lastReadMessageId) return -1
        return uniqueMessages.findIndex((msg) => msg.id === lastReadMessageId)
    }, [uniqueMessages, lastReadMessageId])

    const containerRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const prevPageRef  = useRef(-1);
    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        const prev = prevPageRef.current;
        if (uniqueMessages.length > 0 && endRef.current && currentPage == prev) {
            endRef.current.scrollIntoView({behavior: 'smooth'})
        }
        prevPageRef.current = currentPage;
    }, [uniqueMessages.length, currentPage])

    return (
        <div
            ref={containerRef}
            className="h-full overflow-y-auto overflow-x-hidden bg-gradient-to-b from-background via-background to-muted/10"
        >
            <div className="container max-w-4xl mx-auto px-4 py-4 min-h-full">
                {uniqueMessages.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center h-full text-center py-16 animate-in fade-in duration-500">
                        <div
                            className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 rounded-full p-8 mb-6 shadow-lg">
                            {isGroup ? (
                                <Users className="h-16 w-16 text-cyan-600 dark:text-cyan-400"/>
                            ) : (
                                <User className="h-16 w-16 text-sky-600 dark:text-sky-400"/>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                            {isGroup ? 'Bắt đầu cuộc trò chuyện nhóm' : 'Bắt đầu cuộc trò chuyện'}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện của bạn
                        </p>
                        <div
                            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                            <MessageSquareOff className="h-4 w-4"/>
                            <span>Chưa có tin nhắn nào</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col-reverse">
                        <div ref={endRef}/>
                        {uniqueMessages.map((message, index) => {
                            const actualIndex = uniqueMessages.length - 1 - index
                            const currentMsg = uniqueMessages[actualIndex]
                            const prevMsg = uniqueMessages[actualIndex + 1]
                            const isFirstOfDay =
                                !prevMsg ||
                                new Date(prevMsg.createdAt).toDateString() !==
                                new Date(currentMsg.createdAt).toDateString()

                            const readIndex = uniqueMessages.length - lastReadIndex
                            const showUnreadDivider = readIndex !== -1 && actualIndex === readIndex

                            return (
                                <React.Fragment key={message.id}>
                                    <MessageItem
                                        message={message}
                                        index={actualIndex}
                                        userId={userId}
                                        isGroup={isGroup}
                                        conversationMessages={uniqueMessages}
                                        members={members}
                                        isFirstOfDay={isFirstOfDay}
                                    />
                                    {showUnreadDivider && <UnreadDivider/>}
                                </React.Fragment>
                            )
                        })}

                        <LoadOlderButton onLoadMore={loadMoreMessages}/>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MessageList