"use client";
import { NotificationDTO } from "@/types/notification";
import NotificationBadge from "./NotificationBadge";
import NotificationList from "./NotificationList";
import { useNotificationDropdown } from "./useNotificationDropdown";

interface NotificationDropdownProps {
  notifications: NotificationDTO[];
  totalUnread?: number;
}

const NotificationDropdown = ({
  notifications = [],
  totalUnread = 0,
}: NotificationDropdownProps) => {
  const {
    isOpen,
    dropdownRef,
    handleMouseEnter,
    handleMouseLeave,
    toggleDropdown,
  } = useNotificationDropdown();

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge thông báo */}
      <NotificationBadge
        count={totalUnread}
        onClick={toggleDropdown}
        isActive={isOpen}
      />

      {/* Dropdown thông báo */}
      <div
        className={`absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-200 ${
          isOpen
            ? "transform-none opacity-100 visible"
            : "transform translate-y-2 opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Mũi tên chỉ hướng */}
        <div className="absolute -top-2 right-3 h-4 w-4 rotate-45 bg-white border-t border-l border-gray-200"></div>

        <NotificationList
          notifications={notifications}
          totalUnread={totalUnread}
        />
      </div>
    </div>
  );
};

export default NotificationDropdown;
