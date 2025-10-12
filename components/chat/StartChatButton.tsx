/**
 * Start Chat Button Component
 * Button to initiate a direct conversation with a user
 */

'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useChat} from '@/context/ChatContext';
import {Button} from '@/components/ui/button';
import {MessageCircle, Loader2} from 'lucide-react';
import {cn} from '@/lib/utils';
import {createErrorToast, createSuccessToast} from '@/components/ui/toast-cus';

interface StartChatButtonProps {
    userId: string;
    userName?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showIcon?: boolean;
    children?: React.ReactNode;
}

/**
 * Button component to start a chat with a user
 * Handles conversation creation and navigation
 *
 * @example
 * ```tsx
 * <StartChatButton
 *   userId="user-uuid"
 *   userName="John Doe"
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function StartChatButton({
                                    userId,
                                    userName,
                                    variant = 'default',
                                    size = 'default',
                                    className,
                                    showIcon = true,
                                    children,
                                }: StartChatButtonProps) {
    const router = useRouter();
    const {startDirectConversation, connected} = useChat();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (!connected) {
            createErrorToast('Chat service is currently disconnected. Please try again later.');
            return;
        }

        setIsLoading(true);

        try {
            const conversation = await startDirectConversation(userId);

            if (conversation) {
                createSuccessToast(
                    userName ? `Start chatting with ${userName}` : 'Conversation opened'
                );
                router.push(`/conversations/${conversation.id}`);
            } else {
                createErrorToast('Could not create conversation. Please try again.');
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            createErrorToast('An error occurred while starting the conversation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading || !connected}
            variant={variant}
            size={size}
            className={cn('gap-2', className)}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin"/>
            ) : (
                showIcon && <MessageCircle className="h-4 w-4"/>
            )}
            {children || 'Message'}
        </Button>
    );
}

/**
 * Icon-only version of StartChatButton
 *
 * @example
 * ```tsx
 * <StartChatIconButton userId="user-uuid" />
 * ```
 */
export function StartChatIconButton({
                                        userId,
                                        userName,
                                        className,
                                    }: Pick<StartChatButtonProps, 'userId' | 'userName' | 'className'>) {
    return (
        <StartChatButton
            userId={userId}
            userName={userName}
            variant="ghost"
            size="icon"
            className={className}
            showIcon={true}
        >
            <span className="sr-only">Message {userName || 'user'}</span>
        </StartChatButton>
    );
}
