import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import Script from 'next/script';
import AppProvider from '@/providers/AppProvider';
import "react-toastify/dist/ReactToastify.css";
import FullPageLoadingOverlay from '@/components/shared/FullPageLoadingOverlay';
import React from "react";
import {APP_CONFIG} from "@/config/app.config";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_CONFIG.APP_TITLE,
  description: APP_CONFIG.APP_DESCRIPTION,
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppProvider>
          <FullPageLoadingOverlay>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </FullPageLoadingOverlay>
        </AppProvider>

        {/* Use Next.js Script component for client-side scripts */}
        {typeof window !== 'undefined' && (
          <Script id="navigation-fix">
            {`
      document.addEventListener('DOMContentLoaded', function() {
        const logoLinks = document.querySelectorAll('a.flex.items-center');
        logoLinks.forEach(link => {
          link.addEventListener('click', function(e) {
            if (window.location.pathname.includes('/search')) {
              e.preventDefault();
              window.location.href = '/';
            }
          });
        });
      });
    `}
          </Script>
        )}
      </body>
    </html>
  );
}