/**
 * Chat Badge Component
 * Displays unread chat message count badge
 * Can be used in navigation or anywhere in the UI
 */

'use client';

import React from 'react';
import {MessageCircle} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';
import {cn} from '@/lib/utils';
import {useChatNotification} from '@/hooks/useChatNotification';

interface ChatBadgeProps {
    className?: string;
    variant?: 'icon' | 'button' | 'badge';
    showZero?: boolean;
}

/**
 * Displays chat unread count badge
 * Can be rendered as icon, button, or standalone badge
 *
 * @example
 * ```tsx
 * // Icon with badge (for navigation)
 * <ChatBadge variant="icon" />
 *
 * // Button with text and badge
 * <ChatBadge variant="button" />
 *
 * // Just the badge
 * <ChatBadge variant="badge" />
 * ```
 */
export function ChatBadge({
                              className,
                              variant = 'icon',
                              showZero = false,
                          }: ChatBadgeProps) {
    const router = useRouter();
    const {unreadChatCount} = useChatNotification();

    const handleClick = () => {
        router.push('/conversations');
    };

    // Icon with badge overlay (for navigation)
    if (variant === 'icon') {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleClick}
                className={cn('relative', className)}
                title={`${unreadChatCount} unread message${unreadChatCount !== 1 ? 's' : ''}`}
            >
                <MessageCircle className="h-5 w-5"/>
                {(unreadChatCount > 0 || showZero) && (
                    <Badge
                        variant="default"
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                    >
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </Badge>
                )}
            </Button>
        );
    }

    // Button with text and badge
    if (variant === 'button') {
        return (
            <Button
                variant="outline"
                onClick={handleClick}
                className={cn('gap-2', className)}
            >
                <MessageCircle className="h-4 w-4"/>
                <span>Messages</span>
                {(unreadChatCount > 0 || showZero) && (
                    <Badge variant="default" className="ml-auto">
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                    </Badge>
                )}
            </Button>
        );
    }

    // Just the badge (for embedding in existing UI)
    if (variant === 'badge') {
        if (unreadChatCount === 0 && !showZero) {
            return null;
        }

        return (
            <Badge variant="default" className={className}>
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
            </Badge>
        );
    }

    return null;
}

/**
 * Displays chat status indicator
 * Shows connection status and unread count
 */
export function ChatStatusIndicator({className}: { className?: string }) {
    const {unreadChatCount} = useChatNotification();

    if (unreadChatCount === 0) return null;

    return (
        <div className={cn('flex items-center gap-2 text-sm', className)}>
            <MessageCircle className="h-4 w-4 text-primary"/>
            <span className="text-muted-foreground">
        {unreadChatCount} unread message{unreadChatCount !== 1 ? 's' : ''}
      </span>
        </div>
    );
}
