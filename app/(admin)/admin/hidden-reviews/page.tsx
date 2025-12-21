'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  EyeOff,
  Eye,
  Loader2,
  AlertCircle,
  RotateCcw,
  Calendar,
  User,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getHiddenReviews, unhideReview } from '@/services/sentimentService'
import { toast } from 'react-toastify'
import { formatDate } from '@/utils/dateUtils'

interface HiddenReview {
  id: number
  courseId: string
  courseName?: string
  userId: string
  userName?: string
  rating: number
  review: string
  createdDate: string
  hiddenAt: string
  hiddenReason: string
  hiddenBy: string
}

/**
 * Admin page for managing hidden reviews
 * Quản lý các review bị ẩn do vi phạm
 */
export default function HiddenReviewsPage() {
  const [reviews, setReviews] = useState<HiddenReview[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<HiddenReview | null>(
    null,
  )
  const [unhiding, setUnhiding] = useState(false)

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  })

  useEffect(() => {
    loadHiddenReviews(0)
  }, [])

  const loadHiddenReviews = async (page: number) => {
    try {
      setLoading(true)
      const response = await getHiddenReviews(page, 20)

      setReviews(response.content || [])
      setPagination({
        currentPage: response.number || 0,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
      })
    } catch (error) {
      console.error('Error loading hidden reviews:', error)
      toast.error('Không thể tải danh sách reviews bị ẩn')
    } finally {
      setLoading(false)
    }
  }

  const handleUnhide = async () => {
    if (!selectedReview) return

    try {
      setUnhiding(true)
      await unhideReview(selectedReview.id)
      toast.success('Đã khôi phục review thành công')
      setSelectedReview(null)
      loadHiddenReviews(pagination.currentPage)
    } catch (error) {
      console.error('Error unhiding review:', error)
      toast.error('Không thể khôi phục review')
    } finally {
      setUnhiding(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <EyeOff className="h-8 w-8 text-red-600" />
            Reviews bị ẩn
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý các đánh giá đã bị ẩn do vi phạm chính sách
          </p>
        </div>
      </div>

      {/* Statistics Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-2xl font-bold text-red-600">
                {pagination.totalElements}
              </div>
              <div className="text-sm text-gray-600">Reviews đang bị ẩn</div>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="hover:shadow-md transition-shadow border-red-200"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">Đã ẩn</Badge>
                        <Badge variant="outline">
                          Rating: {review.rating}/5 ⭐
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {review.courseName && (
                          <span className="font-medium">
                            {review.courseName}
                          </span>
                        )}
                        {review.courseName && ' • '}
                        <span>{formatDate(review.createdDate)}</span>
                      </div>
                    </div>
                    <EyeOff className="h-5 w-5 text-red-600 flex-shrink-0" />
                  </div>

                  {/* Review Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-900 line-clamp-3">
                      {review.review}
                    </div>
                  </div>

                  {/* Hidden Info */}
                  <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 text-red-800">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        Bị ẩn lúc: {formatDate(review.hiddenAt)}
                      </span>
                    </div>
                    {review.hiddenBy && (
                      <div className="flex items-center gap-2 text-red-800">
                        <User className="h-4 w-4" />
                        <span>Bởi: {review.hiddenBy}</span>
                      </div>
                    )}
                    {review.hiddenReason && (
                      <div className="text-red-700">
                        <strong>Lý do:</strong> {review.hiddenReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReview(review)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem chi tiết
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReview(review)
                        // Auto-show unhide confirmation
                      }}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Khôi phục
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <EyeOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Không có reviews bị ẩn</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 0 || loading}
            onClick={() => loadHiddenReviews(pagination.currentPage - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Trang {pagination.currentPage + 1} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={
              pagination.currentPage >= pagination.totalPages - 1 || loading
            }
            onClick={() => loadHiddenReviews(pagination.currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Unhide Confirmation Dialog */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết review bị ẩn</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Review Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-900">
                  {selectedReview.review}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Rating: {selectedReview.rating}/5 ⭐
                </div>
              </div>

              {/* Hidden Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <div className="text-sm">
                  <strong>Bị ẩn lúc:</strong>{' '}
                  {formatDate(selectedReview.hiddenAt)}
                </div>
                {selectedReview.hiddenBy && (
                  <div className="text-sm">
                    <strong>Bởi:</strong> {selectedReview.hiddenBy}
                  </div>
                )}
                {selectedReview.hiddenReason && (
                  <div className="text-sm">
                    <strong>Lý do:</strong> {selectedReview.hiddenReason}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Khôi phục review sẽ làm cho nó hiển
                  thị trở lại và được tính vào rating của khóa học.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedReview(null)}
              disabled={unhiding}
            >
              Đóng
            </Button>
            <Button onClick={handleUnhide} disabled={unhiding}>
              {unhiding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Khôi phục review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
