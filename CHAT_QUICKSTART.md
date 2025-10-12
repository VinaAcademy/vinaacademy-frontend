# Chat UI Quick Start Guide

## 🚀 Getting Started

### 1. Navigate to Conversations
```typescript
// From anywhere in your app
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/conversations'); // View all conversations
```

### 2. Add "Message" Button to User Profile

```tsx
import { StartChatButton } from '@/components/chat';

function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <StartChatButton
        userId={user.id}
        userName={user.name}
        variant="outline"
        size="sm"
      >
        Send Message
      </StartChatButton>
    </div>
  );
}
```

### 3. Add Chat Badge to Navigation

```tsx
import { ChatBadge } from '@/components/chat';

function Navigation() {
  return (
    <nav>
      {/* Icon with unread count badge */}
      <ChatBadge variant="icon" />
      
      {/* Or as a button */}
      <ChatBadge variant="button" />
    </nav>
  );
}
```

### 4. Listen to Chat Notifications

```tsx
import { useChatNotification } from '@/hooks/useChatNotification';
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  
  const { unreadChatCount } = useChatNotification({
    onChatNotification: ({ conversationId, title, content }) => {
      // Called when message notification arrives (if not on conversation page)
      console.log('New message:', title, content);
      
      // Optionally navigate to conversation
      // router.push(`/conversations/${conversationId}`);
    }
  });
  
  return <div>Unread: {unreadChatCount}</div>;
}
```

## 📖 Common Use Cases

### Start Conversation from User Card

```tsx
import { StartChatButton } from '@/components/chat';

function UserCard({ user }) {
  return (
    <div className="card">
      <img src={user.avatar} />
      <h3>{user.name}</h3>
      <div className="actions">
        <StartChatButton
          userId={user.id}
          userName={user.name}
          variant="outline"
        />
      </div>
    </div>
  );
}
```

### Display Unread Count in Multiple Places

```tsx
import { useChatNotification } from '@/hooks/useChatNotification';

function Sidebar() {
  const { unreadChatCount } = useChatNotification();
  
  return (
    <div>
      <a href="/conversations">
        Messages {unreadChatCount > 0 && `(${unreadChatCount})`}
      </a>
    </div>
  );
}
```

### Programmatically Start Chat

```tsx
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';

function CustomComponent() {
  const { startDirectConversation } = useChat();
  const router = useRouter();
  
  const handleStartChat = async (userId: string) => {
    const conversation = await startDirectConversation(userId);
    if (conversation) {
      router.push(`/conversations/${conversation.id}`);
    }
  };
  
  return (
    <button onClick={() => handleStartChat('user-uuid')}>
      Chat Now
    </button>
  );
}
```

## 🎯 Integration Points

### Where to Add Chat Features

1. **User Profiles** (`/user/[userId]`)
   - Add `<StartChatButton>` next to user info

2. **Course Instructor Info**
   - Add "Message Instructor" button

3. **Student List** (for instructors)
   - Add chat icon next to each student

4. **Navigation Bar**
   - Add `<ChatBadge variant="icon">` to header

5. **Dashboard**
   - Show `<ChatStatusIndicator>` with unread count

6. **Notifications Page**
   - MESSAGE type notifications already handled

## 🔧 Hooks Available

### `useChat()`
Main chat hook from `ChatContext`

```typescript
const {
  // Connection
  connected,
  connecting,
  connectionError,
  connect,
  disconnect,
  
  // Conversations
  conversations,
  conversationsLoading,
  refetchConversations,
  getConversation,
  
  // Messages
  messages,
  loadMessages,
  sendTextMessage,
  
  // Operations
  startDirectConversation,
  createGroup,
  markAsRead,
} = useChat();
```

### `useChatNotification(options)`
Notification integration hook

```typescript
const {
  unreadChatCount,
  markAllChatNotificationsAsRead,
} = useChatNotification({
  currentConversationId: '...', // Auto-mark this conversation as read
  onChatNotification: ({ conversationId, title, content }) => {
    // Called when notification arrives (if not viewing conversation)
  }
});
```

## 🎨 Components Available

### `<StartChatButton>`
Button to initiate chat with user

```tsx
<StartChatButton
  userId="user-uuid"        // Required
  userName="John Doe"       // Optional, for display
  variant="default"         // default | outline | ghost
  size="default"            // default | sm | lg | icon
  showIcon={true}           // Show message icon
  className="custom-class"  // Additional classes
>
  Custom Text
</StartChatButton>
```

### `<StartChatIconButton>`
Icon-only version

```tsx
<StartChatIconButton
  userId="user-uuid"
  userName="John Doe"
/>
```

### `<ChatBadge>`
Unread count badge

```tsx
<ChatBadge
  variant="icon"      // icon | button | badge
  showZero={false}    // Show badge even when 0
  className="..."
/>
```

### `<ChatStatusIndicator>`
Text indicator with unread count

```tsx
<ChatStatusIndicator className="..." />
```

## ⚙️ Environment Setup

```env
# Required environment variables
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
NEXT_PUBLIC_NOTIFICATION_WS_URL=http://localhost:8080/ws/notification
```

## 🐛 Troubleshooting

### Chat Not Connecting?
1. Check if user is logged in
2. Verify `NEXT_PUBLIC_WS_URL` is set
3. Check browser console for WebSocket errors
4. Ensure backend WebSocket endpoint is running

### Messages Not Sending?
1. Verify WebSocket is connected (`connected` state)
2. Check conversation exists
3. For direct messages, ensure recipientId is provided
4. Check browser console for errors

### Notifications Not Working?
1. Verify `NotificationProvider` is in app tree
2. Check notification type is `MESSAGE`
3. Verify `targetUrl` matches `/conversations/{id}`
4. Ensure both WebSockets are connected

## 📚 Full Documentation

See `CHAT_UI_GUIDE.md` for complete documentation including:
- Architecture details
- API documentation
- WebSocket protocol
- State management
- Security considerations
- Performance optimization

## 🎉 You're Ready!

The chat system is fully integrated and ready to use. Simply:
1. Add chat buttons where needed
2. Add badge to navigation
3. Handle notifications with hook
4. Test with real users!

For detailed examples and advanced usage, refer to the complete guide.
