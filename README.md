# VinaAcademy Frontend

> Nền tảng học trực tuyến hiện đại - Learn Anytime, Anywhere

[![Build Status](https://github.com/VinaAcademy/vinaacademy-frontend/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/VinaAcademy/vinaacademy-frontend/actions)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## About

**VinaAcademy** is a modern, feature-rich e-learning platform built with cutting-edge web technologies. It provides a comprehensive learning experience with role-based access control, real-time notifications, interactive chat, and seamless course management. The platform supports multiple user roles (Students, Instructors, Admins, Staff) with tailored experiences for each.

Designed for educational institutions and online course creators, VinaAcademy enables instructors to create and manage courses while students can browse, enroll, and learn at their own pace.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building](#building)
- [Project Structure](#project-structure)
- [Key Features & Architecture](#key-features--architecture)
- [Contributing](#contributing)

## Features

### 🎓 Learning Experience
- **Course Discovery & Enrollment**: Browse, search, and enroll in courses by category
- **Interactive Learning**: Watch course videos, read lessons, and track progress
- **Quizzes & Assessments**: Take quizzes and receive immediate feedback
- **Course Notes**: Personal note-taking during course learning
- **Discussion Forum**: Engage with instructors and peers

### 👥 Role-Based Access
- **Student Dashboard**: View enrolled courses, learning progress, and course recommendations
- **Instructor Dashboard**: Create courses, manage students, track earnings, and analyze performance
- **Admin Panel**: Manage users, courses, content moderation, and system settings
- **Staff Dashboard**: Handle support requests and administrative tasks

### 💬 Real-Time Communication
- **WebSocket Notifications**: Instant system alerts for payments, course approvals, reviews, and more
- **Real-Time Chat**: Direct messaging and group conversations with WebSocket-powered instant delivery
- **Notification Bell**: Centralized notification hub with unread count tracking

### 🛒 E-Commerce Integration
- **Shopping Cart**: Add/remove courses, persistent cart state
- **Payment Processing**: Secure payment integration
- **Order Management**: Track purchase history and course access

### 📊 Course Management
- **Rich Content Editor**: TipTap editor with YouTube embeds and rich formatting
- **Video Upload**: Chunked upload support for large video files
- **Course Sections & Lessons**: Organize content hierarchically
- **Student Enrollment Tracking**: Monitor student progress and engagement

### 🔒 Security & Authentication
- **JWT Authentication**: Secure token-based authentication with automatic refresh
- **Role-Based Route Protection**: Middleware-level route protection
- **HTTP-Only Cookies**: Secure token storage
- **Auto Token Refresh**: Seamless token refresh on expiration

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Built on Radix UI primitives for WCAG compliance
- **Dark Mode Support**: Full dark mode support with CSS custom properties
- **Smooth Animations**: Framer Motion powered transitions

## Technology Stack

### Frontend Framework
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React with improved hooks and Context
- **TypeScript 5** - Strict type safety across the application

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless, accessible component primitives
- **Shadcn/ui** - Pre-built components on top of Radix UI
- **Framer Motion** - Animation and motion library
- **Lucide React** - Icon library

### State Management
- **TanStack Query v5** - Server state management and caching
- **React Context** - Global client state (Auth, Cart, Notifications, Chat, Categories)
- **React Hook Form** - Efficient form state management
- **Zod** - Runtime type validation

### Rich Content & Media
- **TipTap Editor** - Rich text editor with extensions
- **YouTube Embeds** - Built-in YouTube video support
- **Drag & Drop** - @dnd-kit for content reordering

### Real-Time Communication
- **SockJS + STOMP** - WebSocket communication layer
- **Socket connections for**:
  - User notifications
  - Real-time chat (direct & group messaging)

### Data & API
- **Axios** - HTTP client with interceptors
- **Next.js API Proxy** - CORS-free API routing via `/api/*`
- **JWT** - Token-based authentication

### Development & Build
- **ESLint** - Code linting
- **Tailwind CSS** - PostCSS integration
- **Docker** - Containerization support

### Additional Libraries
- **React Toastify** - Toast notifications
- **Next Auth.js** - Authentication framework (JWT provider)
- **@tanstack/react-table** - Powerful table management
- **js-cookie** - Cookie handling
- **Faker.js** - Mock data generation

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Backend API**: Running microservices backend (accessible at `NEXT_PUBLIC_API_URL`)
- **Git**: For version control

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/VinaAcademy/vinaacademy-frontend.git
cd vinaacademy-frontend
```

### 2. Install Dependencies

```bash
npm install
```

Or with yarn:
```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Frontend URL (used for absolute URLs, SSR, and metadata)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WebSocket Endpoints (optional - has built-in defaults)
NEXT_PUBLIC_NOTIFICATION_WS_URL=http://localhost:8080/ws/notification
```

**Key Configuration Details**:
- **API_URL**: Backend API base URL - all `/api/*` requests proxy through this
- **SITE_URL**: Frontend application URL for absolute links and SSR
- **WS_URL**: WebSocket endpoint for real-time notifications and chat

### 4. Verify Environment Setup

```bash
# Check that environment variables are loaded
npm run dev
```

## Configuration

### API Endpoints

All API endpoints are centralized in `config/api.endpoint.ts`. Common endpoints include:

- **Courses**: `/courses`, `/courses/by-slug/{slug}`, `/courses/by-id/{id}`
- **Authentication**: `/auth/login`, `/auth/register`, `/auth/refresh`
- **Cart**: `/cart`, `/cart/items`
- **Chat**: `/conversations`, `/messages/conversation/{id}`
- **Notifications**: WebSocket `/ws/notification`

### Application Constants

Global constants are defined in `config/app.config.ts`:

```typescript
APP_CONFIG.COURSES.RECENT_COURSES_LIMIT    // Default: 5
APP_CONFIG.COURSES.USER_LEARNING_LIMIT     // Default: 5
APP_CONFIG.HIDE_LAYOUT_ROUTES              // Routes without layout wrapper
APP_CONFIG.LOADING_IGNORE_ROUTES           // Routes without loading indicator
```

### Route Groups

The application uses Next.js route groups for role-based organization:

- `(admin)/*` - Admin-only routes
- `(instructor)/*` - Instructor dashboard routes
- `(student)/*` - Student learning routes
- `(auth)/*` - Authentication routes (login, register)
- `(public)/*` - Public pages (homepage, courses listing)

Route groups don't appear in URLs (e.g., `/admin/dashboard` not `/(admin)/dashboard`).

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Development Features**:
- Hot module reloading (HMR)
- React Query DevTools enabled
- Detailed API request logging in console
- WebSocket debug mode available (see `providers/AppProvider.tsx`)

### Development Commands (Windows PowerShell)

```powershell
# Start dev server
npm run dev

# Run linting
npm run lint

# Check for type errors
npx tsc --noEmit

# Install new package and save
npm install package-name
```

### Testing Features

**Mock Data**:
- `data/mockCourses.ts` - Sample course data
- `data/mockCourseData.ts` - Detailed course information
- `data/mockCartData.ts` - Shopping cart examples
- `data/mockInstructorCourse.ts` - Instructor dashboard data

**WebSocket Testing**:
- Enable debug mode in `AppProvider.tsx`: `[NotificationProvider, { debug: true }]`
- Check notifications via bell icon in navigation
- Test chat at `/conversations` page

## Building

### Create Production Build

```bash
npm run build
```

This creates an optimized production-ready build in the `.next` directory.

### Run Production Build Locally

```bash
npm run build; npm start
```

Or on Windows PowerShell:
```powershell
npm run build; npm start
```

### Docker Build

Build and run the application in Docker:

```bash
# Build image
docker build -t vinaacademy-frontend:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api:8080/api/v1 \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  vinaacademy-frontend:latest
```

## Project Structure

```
vinaacademy-frontend/
├── app/                          # Next.js App Router pages
│   ├── (admin)/                 # Admin route group
│   ├── (instructor)/            # Instructor route group
│   ├── (student)/               # Student route group
│   ├── (auth)/                  # Authentication pages
│   ├── (public)/                # Public pages
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Shadcn/ui base components
│   ├── layout/                  # Layout components (LayoutWrapper, navigation)
│   ├── course/                  # Course display components
│   ├── instructor/              # Instructor-specific components
│   ├── student/                 # Student-specific components
│   ├── admin/                   # Admin panel components
│   ├── chat/                    # Chat/messaging components
│   ├── notifications/           # Notification components
│   ├── cart/                    # Shopping cart components
│   └── common/                  # Shared business components
│
├── config/                       # Centralized configuration
│   ├── api.endpoint.ts          # All API endpoints (NEVER hardcode URLs!)
│   ├── app.config.ts            # Application constants and settings
│   ├── query-keys.config.ts     # React Query cache keys
│   └── seo.config.ts            # SEO metadata
│
├── context/                      # Global state contexts
│   ├── AuthContext.tsx          # User authentication state
│   ├── NotificationContext.tsx  # WebSocket notifications
│   ├── ChatContext.tsx          # Real-time chat messaging
│   ├── CartContext.tsx          # Shopping cart state
│   └── CategoryContext.tsx      # Course categories tree
│
├── hooks/                        # Custom React hooks
│   ├── useCourses.ts            # Course queries
│   ├── useChat.ts               # Chat functionality
│   ├── useNotification.ts       # Notifications
│   └── [various utility hooks]  # Other custom hooks
│
├── services/                     # API service layer
│   ├── courseService.ts         # Course API calls
│   ├── authService.ts           # Authentication API
│   ├── chatService.ts           # Chat REST endpoints
│   ├── imageService.ts          # Image upload
│   └── [other services]         # Feature-specific services
│
├── lib/                          # Utilities & libraries
│   ├── apiClient.ts             # Centralized HTTP client with auth
│   ├── websocket.ts             # WebSocket factory
│   ├── chatWebSocket.ts         # Chat WebSocket connection
│   ├── auth.ts                  # Authentication utilities
│   └── utils.ts                 # Helper functions
│
├── providers/                    # Context providers
│   ├── AppProvider.tsx          # Master provider composition
│   └── [individual providers]   # Feature providers
│
├── types/                        # TypeScript type definitions
│   ├── api-response.ts          # API response structures
│   ├── course.ts                # Course types
│   ├── chat.ts                  # Chat types
│   └── [other types]            # Domain types
│
├── utils/                        # Utility functions
│   ├── courseMapper.ts          # Data transformation
│   └── [other utilities]        # Helper functions
│
├── public/                       # Static assets
│   ├── images/                  # Image assets
│   └── sounds/                  # Notification sounds
│
├── middleware.ts                 # Route protection middleware
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Project dependencies
└── .env.local                   # Environment variables (local only)
```

## Key Features & Architecture

### Authentication & Authorization

- **JWT-based**: Tokens stored in HTTP-only cookies
- **Automatic Refresh**: Token auto-refreshes on 401 errors
- **Role-Based Routes**: Middleware protects routes by role (admin, instructor, student, staff)
- **Context Provider**: Access user data via `useAuth()` hook

### Real-Time Features

#### Notifications
- WebSocket connection to `/ws/notification`
- System alerts for payments, course approvals, reviews
- Auto-reconnect with 5-second interval
- Notification sound on new messages

#### Chat
- Real-time messaging via separate WebSocket connection
- Direct messaging between users
- Group conversations
- Message history retrieval via REST API (paginated)
- Access via `useChat()` hook or `/conversations` page

### API Client Pattern

All HTTP requests use centralized `apiClient.ts`:

```typescript
import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api.endpoint';

// GET request
const response = await apiClient.get(API_ENDPOINTS.COURSE.BY_SLUG(slug));
const data = response.data.data; // Unwrap ApiResponse<T>

// POST request
const result = await apiClient.post(API_ENDPOINTS.CART.ADD, payload);
```

### Service Layer Pattern

Services follow a consistent pattern:

```typescript
export async function getCourse(id: string): Promise<CourseDto | null> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.COURSE.BY_ID(id));
    return response.data.data;
  } catch (error) {
    console.error(`getCourse error for id ${id}:`, error);
    return null; // Services return null on error
  }
}
```

### State Management

- **Server State**: TanStack Query (React Query) for API data
- **Global Client State**: Context providers for auth, notifications, chat, cart, categories
- **Form State**: React Hook Form + Zod validation
- **Provider Nesting**: AppProvider → ReactQuery → Toast → Auth → WebSocket → Features

## Contributing

We welcome contributions from the community! Please follow these guidelines:

### Contributors

- **Nguyen Huu Loc** - Lead Developer, Full Stack Developer
- **Phan Thi My Linh** - Full Stack Developer
- **Vuong Tri Hung** - Full Stack Developer

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/VinaAcademy/vinaacademy-frontend.git
   cd vinaacademy-frontend
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Follow Code Standards**
   - Use TypeScript for type safety
   - Follow the existing code structure and patterns
   - Respect the centralized configuration patterns (endpoints, constants, query keys)
   - Write meaningful commit messages

4. **Testing**
   - Test features thoroughly before submitting
   - Use mock data from `data/mock*.ts` for development
   - Verify WebSocket functionality if applicable
   - Check for TypeScript errors: `npx tsc --noEmit`

5. **Submit a Pull Request**
   - Create a PR against the `develop` branch
   - Provide a clear description of your changes
   - Reference related issues if applicable
   - Ensure CI/CD checks pass

### Code Standards

- **Naming**: PascalCase for components, camelCase for functions/variables
- **API Calls**: Always use `apiClient` from `lib/apiClient.ts`
- **Endpoints**: Define in `config/api.endpoint.ts`, never hardcode URLs
- **Constants**: Use `config/app.config.ts` for app-wide values
- **Query Keys**: Define in `config/query-keys.config.ts` for proper cache invalidation
- **Error Handling**: Services return `null` on error; UI handles via React Query states

### Reporting Issues

When reporting bugs, please include:
- Description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, browser, Node version)
- Screenshots if applicable

---

**Built with ❤️ by the VinaAcademy Team**

For more information, visit our [documentation](https://github.com/VinaAcademy/vinaacademy-frontend/wiki) or contact the development team.
