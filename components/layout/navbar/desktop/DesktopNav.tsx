import { CategoryDto } from '@/types/category'
import { CartItem } from '@/types/navbar'
import { NotificationDTO } from '@/types/notification'
import SearchBar from '../search-bar/SearchBar'
import UserLearning from '../user-learning/UserLearning'
import UserMenu from '../user-dropdown/UserMenu'
import ShoppingCart from '../shopping-cart/ShoppingCart'
import NavigationLinks from '../other-link/NavigationLinks'
import NotificationDropdown from '../notification-badge/NotificationDropdown'
import { ChatBadge } from '@/components/chat/ChatBadge'
import { useUnreadCount } from '@/context/ChatContext'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

interface DesktopNavProps {
  categories: CategoryDto[]
  isLoading: boolean
  roleStaff: any
  roleAdmin: boolean
  notifications: NotificationDTO[]
  totalUnread: number
  cartItems: CartItem[]
  onRemoveFromCart: (id: number) => Promise<void>
  totalPrice: number
}

const DesktopNav = ({
  roleStaff,
  roleAdmin,
  notifications,
  totalUnread,
  cartItems,
  onRemoveFromCart,
  totalPrice,
}: DesktopNavProps) => {
  // Get unread chat count from ChatContext
  const { isAuthenticated } = useAuth()
  const totalChatUnread = useUnreadCount()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      setUnreadCount(totalChatUnread)
    } else {
      setUnreadCount(0)
    }
  }, [isAuthenticated, totalChatUnread])

  return (
    <>
      {/* Search bar */}
      <div className="hidden lg:block flex-grow mx-4 max-w-xl">
        <SearchBar />
      </div>

      {/* Navigation links */}
      <div className="hidden lg:flex items-center space-x-4">
        <NavigationLinks />

        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            {!roleAdmin && roleStaff && (
              <div className="relative group">
                <button className="hover:text-gray-600 transition-colors flex items-center gap-1">
                  Duyệt
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    href="/requests"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg"
                  >
                    Duyệt khóa học
                  </Link>
                  <Link
                    href="/moderation"
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors border-t border-gray-100 last:rounded-b-lg"
                  >
                    Quản lý đánh giá
                  </Link>
                </div>
              </div>
            )}
            {roleAdmin && (
              <Link
                href="/admin/dashboard"
                className="hover:text-gray-600 transition-colors"
              >
                Quản trị
              </Link>
            )}
            <UserLearning />
            <div className="relative group">
              <ChatBadge
                variant="icon"
                className="hover:bg-gray-100 transition-colors"
                unreadCount={unreadCount}
              />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Tin nhắn
              </div>
            </div>
            <NotificationDropdown
              notifications={notifications}
              totalUnread={totalUnread}
            />
            <ShoppingCart
              items={cartItems}
              onRemoveItem={onRemoveFromCart}
              total={totalPrice}
            />
          </div>
        )}

        <UserMenu />
      </div>
    </>
  )
}

export default DesktopNav
