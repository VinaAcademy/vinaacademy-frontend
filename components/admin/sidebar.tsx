'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ChartBarStacked,
  Dot,
  TrendingUp,
  Shield,
} from 'lucide-react'
import { getStatusCourse } from '@/services/courseService'

interface SidebarProps {
  mobile?: boolean
  closeSidebar?: () => void
}

export default function Sidebar({
  mobile = false,
  closeSidebar,
}: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState<number>(0)
  const router = useRouter()

  // Fetch pending courses count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const data = await getStatusCourse()
        if (data) {
          setPendingCount(data.totalPending)
        }
      } catch (error) {
        console.error('Error fetching pending count:', error)
      }
    }

    fetchPendingCount()
    // Refetch every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Khóa học',
      href: '/admin/courses',
      icon: BookOpen,
      children: [
        { name: 'Tổng quan', href: '/admin/courses' },
        {
          name: 'Chờ phê duyệt',
          href: '/admin/courses/requests',
          badge: pendingCount,
        },
        { name: 'Danh mục', href: '/admin/courses/category' },
      ],
    },
    {
      name: 'Người dùng',
      href: '/admin/users',
      icon: Users,
      children: [
        { name: 'Tất cả người dùng', href: '/admin/users' },
        // { name: 'Giảng viên', href: '/admin/users/instructors' },
        // { name: 'Học viên', href: '/admin/users/students' },
      ],
    },
    { name: 'Quản lý doanh thu', href: '/admin/revenue', icon: TrendingUp },
    // { name: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
    { name: 'Kiểm duyệt', href: '/admin/moderation', icon: Shield },
    // { name: 'Danh mục', href: '/admin/category', icon: ChartBarStacked },
    // {
    //   name: 'Cài đặt',
    //   href: '/admin/settings',
    //   icon: Settings,
    //   children: [
    //     { name: 'Cài đặt nền tảng', href: '/admin/settings/platform' },
    //     { name: 'Cài đặt thanh toán', href: '/admin/settings/payment' },
    //     { name: 'Email', href: '/admin/settings/email' },
    //   ],
    // },
  ]

  const toggleExpand = (name: string) => {
    if (expandedItems.includes(name)) {
      setExpandedItems(expandedItems.filter((item) => item !== name))
    } else {
      setExpandedItems([...expandedItems, name])
    }
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  const isChildActive = (children: any[]) => {
    return children.some((child) => pathname === child.href)
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div
      className={`
                flex flex-col flex-shrink-0 bg-white pt-5 pb-4 
                transition-all duration-300 ease-in-out h-full
                ${isCollapsed ? 'w-16' : 'w-64'}
                relative
            `}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={toggleSidebar}
        className="
                    absolute top-5 right-0 transform translate-x-1/2 
                    bg-white border border-gray-200 rounded-full 
                    w-8 h-8 flex items-center justify-center 
                    z-10 shadow-md hover:bg-gray-50
                    mr-9
                "
      >
        {isCollapsed ? (
          <ChevronsRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronsLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 mb-5">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold text-gray-900 hover:cursor-pointer" onClick={() => router.push('/')}>VinAcademy</h1>
        ) : (
          <div className="w-full flex justify-center">
            <span className="text-xl font-bold text-gray-900">VA</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1 bg-white" aria-label="Sidebar">
          {navigation.map((item) =>
            !item.children ? (
              <Link
                key={item.name}
                href={item.href}
                onClick={mobile ? closeSidebar : undefined}
                className={`
                                    group flex items-center px-2 py-2 text-sm font-medium rounded-md text-center
                                    ${
                                      isActive(item.href)
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`
                                        flex-shrink-0 h-5 w-5
                                        ${isActive(item.href) ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}
                                        ${!isCollapsed ? 'mr-3' : ''}
                                    `}
                />
                {!isCollapsed && <span className="ml-7">{item.name}</span>}
              </Link>
            ) : (
              <div key={item.name}>
                <button
                  onClick={() => !isCollapsed && toggleExpand(item.name)}
                  className={`
                                        w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md
                                        ${
                                          expandedItems.includes(item.name)
                                            ? 'bg-gray-50 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`
                                            flex-shrink-0 h-5 w-5
                                            ${
                                              expandedItems.includes(item.name)
                                                ? 'text-gray-500'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                            }
                                            ${!isCollapsed ? 'mr-3' : ''}
                                        `}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="ml-7">{item.name}</span>
                      <svg
                        className={`
                                                    
                                                    ml-auto flex-shrink-0 h-5 w-5 transform transition-transform duration-150
                                                    ${expandedItems.includes(item.name) ? 'rotate-90' : 'rotate-0'}
                                                `}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </button>

                {/* Sub-navigation */}
                {!isCollapsed &&
                  (expandedItems.includes(item.name) ||
                    item.children.some((child) => isActive(child.href))) && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={mobile ? closeSidebar : undefined}
                          className={`
                                                    group flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md
                                                    ${
                                                      isActive(child.href)
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                    }
                                                `}
                        >
                          <Dot className="flex-shrink-0 h-4 w-4 -ml-2 mr-2" />
                          <span className="truncate">{child.name}</span>
                          {child.badge !== undefined && child.badge > 0 && (
                            <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ),
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {/* <div className="pl-2 space-y-4">
          <Link
            href="/admin/help"
            className="group flex items-center pl-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            title={isCollapsed ? 'Thông báo' : undefined}
          >
            <Bell
              className={`
                                flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500
                                ${!isCollapsed ? 'mr-3' : ''}
                            `}
            />
            {!isCollapsed && (
              <>
                Thông báo
                <span className="ml-auto mr-3 inline-block py-0.5 px-3 text-xs rounded-full bg-red-100 text-red-800">
                  3
                </span>
              </>
            )}
          </Link>

          <div className="flex items-center pl-2">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500">A</span>
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs font-medium text-gray-500">Super Admin</p>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  )
}
