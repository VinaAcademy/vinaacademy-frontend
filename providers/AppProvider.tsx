"use client";

import React from "react";
import ComposerProvider from "./ComposerProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import ToastProvider from "./ToastProvider";
import {AuthProvider} from "@/context/AuthContext";
import {NotificationProvider} from "@/context/NotificationContext";
import {CategoryProvider} from "@/context/CategoryContext";
import {CartProvider} from "@/context/CartContext";
import {Toaster} from "@/components/ui/sonner";

/**
 * AppProvider - Centralized provider composition
 *
 * This component combines all application providers in the correct order:
 * 1. ReactQueryProvider - Data fetching and caching
 * 2. ToastProvider - Toast notifications
 * 3. AuthProvider - Authentication state
 * 4. WebSocketProvider - Real-time notifications (requires auth)
 * 5. CategoryProvider - Category data
 * 6. CartProvider - Shopping cart state
 *
 * Order matters! WebSocket must be after Auth (requires token).
 *
 * Providers can be passed as:
 * - Simple component: AuthProvider
 * - Component with props: [WebSocketProvider, { debug: true }]
 */

interface AppProviderProps {
    children: React.ReactNode;
}

export default function AppProvider({children}: AppProviderProps) {
    const wsUrl = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL;
    const debug = process.env.NODE_ENV === 'development';

    if (!wsUrl) {
        console.error("Missing NEXT_PUBLIC_NOTIFICATION_WS_URL environment variable");
    }
    return (
        <ComposerProvider
            providers={[
                ReactQueryProvider,
                ToastProvider,
                AuthProvider,
                wsUrl ? [NotificationProvider, {debug, wsUrl}] : null,
                CategoryProvider,
                CartProvider,
            ]}
        >
            {children}
            <Toaster/>
        </ComposerProvider>
    );
}
