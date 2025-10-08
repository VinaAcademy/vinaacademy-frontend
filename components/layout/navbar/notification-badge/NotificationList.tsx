import { NotificationDTO } from "@/types/notification";
import { useNotification } from "@/hooks/useNotification";
import { useRouter } from "next/navigation";
import { on } from "events";

interface NotificationListProps {
  notifications: NotificationDTO[];
  totalUnread?: number;
}

const NotificationList = ({
  notifications,
  totalUnread = 0,
}: NotificationListProps) => {
  const router = useRouter();
  const { markAsRead, markAllAsRead } = useNotification();

  const viewAllNotifications = () => {
    router.push("/profile/notification");
  };

  const handleNotificationClick = async (notification: NotificationDTO) => {
    // Mark as read
    const success = await markAsRead(notification.id);

    // Navigate to target URL if exists and mark was successful
    if (success && notification.targetUrl) {
      router.push(notification.targetUrl);
    }
  };

  // Get only the first 2 unread notifications for display
  const displayNotifications = notifications.filter(n => !n.isRead).slice(0, 2);

  return (
    <div className="p-4">
      {displayNotifications.length > 0 ? (
        <ul className="max-h-60 overflow-y-auto">
          {displayNotifications.map((notif) => (
            <li
              key={notif.id}
              className="py-3 text-sm hover:bg-blue-100 px-2 rounded cursor-pointer transition-colors bg-blue-50 mt-2"
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="font-medium text-sm truncate">{notif.title}</div>
              <div className="text-xs text-gray-500 truncate">
                {notif.content}
              </div>
            </li>
          ))}
          {totalUnread > 2 && (
            <li className="py-3 text-sm text-blue-400 font-medium">
              ... còn {totalUnread - 2} thông báo nữa chưa đọc
            </li>
          )}
        </ul>
      ) : (
        <div className="py-6 text-center text-gray-500">
          Bạn không có thông báo nào chưa đọc
        </div>
      )}
      <div className="border-t border-gray-100">
        <button
          className="w-full text-center py-2 text-sm text-blue-600 hover:bg-gray-50 font-medium"
          onClick={viewAllNotifications}
        >
          Xem tất cả
        </button>
      </div>
    </div>
  );
};

export default NotificationList;
