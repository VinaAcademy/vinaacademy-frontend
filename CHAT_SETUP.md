# Chat Service Integration - Quick Start Guide

## Overview

The chat service provides real-time messaging capabilities for the VinaAcademy platform, supporting both direct (1-on-1) and group conversations.

## Files Added

### API Configuration
- `config/api.endpoint.ts` - Added `CHAT_ENDPOINTS` for REST API endpoints
- Updated `WS_ENDPOINTS.CHAT` with WebSocket destinations

### Core Services
- `services/chatService.ts` - REST API service layer for conversations and messages
- `lib/chatWebSocket.ts` - WebSocket client for real-time messaging

### Type Definitions
- `types/chat.ts` - All TypeScript types for chat functionality

### React Integration
- `hooks/useChat.ts` - React hook for chat functionality
- `context/ChatContext.tsx` - Global chat context provider

## Quick Start

### 1. Add ChatProvider to your app

Add `ChatProvider` to your `AppProvider.tsx` after `AuthProvider` (chat requires authentication):

```typescript
// providers/AppProvider.tsx
import { ChatProvider } from '@/context/ChatContext';

const providers: ProviderComponent[] = [
  ReactQueryProvider,
  ToastProvider,
  [AuthProvider, { children }],
  [NotificationProvider, { debug: false }],
  [ChatProvider, { debug: false, autoConnect: true }], // Add this line
  CategoryProvider,
  CartProvider,
  LayoutWrapper,
];
```

### 2. Use chat in your components

```typescript
import { useChat } from '@/context/ChatContext';

export default function ChatComponent() {
  const {
    connected,
    conversations,
    messages,
    sendTextMessage,
    loadMessages,
  } = useChat();

  // Load messages for a conversation
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Send a message
  const handleSend = (content: string) => {
    const conversation = conversations.find(c => c.id === selectedConversationId);
    const isGroup = conversation?.type === 'GROUP';
    const recipientId = isGroup ? undefined : getRecipientId(conversation);
    
    sendTextMessage(selectedConversationId, content, isGroup, recipientId);
  };

  return (
    <div>
      {connected ? (
        <div>
          {/* Your chat UI */}
        </div>
      ) : (
        <div>Connecting to chat...</div>
      )}
    </div>
  );
}
```

## API Reference

### REST API Endpoints

All endpoints are available in `CHAT_ENDPOINTS`:

```typescript
import { CHAT_ENDPOINTS } from '@/config/api.endpoint';

// Conversations
CHAT_ENDPOINTS.CONVERSATIONS.LIST                    // GET /conversations
CHAT_ENDPOINTS.CONVERSATIONS.BY_ID(conversationId)   // GET /conversations/{id}
CHAT_ENDPOINTS.CONVERSATIONS.DIRECT(userId)          // GET /conversations/direct/{userId}
CHAT_ENDPOINTS.CONVERSATIONS.CREATE_GROUP            // POST /conversations/groups
CHAT_ENDPOINTS.CONVERSATIONS.MARK_READ(conversationId) // PUT /conversations/{id}/mark-read

// Messages
CHAT_ENDPOINTS.MESSAGES.BY_RECIPIENT(recipientId)    // GET /messages/recipient/{id}
CHAT_ENDPOINTS.MESSAGES.BY_CONVERSATION(conversationId) // GET /messages/conversation/{id}
```

### Service Functions

All functions are available in `services/chatService.ts`:

```typescript
import {
  getConversations,
  getConversationById,
  getOrCreateDirectConversation,
  createGroupConversation,
  markConversationAsRead,
  getMessagesByConversation,
} from '@/services/chatService';

// Get all conversations
const conversations = await getConversations();

// Get or create direct conversation
const conversation = await getOrCreateDirectConversation(userId);

// Create group conversation
const group = await createGroupConversation({
  title: 'My Group',
  memberIds: ['user1-uuid', 'user2-uuid'],
});

// Get messages
const messages = await getMessagesByConversation(conversationId, page, size);

// Mark as read
await markConversationAsRead(conversationId);
```

### WebSocket Client

Direct access to WebSocket client (usually not needed, use hooks instead):

```typescript
import { getChatWebSocketClient } from '@/lib/chatWebSocket';

const client = getChatWebSocketClient({ debug: true });

// Connect
await client.connect(accessToken);

// Send private message
client.sendPrivateMessage({
  recipientId: 'user-uuid',
  type: 'TEXT',
  textContent: 'Hello!',
});

// Send group message
client.sendGroupMessage({
  conversationId: 'conversation-uuid',
  type: 'TEXT',
  textContent: 'Hello everyone!',
});

// Subscribe to group
client.subscribeToGroup(conversationId);

// Handle messages
client.onMessage((message) => {
  console.log('New message:', message);
});
```

### React Hooks

#### useChat (Main Hook)

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
  conversationsError,
  refetchConversations,
  getConversation,

  // Messages
  messages,
  loadMessages,
  clearMessages,

  // Sending
  sendTextMessage,

  // Groups
  subscribeToGroup,
  unsubscribeFromGroup,
  createGroup,

  // Direct chats
  startDirectConversation,

  // Read status
  markAsRead,
} = useChat();
```

#### Additional Hooks

```typescript
import { 
  useConversation,
  useConversationMessages 
} from '@/hooks/useChat';

// Load specific conversation
const { data: conversation, isLoading } = useConversation(conversationId);

// Load messages with pagination
const { data: messages, isLoading } = useConversationMessages(conversationId, page);
```

### Context Helpers

```typescript
import {
  useChatAvailable,
  useChatConversation,
  useChatMessages,
  useUnreadCount,
} from '@/context/ChatContext';

// Check if chat is available
const isChatAvailable = useChatAvailable();

// Get specific conversation
const conversation = useChatConversation(conversationId);

// Get messages for conversation
const messages = useChatMessages(conversationId);

// Get unread count
const unreadCount = useUnreadCount();
```

## Type Definitions

### Core Types

```typescript
import type {
  ConversationDto,
  MessageDto,
  MemberDto,
  ConversationType,  // 'DIRECT' | 'GROUP'
  MessageType,       // 'TEXT' | 'IMAGE' | 'FILE'
  MemberRole,        // 'OWNER' | 'MOD' | 'MEMBER'
} from '@/types/chat';
```

### Request Types

```typescript
import type {
  CreateGroupRequest,
  PrivateMessageRequest,
  GroupMessageRequest,
} from '@/types/chat';

// Create group
const request: CreateGroupRequest = {
  title: 'My Group',
  memberIds: ['uuid1', 'uuid2'],
};

// Send private message
const message: PrivateMessageRequest = {
  recipientId: 'user-uuid',
  type: 'TEXT',
  textContent: 'Hello!',
};
```

## WebSocket Message Flow

### Private Messages
1. Client sends to `/app/pm` with `recipientId`
2. Server publishes to Kafka
3. Both sender and recipient receive via `/user/queue/pm`

### Group Messages
1. Client sends to `/app/group` with `conversationId`
2. Server publishes to Kafka
3. All members receive via `/topic/group/{conversationId}`

**Important:** Each group requires a separate subscription to `/topic/group/{conversationId}`

## Environment Variables

Required in `.env.local`:

```bash
# WebSocket base URL
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
```

## Common Patterns

### Start a direct conversation

```typescript
const { startDirectConversation, sendTextMessage } = useChat();

// Get or create conversation
const conversation = await startDirectConversation(recipientUserId);

if (conversation) {
  // Send message
  sendTextMessage(
    conversation.id,
    'Hello!',
    false, // not a group
    recipientUserId
  );
}
```

### Create and send to group

```typescript
const { createGroup, sendTextMessage } = useChat();

// Create group
const group = await createGroup({
  title: 'Project Team',
  memberIds: ['user1', 'user2', 'user3'],
});

if (group) {
  // Send message
  sendTextMessage(
    group.id,
    'Welcome to the group!',
    true, // is a group
  );
}
```

### Handle incoming messages

```typescript
const { messages } = useChat();

useEffect(() => {
  const conversationMessages = messages[conversationId] || [];
  // Update UI with new messages
  setDisplayMessages(conversationMessages);
}, [messages, conversationId]);
```

### Load message history

```typescript
const { loadMessages } = useChat();

const loadMore = async () => {
  await loadMessages(conversationId, nextPage);
};
```

## Best Practices

1. **Provider Nesting**: Always place `ChatProvider` after `AuthProvider` in your provider tree
2. **Auto-Connect**: Enable `autoConnect={true}` to automatically connect when user logs in
3. **Error Handling**: Check `connectionError` to handle connection failures
4. **Group Subscriptions**: Groups are auto-subscribed on connection, but manually subscribe when joining new groups
5. **Message State**: Use the `messages` object from context for local message state
6. **Pagination**: Use `seq` field from messages for efficient pagination
7. **Optimistic Updates**: Show sent messages immediately, update on server confirmation

## Debugging

Enable debug mode to see WebSocket logs:

```typescript
<ChatProvider debug={true} autoConnect={true}>
  {children}
</ChatProvider>
```

Check console for:
- `[ChatWebSocket]` - Connection and subscription logs
- `[STOMP]` - Low-level WebSocket protocol logs
- `[useChat]` - Hook-level operation logs

## Troubleshooting

### Not connecting
- Check if user is logged in and has valid access token
- Verify `NEXT_PUBLIC_WS_URL` environment variable
- Check browser console for errors

### Messages not received
- Verify WebSocket connection: `connected === true`
- Check if subscribed to correct destination
- For groups, ensure subscription to `/topic/group/{conversationId}`

### Cannot send messages
- Ensure `connected === true` before sending
- Validate message request (required fields based on message type)
- Check browser network tab for errors

## Next Steps

1. Build UI components for conversations list
2. Create message display components
3. Add file upload support for IMAGE/FILE message types
4. Implement typing indicators (requires backend support)
5. Add notification sounds for new messages
6. Implement message search functionality

## Related Documentation

- Full API Documentation: See the API documentation provided
- WebSocket Setup: See existing `WEBSOCKET_SETUP.md` for notification system comparison
- API Client: See `lib/apiClient.ts` for HTTP request handling
- Auth Context: See `context/AuthContext.tsx` for authentication integration
