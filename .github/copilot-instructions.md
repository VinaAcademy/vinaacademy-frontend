# VinaAcademy Frontend - AI Coding Instructions

## General Guidelines

**IMPORTANT**: Do NOT create markdown documentation files (e.g., README.md, SETUP.md, GUIDE.md, CHANGES.md) after completing tasks unless explicitly requested by the user. Focus on implementing the actual code changes requested. Provide a brief summary in the chat instead.

## Architecture Overview

This is a **Next.js 14+ App Router** e-learning platform with role-based access and microservices integration. Key architectural patterns:

- **Route Groups**: Uses Next.js route groups `(admin)`, `(instructor)`, `(student)`, `(auth)`, `(public)`, `(staff,admin)` for role-based layouts without affecting URLs
- **API Proxy**: All backend calls proxy through `/api/*` → `${NEXT_PUBLIC_API_URL}/api/v1/*` via `next.config.ts` rewrites
- **JWT + Cookie Auth**: Access/refresh tokens stored in httpOnly cookies (`access_token`, `refresh_token`), managed by `lib/apiClient.ts` with automatic refresh on 401
- **Context Providers**: Nested via `providers/AppProvider.tsx` → ReactQuery → Toast → Auth → **WebSocket** → Category → Cart → LayoutWrapper
- **Real-time Communications**: WebSocket notifications via SockJS + STOMP, globally available through `NotificationContext`
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
- `CartContext`: Shopping cart state across sessions - accessed via `useCart()` hook  
- `CategoryContext`: Category tree for navigation - accessed via `useCategories()` hook

**Provider Order Matters**: WebSocket must be after Auth (requires token), before feature contexts.

**ComposerProvider Pattern**: `AppProvider.tsx` uses `ComposerProvider` utility for clean provider nesting without "provider hell". Providers can be passed as plain components or as tuples with props:
```typescript
// Plain component
ReactQueryProvider

// Component with props
[NotificationProvider, { debug: true, wsUrl: 'ws://localhost:8080' }]

// Conditional provider (null providers are skipped)
wsUrl ? [NotificationProvider, { debug, wsUrl }] : null
```

## Service Layer Architecture

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

### Testing Patterns
- Services return `null` on error for graceful degradation
- React Query handles loading/error states
- Use mock data from `data/mock*.ts` for development
- `<NotificationDemo />` component for WebSocket testing
- Mock data includes: `mockCourses.ts`, `mockCourseData.ts`, `mockCartData.ts`, `mockInstructorCourse.ts`
- Test WebSocket by enabling debug mode in `AppProvider.tsx`: `[WebSocketProvider, { debug: true }]`

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
7. **Provider Order**: WebSocket must be nested inside AuthProvider (requires token) but before feature contexts
8. **Toast Notifications**: Use `createSuccessToast()` / `createErrorToast()` from `components/ui/toast-cus`, not raw toast library
9. **Auth Redirects**: Middleware redirects to `/login?redirect={pathname}` on 401, and redirects away from `/login` if already authenticated
10. **API Response Unwrapping**: Backend wraps all responses in `ApiResponse<T>`, always access `response.data.data` not `response.data`

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

- **WebSocket Setup**: See `WEBSOCKET_SETUP.md` for quick start
- **Full WebSocket Docs**: See `docs/WEBSOCKET_NOTIFICATION.md`
- **Architecture**: This file
- **Mock Data**: Check `data/mock*.ts` files for development examples