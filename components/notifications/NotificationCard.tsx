// components/notifications/NotificationCard.tsx
import { useState } from "react";
import { 
  Bell, CheckCircle, AlertCircle, FileText, 
  MessageSquare, Tag, DollarSign, Users, Trash2,
  BadgeInfo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { NotificationDTO, NotificationType } from "@/types/notification-type";
import { useRouter } from "next/navigation";

// Type icon mapper
export const getTypeIcon = (type: NotificationType) => {
  switch(type) {
    case NotificationType.SYSTEM: return <Bell className="h-5 w-5" />;
    case NotificationType.PAYMENT_SUCCESS: return <CheckCircle className="h-5 w-5" />;
    case NotificationType.COURSE_REVIEW: return <FileText className="h-5 w-5" />;
    case NotificationType.COURSE_APPROVAL: return <BadgeInfo className="h-5 w-5" />;
    case NotificationType.SUPPORT_REPLY: return <MessageSquare className="h-5 w-5" />;
    case NotificationType.PROMOTION: return <Tag className="h-5 w-5" />;
    case NotificationType.FINANCIAL_ALERT: return <DollarSign className="h-5 w-5" />;
    case NotificationType.STAFF_REQUEST: return <Users className="h-5 w-5" />;
    default: return <AlertCircle className="h-5 w-5" />;
  }
};

// Badge color mapper
export const getTypeBadgeColor = (type: NotificationType): string => {
  switch(type) {
    case NotificationType.SYSTEM: return "bg-gray-500";
    case NotificationType.PAYMENT_SUCCESS: return "bg-green-500";
    case NotificationType.COURSE_REVIEW: return "bg-blue-500";
    case NotificationType.COURSE_APPROVAL: return "bg-purple-500";
    case NotificationType.SUPPORT_REPLY: return "bg-yellow-500";
    case NotificationType.PROMOTION: return "bg-pink-500";
    case NotificationType.FINANCIAL_ALERT: return "bg-red-500";
    case NotificationType.STAFF_REQUEST: return "bg-orange-500";
    default: return "bg-gray-500";
  }
};

interface NotificationCardProps {
  notification: NotificationDTO;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete(notification.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className={`transition-all ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`mt-1 flex-shrink-0 rounded-full p-2 ${getTypeBadgeColor(notification.type)} text-white`}>
            {getTypeIcon(notification.type)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-medium text-lg">{notification.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto bg-gray-400/40">
                {notification.type.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-gray-700 mb-3">{notification.content}</p>
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex gap-2">
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => router.push(notification.targetUrl)}
                >
                    Xem chi tiết
                </Button>
              </div>
              <div className="flex gap-2">
                {!notification.isRead && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/70"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa thông báo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa thông báo này? Sau khi thực hiện không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;