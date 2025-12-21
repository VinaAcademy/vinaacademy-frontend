'use client'

import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Eye, Loader2, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FlaggedReviewDto,
  ModerationStatus,
  getFlagTypeLabel,
  getModerationStatusLabel,
  getSeverityColor,
} from '@/types/sentiment'
import { formatDate } from '@/utils/dateUtils'
import {
  getFlaggedReviews,
  getModerationHistory,
} from '@/services/sentimentService'
import { toast } from 'react-toastify'

/**
 * Moderation History Component
 * Hiển thị lịch sử các quyết định kiểm duyệt (APPROVED, REJECTED, AUTO_APPROVED)
 */
export default function ModerationHistory() {
  const [flags, setFlags] = useState<FlaggedReviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<ModerationStatus | 'ALL'>(
    'ALL',
  )
  const [selectedFlag, setSelectedFlag] = useState<FlaggedReviewDto | null>(
    null,
  )
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  })

  useEffect(() => {
    loadHistory(0)
  }, [filterStatus])

  const loadHistory = async (page: number) => {
    try {
      setLoading(true)

      let response

      if (filterStatus === 'ALL') {
        // Sử dụng API mới để lấy TẤT CẢ flags đã xử lý
        // (APPROVED + REJECTED + AUTO_APPROVED)
        response = await getModerationHistory(page, 20)
      } else {
        // Lọc theo status cụ thể
        response = await getFlaggedReviews({
          status: filterStatus,
          page,
          size: 20,
        })
      }

      if (response) {
        setFlags(response.content)
        setPagination({
          currentPage: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
        })
      }
    } catch (error) {
      console.error('Error loading moderation history:', error)
      toast.error('Không thể tải lịch sử kiểm duyệt')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      loadHistory(newPage)
    }
  }

  const handleViewDetail = (flag: FlaggedReviewDto) => {
    setSelectedFlag(flag)
    setShowDetailDialog(true)
  }

  const getStatusIcon = (status: ModerationStatus) => {
    switch (status) {
      case ModerationStatus.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case ModerationStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />
      case ModerationStatus.AUTO_APPROVED:
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadgeVariant = (status: ModerationStatus) => {
    switch (status) {
      case ModerationStatus.APPROVED:
        return 'default' // green
      case ModerationStatus.REJECTED:
        return 'destructive' // red
      case ModerationStatus.AUTO_APPROVED:
        return 'secondary' // blue
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as ModerationStatus | 'ALL')
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value={ModerationStatus.APPROVED}>
                  Đã duyệt (Ẩn review)
                </SelectItem>
                <SelectItem value={ModerationStatus.REJECTED}>
                  Đã từ chối (Giữ review)
                </SelectItem>
                <SelectItem value={ModerationStatus.AUTO_APPROVED}>
                  Tự động duyệt
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600">
              Tổng:{' '}
              <span className="font-semibold">{pagination.totalElements}</span>{' '}
              bản ghi
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {flags.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Chưa có lịch sử kiểm duyệt</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card
              key={flag.flagId}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="mt-1">{getStatusIcon(flag.status)}</div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(flag.status)}>
                            {getModerationStatusLabel(flag.status)}
                          </Badge>
                          <Badge variant="outline">
                            {getFlagTypeLabel(flag.flagType)}
                          </Badge>
                          <Badge
                            className={`${getSeverityColor(flag.severity)}`}
                          >
                            Mức {flag.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Đánh giá #{flag.review.id} -{' '}
                          {flag.review.userFullName}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(flag)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Chi tiết
                      </Button>
                    </div>

                    {/* Review Content */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {flag.review.review}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>⭐ {flag.review.rating}/5</span>
                        <span>Khóa học: {flag.review.courseName}</span>
                      </div>
                    </div>

                    {/* Moderation Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <div className="text-gray-600">
                          <span className="font-medium">Xử lý bởi:</span>{' '}
                          {flag.reviewedByName || 'Hệ thống'}
                        </div>
                        {flag.moderatorNotes && (
                          <div className="text-gray-600">
                            <span className="font-medium">Ghi chú:</span>{' '}
                            {flag.moderatorNotes}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {flag.reviewedAt
                          ? formatDate(flag.reviewedAt)
                          : formatDate(flag.flaggedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang {pagination.currentPage + 1} / {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 0}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết quyết định kiểm duyệt</DialogTitle>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedFlag.status)}
                  <Badge variant={getStatusBadgeVariant(selectedFlag.status)}>
                    {getModerationStatusLabel(selectedFlag.status)}
                  </Badge>
                </div>
              </div>

              {/* Flag Info */}
              <div>
                <h3 className="font-semibold mb-2">Thông tin cờ</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Loại:</span>{' '}
                    <span className="font-medium">
                      {getFlagTypeLabel(selectedFlag.flagType)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mức độ:</span>{' '}
                    <Badge className={getSeverityColor(selectedFlag.severity)}>
                      {selectedFlag.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Độ tin cậy:</span>{' '}
                    <span className="font-medium">
                      {(selectedFlag.confidence * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian flag:</span>{' '}
                    <span className="font-medium">
                      {formatDate(selectedFlag.flaggedAt)}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">Lý do:</span>
                  <p className="mt-1 text-sm">{selectedFlag.reason}</p>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h3 className="font-semibold mb-2">Nội dung đánh giá</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedFlag.review.userFullName}
                    </span>
                    <span className="text-yellow-500">
                      {'⭐'.repeat(selectedFlag.review.rating)}
                    </span>
                  </div>
                  <p className="text-sm">{selectedFlag.review.review}</p>
                  <div className="text-xs text-gray-500">
                    Khóa học: {selectedFlag.review.courseName}
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              {selectedFlag.sentiment &&
                selectedFlag.sentiment.confidenceScores && (
                  <div>
                    <h3 className="font-semibold mb-2">Phân tích cảm xúc</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tích cực:</span>{' '}
                        <span className="font-medium text-green-600">
                          {(
                            selectedFlag.sentiment.confidenceScores.positive *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Trung lập:</span>{' '}
                        <span className="font-medium text-blue-600">
                          {(
                            selectedFlag.sentiment.confidenceScores.neutral *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tiêu cực:</span>{' '}
                        <span className="font-medium text-red-600">
                          {(
                            selectedFlag.sentiment.confidenceScores.negative *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Moderation Decision */}
              <div>
                <h3 className="font-semibold mb-2">Quyết định kiểm duyệt</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Xử lý bởi:</span>{' '}
                    <span className="font-medium">
                      {selectedFlag.reviewedByName || 'Hệ thống'}
                    </span>
                  </div>
                  {selectedFlag.reviewedAt && (
                    <div>
                      <span className="text-gray-600">Thời gian xử lý:</span>{' '}
                      <span className="font-medium">
                        {formatDate(selectedFlag.reviewedAt)}
                      </span>
                    </div>
                  )}
                  {selectedFlag.moderatorNotes && (
                    <div>
                      <span className="text-gray-600">Ghi chú:</span>
                      <p className="mt-1 bg-gray-50 p-2 rounded">
                        {selectedFlag.moderatorNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
