import { DiscussionDto } from "@/types/discussion";
import { getImageUrl } from "@/utils/imageUtils";
import { Reply, ThumbsUp, Trash2 } from "lucide-react";
import { FC, memo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReplyItemProps {
  reply: DiscussionDto;
  onToggleLike: (commentId: string, isLiked: boolean) => void;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
  formatRelativeTime: (dateString: string) => string;
}

// Memoized Reply Item Component
const ReplyItem: FC<ReplyItemProps> = memo(({ 
  reply, 
  onToggleLike, 
  onDelete, 
  onReply, 
  formatRelativeTime 
}) => {
  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="bg-gray-50 rounded-md p-2 sm:p-3">
      {/* Reply header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
            {reply.avatarUrl ? (
              <img
                src={getImageUrl(reply.avatarUrl)}
                alt={reply.userFullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {reply.userFullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-xs sm:text-sm text-gray-800">
              {reply.userFullName}
            </p>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(reply.createdDate)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpenDelete(true)}
          className="text-gray-400 hover:text-red-600"
          aria-label="Xóa phản hồi"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Reply content */}
      <div className="mb-2">
        <p className="text-gray-800 text-xs sm:text-sm whitespace-pre-wrap">
          {reply.comment}
        </p>
      </div>

      {/* Reply actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onToggleLike(reply.id, reply.likedByCurrentUser)}
          className={`flex items-center space-x-1 text-xs sm:text-sm ${
            reply.likedByCurrentUser
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <ThumbsUp
            size={12}
            className={reply.likedByCurrentUser ? "fill-current" : ""}
          />
          <span>{reply.favoriteCount}</span>
        </button>

        <button
          onClick={() => onReply(reply.id)}
          className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700"
        >
          <Reply size={12} />
          <span>Trả lời</span>
        </button>
      </div>
      {/* Confirm delete reply dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phản hồi?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không thể hoàn tác. Phản hồi sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDelete(reply.id);
                setOpenDelete(false);
              }}
            >
              Xóa
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

ReplyItem.displayName = "ReplyItem";

export default ReplyItem;