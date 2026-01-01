/**
 * Chat Badge Component
 * Displays unread chat message count badge
 * Can be used in navigation or anywhere in the UI
 */

'use client'

import React from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useChatNotification } from '@/hooks/useChatNotification'

interface ChatBadgeProps {
  className?: string
  variant?: 'icon' | 'button' | 'badge'
  showZero?: boolean
  unreadCount?: number // Optional: allows external unread count to be passed
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
 *
 * // With external unread count
 * <ChatBadge variant="icon" unreadCount={5} />
 * ```
 */
export function ChatBadge({
  className,
  variant = 'icon',
  showZero = false,
  unreadCount: externalUnreadCount,
}: ChatBadgeProps) {
  const router = useRouter()
  const { unreadChatCount: hookUnreadCount } = useChatNotification()

  // Use external count if provided, otherwise fall back to hook
  const unreadChatCount =
    externalUnreadCount !== undefined ? externalUnreadCount : hookUnreadCount

  const handleClick = () => {
    router.push('/conversations')
  }

  // Icon with badge overlay (for navigation)
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn('relative', className)}
        title={`${unreadChatCount} tin nhắn chưa đọc`}
      >
        <MessageCircle className="h-5 w-5 text-gray-700" />
        {(unreadChatCount > 0 || showZero) && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full animate-pulse-subtle shadow-sm"
            aria-hidden="true"
          >
            {unreadChatCount > 9 ? '9+' : unreadChatCount}
          </span>
        )}
      </Button>
    )
  }

  // Button with text and badge
  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className={cn('gap-2', className)}
      >
        <MessageCircle className="h-4 w-4" />
        <span>Tin nhắn</span>
        {(unreadChatCount > 0 || showZero) && (
          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
            {unreadChatCount > 9 ? '9+' : unreadChatCount}
          </span>
        )}
      </Button>
    )
  }

  // Just the badge (for embedding in existing UI)
  if (variant === 'badge') {
    if (unreadChatCount === 0 && !showZero) {
      return null
    }

    return (
      <span
        className={cn(
          'px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full',
          className,
        )}
      >
        {unreadChatCount > 9 ? '9+' : unreadChatCount}
      </span>
    )
  }

  return null
}

/**
 * Displays chat status indicator
 * Shows connection status and unread count
 */
export function ChatStatusIndicator({ className }: { className?: string }) {
  const { unreadChatCount } = useChatNotification()

  if (unreadChatCount === 0) return null

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <MessageCircle className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">
        {unreadChatCount} unread message{unreadChatCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
