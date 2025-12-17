import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import AppProvider from '@/providers/AppProvider'
import 'react-toastify/dist/ReactToastify.css'
import FullPageLoadingOverlay from '@/components/shared/FullPageLoadingOverlay'
import React from 'react'
import { APP_CONFIG } from '@/config/app.config'
import NavigationFix from '@/components/layout/navbar/NavigationFix'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: APP_CONFIG.APP_TITLE,
  description: APP_CONFIG.APP_DESCRIPTION,
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppProvider>
          <FullPageLoadingOverlay>
            <LayoutWrapper>{children}</LayoutWrapper>
          </FullPageLoadingOverlay>
        </AppProvider>
        <NavigationFix />
      </body>
    </html>
  )
}
