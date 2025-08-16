# VinaAcademy Frontend - AI Coding Instructions

## Architecture Overview

This is a **Next.js 14+ App Router** e-learning platform with role-based access and microservices integration. Key architectural patterns:

- **Route Groups**: Uses Next.js route groups `(admin)`, `(instructor)`, `(student)`, `(auth)`, `(public)` for role-based layouts without affecting URLs
- **API Proxy**: All backend calls proxy through `/api/*` → `${NEXT_PUBLIC_API_URL}/api/v1/*` via `next.config.ts` rewrites
- **JWT + Cookie Auth**: Access/refresh tokens stored in httpOnly cookies, managed by `lib/apiClient.ts` with automatic refresh
- **Context Providers**: Nested providers in `app/layout.tsx` → ReactQuery → Toast → Auth → Category → Cart → LayoutWrapper

## Authentication & Authorization

### Role-Based Routing
```typescript
// middleware.ts patterns:
// /admin/* → requires ROLE_admin
// /instructor/* → requires ROLE_instructor  
// /requests/* → requires ROLE_admin OR ROLE_staff
```

### Token Management
- Access tokens auto-refresh via `apiClient.ts` interceptors
- Use `getAccessToken()` to check auth state, not direct cookie access
- JWT payload contains `scope: string[]` for role checking

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
- `AuthContext`: User session, login/logout, role checks
- `CartContext`: Shopping cart state across sessions
- `CategoryContext`: Category tree for navigation

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

### Backend Response Structure
```typescript
// All API responses follow this pattern:
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

// Paginated responses wrap data in additional structure:
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  // ... Spring Page metadata
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
npm run lint    # ESLint checking
```

### Environment Setup
- `NEXT_PUBLIC_API_URL` points to backend (default: http://localhost:8080)
- Cookies require secure flag in production
- API rewrites handle CORS automatically

### Testing Patterns
- Services return `null` on error for graceful degradation
- React Query handles loading/error states
- Use mock data from `data/mock*.ts` for development

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
- **Next.js 14+**: App Router, Server Components, Route Groups
- **React 18+**: Hooks, Context, Suspense
- **TypeScript**: Strict mode enabled, path aliases configured

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

## Common Pitfalls

1. **Route Groups**: Don't include parentheses in actual URLs - they're for organization only
2. **API Calls**: Always use `apiClient.ts`, never direct fetch - it handles auth headers
3. **Middleware**: JWT parsing happens in middleware, not components - use context for user data
4. **TypeScript**: Backend uses UUIDs as strings - don't assume numeric IDs
5. **Pagination**: Spring Boot pagination is 0-indexed, match this in frontend calls
