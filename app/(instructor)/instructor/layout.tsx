'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Layers,
  Video,
  FileText,
  Settings,
  Users,
  BarChart2,
  Plus,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User as UserIcon,
  DollarSign,
} from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { getCurrentUser } from '@/services/authService'
import { User } from '@/types/auth'
import HomeLink from '@/components/layout/HomeLink'

interface InstructorLayoutProps {
  children: ReactNode
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { logout } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const handleUser = async () => {
    const user = await getCurrentUser()
    setUser(user)
  }
  useEffect(() => {
    handleUser()
  }, [])

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isActive = (path: string) => {
    if (path === '/instructor/courses' && pathname === path) {
      return true
    }
    // Special case for new course path to not highlight courses
    if (pathname === '/instructor/courses/new') {
      return path === '/instructor/courses/new'
    }
    return pathname.includes(path)
  }

  const navItems = [
    {
      path: '/instructor/dashboard',
      icon: <BarChart2 className="w-5 h-5 mr-3" />,
      label: 'Tổng quan',
    },
    {
      path: '/instructor/courses',
      icon: <Layers className="w-5 h-5 mr-3" />,
      label: 'Khóa học của tôi',
    },
    {
      path: '/instructor/courses/new',
      icon: <Plus className="w-5 h-5 mr-3" />,
      label: 'Tạo khóa học mới',
    },
    {
      path: '/instructor/revenue',
      icon: <DollarSign className="w-5 h-5 mr-3" />,
      label: 'Doanh thu',
    },
    {
      path: '/instructor/students',
      icon: <Users className="w-5 h-5 mr-3" />,
      label: 'Học viên',
    },
    {
      path: '/instructor/settings',
      icon: <Settings className="w-5 h-5 mr-3" />,
      label: 'Cài đặt',
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-900">
          <div className="flex items-center justify-center h-16 px-4 bg-gray-800 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Giảng viên</h1>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-grow px-2 py-6 space-y-2">
              {navItems.map((item) => (
                <Link href={item.path} key={item.path}>
                  <div
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {isActive(item.path) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                </Link>
              ))}
            </nav>

            <div className="p-4 mt-auto">
              <Link href="/">
                <div className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Về trang chủ
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 md:hidden hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                >
                  <span className="sr-only">
                    {isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
                  </span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>

                {/* Page title - visible on small screens */}
                <div className="md:hidden ml-2 font-semibold text-gray-800">
                  Giảng viên
                </div>
              </div>
              <HomeLink className="flex items-center">
                <span className="hidden sm:inline">Vina Academy</span>
              </HomeLink>
              {/* Right side elements */}
              <div className="flex items-center space-x-4">
                {/* Return to Home (visible on mobile) */}
                
                <div className="md:hidden">
                  <Link href="/">
                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
                      Trang chủ
                    </button>
                  </Link>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  {isMounted && (
                    <>
                      <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center space-x-2 bg-white rounded-lg p-1.5 border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                      >
                        {/* <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="font-medium text-blue-600">GV</span>
                                                </div>
                                                <div className="hidden sm:block text-left">
                                                    <div className="text-sm font-medium text-gray-800">Nguyễn Văn A</div>
                                                    <div className="text-xs text-gray-500">Giảng viên</div>
                                                </div> */}
                        <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                      </button>

                      <AnimatePresence>
                        {isProfileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                          >
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="user-menu"
                            >
                              <Link href={`/instructors/${user?.id}`}>
                                <div
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  <UserIcon className="mr-3 h-4 w-4" />
                                  Hồ sơ của tôi
                                </div>
                              </Link>
                              <Link href="/instructor/settings">
                                <div
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  role="menuitem"
                                >
                                  <Settings className="mr-3 h-4 w-4" />
                                  Cài đặt
                                </div>
                              </Link>
                              <div className="border-t border-gray-100 my-1"></div>
                              <Link
                                href="#"
                                onClick={logout}
                                className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                              >
                                Đăng xuất
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on mobile menu state */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gray-900 pt-2 pb-3 space-y-1 shadow-lg z-20">
                {navItems.map((item) => (
                  <Link href={item.path} key={`mobile-${item.path}`}>
                    <div
                      className={`flex items-center px-4 py-3 text-sm font-medium ${
                        isActive(item.path)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-20">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  )
}
