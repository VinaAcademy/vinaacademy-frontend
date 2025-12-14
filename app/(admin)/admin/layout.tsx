'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/sidebar'
import Header from '@/components/admin/header'
import { Toaster } from '@/components/ui/toaster'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar cho desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* Sidebar cho mobile - overlay */}
      {sidebarOpen && (
        <div className="relative z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          <div className="fixed inset-0 flex z-40">
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Đóng sidebar</span>
                  <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <Sidebar
                mobile={true}
                closeSidebar={() => setSidebarOpen(false)}
              />
            </div>
            <div className="flex-shrink-0 w-14">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMenuButtonClick={() => setSidebarOpen(true)} />

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {/* Page heading and actions */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="border-b border-gray-200 pb-4"></div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">{children}</div>
            </div>
          </div>
          <Toaster />
        </main>
      </div>
    </div>
  )
}
