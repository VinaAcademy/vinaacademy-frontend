# Revenue Management Setup Guide

## 🚀 Quick Start

### 1. Add Revenue Routes to Navigation

Update your navigation configuration to include revenue management routes:

**For Instructor Navigation:**

```typescript
// In your instructor navigation config
{
  title: "Doanh thu",
  url: "/instructor/revenue",
  icon: "wallet", // or appropriate icon
}
```

**For Admin Navigation:**

```typescript
// In your admin navigation config
{
  title: "Quản lý doanh thu",
  url: "/admin/revenue",
  icon: "barChart3", // or appropriate icon
}
```

### 2. Configure React Query Provider

Make sure your app is wrapped with React Query provider:

```tsx
// In your root layout or _app.tsx
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
```

### 3. Set Up Toast Notifications

Ensure the toast provider is configured:

```tsx
// In your root layout
import ToastProvider from "@/providers/ToastProvider";

export default function Layout({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
```

### 4. Verify API Endpoints

Make sure your backend implements these endpoints:

**Instructor Endpoints:**

- `GET /api/instructor/revenue/wallet/balance`
- `GET /api/instructor/revenue/wallet/transactions`
- `GET /api/instructor/revenue/history`
- `POST /api/instructor/revenue/payout/request`
- `GET /api/instructor/revenue/payout/requests`
- `PUT /api/instructor/revenue/payout/requests/{id}/cancel`

**Admin Endpoints:**

- `GET /api/admin/revenue/dashboard`
- `GET /api/admin/revenue/payout/pending`
- `PUT /api/admin/revenue/payout/approve`
- `PUT /api/admin/revenue/refund`

### 5. Update Environment Variables

Add any required environment variables:

```env
# In your .env.local or .env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Add other revenue-related config as needed
```

## 🔧 Customization

### Styling

You can customize the appearance by modifying the Tailwind classes in components or creating custom CSS:

```css
/* Custom revenue component styles */
.revenue-card {
  @apply bg-gradient-to-r from-blue-500 to-green-500;
}
```

### Minimum Withdrawal Amount

Update the minimum amount in `services/revenueService.ts`:

```typescript
export const validatePayoutAmount = (
  amount: number,
  availableBalance: number,
  minAmount = 50000 // Change this value
) => {
  // validation logic
};
```

### Currency Format

Modify currency formatting in `services/revenueService.ts`:

```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND", // Change currency as needed
  }).format(amount);
};
```

## 🛡️ Security Considerations

1. **Route Protection**: Ensure proper role-based access control
2. **API Security**: Validate user permissions on the backend
3. **Input Validation**: Always validate user inputs
4. **Audit Logging**: Log all financial transactions

## 📊 Monitoring

Consider adding analytics to track:

- Payout request volumes
- Approval/rejection rates
- Average processing times
- Revenue trends

## 🐛 Troubleshooting

### Common Issues

**1. Toast notifications not showing**

- Verify ToastProvider is properly configured
- Check console for JavaScript errors

**2. API calls failing**

- Check network tab for request errors
- Verify API endpoints are correct
- Ensure authentication tokens are valid

**3. Components not rendering**

- Check for missing dependencies
- Verify all imports are correct
- Look for TypeScript compilation errors

**4. Pagination not working**

- Ensure backend returns proper pagination metadata
- Check page size and offset calculations

### Debug Mode

Add debug logging to services:

```typescript
// In revenueService.ts
const DEBUG = process.env.NODE_ENV === "development";

export const getWalletBalance = async (): Promise<WalletBalanceDto | null> => {
  try {
    if (DEBUG) console.log("Fetching wallet balance...");
    const response = await apiClient.get("/instructor/revenue/wallet/balance");
    if (DEBUG) console.log("Wallet balance response:", response.data);
    return response.data.data;
  } catch (error) {
    if (DEBUG) console.error("getWalletBalance error:", error);
    return null;
  }
};
```

## 🚀 Deployment

Before deploying to production:

1. **Test all revenue flows** thoroughly
2. **Verify API endpoints** work in production environment
3. **Check error handling** with invalid data
4. **Test mobile responsiveness**
5. **Validate security permissions**
6. **Set up monitoring** and alerting

## 📞 Support

For issues or questions:

1. Check the component documentation
2. Review the API response formats
3. Test with sample data
4. Check browser developer console for errors

Happy coding! 🎉
