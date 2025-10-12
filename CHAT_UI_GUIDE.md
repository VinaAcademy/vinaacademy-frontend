# Chat UI Implementation Guide

## Overview

This document describes the complete Chat UI system implemented for the VinaAcademy platform, including real-time messaging, notification integration, and conversation management.

## Architecture

### Components Structure

```
app/(student)/conversations/
├── page.tsx                    # Conversations list page
├── [conversationId]/
│   └── page.tsx               # Conversation detail with messages
└── layout.tsx                 # Conversations layout

context/
├── ChatContext.tsx            # Global chat state and WebSocket
└── NotificationContext.tsx    # Notification system integration

hooks/
├── useChat.ts                 # Chat hook with WebSocket management
└── useChatNotification.ts     # Chat notification integration hook

services/
└── chatService.ts             # REST API calls for chat

lib/
└── chatWebSocket.ts           # WebSocket client for chat

types/
├── chat.ts                    # Chat type definitions
└── notification.ts            # Notification types (includes MESSAGE)
```

## Features

### 1. Conversations List (`/conversations`)

**URL**: `/conversations`

**Features**:
- Displays all user's conversations (direct and group)
- Real-time updates when new messages arrive
- Search functionality to find users/conversations
- Unread message indicators
- Last message preview with timestamp
- Connection status indicator
- Empty state when no conversations

**Key Components**:
```tsx
- ConversationsPage: Main page component
- useChatNotification(): Manages notification integration
- useChat(): Provides conversation list and WebSocket status
```

**User Flow**:
1. User navigates to `/conversations`
2. WebSocket auto-connects if authenticated
3. Conversations load from backend via REST API
4. Search bar filters conversations by name/username
5. Click on conversation navigates to detail page

### 2. Conversation Detail (`/conversations/{conversationId}`)

**URL**: `/conversations/{conversationId}`

**Features**:
- Real-time message display with auto-scroll
- Send text messages (file upload coming soon)
- Message timestamps and date separators
- Sender information for group chats
- Auto-mark notifications as read when viewing
- Auto-mark conversation as read
- Connection status indicator
- Empty state for new conversations

**Key Components**:
```tsx
- ConversationPage: Message display and input
- useChatNotification(): Auto-marks notifications as read
- useChat(): Provides messages and send functionality
```

**User Flow**:
1. User navigates from conversations list or notification
2. Conversation details load from context
3. Messages load via REST API (paginated, 50 per page)
4. User types message and presses Enter or clicks Send
5. Message sent via WebSocket to backend
6. Backend broadcasts to recipients
7. Message appears in conversation in real-time

### 3. Notification Integration

**Notification Type**: `MESSAGE`

**Backend Event**:
```java
kafkaNotificationService.sendNotification(
  NotificationCreateEvent.builder()
    .title("Bạn có tin nhắn mới")
    .content("%s: %s".formatted(userInfo.getFullName(), message.getTextContent()))
    .type(NotificationType.MESSAGE)
    .targetUrl("/conversations/" + conversation.getId())
    .userId(messageDto.getRecipientId())
    .build()
);
```

**Auto-Read Logic**:
- **Current conversation page**: Notification auto-marked as read (no popup)
- **Conversations list page**: No notification popup (list updates automatically)
- **Other pages**: Notification shown via callback (can trigger toast/popup)

**Implementation**:
```tsx
// In conversation detail page
useChatNotification({
  currentConversationId: conversationId,
});

// In conversations list page
const { unreadChatCount } = useChatNotification();
```

## WebSocket Architecture

### Chat WebSocket

**Endpoint**: `http://localhost:8080/ws/chat`

**Authentication**: JWT Bearer token in connect headers

**Subscriptions**:
1. **Private Messages**: `/user/queue/pm`
   - Auto-subscribed on connection
   - Receives direct messages from any user

2. **Group Messages**: `/topic/group/{conversationId}`
   - Subscribe when viewing group conversation
   - Receives messages from group members

**Publishing**:
1. **Send Private Message**: `/app/pm`
   ```json
   {
     "recipientId": "uuid",
     "type": "TEXT",
     "textContent": "Hello!"
   }
   ```

2. **Send Group Message**: `/app/group`
   ```json
   {
     "conversationId": "uuid",
     "type": "TEXT",
     "textContent": "Hello everyone!"
   }
   ```

### Notification WebSocket

**Endpoint**: `http://localhost:8080/ws/notification`

**Subscription**: `/user/queue/notifications`

**Message Format**:
```typescript
{
  id: string;
  title: string;
  content: string;
  type: 'MESSAGE' | 'SYSTEM' | ...;
  targetUrl: '/conversations/{conversationId}';
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}
```

## State Management

### Global State (Context)

**ChatContext** provides:
```typescript
{
  // Connection
  connected: boolean;
  connecting: boolean;
  connectionError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;

  // Conversations
  conversations: ConversationDto[];
  conversationsLoading: boolean;
  conversationsError: Error | null;
  refetchConversations: () => void;
  getConversation: (id: string) => ConversationDto | undefined;

  // Messages
  messages: Record<string, MessageDto[]>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  clearMessages: (conversationId: string) => void;

  // Sending
  sendTextMessage: (
    conversationId: string,
    content: string,
    isGroup: boolean,
    recipientId?: string
  ) => void;

  // Groups
  subscribeToGroup: (conversationId: string) => void;
  unsubscribeFromGroup: (conversationId: string) => void;
  createGroup: (request: CreateGroupRequest) => Promise<ConversationDto | null>;

  // Direct conversations
  startDirectConversation: (userId: string) => Promise<ConversationDto | null>;

  // Read status
  markAsRead: (conversationId: string) => Promise<void>;
}
```

### Local State

Each page component manages:
- Message input text
- Loading states
- UI-specific state (scroll position, etc.)

## API Endpoints

### REST API

**Conversations**:
- `GET /conversations` - List all conversations
- `GET /conversations/{id}` - Get conversation by ID
- `GET /conversations/direct/{userId}` - Get/create direct conversation
- `POST /conversations/groups` - Create group conversation
- `PUT /conversations/{id}/mark-read` - Mark as read

**Messages**:
- `GET /messages/conversation/{conversationId}?page=0&size=50` - Get messages (paginated)
- `GET /messages/recipient/{recipientId}?page=0&size=50` - Get direct messages

### WebSocket Endpoints

**Chat**:
- `ws://localhost:8080/ws/chat` - Connection endpoint
- `/user/queue/pm` - Private message queue
- `/topic/group/{conversationId}` - Group message topic
- `/app/pm` - Send private message
- `/app/group` - Send group message

**Notifications**:
- `ws://localhost:8080/ws/notification` - Connection endpoint
- `/user/queue/notifications` - User notification queue

## Data Flow

### Sending a Message

```
User types & clicks Send
       ↓
handleSendMessage()
       ↓
sendTextMessage() in ChatContext
       ↓
ChatWebSocketClient.sendTextMessage()
       ↓
STOMP publish to /app/pm or /app/group
       ↓
Backend processes & broadcasts
       ↓
Recipient's WebSocket receives message
       ↓
handleIncomingMessage() in useChat
       ↓
Update messages state
       ↓
UI re-renders with new message
```

### Receiving a Notification

```
Backend sends notification
       ↓
Notification WebSocket receives
       ↓
handleNotificationMessage() in NotificationContext
       ↓
Add to notifications state
       ↓
useChatNotification() hook processes
       ↓
Check if current conversation page
       ↓
If match: markAsRead() automatically
If no match: trigger callback
```

## Usage Examples

### Navigate to a Conversation

```tsx
// From anywhere in the app
import { useRouter } from 'next/navigation';

const router = useRouter();

// Navigate to conversations list
router.push('/conversations');

// Navigate to specific conversation
router.push(`/conversations/${conversationId}`);
```

### Start a Direct Conversation

```tsx
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

const { startDirectConversation } = useChat();
const router = useRouter();

const handleMessageUser = async (userId: string) => {
  const conversation = await startDirectConversation(userId);
  if (conversation) {
    router.push(`/conversations/${conversation.id}`);
  }
};
```

### Listen to Chat Notifications

```tsx
import { useChatNotification } from '@/hooks/useChatNotification';
import { createSuccessToast } from '@/components/ui/toast-cus';

const { unreadChatCount } = useChatNotification({
  onChatNotification: ({ conversationId, title, content }) => {
    // Show toast notification
    createSuccessToast(title, content, {
      onClick: () => router.push(`/conversations/${conversationId}`)
    });
  }
});

// Display unread count in UI
<Badge>{unreadChatCount}</Badge>
```

## Environment Variables

```env
# Chat WebSocket endpoint (default: http://localhost:8080/ws/chat)
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws

# Notification WebSocket endpoint (default: http://localhost:8080/ws/notification)
NEXT_PUBLIC_NOTIFICATION_WS_URL=http://localhost:8080/ws/notification
```

## Testing

### Manual Testing Steps

1. **Test Connection**:
   - Login as user
   - Navigate to `/conversations`
   - Verify "Connected" status appears
   - Check browser console for WebSocket connection logs

2. **Test Conversations List**:
   - Verify existing conversations load
   - Test search functionality
   - Verify unread indicators
   - Click conversation to navigate to detail

3. **Test Messaging**:
   - Type a message and press Enter
   - Verify message appears in list
   - Open same conversation in another browser/user
   - Verify real-time message delivery

4. **Test Notifications**:
   - Keep conversation page open
   - Have another user send a message
   - Verify notification is NOT shown (auto-marked read)
   - Navigate away from conversation
   - Have another user send a message
   - Verify notification appears in bell

## Common Issues & Solutions

### WebSocket Not Connecting

**Issue**: Chat shows "Disconnected" status

**Solutions**:
1. Verify `NEXT_PUBLIC_WS_URL` environment variable
2. Check backend WebSocket endpoint is running
3. Verify JWT token is valid (check browser cookies)
4. Check browser console for connection errors

### Messages Not Sending

**Issue**: Message input doesn't send messages

**Solutions**:
1. Verify WebSocket is connected
2. Check conversation exists and user is a member
3. For direct messages, ensure recipientId is correct
4. Check browser console for errors

### Notifications Not Working

**Issue**: Not receiving notification when message arrives

**Solutions**:
1. Verify notification WebSocket is connected
2. Check `NotificationProvider` is in `AppProvider`
3. Verify backend is sending notification events
4. Check notification type is `MESSAGE`
5. Verify `targetUrl` format matches `/conversations/{id}`

## Future Enhancements

- [ ] File/image upload support
- [ ] Voice messages
- [ ] Read receipts (show who read messages)
- [ ] Typing indicators
- [ ] Message reactions (emoji)
- [ ] Message search
- [ ] Infinite scroll for message history
- [ ] Group management (add/remove members, change title)
- [ ] Message editing/deletion
- [ ] Conversation muting
- [ ] Push notifications (service worker)
- [ ] Unread message count badges
- [ ] Online/offline status indicators

## Performance Considerations

1. **Message Pagination**: Messages load 50 at a time to avoid loading entire history
2. **WebSocket Reconnection**: Auto-reconnect every 5 seconds if connection drops
3. **State Updates**: React Query caches conversation list to minimize API calls
4. **Subscription Management**: Auto-subscribe to groups only when needed
5. **Memory Management**: Clear messages when leaving conversation to prevent memory leaks

## Security

1. **Authentication**: JWT tokens required for WebSocket connections
2. **Authorization**: Backend validates user can access conversation
3. **XSS Prevention**: All user content sanitized before rendering
4. **CSRF Protection**: WebSocket uses token-based auth (no cookies for WS)

## Support

For issues or questions:
- Check browser console for errors
- Enable debug mode: `[ChatProvider, { debug: true }]` in `AppProvider.tsx`
- Review WebSocket connection logs
- Check backend logs for message processing errors
