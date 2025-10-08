'use client';

import React, { useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationDTO, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { createSuccessToast } from '@/components/ui/toast-cus';

interface NotificationBellProps {
  className?: string;
}

// Get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.PAYMENT_SUCCESS:
      return '💳';
    case NotificationType.COURSE_REVIEW:
      return '⭐';
    case NotificationType.COURSE_APPROVAL:
      return '✅';
    case NotificationType.SUPPORT_REPLY:
      return '💬';
    case NotificationType.PROMOTION:
      return '🎉';
    case NotificationType.FINANCIAL_ALERT:
      return '💰';
    case NotificationType.STAFF_REQUEST:
      return '📋';
    case NotificationType.INSTRUCTOR_REQUEST:
      return '👨‍🏫';
    case NotificationType.SYSTEM:
    default:
      return '🔔';
  }
};

// Get color for notification type
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.PAYMENT_SUCCESS:
      return 'text-green-600';
    case NotificationType.COURSE_REVIEW:
      return 'text-yellow-600';
    case NotificationType.COURSE_APPROVAL:
      return 'text-blue-600';
    case NotificationType.SUPPORT_REPLY:
      return 'text-purple-600';
    case NotificationType.PROMOTION:
      return 'text-pink-600';
    case NotificationType.FINANCIAL_ALERT:
      return 'text-orange-600';
    case NotificationType.STAFF_REQUEST:
      return 'text-indigo-600';
    case NotificationType.INSTRUCTOR_REQUEST:
      return 'text-cyan-600';
    case NotificationType.SYSTEM:
    default:
      return 'text-gray-600';
  }
};

export function NotificationBell({ className }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, isConnected } = useNotification();
  const router = useRouter();

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.isRead) {
        createSuccessToast(`${latestNotification.title}: ${latestNotification.content}`);
      }
    }
  }, [notifications]);

  const handleNotificationClick = async (notification: NotificationDTO) => {
    // Mark as read
    await markAsRead(notification.id);

    // Navigate to target URL if exists
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return '';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {isConnected ? (
            <Badge variant="outline" className="text-green-600">
              ● Đang kết nối
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-400">
              ● Mất kết nối
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start w-full gap-2">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {notification.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${getNotificationColor(notification.type)}`}>
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
