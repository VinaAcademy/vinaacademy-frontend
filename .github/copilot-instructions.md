# VinaAcademy Frontend - AI Coding Instructions

<div style="background: linear-gradient(135deg, rgba(84, 180, 211, 1) 0%, rgba(57, 192, 237, 0.2) 100%); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
  <strong>🎯 Quick Navigation:</strong> Next.js 14+ • App Router • Microservices • Real-time Chat & Notifications • Role-based Access
</div>

## General Guidelines

> [!IMPORTANT]
> **CRITICAL**: Do NOT create markdown documentation files (e.g., README.md, SETUP.md, GUIDE.md, CHANGES.md) after completing tasks unless explicitly requested by the user. Focus on implementing the actual code changes requested. Provide a brief summary in the chat instead.

<details style="background: rgba(57, 192, 237, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid rgb(84, 180, 211);">
<summary><strong>🔑 Key Architectural Principles</strong></summary>

- **Route Groups** organize code without affecting URLs
- **API Proxy** handles CORS automatically via `next.config.ts`
- **Dual WebSocket** system separates Notifications from Chat
- **JWT Auto-refresh** happens transparently on 401 errors
- **Centralized Endpoints** in `config/api.endpoint.ts`
</details>


## Architecture Overview

This is a **Next.js 14+ App Router** e-learning platform with role-based access and microservices integration. Key architectural patterns:

- **Route Groups**: Uses Next.js route groups `(admin)`, `(instructor)`, `(student)`, `(auth)`, `(public)`, `(staff,admin)` for role-based layouts without affecting URLs
- **API Proxy**: All backend calls proxy through `/api/*` → `${NEXT_PUBLIC_API_URL}/api/v1/*` via `next.config.ts` rewrites
- **JWT + Cookie Auth**: Access/refresh tokens stored in httpOnly cookies (`access_token`, `refresh_token`), managed by `lib/apiClient.ts` with automatic refresh on 401
- **Context Providers**: Nested via `providers/AppProvider.tsx` → ReactQuery → Toast → Auth → **WebSocket (Notifications + Chat)** → Category → Cart → LayoutWrapper
- **Real-time Communications**: Dual WebSocket system via SockJS + STOMP
  - **Notifications**: `NotificationContext` for system alerts (course reviews, payments, etc.)
  - **Chat**: `ChatContext` for real-time messaging (private DMs + group conversations)
- **Centralized Provider Composition**: `AppProvider.tsx` uses `ComposerProvider` for clean provider nesting

## Authentication & Authorization

### Role-Based Routing
```typescript
// middleware.ts patterns:
// /admin/* → requires ROLE_admin
// /instructor/* → requires ROLE_instructor  
// /requests/* → requires ROLE_admin OR ROLE_staff
```

### Token Management
- Access tokens auto-refresh via `apiClient.ts` interceptors on 401 responses
- Use `getAccessToken()` from `lib/apiClient.ts` to check auth state, not direct cookie access
- JWT payload contains `scope: string[]` for role checking (e.g., `ROLE_admin`, `ROLE_instructor`, `ROLE_staff`)
- Refresh flow: On 401 → POST `/api/auth/refresh` with refresh_token → update both tokens → retry original request with `X-Retry: true` header
- Cookie security: `secure: true` in production, `sameSite: 'strict'` always

## State Management Patterns

### TanStack Query (Primary)
```typescript
// Standard hook pattern in hooks/ directory:
export const useCourses = ({ page = 0, size = 8, status = "PUBLISHED" }) => {
  return useQuery({
    queryKey: ['courses', searchRequest, page, size, sortBy, sortDirection],
    queryFn: () => searchCourses(searchRequest, page, size, sortBy, sortDirection)
  });
};
```

### Context Providers (Global State)
- `AuthContext`: User session, login/logout, role checks - accessed via `useAuth()` hook
- `NotificationContext`: Real-time notifications via SockJS + STOMP (auto-connect on login) - accessed via `useWebSocketNotification()` hook
- `ChatContext`: Real-time messaging (private + group chat) via SockJS + STOMP - accessed via `useChat()` hook from `context/ChatContext.tsx`
- `CartContext`: Shopping cart state across sessions - accessed via `useCart()` hook  
- `CategoryContext`: Category tree for navigation - accessed via `useCategories()` hook

**Provider Order Matters**: Both WebSocket contexts (Notifications + Chat) must be after Auth (requires token), before feature contexts.

**ComposerProvider Pattern**: `AppProvider.tsx` uses `ComposerProvider` utility for clean provider nesting without "provider hell". Providers can be passed as plain components or as tuples with props:
```typescript
// Plain component
ReactQueryProvider

// Component with props
[NotificationProvider, { debug: true, wsUrl: 'ws://localhost:8080' }]

// Conditional provider (null providers are skipped)
wsUrl ? [NotificationProvider, { debug, wsUrl }] : null
```

**Dual WebSocket Architecture**:
- **Notifications**: Uses `lib/websocket.ts` + `NotificationContext` for system-wide alerts
- **Chat**: Uses `lib/chatWebSocket.ts` + `ChatContext` for peer-to-peer messaging
- Both share the same SockJS + STOMP infrastructure but have separate connection management
- Both auto-reconnect with token refresh on authentication errors

## Service Layer Architecture

### Centralized Endpoint Configuration
All API endpoints are defined in `config/api.endpoint.ts` for consistency and maintainability:

```typescript
// Define endpoints as constants
export const API_ENDPOINTS = {
  COURSE: {
    LIST: '/courses',
    BY_SLUG: (slug: string) => `/courses/by-slug/${slug}`,
    BY_ID: (id: string) => `/courses/by-id/${id}`,
  }
};

// WebSocket endpoints
export const WS_ENDPOINTS = {
  NOTIFICATION: { URL: `${WS_BASE_URL}/notification` },
  CHAT: { URL: `${WS_BASE_URL}/chat` }
};

// Chat REST endpoints
export const CHAT_ENDPOINTS = {
  CONVERSATIONS: { LIST: '/conversations' },
  MESSAGES: { BY_CONVERSATION: (id: string) => `/messages/conversation/${id}` }
};
```

**Usage in Services**: Always import endpoints from config, never hardcode URLs:
```typescript
import { API_ENDPOINTS } from '@/config/api.endpoint';
const response = await apiClient.get(API_ENDPOINTS.COURSE.BY_SLUG(slug));
```

### API Client Pattern
```typescript
// All services use centralized apiClient from lib/apiClient.ts
export async function getCourseBySlug(slug: string): Promise<CourseDetailsResponse | null> {
  try {
    const response = await apiClient.get(`/courses/by-slug/${slug}`);
    return response.data.data; // Backend wraps in ApiResponse<T>
  } catch (error) {
    console.error(`getCourseBySlug error for slug ${slug}:`, error);
    return null; // Services return null on error, let UI handle
  }
}
```

### Adapter Pattern
- `adapters/` directory contains transformation logic between frontend and backend models
- Used for complex data mapping scenarios (e.g., `quizAdapter.ts`)
- Keeps services focused on API communication

### Backend Response Structure
```typescript
// All API responses follow this pattern:
interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
  timestamp: string;
}

// Paginated responses wrap data in additional structure:
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page
  first: boolean;
  last: boolean;
}
```

## Component Patterns

### UI Components (Shadcn/ui)
- Base components in `components/ui/` built on Radix UI
- Custom toast system via `toast-cus.tsx` wrapping react-toastify
- Use `createErrorToast()`, `createSuccessToast()` for consistent UX

### Feature Components
```
components/
├── admin/          # Admin-specific components
├── instructor/     # Course creation/management  
├── student/        # Learning interface
├── course/         # Shared course display
├── layout/         # Navigation, headers, LayoutWrapper
└── shared/         # Cross-feature utilities
```

### Layout Wrapper Pattern
`LayoutWrapper` dynamically renders different layouts based on route groups, handling role-specific navigation and sidebars.

## File Upload & Media

### Image Handling
- `services/imageService.ts` handles uploads to backend
- Next.js Image component configured for any remote domain in `next.config.ts`
- Course thumbnails, user avatars stored on backend, served via API

### Video Processing
- Chunked upload pattern in `services/chunkUploadService.ts`
- Video progress tracking via `services/videoProgressService.ts`
- TipTap editor for rich content with YouTube embeds

## Development Workflows

### Scripts
```bash
npm run dev     # Development server (port 3000)
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint checking
```

**Windows/PowerShell Specific**:
- Join commands with `;` separator: `npm install; npm run dev`
- Use forward slashes in paths when passing to Node tools
- If encountering execution policy errors, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### Environment Setup
Required environment variables (create `.env.local` file):
```bash
# Backend API base URL (proxied through /api/*)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Frontend base URL (used for absolute URLs, SSR)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# WebSocket endpoint for real-time notifications (optional - has default)
NEXT_PUBLIC_NOTIFICATION_WS_URL=http://localhost:8080/ws/notification

# Optional: Application base URL (for SEO/metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Configuration details:
- **API Proxy**: All `/api/*` requests automatically proxy to `NEXT_PUBLIC_API_URL` via `next.config.ts` rewrites - this handles CORS automatically
- **Cookies**: `secure: true` in production only, `sameSite: 'strict'` always (see `lib/apiClient.ts`)
- **Docker**: Uses `output: "standalone"` in `next.config.ts` for optimized container builds
- **Images**: Wildcard `remotePatterns` in `next.config.ts` allows all remote images (backend serves user uploads)

### Real-Time Notifications
- WebSocket connects automatically when user logs in (has JWT token)
- Subscribes to `/user/queue/notifications` for user-specific messages
- Auto-reconnects every 5s if connection drops
- Access via `useWebSocketNotification()` hook from any component (exported from `context/NotificationContext.tsx`)
- Backend sends `NotificationDTO` matching `types/notification.ts`
- Notification sound plays on new notifications (see `utils/notificationSound.ts`)

### Real-Time Chat System
**Architecture**: Separate WebSocket connection from notifications, managed by `ChatContext` + `lib/chatWebSocket.ts`

**Key Endpoints** (defined in `config/api.endpoint.ts`):
```typescript
// WebSocket
WS_ENDPOINTS.CHAT.URL                            // ws://localhost:8080/ws/chat
WS_ENDPOINTS.CHAT.PRIVATE_MESSAGE_QUEUE          // /user/queue/pm
WS_ENDPOINTS.CHAT.GROUP_MESSAGE_WEBSOCKET_TOPIC  // /topic/group/{conversationId}
WS_ENDPOINTS.CHAT.SEND_PRIVATE_MESSAGE           // /app/pm
WS_ENDPOINTS.CHAT.SEND_GROUP_MESSAGE             // /app/group

// REST API (paginated message history)
CHAT_ENDPOINTS.CONVERSATIONS.LIST                // GET /conversations
CHAT_ENDPOINTS.CONVERSATIONS.DIRECT(userId)      // GET /conversations/direct/{userId}
CHAT_ENDPOINTS.CONVERSATIONS.CREATE_GROUP        // POST /conversations/groups
CHAT_ENDPOINTS.MESSAGES.BY_CONVERSATION(id)      // GET /messages/conversation/{id}?page=0&size=50
```

**Usage Pattern**:
```typescript
// 1. Access chat from ChatContext
import { useChat } from '@/context/ChatContext';

const {
  connected,                              // WebSocket connection state
  conversations,                          // All user's conversations
  messages,                               // Record<conversationId, MessageDto[]>
  sendTextMessage,                        // Send message via WebSocket
  loadMessages,                           // Load paginated history via REST
  startDirectConversation,               // Create/get direct chat
  subscribeToGroup,                       // Subscribe to group topic
} = useChat();

// 2. Start a direct conversation (returns existing or creates new)
const conversation = await startDirectConversation(userId);

// 3. Load message history (paginated, newest first)
await loadMessages(conversationId, page);

// 4. Send real-time message
sendTextMessage(conversationId, content, isGroup, recipientId);

// 5. Subscribe to group updates (auto-done for new groups)
subscribeToGroup(conversationId);
```

**Data Flow**:
- **Outbound**: UI → `ChatContext.sendTextMessage()` → `chatWebSocket.ts` → STOMP publish → Backend
- **Inbound**: Backend → STOMP subscription → `chatWebSocket.ts` message handler → Update `messages` state → UI re-renders
- **History**: UI → `loadMessages()` → `chatService.ts` REST call → Backend paginated response → Prepend to `messages[conversationId]`

**Token Refresh Integration**:
- Chat WebSocket client includes `onTokenExpired` callback that auto-refreshes via `authService.refreshToken()`
- On auth error from backend, triggers refresh and reconnects with new token automatically
- Max 5 reconnect attempts with exponential backoff

**Types** (see `types/chat.ts`):
- `ConversationDto`: Conversation metadata (type: DIRECT | GROUP, members, last message)
- `MessageDto`: Individual message (id, seq, senderId, type: TEXT | IMAGE | FILE, content, timestamp)
- `MemberDto`: Conversation member with role (OWNER | MOD | MEMBER) and read status
- `PrivateMessageRequest` / `GroupMessageRequest`: WebSocket send payloads

**UI Components** (see `components/chat/` + `CHAT_QUICKSTART.md`):
- `<StartChatButton userId={...} />` - Opens direct chat with user
- `<ChatBadge variant="icon|button" />` - Shows unread count in navigation
- `/conversations` page - Lists all conversations with search/filter
- `/conversations/[id]` page - Full chat interface with message history

**Key Differences from Notifications**:
- **Bidirectional**: Chat allows sending, notifications are receive-only
- **Paginated History**: Chat loads old messages via REST, notifications don't persist history in frontend
- **Multiple Subscriptions**: Chat subscribes to multiple group topics dynamically, notifications only `/user/queue/notifications`
- **Conversation Management**: Chat has CRUD operations for conversations, notifications don't have conversation concept

### Testing Patterns
- Services return `null` on error for graceful degradation
- React Query handles loading/error states
- Use mock data from `data/mock*.ts` for development
- `<NotificationDemo />` component for WebSocket testing
- Mock data includes: `mockCourses.ts`, `mockCourseData.ts`, `mockCartData.ts`, `mockInstructorCourse.ts`
- Test WebSocket by enabling debug mode in `AppProvider.tsx`: `[NotificationProvider, { debug: true }]`
- Test Chat WebSocket with `[ChatProvider, { debug: true, autoConnect: true }]`

## Clean Architecture Structure

### Directory Organization (Feature-Based)
```
app/
├── (admin)/           # Admin route group - protected routes
├── (instructor)/      # Instructor route group - protected routes  
├── (student)/         # Student route group - protected routes
├── (auth)/           # Authentication route group - public routes
├── (public)/         # Public route group - no auth required
└── (staff,admin)/    # Multiple role route group

components/
├── ui/               # Shadcn/ui base components (Button, Input, etc.)
├── common/           # Shared business components (editors, forms)
├── layout/           # Layout components (LayoutWrapper, navigation)
├── [feature]/        # Feature-specific components (admin/, instructor/, etc.)
└── shared/           # Cross-feature utilities

lib/
├── apiClient.ts      # Centralized HTTP client with auth
├── auth.ts          # NextAuth configuration
├── utils.ts         # Utility functions (cn, formatters)
└── [feature]-schema.ts # Validation schemas

services/
├── [entity]Service.ts # API service layer (courseService, authService)
└── [feature]Service.ts # Feature-specific services

types/
├── api-response.ts   # Generic API response types
├── [entity].ts      # Domain entity types
└── [feature].ts     # Feature-specific types

hooks/
├── use[Entity].ts   # Entity-specific hooks (useCourses, useAuth)
├── [feature]/       # Feature-specific hooks directory
└── use[Utility].ts  # Utility hooks (useDebounce, useMobile)

utils/
├── courseMapper.ts  # Data transformation utilities
└── [feature]Mapper.ts # Feature-specific mappers
```

### Separation of Concerns
- **Components**: Pure UI logic, receive props, emit events
- **Hooks**: Business logic, state management, side effects
- **Services**: API communication, data transformation
- **Context**: Global state that spans multiple features
- **Types**: Shared contracts between layers

### Data Flow Pattern
```
UI Component → Custom Hook → Service Layer → API Client → Backend
           ← React Query ← Response Transform ← HTTP Response ←
```

## Libraries and Frameworks

### Core Framework
- **Next.js 15.2.4**: App Router, Server Components, Route Groups, optimized bundling
- **React 19**: Latest React with improved hooks, Context, and Suspense
- **TypeScript 5**: Strict mode enabled, path aliases configured (`@/*` → `./`)

### UI & Styling
- **Tailwind CSS**: Utility-first styling with custom design system
- **Radix UI**: Headless accessible component primitives
- **Shadcn/ui**: Pre-built component library on Radix
- **Framer Motion**: Animations and transitions
- **Lucide React**: Icon library
- **DaisyUI**: Additional Tailwind components

### State Management
- **TanStack Query**: Server state, caching, synchronization
- **React Context**: Global client state (auth, cart, categories)
- **React Hook Form**: Form state and validation
- **Zod**: Runtime type validation

### Rich Content & Media
- **TipTap**: Rich text editor with extensions
- **PrimeReact**: Additional UI components (Editor, InputNumber)
- **@dnd-kit**: Drag and drop functionality
- **React Toastify**: Toast notifications

### Data & API
- **Axios**: HTTP client with interceptors
- **js-cookie**: Cookie management
- **NextAuth.js**: Authentication framework
- **SockJS + STOMP**: WebSocket real-time communication

### Development Tools
- **ESLint**: Code linting with Next.js rules
- **PostCSS**: CSS processing
- **Faker.js**: Mock data generation

## Coding Standards

### File Naming Conventions
```
PascalCase:     Components, Types, Interfaces
camelCase:      Functions, variables, file contents
kebab-case:     File names, directories
SCREAMING_CASE: Constants, environment variables
```

### Component Structure
```typescript
// 1. Imports (external libraries first, then internal)
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourseDto } from '@/types/course';

// 2. Types/Interfaces (component-specific)
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

// 3. Component definition
export default function ComponentName({ title, onSubmit }: ComponentProps) {
  // 4. Hooks (useState, useEffect, custom hooks)
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Event handlers
  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    await onSubmit(data);
    setIsLoading(false);
  };
  
  // 6. Render logic
  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  );
}
```

### Service Layer Conventions
```typescript
// Always return typed responses or null for errors
export async function getEntity(id: string): Promise<EntityDto | null> {
  try {
    const response = await apiClient.get(`/entities/${id}`);
    return response.data.data; // Backend wraps in ApiResponse<T>
  } catch (error) {
    console.error(`getEntity error for id ${id}:`, error);
    return null; // Let UI handle gracefully
  }
}
```

### Hook Patterns
```typescript
// Custom hooks for business logic
export const useEntity = (id: string) => {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: () => getEntity(id),
    enabled: !!id, // Only run if id exists
  });
};
```

### Type Definitions
```typescript
// Use consistent naming patterns
export interface EntityDto extends BaseDto {
  id: string;        // UUIDs as strings
  name: string;
  status: EntityStatus; // Use enums for status types
}

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
```

### Error Handling
- Services return `null` on error, log detailed errors
- Components handle loading/error states via React Query
- Use toast notifications for user feedback
- Middleware handles auth errors and redirects

### CSS Classes
- Use Tailwind utility classes with consistent spacing scale
- Custom components should use `cn()` utility for class merging
- Responsive design: mobile-first approach
- Dark mode support via CSS custom properties

## Key Dependencies

- **UI**: Radix UI primitives + Tailwind CSS + shadcn/ui
- **State**: TanStack Query + React Context
- **Auth**: NextAuth.js with custom JWT provider
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: TipTap editor with extensions
- **DnD**: @dnd-kit for course section reordering
- **Tables**: @tanstack/react-table for admin interfaces
- **WebSocket**: sockjs-client + @stomp/stompjs for real-time notifications

## Real-Time Notifications System

### WebSocket Integration
```typescript
// Access notifications from any component
import { useWebSocketNotification } from '@/context/NotificationContext';

const { notifications, unreadCount, isConnected, markAsRead } = useWebSocketNotification();
```

### Key Files
- `lib/websocket.ts` - WebSocket client factory with auto-reconnect
- `context/NotificationContext.tsx` - Global notification state management
- `components/notifications/NotificationBell.tsx` - UI component with dropdown
- `types/notification.ts` - NotificationDTO types (9 notification types)

### Backend Integration
- Endpoint: `${NEXT_PUBLIC_NOTIFICATION_WS_URL}` (default: http://localhost:8080/ws/notification)
- Subscription: `/user/queue/notifications` (user-specific queue)
- Protocol: SockJS + STOMP with JWT authentication
- Auto-reconnect: 5 second delay, 4 second heartbeat

### Notification Types
```typescript
SYSTEM, PAYMENT_SUCCESS, COURSE_REVIEW, COURSE_APPROVAL, 
SUPPORT_REPLY, PROMOTION, FINANCIAL_ALERT, STAFF_REQUEST, INSTRUCTOR_REQUEST
```

## Common Pitfalls

1. **Route Groups**: Don't include parentheses in actual URLs - they're for organization only
2. **API Calls**: Always use `apiClient.ts`, never direct fetch - it handles auth headers
3. **Middleware**: JWT parsing happens in middleware, not components - use context for user data
4. **TypeScript**: Backend uses UUIDs as strings - don't assume numeric IDs
5. **Pagination**: Spring Boot pagination is 0-indexed, match this in frontend calls
6. **WebSocket**: Only connects after user login - check `isConnected` before assuming live connection
7. **Provider Order**: Both WebSocket providers must be nested inside AuthProvider (requires token) but before feature contexts
8. **Toast Notifications**: Use `createSuccessToast()` / `createErrorToast()` from `components/ui/toast-cus`, not raw toast library
9. **Auth Redirects**: Middleware redirects to `/login?redirect={pathname}` on 401, and redirects away from `/login` if already authenticated
10. **API Response Unwrapping**: Backend wraps all responses in `ApiResponse<T>`, always access `response.data.data` not `response.data`
11. **Chat vs Notifications**: These are two separate WebSocket connections - don't confuse `useChat()` with `useWebSocketNotification()`
12. **Message Ordering**: Chat messages are newest-first from backend, but displayed oldest-first in UI - reverse in component rendering

## Debugging & Troubleshooting

### API Request Tracing
- `apiClient.ts` logs all requests: `🔄 Request: ${method} ${url}`
- Token refresh attempts logged: `🔄 Token expired, attempting to refresh...`
- Successful refresh: `✅ Token refreshed successfully`
- Enable WebSocket debug mode via `[WebSocketProvider, { debug: true }]` in `AppProvider.tsx`

### Common Error Scenarios
1. **Infinite 401 loops**: Check if refresh token exists and is valid in cookies
2. **WebSocket not connecting**: Verify user is logged in and `access_token` cookie exists
3. **CORS errors**: Ensure API calls go through `/api/*` proxy, not directly to `NEXT_PUBLIC_API_URL`
4. **Route protection failing**: Check `middleware.ts` path matchers and JWT scope parsing
5. **Provider errors**: Verify provider nesting order in `AppProvider.tsx` - Auth → WebSocket → Features

### Development Debugging Tools
- React Query DevTools enabled in development (from `@tanstack/react-query-devtools`)
- Check browser console for API request/response logs
- WebSocket connection status available via `useWebSocketNotification().isConnected`
- Inspect cookies in DevTools → Application → Cookies for `access_token` and `refresh_token`

## Critical Implementation Patterns

### Adding New API Service
```typescript
// services/newService.ts
import apiClient from '@/lib/apiClient';

export async function getEntity(id: string): Promise<EntityDto | null> {
  try {
    const response = await apiClient.get(`/entities/${id}`);
    return response.data.data; // Always unwrap ApiResponse<T>
  } catch (error) {
    console.error(`getEntity error for id ${id}:`, error);
    return null; // Return null, not throw - let UI handle gracefully
  }
}
```

### Creating Custom Hook
```typescript
// hooks/useEntity.ts
import { useQuery } from '@tanstack/react-query';
import { getEntity } from '@/services/entityService';

export const useEntity = (id: string) => {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: () => getEntity(id),
    enabled: !!id, // Only fetch if id exists
  });
};
```

### Role-Based Access
```typescript
// middleware.ts already handles route protection
// In components, use AuthContext:
import { useAuth } from '@/context/AuthContext';

const { user } = useAuth();
const isAdmin = user?.roles?.includes('ROLE_admin');
```

### File Upload Pattern
```typescript
// Use imageService.ts for images, chunkUploadService.ts for videos
import { uploadImage } from '@/services/imageService';

const formData = new FormData();
formData.append('file', file);
const imageUrl = await uploadImage(formData);
```

## Documentation Resources

- **Chat Quick Start**: See `CHAT_QUICKSTART.md` for implementing chat UI components
- **Chat Setup Guide**: See `CHAT_SETUP.md` for full integration details
- **Chat UI Guide**: See `CHAT_UI_GUIDE.md` for design patterns and component specs
- **WebSocket Setup**: See `WEBSOCKET_SETUP.md` for notification system quick start
- **Architecture**: This file
- **Mock Data**: Check `data/mock*.ts` files for development examples

## Chat/Conversations UI/UX Guidelines

### Standard Component Sizes
These sizes have been optimized for balance and readability across the chat interface:

#### Page Container
- Max width: `max-w-4xl` (optimal for conversation lists)
- Padding: `py-6 px-4` (compact but breathable)
- Background: `bg-gradient-to-br from-gray-50 via-white to-blue-50/20` (subtle gradient)

#### Header Section
- Icon container: `p-2.5` with `rounded-xl`
- Icon size: `h-6 w-6`
- Title: `text-2xl font-bold` with gradient text
- Description: `text-sm text-gray-600`
- Spacing: `gap-3 space-y-3`

#### Status Indicators (Connection Status)
- Padding: `px-3 py-2`
- Font: `text-sm font-medium`
- Status dot: `h-1.5 w-1.5` with `rounded-full`
- Border radius: `rounded-lg`

#### Search Bar
- Height: `h-11` (comfortable tap target)
- Icon size: `h-4 w-4`
- Font: `text-sm`
- Padding: `pl-10 pr-4`
- Border: `border` (single, not border-2)
- Focus ring: `ring-2` (not ring-4)
- Border radius: `rounded-xl`

#### Conversation List Container
- Border radius: `rounded-xl` (consistent with other elements)
- Shadow: `shadow-md` (moderate depth)
- Background: `bg-white/80 backdrop-blur-sm`

#### Conversation Item
- Padding: `p-4` (balanced spacing)
- Gap: `gap-3`
- Avatar size: `size={48}` (readable but not overwhelming)
- Online indicator: `h-3 w-3` (subtle presence indicator)
- Ring on unread: `ring-2 ring-blue-400` (noticeable but not harsh)
- Title font: `text-sm font-semibold`
- Message preview: `text-xs`
- Unread badge: `h-5 min-w-[20px] px-1.5` with `text-xs`
- Hover effect: `hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30`

#### Empty States
- Padding: `py-16 px-6` (centered attention)
- Icon container: `p-6` with `rounded-full`
- Icon size: `h-10 w-10`
- Title: `text-xl font-bold`
- Description: `text-sm`
- Button: `px-4 py-2 rounded-lg`

#### Loading Skeletons
- Padding: `p-4`
- Gap: `gap-3`
- Avatar: `h-12 w-12`
- Content spacing: `space-y-2`

### Design Patterns
- Use `backdrop-blur-sm` for glass morphism effect
- Gradient overlays on hover: `from-blue-500/0 to-purple-500/0` → `from-blue-500/5 to-purple-500/5`
- Ring effects for focus/unread: `ring-2` with appropriate color
- Smooth transitions: `transition-all duration-300`
- Staggered animations: `style={{ animationDelay: \`\${index * 30}ms\` }}`
- Border radius consistency: `rounded-xl` for containers, `rounded-lg` for smaller elements
- Status dots: `h-1.5 w-1.5` for compact indicators

### Color Palette
- Primary gradient: `from-blue-600 to-purple-600`
- Hover states: `blue-50` to `purple-50` with low opacity
- Unread highlight: `from-blue-50/60 to-transparent` with `border-l-4 border-l-blue-500`
- Text hierarchy: 
  - Primary: `text-gray-900` (headings)
  - Secondary: `text-gray-800` (normal text)
  - Tertiary: `text-gray-600` (descriptions)
  - Muted: `text-gray-500` (timestamps)
  - Active/Unread: `text-blue-600`