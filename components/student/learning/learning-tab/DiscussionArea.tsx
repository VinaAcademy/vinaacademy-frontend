"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { MessageSquare, Loader } from "lucide-react";
import {
  getRootCommentsPaginated,
  createDiscussion,
  toggleFavorite,
  deleteDiscussion,
} from "@/services/discussionService";
import { DiscussionDto, DiscussionRequest } from "@/types/discussion";
import CommentItem from "./discussion/CommentItem";
import { createSuccessToast } from "@/components/ui/toast-cus";

interface DiscussionAreaProps {
  courseId: string;
  lectureId: string;
}

// Main Discussion Area Component
const DiscussionArea: FC<DiscussionAreaProps> = ({ courseId, lectureId }) => {
  const [comments, setComments] = useState<DiscussionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState("");
  const [filter, setFilter] = useState<"newest" | "popular">("newest");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Load root comments
  const loadComments = useCallback(
    async (pageNum = 0) => {
      setLoading(true);
      try {
        const sortBy = filter === "popular" ? "favoriteCount" : "createdDate";
        const result = await getRootCommentsPaginated(
          lectureId,
          pageNum,
          10,
          sortBy,
          "DESC"
        );

        if (result) {
          if (pageNum === 0) {
            setComments(result.content);
          } else {
            setComments((prev) => [...prev, ...result.content]);
          }
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [lectureId, filter]
  );

  // Create new comment or reply
  const createNewComment = useCallback(
    async (content: string, parentId?: string) => {
      setSubmitting(true);
      try {
        const request: DiscussionRequest = {
          lessonId: lectureId,
          comment: content,
          parentCommentId: parentId || undefined,
        };

        const result = await createDiscussion(request);

        if (result) {
          if (parentId) {
            // Update reply count in parent comment
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === parentId
                  ? { ...comment, replyCount: comment.replyCount + 1 }
                  : comment
              )
            );
          } else {
            // It's a root comment - add to top
            setComments((prev) => [result, ...prev]);
          }
          return true;
        }
      } catch (error) {
        console.error("Error creating comment:", error);
        return false;
      } finally {
        setSubmitting(false);
      }
      return false;
    },
    [lectureId]
  );

  // Toggle like/unlike
  const handleToggleLike = useCallback(
    async (commentId: string, isLiked: boolean) => {
      try {
        const result = await toggleFavorite(commentId, isLiked);
        console.log(result)
        if (result !== null) {
          // Update in root comments
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    favoriteCount: result
                      ? comment.favoriteCount + 1
                      : comment.favoriteCount - 1,
                    likedByCurrentUser: result ? true : false,
                  }
                : comment
            )
          );
          createSuccessToast(
            !result? "Đã bỏ thích bình luận" : "Đã thích bình luận"
          );
          
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        createSuccessToast("Đã có lỗi xảy ra, vui lòng thử lại");
      }
    },
    []
  );

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        const success = await deleteDiscussion(commentId);
        console.log("delete", success);
        if (success) {
          // Remove from root comments
          setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
          );
          createSuccessToast("Xóa bình luận thành công");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  }, []);

  // Format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  }, []);

  // Submit new comment
  const submitComment = useCallback(async () => {
    if (!newComment.trim()) return;

    const success = await createNewComment(newComment);
    if (success) {
      setNewComment("");
    }
  }, [newComment, createNewComment]);

  // Load more comments
  const loadMore = useCallback(() => {
    if (page + 1 < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages]);

  // Effects
  useEffect(() => {
    // Khi filter hoặc lectureId đổi, reset về 0 và load ngay trang 0
    setPage(0);
    loadComments(0);
    console.log(page+" tren 1")
  }, [lectureId, filter]);

  useEffect(() => {
    // Khi người dùng nhấn "load more" đổi page
    if (page > 0) { //thêm điều kiện page > 0 mới load tại vì khi filter đổi page sẽ về 0 đã có loadComments(0) ở trên
                    //nếu ko có điều kiện này sẽ load 2 lần trang 0 bị duplicate
      loadComments(page);
      console.log(page+" tren 2")
    }
  }, [page]);

  return (
    <div className="flex flex-col h-full px-2 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Thảo luận
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("newest")}
            className={`px-2 sm:px-3 py-1 rounded text-sm ${
              filter === "newest"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mới nhất
          </button>
          <button
            onClick={() => setFilter("popular")}
            className={`px-2 sm:px-3 py-1 rounded text-sm ${
              filter === "popular"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            Phổ biến nhất
          </button>
        </div>
      </div>

      {/* Comment input */}
      <div className="mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
        <h3 className="text-base md:text-lg font-medium mb-2 sm:mb-3 text-gray-800">
          Thêm bình luận vào thảo luận
        </h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-300"
          placeholder="Chia sẻ suy nghĩ của bạn với các học viên khác..."
          rows={4}
          maxLength={2000}
        ></textarea>
        <div className="flex justify-between items-center mt-2 sm:mt-3">
          <span className="text-xs text-gray-500">
            {newComment.length}/2000
          </span>
          <button
            onClick={submitComment}
            disabled={!newComment.trim() || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {submitting ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              "Đăng bình luận"
            )}
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">
              Chưa có thảo luận nào
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hãy là người đầu tiên bắt đầu cuộc thảo luận về bài học này!
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onToggleLike={handleToggleLike}
                onDelete={handleDeleteComment}
                onReply={setReplyingTo}
                onCreateReply={createNewComment}
                formatRelativeTime={formatRelativeTime}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                newReply={newReply}
                setNewReply={setNewReply}
                submitting={submitting}
              />
            ))}

            {/* Load more comments button */}
            {page + 1 < totalPages && (
              <div className="flex justify-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader className="animate-spin w-4 h-4" />
                  ) : (
                    "Tải thêm bình luận"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionArea;
