/**
 * Providers Index
 * 
 * Central export point for all application providers.
 * 
 * ## Provider Composition Pattern
 * 
 * This project uses a composer pattern to avoid "provider hell" - the problem
 * of deeply nested provider components that make code hard to read and maintain.
 * 
 * ### Before (Provider Hell):
 * ```tsx
 * <ReactQueryProvider>
 *   <ToastProvider>
 *     <AuthProvider>
 *       <WebSocketProvider>
 *         <CategoryProvider>
 *           <CartProvider>
 *             <App />
 *           </CartProvider>
 *         </CategoryProvider>
 *       </WebSocketProvider>
 *     </AuthProvider>
 *   </ToastProvider>
 * </ReactQueryProvider>
 * ```
 * 
 * ### After (Clean Composition):
 * ```tsx
 * <AppProvider>
 *   <App />
 * </AppProvider>
 * ```
 * 
 * ## Architecture
 * 
 * - **ComposerProvider**: Generic provider composition utility
 * - **AppProvider**: Application-specific provider configuration
 * - **Individual Providers**: ReactQuery, Toast, Auth, WebSocket, Category, Cart
 * 
 * ## Usage
 * 
 * In most cases, just use `AppProvider` in your root layout:
 * 
 * ```tsx
 * import { AppProvider } from '@/providers';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <AppProvider>
 *       {children}
 *     </AppProvider>
 *   );
 * }
 * ```
 * 
 * ## Adding New Providers
 * 
 * To add a new provider to the composition:
 * 
 * 1. Create your provider component (must accept children prop)
 * 2. Add it to the `providers` array in `AppProvider.tsx`
 * 3. Consider the order - some providers depend on others
 * 
 * ```tsx
 * // AppProvider.tsx
 * providers={[
 *   ReactQueryProvider,
 *   ToastProvider,
 *   AuthProvider,
 *   [WebSocketProvider, { debug: true }], // Provider with props
 *   YourNewProvider, // Add here
 *   CategoryProvider,
 *   CartProvider,
 * ]}
 * ```
 * 
 * ## Provider Order
 * 
 * The order matters! Current order:
 * 1. **ReactQueryProvider** - Must be first for data fetching
 * 2. **ToastProvider** - UI notifications
 * 3. **AuthProvider** - Authentication state
 * 4. **WebSocketProvider** - Requires auth token, must come after AuthProvider
 * 5. **CategoryProvider** - May depend on auth
 * 6. **CartProvider** - May depend on auth
 */

// Export all providers
export { default as ComposerProvider } from './ComposerProvider';
export { default as AppProvider } from './AppProvider';
export { default as ReactQueryProvider } from './ReactQueryProvider';
export { default as ToastProvider } from './ToastProvider';
export { default as SessionProvider } from './SessionProvider';

// Re-export context providers for convenience
export { AuthProvider, useAuth } from '@/context/AuthContext';
export { NotificationProvider, useWebSocketNotification } from '@/context/NotificationContext';
export { CategoryProvider, useCategories } from '@/context/CategoryContext';
export { CartProvider, useCart } from '@/context/CartContext';
