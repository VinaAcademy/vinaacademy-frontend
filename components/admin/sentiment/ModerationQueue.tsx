'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Check, X, Eye, Loader2, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  ModerationStatistics,
  getFlagTypeLabel,
  getModerationStatusLabel,
  getSeverityColor,
} from '@/types/sentiment'
import { formatDate } from '@/utils/dateUtils'
import {
  getFlaggedReviews,
  getCriticalFlags,
  moderateFlag,
  getModerationStatistics,
} from '@/services/sentimentService'
import { toast } from 'react-toastify'

// Grouped flags by review
interface GroupedFlag {
  reviewId: number
  review: FlaggedReviewDto['review']
  sentiment: FlaggedReviewDto['sentiment']
  flags: Array<{
    flagId: number
    flagType: FlaggedReviewDto['flagType']
    severity: number
    confidence: number // Sửa từ string thành number để khớp với FlaggedReviewDto
    reason: string
    status: ModerationStatus
    flaggedAt: string
    reviewedBy?: string
    reviewedByName?: string
    reviewedAt?: string
    moderatorNotes?: string
  }>
  maxSeverity: number
  status: ModerationStatus
}

/**
 * Admin moderation queue component
 * Quản lý đánh giá bị flag, approve/reject reviews
 */
export default function ModerationQueue() {
  const [flags, setFlags] = useState<FlaggedReviewDto[]>([])
  const [groupedFlags, setGroupedFlags] = useState<GroupedFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<ModerationStatus | 'ALL'>(
    ModerationStatus.PENDING,
  )
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [statistics, setStatistics] = useState<ModerationStatistics | null>(
    null,
  )

  // Moderation Dialog
  const [moderatingFlag, setModeratingFlag] = useState<GroupedFlag | null>(null)
  const [moderatingFlagIds, setModeratingFlagIds] = useState<number[]>([])
  const [moderationNotes, setModerationNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  })

  useEffect(() => {
    loadFlags(0)
    loadStatistics()
  }, [filterStatus, showCriticalOnly])

  const loadStatistics = async () => {
    try {
      const stats = await getModerationStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading statistics:', error)
    }
  }

  const groupFlagsByReview = (flagList: FlaggedReviewDto[]): GroupedFlag[] => {
    const grouped = new Map<number, GroupedFlag>()

    flagList.forEach((flag) => {
      const reviewId = flag.review.id

      if (grouped.has(reviewId)) {
        const existing = grouped.get(reviewId)!
        existing.flags.push({
          flagId: flag.flagId,
          flagType: flag.flagType,
          severity: flag.severity,
          confidence: flag.confidence,
          reason: flag.reason,
          status: flag.status,
          flaggedAt: flag.flaggedAt,
          reviewedBy: flag.reviewedBy,
          reviewedByName: flag.reviewedByName,
          reviewedAt: flag.reviewedAt,
          moderatorNotes: flag.moderatorNotes,
        })
        // Update max severity
        if (flag.severity > existing.maxSeverity) {
          existing.maxSeverity = flag.severity
        }
      } else {
        grouped.set(reviewId, {
          reviewId,
          review: flag.review,
          sentiment: flag.sentiment,
          flags: [
            {
              flagId: flag.flagId,
              flagType: flag.flagType,
              severity: flag.severity,
              confidence: flag.confidence,
              reason: flag.reason,
              status: flag.status,
              flaggedAt: flag.flaggedAt,
              reviewedBy: flag.reviewedBy,
              reviewedByName: flag.reviewedByName,
              reviewedAt: flag.reviewedAt,
              moderatorNotes: flag.moderatorNotes,
            },
          ],
          maxSeverity: flag.severity,
          status: flag.status,
        })
      }
    })

    return Array.from(grouped.values())
  }

  const loadFlags = async (page: number) => {
    try {
      setLoading(true)

      // ModerationQueue: "ALL" nghĩa là tất cả các trạng thái
      // Mặc định là PENDING (chờ xử lý)
      const status =
        filterStatus === 'ALL'
          ? undefined // Không filter, lấy tất cả
          : filterStatus

      const response = showCriticalOnly
        ? await getCriticalFlags(page, 20)
        : await getFlaggedReviews({ status, page, size: 20 })

      setFlags(response.content)
      setGroupedFlags(groupFlagsByReview(response.content))
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      })
    } catch (error) {
      console.error('Error loading flags:', error)
      toast.error('Không thể tải danh sách flags')
    } finally {
      setLoading(false)
    }
  }

  const handleModerate = (groupedFlag: GroupedFlag) => {
    setModeratingFlag(groupedFlag)
    setModeratingFlagIds(groupedFlag.flags.map((f) => f.flagId))
    setModerationNotes('')
  }

  const handleSubmitModeration = async (action: 'approve' | 'reject') => {
    if (!moderatingFlag || moderatingFlagIds.length === 0) return

    try {
      setSubmitting(true)

      // Moderate all flags for this review
      const promises = moderatingFlagIds.map((flagId) =>
        moderateFlag(flagId, {
          action,
          notes: moderationNotes,
          userId: moderatingFlag.review.userId,
          reviewId: moderatingFlag.review.id,
        }),
      )

      await Promise.all(promises)

      const actionLabel =
        action === 'approve'
          ? 'đã xác nhận vi phạm và ẩn review'
          : 'đã từ chối, review được giữ lại'
      toast.success(
        `Đã xử lý ${moderatingFlagIds.length} flag(s) - ${actionLabel}`,
      )

      setModeratingFlag(null)
      setModeratingFlagIds([])
      loadFlags(pagination.currentPage)
      loadStatistics()
    } catch (error) {
      console.error('Error moderating flag:', error)
      toast.error('Không thể xử lý moderation')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatisticsCards = () => {
    if (!statistics) return null

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.pending}
            </div>
            <div className="text-sm text-gray-600">Chờ xử lý</div>
          </CardContent>
        </Card>

        {statistics.criticalPending > 0 && (
          <Card className="border-red-300">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {statistics.criticalPending}
              </div>
              <div className="text-sm text-gray-600">Ưu tiên cao</div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {statistics.approved}
            </div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {statistics.rejected}
            </div>
            <div className="text-sm text-gray-600">Từ chối</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.autoApproved}
            </div>
            <div className="text-sm text-gray-600">Tự động</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {statistics.totalFlags}
            </div>
            <div className="text-sm text-gray-600">Tổng cộng</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderGroupedFlagCard = (groupedFlag: GroupedFlag) => {
    const severityClass = getSeverityColor(groupedFlag.maxSeverity)

    return (
      <Card
        key={groupedFlag.reviewId}
        className="hover:shadow-md transition-shadow"
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={severityClass}>
                    Mức {groupedFlag.maxSeverity}
                  </Badge>
                  {groupedFlag.flags.map((f, idx) => (
                    <Badge key={idx} variant="outline">
                      {getFlagTypeLabel(f.flagType)}
                    </Badge>
                  ))}
                  <Badge variant="secondary">
                    {getModerationStatusLabel(groupedFlag.status)}
                  </Badge>
                  {groupedFlag.flags.length > 1 && (
                    <Badge variant="default" className="bg-blue-600">
                      {groupedFlag.flags.length} vi phạm
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">
                    {groupedFlag.review.courseName}
                  </span>
                  {' • '}
                  <span>{formatDate(groupedFlag.review.createdDate)}</span>
                </div>
              </div>
              {groupedFlag.maxSeverity >= 4 && (
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
            </div>

            {/* Review Text */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-900">
                {groupedFlag.review.review}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Rating: {groupedFlag.review.rating}/5 ⭐
              </div>
            </div>

            {/* Flag Reasons */}
            <div className="text-sm space-y-1">
              <span className="font-medium text-gray-700">Lý do vi phạm:</span>
              {groupedFlag.flags.map((f, idx) => (
                <div key={idx} className="text-gray-600 ml-2">
                  • {f.reason} ({getFlagTypeLabel(f.flagType)})
                </div>
              ))}
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Độ tin cậy cao nhất:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${groupedFlag.flags.reduce((max, f) => (f.confidence > max.confidence ? f : max)).confidence * 100}%`,
                  }}
                />
              </div>
              <span className="text-gray-700 font-medium">
                {(
                  groupedFlag.flags.reduce((max, f) =>
                    f.confidence > max.confidence ? f : max,
                  ).confidence * 100
                ).toFixed(0)}
                %
              </span>
            </div>

            {/* Moderation Info */}
            {(groupedFlag.flags[0].reviewedBy ||
              groupedFlag.flags[0].reviewedByName) && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div>
                  Xử lý bởi: {groupedFlag.flags[0].reviewedByName || 'Hệ thống'}
                </div>
                {groupedFlag.flags[0].reviewedAt && (
                  <div>Lúc: {formatDate(groupedFlag.flags[0].reviewedAt)}</div>
                )}
                {groupedFlag.flags[0].moderatorNotes && (
                  <div className="mt-1">
                    Ghi chú: {groupedFlag.flags[0].moderatorNotes}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {groupedFlag.status === ModerationStatus.PENDING && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate(groupedFlag)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Xử lý{' '}
                  {groupedFlag.flags.length > 1
                    ? `(${groupedFlag.flags.length} vi phạm)`
                    : ''}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Hàng đợi kiểm duyệt
          </h2>
        </div>
      </div>

      {/* Statistics */}
      {renderStatisticsCards()}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as any)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value={ModerationStatus.PENDING}>Chờ xử lý</SelectItem>
            <SelectItem value={ModerationStatus.APPROVED}>Đã duyệt</SelectItem>
            <SelectItem value={ModerationStatus.REJECTED}>Từ chối</SelectItem>
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={showCriticalOnly}
            onCheckedChange={(checked) =>
              setShowCriticalOnly(checked as boolean)
            }
          />
          <span className="text-sm text-gray-700">Chỉ hiện ưu tiên cao</span>
        </label>

        <span className="text-sm text-gray-500 ml-auto">
          {pagination.totalElements} kết quả
        </span>
      </div>

      {/* Flags List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : groupedFlags.length > 0 ? (
        <div className="grid gap-4">
          {groupedFlags.map(renderGroupedFlagCard)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Không có flags nào
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 0 || loading}
            onClick={() => loadFlags(pagination.currentPage - 1)}
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
            onClick={() => loadFlags(pagination.currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Moderation Dialog */}
      <Dialog
        open={!!moderatingFlag}
        onOpenChange={() => setModeratingFlag(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xử lý kiểm duyệt</DialogTitle>
          </DialogHeader>

          {moderatingFlag && (
            <div className="space-y-4">
              {/* Review Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">
                  {moderatingFlag.review.courseName}
                </div>
                <div className="text-sm text-gray-700">
                  {moderatingFlag.review.review}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Rating: {moderatingFlag.review.rating}/5 ⭐
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge
                    className={getSeverityColor(moderatingFlag.maxSeverity)}
                  >
                    Mức {moderatingFlag.maxSeverity}
                  </Badge>
                  {moderatingFlag.flags.map((f, idx) => (
                    <Badge key={idx} variant="outline">
                      {getFlagTypeLabel(f.flagType)}
                    </Badge>
                  ))}
                  <Badge variant="default" className="bg-blue-600">
                    {moderatingFlag.flags.length} vi phạm
                  </Badge>
                </div>
              </div>

              {/* Moderation Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú xử lý
                </label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Nhập ghi chú về quyết định của bạn..."
                  rows={4}
                />
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Chọn <strong>"Duyệt"</strong> nếu xác
                  nhận vi phạm → Review sẽ bị ẩn. Chọn{' '}
                  <strong>"Từ chối"</strong> nếu không vi phạm → Review được giữ
                  lại.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModeratingFlag(null)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubmitModeration('reject')}
              disabled={submitting}
            >
              <X className="h-4 w-4 mr-2" />
              Từ chối
            </Button>
            <Button
              onClick={() => handleSubmitModeration('approve')}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
