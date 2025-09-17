import { getRepliesPaginated } from "@/services/discussionService";
import { DiscussionDto } from "@/types/discussion";
import { ChevronDown, ChevronUp, Loader, MoreHorizontal, Reply, ThumbsUp, Trash2 } from "lucide-react";
import { FC, memo, useCallback, useState } from "react";
import ReplyItem from "./ReplyItem";
import { getImageUrl } from "@/utils/imageUtils";

interface CommentItemProps {
  comment: DiscussionDto;
  onToggleLike: (commentId: string, isLiked: boolean) => void;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
  onCreateReply: (content: string, parentId: string) => Promise<boolean>;
  formatRelativeTime: (dateString: string) => string;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  newReply: string;
  setNewReply: (content: string) => void;
  submitting: boolean;
}



// Memoized Comment Item Component
const CommentItem: FC<CommentItemProps> = memo(({ 
  comment,
  onToggleLike,
  onDelete,
  onReply,
  onCreateReply,
  formatRelativeTime,
  replyingTo,
  setReplyingTo,
  newReply,
  setNewReply,
  submitting
}) => {
  const [expandedReplies, setExpandedReplies] = useState(false);
  const [replies, setReplies] = useState<DiscussionDto[]>([]);
  const [repliesPage, setRepliesPage] = useState(0);
  const [repliesTotalPages, setRepliesTotalPages] = useState(0);
  const [loadedRepliesCount, setLoadedRepliesCount] = useState(0);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);

  // Load initial replies
  const loadReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const result = await getRepliesPaginated(comment.id, 0, 10);
      if (result) {
        setReplies(result.content);
        setRepliesPage(0);
        setRepliesTotalPages(result.totalPages);
        setLoadedRepliesCount(result.content.length);
        setExpandedReplies(true);
      }
    } catch (error) {
      console.error("Error loading replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id]);

  // Load more replies
  const loadMoreReplies = useCallback(async () => {
    const nextPage = repliesPage + 1;
    setLoadingMoreReplies(true);
    try {
      const result = await getRepliesPaginated(comment.id, nextPage, 10);
      if (result) {
        setReplies(prev => [...prev, ...result.content]);
        setRepliesPage(nextPage);
        setLoadedRepliesCount(prev => prev + result.content.length);
      }
    } catch (error) {
      console.error("Error loading more replies:", error);
    } finally {
      setLoadingMoreReplies(false);
    }
  }, [comment.id, repliesPage]);

  // Toggle replies visibility
  const toggleReplies = useCallback(async () => {
    if (expandedReplies) {
      setExpandedReplies(false);
    } else {
      await loadReplies();
    }
  }, [expandedReplies, loadReplies]);

  // Handle reply submission
  const handleSubmitReply = useCallback(async () => {
    if (!newReply.trim()) return;
    
    const success = await onCreateReply(newReply, comment.id);
    if (success) {
      setNewReply("");
      setReplyingTo(null);
      // Reload replies to show the new one
      if (expandedReplies) {
        await loadReplies();
      }
    }
  }, [newReply, comment.id, onCreateReply, setNewReply, setReplyingTo, expandedReplies, loadReplies]);

  // Handle reply to reply submission  
  const handleSubmitReplyToReply = useCallback(async () => {
    if (!newReply.trim()) return;
    
    const success = await onCreateReply(newReply, comment.id);
    if (success) {
      setNewReply("");
      setReplyingTo(null);
      // Reload replies to show the new one
      await loadReplies();
    }
  }, [newReply, comment.id, onCreateReply, setNewReply, setReplyingTo, loadReplies]);

  // Handle like toggle for replies
  const handleReplyLikeToggle = useCallback(async (replyId: string, isLiked: boolean) => {
    await onToggleLike(replyId, isLiked);
    // Update local reply state
    setReplies(prev => prev.map(reply => 
      reply.id === replyId 
        ? { ...reply, likedByCurrentUser: !isLiked, favoriteCount: reply.favoriteCount + (isLiked ? -1 : 1) }
        : reply
    ));
  }, [onToggleLike]);

  // Handle reply deletion
  const handleReplyDelete = useCallback((replyId: string) => {
    onDelete(replyId);
    // Update local state
    setReplies(prev => prev.filter(reply => reply.id !== replyId));
    setLoadedRepliesCount(prev => Math.max(0, prev - 1));
  }, [onDelete]);

  // Calculate remaining replies
  const getRemainingRepliesCount = useCallback((): number => {
    return Math.max(0, comment.replyCount - loadedRepliesCount);
  }, [comment.replyCount, loadedRepliesCount]);

  // Check if can load more replies
  const canLoadMoreReplies = useCallback((): boolean => {
    return repliesPage + 1 < repliesTotalPages;
  }, [repliesPage, repliesTotalPages]);

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 sm:p-4">
        {/* Comment header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 mr-2 sm:mr-3 flex items-center justify-center">
              {comment.avatarUrl ? (
                <img
                  src={getImageUrl(comment.avatarUrl)}
                  alt={comment.userFullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  {comment.userFullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm sm:text-base text-gray-800">
                {comment.userFullName}
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(comment.createdDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-400 hover:text-red-600"
              aria-label="Xóa bình luận"
            >
              <Trash2 size={16} />
            </button>
            <button
              aria-label="more"
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Comment content */}
        <div className="mb-3">
          <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap">
            {comment.comment}
          </p>
        </div>

        {/* Comment actions */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 space-x-3 sm:space-x-4">
          <button
            onClick={() => onToggleLike(comment.id, comment.likedByCurrentUser)}
            className={`flex items-center space-x-1 ${
              comment.likedByCurrentUser
                ? "text-blue-600"
                : "hover:text-gray-700"
            }`}
          >
            <ThumbsUp
              size={14}
              className={comment.likedByCurrentUser ? "fill-current" : ""}
            />
            <span>{comment.favoriteCount}</span>
          </button>

          <button
            onClick={() => setReplyingTo(comment.id)}
            className="flex items-center space-x-1 hover:text-gray-700"
          >
            <Reply size={14} />
            <span>Trả lời</span>
          </button>

          {comment.replyCount > 0 && (
            <button
              onClick={toggleReplies}
              className="flex items-center space-x-1 hover:text-gray-700"
              disabled={loadingReplies}
            >
              {loadingReplies ? (
                <Loader className="animate-spin w-3 h-3" />
              ) : expandedReplies ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              <span>
                {expandedReplies ? "Ẩn" : "Xem"} {comment.replyCount} phản hồi
              </span>
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 border-l-2 border-blue-200">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-300"
              placeholder="Trả lời bình luận này..."
              rows={3}
              maxLength={2000}
            ></textarea>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {newReply.length}/2000
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setNewReply("");
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!newReply.trim() || submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {submitting ? (
                    <Loader className="animate-spin w-3 h-3" />
                  ) : (
                    "Trả lời"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {expandedReplies && replies.length > 0 && (
          <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 border-l-2 border-gray-200 space-y-3 sm:space-y-4">
            {replies.map((reply) => (
              <div key={reply.id}>
                <ReplyItem
                  reply={reply}
                  onToggleLike={handleReplyLikeToggle}
                  onDelete={handleReplyDelete}
                  onReply={onReply}
                  formatRelativeTime={formatRelativeTime}
                />
                
                {/* Reply to reply input */}
                {replyingTo === reply.id && (
                  <div className="mt-3 pl-2 border-l-2 border-blue-200">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-300"
                      placeholder="Trả lời..."
                      rows={2}
                      maxLength={2000}
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {newReply.length}/2000
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setNewReply("");
                          }}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSubmitReplyToReply}
                          disabled={!newReply.trim() || submitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          {submitting ? (
                            <Loader className="animate-spin w-3 h-3" />
                          ) : (
                            "Trả lời"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Load more replies button */}
            {canLoadMoreReplies() && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={loadMoreReplies}
                  disabled={loadingMoreReplies}
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {loadingMoreReplies ? (
                    <Loader className="animate-spin w-3 h-3" />
                  ) : (
                    <span>
                      Tải thêm {Math.min(10, getRemainingRepliesCount())} phản hồi
                      {getRemainingRepliesCount() > 10 && 
                        ` (còn ${getRemainingRepliesCount() - 10})`
                      }
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

CommentItem.displayName = "CommentItem";

export default CommentItem;