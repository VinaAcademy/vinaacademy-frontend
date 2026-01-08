'use client'

import { FC, useState, useEffect, useCallback, useRef } from 'react'
import { MessageSquare, Loader, AlertTriangle } from 'lucide-react'
import {
  getRootCommentsPaginated,
  createDiscussion,
  toggleFavorite,
  deleteDiscussion,
} from '@/services/discussionService'
import { DiscussionDto, DiscussionRequest } from '@/types/discussion'
import CommentItem from './discussion/CommentItem'
import CommentInput from './CommentInput'
import { createSuccessToast } from '@/components/ui/toast-cus'
import { useAuth } from '@/providers'
import { isInstructorOfCourse } from '@/services/courseService'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Helpers to avoid duplicate keys when merging pages or switching sort
const uniqueById = (items: DiscussionDto[]): DiscussionDto[] => {
  const seen = new Set<string>()
  return items.filter((it) => {
    if (seen.has(it.id)) return false
    seen.add(it.id)
    return true
  })
}

const appendUnique = (
  prev: DiscussionDto[],
  next: DiscussionDto[],
): DiscussionDto[] => {
  const existing = new Set(prev.map((c) => c.id))
  const dedupedNext = next.filter((c) => !existing.has(c.id))
  return [...prev, ...dedupedNext]
}

interface DiscussionAreaProps {
  courseId: string
  lectureId: string
}

// Main Discussion Area Component
const DiscussionArea: FC<DiscussionAreaProps> = ({ courseId, lectureId }) => {
  const [comments, setComments] = useState<DiscussionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [newReply, setNewReply] = useState('')
  const [filter, setFilter] = useState<'newest' | 'popular'>('newest')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const instructorCacheRef = useRef<Record<string, boolean>>({})
  const [moderationDialog, setModerationDialog] = useState<{
    open: boolean
    flagType: string | null
    flagSeverity: number | null
  }>({ open: false, flagType: null, flagSeverity: null })

  const resolveInstructorStatus = useCallback(
    async (userId: string): Promise<boolean> => {
      const cached = instructorCacheRef.current[userId]
      if (cached !== undefined) return cached

      const result = await isInstructorOfCourse(courseId, userId)
      const isInstructor = !!result
      instructorCacheRef.current[userId] = isInstructor
      return isInstructor
    },
    [courseId],
  )

  const annotateWithInstructor = useCallback(
    async (items: DiscussionDto[]): Promise<DiscussionDto[]> => {
      const uniqueUserIds = Array.from(
        new Set(items.map((item) => item.userId)),
      )
      const statuses = await Promise.all(
        uniqueUserIds.map(
          async (uid) => [uid, await resolveInstructorStatus(uid)] as const,
        ),
      )
      const statusMap = Object.fromEntries(statuses)

      return items.map((item) => ({
        ...item,
        isInstructor: statusMap[item.userId] ?? false,
      }))
    },
    [resolveInstructorStatus],
  )

  // Load root comments
  const loadComments = useCallback(
    async (pageNum = 0) => {
      setLoading(true)
      try {
        const sortBy = filter === 'popular' ? 'favoriteCount' : 'createdDate'
        const result = await getRootCommentsPaginated(
          lectureId,
          pageNum,
          5,
          sortBy,
          'DESC',
        )

        if (result) {
          const annotated = await annotateWithInstructor(
            uniqueById(result.content),
          )
          if (pageNum === 0) {
            setComments(annotated)
          } else {
            setComments((prev) => appendUnique(prev, annotated))
          }
          setTotalPages(result.totalPages)
        }
      } catch (error) {
        console.error('Error loading comments:', error)
      } finally {
        setLoading(false)
      }
    },
    [lectureId, filter, annotateWithInstructor],
  )

  // Create new comment or reply
  const createNewComment = useCallback(
    async (content: string, parentId?: string) => {
      try {
        const request: DiscussionRequest = {
          lessonId: lectureId,
          comment: content,
          parentCommentId: parentId || undefined,
          courseId: courseId,
        }

        const result = await createDiscussion(request)

        if (result) {
          // Check for moderation flags
          if (result.flagType && result.moderationStatus === 'PENDING') {
            setModerationDialog({
              open: true,
              flagType: result.flagType,
              flagSeverity: result.flagSeverity || null,
            })
            // Don't add flagged comment to the list
            return true
          }
          console.log('Created comment:', result)

          const isInstructor = await resolveInstructorStatus(result.userId)
          const enrichedResult = { ...result, isInstructor }
          if (parentId) {
            // Update reply count in parent comment
            setComments((prev) =>
              prev.map((comment) =>
                comment.id === parentId
                  ? { ...comment, replyCount: comment.replyCount + 1 }
                  : comment,
              ),
            )
          } else {
            // it is a root comment - add to top
            setComments((prev) => [enrichedResult, ...prev])
          }
          return true
        }
      } catch (error) {
        console.error('Error creating comment:', error)
        return false
      }
      return false
    },
    [lectureId, courseId, resolveInstructorStatus],
  )

  // Toggle like/unlike
  const handleToggleLike = useCallback(
    async (commentId: string, isLiked: boolean) => {
      try {
        const result = await toggleFavorite(commentId, isLiked)
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
                : comment,
            ),
          )
          createSuccessToast(
            !result ? 'Đã bỏ thích bình luận' : 'Đã thích bình luận',
          )
        }
      } catch (error) {
        console.error('Error toggling like:', error)
        createSuccessToast('Đã có lỗi xảy ra, vui lòng thử lại')
      }
    },
    [],
  )

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      const success = await deleteDiscussion(commentId)
      console.log('delete', success)
      if (success) {
        // Remove from root comments
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        )
        createSuccessToast('Xóa bình luận thành công')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }, [])

  // Format relative time
  const formatRelativeTime = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    console.log('BEFORE ' + date, 'AFTER ' + now)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return date.toLocaleDateString('vi-VN')
  }, [])

  // Submit new comment
  const submitComment = useCallback(
    async (content: string) => {
      return await createNewComment(content)
    },
    [createNewComment],
  )

  // Load more comments
  const loadMore = useCallback(() => {
    if (page + 1 < totalPages) {
      setPage((prev) => prev + 1)
    }
  }, [page, totalPages])

  // Effects
  useEffect(() => {
    // Khi filter hoặc lectureId đổi, reset về 0 và load ngay trang 0
    setPage(0)
    // Clear current list to avoid key duplication when new sort arrives
    setComments([])
    loadComments(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId, filter])

  useEffect(() => {
    // Khi người dùng nhấn "load more" đổi page
    if (page > 0) {
      //thêm điều kiện page > 0 mới load tại vì khi filter đổi page sẽ về 0 đã có loadComments(0) ở trên
      //nếu ko có điều kiện này sẽ load 2 lần trang 0 bị duplicate
      loadComments(page)
      console.log(page + ' tren 2')
    }
  }, [page, loadComments])

  // Get moderation flag message
  const getModerationMessage = (
    flagType: string | null,
    severity: number | null,
  ) => {
    switch (flagType) {
      case 'TOXIC':
        return 'Bình luận của bạn có chứa ngôn từ độc hại hoặc xúc phạm. Nội dung này sẽ được kiểm duyệt trước khi hiển thị công khai.'
      case 'EXTREME_NEGATIVE':
        return 'Bình luận của bạn có nội dung tiêu cực. Nội dung này sẽ được kiểm duyệt trước khi hiển thị công khai.'
      case 'SPAM':
        return 'Bình luận của bạn có dấu hiệu spam. Nội dung này sẽ được kiểm duyệt trước khi hiển thị công khai.'
      default:
        return 'Bình luận của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.'
    }
  }

  const getModerationColor = (flagType: string | null) => {
    switch (flagType) {
      case 'TOXIC':
        return 'text-red-600'
      case 'EXTREME_NEGATIVE':
        return 'text-orange-600'
      case 'SPAM':
        return 'text-gray-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <>
      <div className="flex flex-col h-full px-2 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Thảo luận
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('newest')}
              className={`px-2 sm:px-3 py-1 rounded text-sm ${
                filter === 'newest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-2 sm:px-3 py-1 rounded text-sm ${
                filter === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              Phổ biến nhất
            </button>
          </div>
        </div>

        {/* Comment input */}
        <CommentInput onSubmit={submitComment} />

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
                  userId={user?.id || ''}
                  resolveInstructorStatus={resolveInstructorStatus}
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
                      'Tải thêm bình luận'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Moderation Dialog */}
      <AlertDialog
        open={moderationDialog.open}
        onOpenChange={(open) =>
          setModerationDialog({ open, flagType: null, flagSeverity: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle
                className={`h-6 w-6 ${getModerationColor(moderationDialog.flagType)}`}
              />
              <AlertDialogTitle>Bình luận cần kiểm duyệt</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              {getModerationMessage(
                moderationDialog.flagType,
                moderationDialog.flagSeverity,
              )}
            </AlertDialogDescription>
            {moderationDialog.flagType && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Loại vi phạm:</strong>{' '}
                  <span
                    className={`font-medium ${getModerationColor(moderationDialog.flagType)}`}
                  >
                    {moderationDialog.flagType === 'TOXIC'
                      ? 'Nội dung độc hại'
                      : moderationDialog.flagType === 'EXTREME_NEGATIVE'
                        ? 'Nội dung tiêu cực'
                        : 'Spam'}
                  </span>
                </p>
                {moderationDialog.flagSeverity && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Mức độ:</strong> {moderationDialog.flagSeverity}/10
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-3">
              Bình luận của bạn sẽ được xem xét bởi đội ngũ quản trị. Nếu được
              phê duyệt, nó sẽ hiển thị công khai.
            </p>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <AlertDialogAction
              onClick={() =>
                setModerationDialog({
                  open: false,
                  flagType: null,
                  flagSeverity: null,
                })
              }
            >
              Đã hiểu
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DiscussionArea
