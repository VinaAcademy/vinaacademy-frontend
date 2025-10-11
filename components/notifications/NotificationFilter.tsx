// components/notifications/NotificationFilters.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter, SortDesc, SortAsc } from "lucide-react";
import { NotificationType, NotificationFilters } from "@/types/notification-type";

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFilterChange: (newFilters: Partial<NotificationFilters>) => void;
}

const NotificationFilterFunction = ({ filters, onFilterChange }: NotificationFiltersProps) => {
  const { type, isRead, sortBy, direction } = filters;

  const handleTypeChange = (value: string) => {
    onFilterChange({ 
      type: value === "ALL" ? null : value as NotificationType 
    });
  };

  const handleReadStatusChange = (value: string) => {
    onFilterChange({
      isRead: value === "ALL" ? null : value === "READ",
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ sortBy: value });
  };

  const handleDirectionChange = (value: string) => {
    onFilterChange({ direction: value as 'asc' | 'desc' });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 bg-white/50">
            <Filter className="h-4 w-4 mr-1" />
            Loại thông báo
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Loại thông báo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={type || "ALL"} onValueChange={handleTypeChange}>
            <DropdownMenuRadioItem value="ALL">Tất cả</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={NotificationType.SYSTEM}>Hệ thống</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={NotificationType.PAYMENT_SUCCESS}>Thanh toán thành công</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={NotificationType.COURSE_REVIEW}>Đánh giá khóa học</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={NotificationType.COURSE_APPROVAL}>Phản hồi phê duyệt khóa học</DropdownMenuRadioItem>
            {/* Nhớ thêm type INSTRUCTOR_REQUEST vào đây để filter*/ }
            {/*<DropdownMenuRadioItem value={NotificationType.SUPPORT_REPLY}>Phản hồi hỗ trợ</DropdownMenuRadioItem>
             <DropdownMenuRadioItem value={NotificationType.PROMOTION}>Promotion</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={NotificationType.FINANCIAL_ALERT}>Cảnh báo thanh toán</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={NotificationType.STAFF_REQUEST}>Staff Request</DropdownMenuRadioItem> */}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Read Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 bg-white/50">
            <Filter className="h-4 w-4 mr-1" />
            Trạng thái
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Trạng thái thông báo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup 
            value={isRead === null ? "ALL" : isRead ? "READ" : "UNREAD"} 
            onValueChange={handleReadStatusChange}
          >
            <DropdownMenuRadioItem value="ALL">Tất cả</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="READ">Đã đọc</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="UNREAD">Chưa đọc</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 bg-white/50">
            {direction === "desc" ? (
              <SortDesc className="h-4 w-4 mr-1" />
            ) : (
              <SortAsc className="h-4 w-4 mr-1" />
            )}
            Sắp xếp
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Cài đặt sắp xếp</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Xếp theo</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={handleSortChange}>
                    <DropdownMenuRadioItem value="createdAt">Ngày nhận</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="readAt">Ngày đọc</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Chiều</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={direction} onValueChange={handleDirectionChange}>
                    <DropdownMenuRadioItem value="desc">Mới nhất</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="asc">Cũ nhất</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationFilterFunction;