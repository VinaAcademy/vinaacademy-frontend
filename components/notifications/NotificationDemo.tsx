'use client';

import React from 'react';
import { useNotification } from '@/hooks/useNotification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2 } from 'lucide-react';
import { NotificationDTO } from '@/types/notification';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationDemo() {
  const { 
    isConnected, 
    notifications, 
    unreadCount, 
    markAsRead, 
    clearNotifications 
  } = useNotification();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              WebSocket Notification Demo
            </CardTitle>
            <CardDescription>
              Real-time notifications using SockJS + STOMP
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
            <Badge variant="outline">
              {unreadCount} unread
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <div className="space-y-1 text-sm">
            <p>Status: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Connected to WebSocket' : 'Disconnected'}
            </span></p>
            <p>Total Notifications: {notifications.length}</p>
            <p>Unread: {unreadCount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Notifications List */}
        <div>
          <h3 className="font-semibold mb-2">Notifications</h3>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mb-2 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">
                  Waiting for real-time notifications from server...
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification: NotificationDTO) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.isRead && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Type: {notification.type}</span>
                          <span>Time: {formatDate(notification.createdAt)}</span>
                          {notification.targetUrl && (
                            <a 
                              href={notification.targetUrl}
                              className="text-blue-600 hover:underline"
                            >
                              View Details →
                            </a>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Usage Instructions */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h3 className="font-semibold text-sm">💡 How to Use</h3>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>The WebSocket connection is established automatically when you login</li>
            <li>Notifications will appear in real-time when sent from the backend</li>
            <li>Click the bell icon in the header to see all notifications</li>
            <li>Browser notifications will show if you grant permission</li>
            <li>Connection will auto-reconnect if lost (5 second delay)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
