# Revenue & Payout Management System

This documentation describes the revenue and payout management features implemented for both Instructors and Administrators in the Vina Academy frontend application.

## 📋 Overview

The revenue management system consists of two main user interfaces:

- **Instructor Interface**: For managing personal revenue, wallet, and payout requests
- **Admin Interface**: For overseeing system revenue, approving payouts, and processing refunds

## 🗂️ Project Structure

```
components/
├── instructor/
│   └── revenue/
│       ├── WalletBalanceCard.tsx          # Wallet balance overview
│       ├── WalletTransactionsTable.tsx    # Transaction history
│       ├── RevenueHistoryTable.tsx        # Course revenue history
│       ├── PayoutRequestModal.tsx         # Payout request form
│       └── PayoutRequestsTable.tsx        # Payout requests management
└── admin/
    └── revenue/
        ├── AdminRevenueDashboard.tsx      # Admin revenue overview
        ├── AdminPayoutApproval.tsx       # Payout approval interface
        └── AdminRefundForm.tsx           # Refund processing form

app/
├── (instructor)/instructor/revenue/page.tsx  # Main instructor revenue page
└── (admin)/admin/revenue/page.tsx           # Main admin revenue page

services/
└── revenueService.ts                       # API service functions

hooks/
└── useRevenue.ts                          # Custom hooks for revenue data

types/
└── revenue.ts                             # TypeScript interfaces and enums
```

## 🎯 Features

### Instructor Features

#### 1. Wallet Balance Overview

- **Component**: `WalletBalanceCard.tsx`
- **Features**:
  - Current balance display
  - Available withdrawal amount
  - Total earnings summary
  - Pending withdrawals tracking
- **API**: `GET /instructor/revenue/wallet/balance`

#### 2. Transaction History

- **Component**: `WalletTransactionsTable.tsx`
- **Features**:
  - Paginated transaction list
  - Filter by transaction type (EARNING, PAYOUT, REFUND, ADJUSTMENT)
  - Real-time balance tracking
  - Detailed transaction descriptions
- **API**: `GET /instructor/revenue/wallet/transactions`

#### 3. Course Revenue History

- **Component**: `RevenueHistoryTable.tsx`
- **Features**:
  - Revenue breakdown per course
  - Instructor earnings vs platform fees
  - Revenue status tracking (ACTIVE, REFUNDED)
  - Summary statistics per page
- **API**: `GET /instructor/revenue/history`

#### 4. Payout Request Management

- **Components**: `PayoutRequestModal.tsx`, `PayoutRequestsTable.tsx`
- **Features**:
  - Create new payout requests
  - Bank account information management
  - Request status tracking
  - Cancel pending requests
  - Validation for minimum amounts
- **APIs**:
  - `POST /instructor/revenue/payout/request`
  - `GET /instructor/revenue/payout/requests`
  - `PUT /instructor/revenue/payout/requests/{id}/cancel`

### Admin Features

#### 1. Revenue Dashboard

- **Component**: `AdminRevenueDashboard.tsx`
- **Features**:
  - Total revenue overview
  - Platform fees and instructor earnings
  - Pending vs completed payouts
  - System-wide statistics
  - Revenue analysis and ratios
- **API**: `GET /admin/revenue/dashboard`

#### 2. Payout Approval System

- **Component**: `AdminPayoutApproval.tsx`
- **Features**:
  - Review pending payout requests
  - Approve or reject requests with reasons
  - Instructor information display
  - Batch processing capabilities
- **API**:
  - `GET /admin/revenue/payout/pending`
  - `PUT /admin/revenue/payout/approve`

#### 3. Refund Processing

- **Component**: `AdminRefundForm.tsx`
- **Features**:
  - VNPay transaction refund processing
  - Detailed reason tracking
  - Validation and error handling
  - Refund status notifications
- **API**: `PUT /admin/revenue/refund`

## 🔧 Technical Implementation

### State Management

- **React Query**: Used for server state management, caching, and synchronization
- **Custom Hooks**: `useRevenue.ts` provides typed hooks for all revenue operations
- **Automatic Invalidation**: Related queries are invalidated after mutations

### Data Validation

- **Client-side**: Form validation with real-time error feedback
- **Amount Validation**: Minimum withdrawal amounts and balance checks
- **Bank Details**: Account number format validation

### UI/UX Features

- **Responsive Design**: Mobile-friendly layouts using Tailwind CSS
- **Loading States**: Skeleton loaders for better user experience
- **Error Handling**: Comprehensive error messages and retry mechanisms
- **Toast Notifications**: Success/error feedback using react-toastify
- **Pagination**: Efficient data loading for large datasets

### Security & Permissions

- **Role-based Access**: Instructor vs Admin route protection
- **API Authentication**: Automatic token handling via apiClient
- **Input Sanitization**: XSS protection and data validation

## 📊 Data Flow

### Instructor Flow

1. **Dashboard Load**: Fetch wallet balance and display overview
2. **Transaction View**: Paginated transaction history with filters
3. **Revenue Analysis**: Course-wise revenue breakdown
4. **Payout Request**: Create, track, and manage withdrawal requests

### Admin Flow

1. **Dashboard Overview**: System-wide revenue statistics
2. **Payout Review**: Approve/reject instructor withdrawal requests
3. **Refund Processing**: Handle customer refunds via VNPay
4. **Audit Trail**: Comprehensive logging of all financial operations

## 🚀 Usage Examples

### Creating a Payout Request (Instructor)

```tsx
// Component automatically validates minimum amounts and available balance
<PayoutRequestModal trigger={<Button>Request Payout</Button>} />
```

### Approving Payouts (Admin)

```tsx
// Modal with approval/rejection functionality
<PayoutApprovalModal
  request={selectedRequest}
  onClose={() => setSelectedRequest(null)}
/>
```

### Processing Refunds (Admin)

```tsx
// Form with VNPay integration
<AdminRefundForm />
```

## 🎨 Styling & Theming

- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Consistent component library
- **Custom Components**: Styled cards, tables, and forms
- **Color Coding**: Status-based color schemes for better UX

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Responsive layouts for tablet screens
- **Desktop**: Full-featured interface for desktop users
- **Touch-friendly**: Appropriate touch targets and gestures

## 🔄 API Integration

All components use the centralized `revenueService.ts` with:

- **Error Handling**: Comprehensive error catching and logging
- **Type Safety**: Full TypeScript support
- **Automatic Retries**: Built-in retry logic for failed requests
- **Cache Management**: Optimistic updates and cache invalidation

## 🧪 Testing Considerations

- **Unit Tests**: Individual component testing
- **Integration Tests**: API service testing
- **E2E Tests**: Full user flow testing
- **Error Scenarios**: Edge case and error handling tests

## 🚦 Status Indicators

- **Payout Status**: PENDING, REVIEWING, APPROVED, PROCESSING, PAID, REJECTED, CANCELLED
- **Revenue Status**: ACTIVE, REFUNDED
- **Transaction Types**: EARNING, PAYOUT, REFUND, ADJUSTMENT

## 📈 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Virtual Scrolling**: For large data sets
- **Optimistic Updates**: Immediate UI feedback

This implementation provides a comprehensive revenue management system that handles the complete lifecycle of instructor earnings and administrator oversight, with a focus on user experience, security, and maintainability.
