'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import NotificationCard from '@/components/notifications/NotificationCard'
import NotificationFilterFunction from '@/components/notifications/NotificationFilter'
import {
  deleteNotification,
  fetchUserNotifications,
} from '@/services/notificationService'
import {
  NotificationDTO,
  NotificationFilters as NotificationFiltersType,
  PaginationState,
} from '@/types/notification-type'
import { toast } from '@/hooks/use-toast'

import renderSkeletons from '@/components/notifications/NotificationSkeleton'
import { useNotification } from '@/hooks/useNotification'

const NotificationsPage = () => {
  // User ID would normally come from auth context or similar

  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 3,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [filters, setFilters] = useState<NotificationFiltersType>({
    type: null,
    isRead: null,
    sortBy: 'createdAt',
    direction: 'desc',
  })

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true)
      try {
        const result = await fetchUserNotifications({
          type: filters.type,
          isRead: filters.isRead,
          page: pagination.currentPage,
          size: pagination.size,
          sortBy: filters.sortBy,
          direction: filters.direction,
        })

        setNotifications(result.content)
        console.log('Notifications:', result.content)
        setPagination({
          currentPage: result.number,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
          size: result.size,
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
        //console.error("Error loading notifications:", error);
        toast({
          title: 'Đã có lỗi xảy ra khi tải thông báo',
          description: 'Vui lòng thử lại sau.',
          className: 'bg-red-500 text-white border-none',
        })
      } finally {
        setLoading(false)
      }
    }
    loadNotifications().then((r) => r)
  }, [pagination.currentPage, filters, pagination.size])

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page })
  }

  const handleFilterChange = (newFilters: Partial<NotificationFiltersType>) => {
    setFilters({ ...filters, ...newFilters })
    // Reset to first page when filters change
    setPagination({ ...pagination, currentPage: 0 })
  }

  const { markAllAsRead, markAsRead } = useNotification()

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      // Update local state for immediate UI feedback

      setNotifications(
        notifications.map((item) =>
          item.id === notificationId
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      )
      toast({
        title: 'Đã đánh dấu thông báo này là đã đọc',
        description: 'Bạn có thể xem lại thông báo này trong phần đã đọc',
        className: 'bg-green-500 text-white border-none',
        variant: 'default',
      })
    } catch (error) {
      //console.error("Error marking notification as read:", error);
      toast({
        title: 'Đã có lỗi xảy ra',
        className: 'bg-red-500 text-white border-none',
      })
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      // Remove deleted notification from local state
      setNotifications(
        notifications.filter((item) => item.id !== notificationId),
      )
      toast({
        title: 'Đã xóa thông báo này',
        className: 'bg-green-500 text-white border-none',
      })
    } catch (error) {
      //console.error("Error deleting notification:", error);
      toast({
        title: 'Đã có lỗi xảy ra',
        className: 'bg-red-500 text-white border-none',
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()

      if (!notifications || notifications.length == 0) return

      // Update all notifications in local state
      setNotifications(
        notifications.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        })),
      )
      toast({
        title: 'Đã đánh dấu tất cả các thông báo là đã đọc',
        className: 'bg-green-500 text-white border-none',
      })
    } catch (error) {
      //console.error("Error marking all notifications as read:", error);
      toast({
        title: 'Đã có lỗi xảy ra',
        className: 'bg-red-500 text-white border-none',
      })
    }
  }

  return (
    <div className="container pt-16 pb-32 w-[75%] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Thông báo</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <NotificationFilterFunction
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="bg-white/50"
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">{renderSkeletons()}</div>
        ) : !notifications || notifications.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-12">
                <Bell className="h-12 w-12 text-gray-400" />
                <h3 className="font-semibold text-xl">
                  Không tìm thấy thông báo nào
                </h3>
                <p className="text-gray-500">
                  Bạn không có thông báo nào dựa trên bộ lọc hiện tại
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <Pagination className="mt-6 ">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    pagination.currentPage > 0 &&
                    handlePageChange(pagination.currentPage - 1)
                  }
                  className={
                    pagination.currentPage === 0
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from({ length: pagination.totalPages }, (_, i) => i).map(
                (page) => {
                  // Show first page, last page, and pages around current page
                  if (
                    page === 0 ||
                    page === pagination.totalPages - 1 ||
                    (page >= pagination.currentPage - 1 &&
                      page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === pagination.currentPage}
                          className={
                            page === pagination.currentPage
                              ? 'bg-slate-400/60 cursor-pointer hover:bg-slate-400/90'
                              : 'cursor-pointer'
                          }
                          onClick={() => handlePageChange(page)}
                        >
                          {page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (
                    page === pagination.currentPage - 2 ||
                    page === pagination.currentPage + 2
                  ) {
                    return <PaginationEllipsis key={page} />
                  }
                  return null
                },
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    pagination.currentPage < pagination.totalPages - 1 &&
                    handlePageChange(pagination.currentPage + 1)
                  }
                  className={
                    pagination.currentPage === pagination.totalPages - 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
