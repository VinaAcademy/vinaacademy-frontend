"use client";
import {useParams, useRouter} from 'next/navigation';
import ConversationHeader from '@/components/chat/messages/ConversationHeader';
import MessageList from '@/components/chat/messages/MessageList';
import MessageInput from '@/components/chat/message-input/MessageInput';
import ConversationSkeleton from '@/components/chat/messages/ConversationSkeleton';
import ConversationNotFound from '@/components/chat/messages/ConversationNotFound';
import {useConversationLogic} from "@/hooks/page/conversation/useConversationLogic";

export default function ConversationPage() {
    const {conversationId} = useParams() as { conversationId: string };
    const router = useRouter();
    const {
        user,
        connected,
        conversationsLoading,
        conversation,
        conversationMessages,
        recipient,
        isGroup,
        lastReadMessageId,
        isSending,
        handleSendMessage,
        loadMoreMessages,
        currentPage
    } = useConversationLogic(conversationId);

    if (conversationsLoading) return <ConversationSkeleton/>;
    if (!conversation) return <ConversationNotFound/>;

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            <ConversationHeader
                conversation={conversation}
                recipient={recipient}
                isGroup={isGroup}
                userFullName={user?.fullName}
                userUsername={user?.username}
                onBack={() => router.push('/conversations')}
            />

            {!connected && (
                <div className="bg-amber-500/10 text-amber-700 px-4 py-2 text-center text-sm border-b">
                    <span>Mất kết nối. Tin nhắn có thể không được gửi hoặc nhận.</span>
                </div>
            )}

            <MessageList
                messages={conversationMessages}
                isGroup={isGroup}
                userId={user?.id}
                members={conversation?.members || []}
                lastReadMessageId={lastReadMessageId}
                loadMoreMessages={loadMoreMessages}
                currentPage={currentPage}
            />

            <MessageInput
                isSending={isSending}
                connected={connected}
                onSendMessage={handleSendMessage}
            />
        </div>
    );
}