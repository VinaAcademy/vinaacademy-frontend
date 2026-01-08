/**
 * Discussion Moderation Component
 * Reusable component for staff/admin to moderate flagged discussions
 * Features: Statistics, Tabs (Pending/All/History), Filters, Table, Moderation Modal
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Clock,
  BarChart3,
} from 'lucide-react'
import { Spinner } from '@/components/common/spinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useModerateFlag } from '@/hooks/useDiscussionModeration'
import {
  getFlaggedDiscussions,
  getModerationHistory,
  getModerationStatistics,
} from '@/services/discussionModerationService'
import { createSuccessToast, createErrorToast } from '@/components/ui/toast-cus'
import type {
  FlaggedDiscussionDto,
  FlagType,
  ModerationStatus,
} from '@/types/discussion-moderation'

// Flag type display configuration
const FLAG_TYPE_CONFIG: Record<
  FlagType,
  { label: string; color: string; icon: typeof AlertTriangle; severity: string }
> = {
  TOXIC: {
    label: 'Độc hại',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: AlertTriangle,
    severity: 'Nghiêm trọng',
  },
  EXTREME_NEGATIVE: {
    label: 'Tiêu cực',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle,
    severity: 'Cao',
  },
  SPAM: {
    label: 'Spam',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    icon: Shield,
    severity: 'Trung bình',
  },
}

export default function DiscussionModerationComponent() {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'history'>(
    'pending',
  )
  const [selectedStatus, setSelectedStatus] = useState<
    ModerationStatus | undefined
  >('PENDING')
  const [currentPage, setCurrentPage] = useState(0)
  const [detailFlag, setDetailFlag] = useState<FlaggedDiscussionDto | null>(
    null,
  )
  const [moderationNotes, setModerationNotes] = useState('')

  // Queries
  const [statistics, setStatistics] = useState<any>(null)
  const [flaggedData, setFlaggedData] = useState<any>(null)
  const [historyData, setHistoryData] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [flaggedLoading, setFlaggedLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Track if component has mounted to avoid double-fetch in Strict Mode
  const isMountedRef = useRef(false)

  // Mutation
  const moderateMutation = useModerateFlag()

  // Manual fetcher for statistics (realtime)
  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await getModerationStatistics()
      setStatistics(res)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Manual fetchers (no cache) for real-time data
  const fetchFlagged = useCallback(async () => {
    try {
      setFlaggedLoading(true)
      const res = await getFlaggedDiscussions(selectedStatus, currentPage, 10)
      setFlaggedData(res)
    } finally {
      setFlaggedLoading(false)
    }
  }, [selectedStatus, currentPage])

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      const res = await getModerationHistory(currentPage, 20)
      setHistoryData(res)
    } finally {
      setHistoryLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory()
    } else {
      fetchFlagged()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedStatus, currentPage])

  // Fetch statistics on mount only
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      fetchStatistics()
    }
  }, [fetchStatistics])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pending' | 'all' | 'history')
    setCurrentPage(0)

    if (value === 'pending') {
      setSelectedStatus('PENDING')
    } else if (value === 'all') {
      setSelectedStatus(undefined)
    } else {
      setSelectedStatus(undefined)
    }
  }

  // Open detail dialog
  const handleOpenDetail = (flag: FlaggedDiscussionDto) => {
    setDetailFlag(flag)
    setModerationNotes('')
  }

  // Submit moderation from detail dialog
  const handleDetailAction = async (action: 'approve' | 'reject') => {
    if (!detailFlag) return
    const success = await moderateMutation.mutateAsync({
      flagId: detailFlag.flagId,
      request: {
        action,
        notes: moderationNotes || undefined,
        hideDiscussion: action === 'approve' ? true : undefined,
      },
    })

    if (success) {
      createSuccessToast(
        action === 'approve'
          ? 'Đã xác nhận vi phạm và xử lý bình luận'
          : 'Đã từ chối cờ, bình luận không vi phạm',
      )
      setDetailFlag(null)
      if (activeTab === 'history') {
        fetchHistory()
      } else {
        fetchFlagged()
      }
      // Refetch statistics after moderation
      fetchStatistics()
    } else {
      createErrorToast('Có lỗi xảy ra khi xử lý kiểm duyệt')
    }
  }

  // Render statistics cards
  const renderStatistics = () => {
    if (statsLoading) {
      return (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )
    }

    if (!statistics) return null
    const stats = [
      {
        title: 'Chờ xử lý',
        value: statistics.totalPendingFlags,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
      //   {
      //     title: 'Quan trọng',
      //     value: statistics.criticalPendingFlags,
      //     icon: AlertTriangle,
      //     color: 'text-red-600',
      //     bgColor: 'bg-red-50',
      //   },
      {
        title: 'Đã xác nhận',
        value: statistics.totalApprovedFlags,
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Đã từ chối',
        value: statistics.totalRejectedFlags,
        icon: XCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Render flagged discussions table
  const renderTable = () => {
    const isHistory = activeTab === 'history'
    const data = isHistory ? historyData : flaggedData
    const loading = isHistory ? historyLoading : flaggedLoading

    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )
    }

    if (!data || data.content.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Không có dữ liệu</p>
        </div>
      )
    }

    return (
      <>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bình luận</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Khóa học</TableHead>
                <TableHead>Loại vi phạm</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.content.map((flag: FlaggedDiscussionDto) => {
                const flagConfig = FLAG_TYPE_CONFIG[flag.flagType]
                const FlagIcon = flagConfig.icon
                const discussion = (flag as any).discussion || null
                const commentText = flag.comment || discussion?.comment || ''
                const lessonTitle = flag.lessonTitle || discussion?.lessonTitle
                const courseTitle =
                  flag.courseTitle || (flag as any)?.courseName
                const severityRaw =
                  flag.flagSeverity ?? (flag as any).severity ?? 0
                const severityDisplay = Math.round(severityRaw)
                const severityDots =
                  Math.min(
                    5,
                    Math.max(0, Math.round((severityRaw / 10) * 5)),
                  ) || 0
                const status = (flag.moderationStatus ||
                  (flag as any).status ||
                  'PENDING') as ModerationStatus
                const userName =
                  flag.userFullName ||
                  discussion?.userFullName ||
                  (discussion as any)?.userFullName ||
                  'Người dùng'

                return (
                  <TableRow
                    key={flag.flagId}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleOpenDetail(flag)}
                  >
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm" title={commentText}>
                        {commentText}
                      </p>
                      {lessonTitle && (
                        <p
                          className="text-xs text-gray-500 truncate"
                          title={lessonTitle}
                        >
                          Bài học: {lessonTitle}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-center gap-2">
                        {flag.avatarUrl && (
                          <img
                            src={flag.avatarUrl}
                            alt={userName}
                            className="h-8 w-8 rounded-full flex-shrink-0"
                          />
                        )}
                        <span className="text-sm truncate" title={userName}>
                          {userName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate text-sm"
                      title={courseTitle || 'N/A'}
                    >
                      {courseTitle || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${flagConfig.color} border`}>
                        <FlagIcon className="h-3 w-3 mr-1" />
                        {flagConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < severityDots ? 'bg-red-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          ({severityDisplay}/10)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(flag.flaggedAt), 'dd/MM/yyyy HH:mm', {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      {status === 'PENDING' && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-800 border-yellow-300"
                        >
                          Chờ xử lý
                        </Badge>
                      )}
                      {status === 'APPROVED' && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-800 border-green-300"
                        >
                          Đã xác nhận
                        </Badge>
                      )}
                      {status === 'REJECTED' && (
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-800 border-gray-300"
                        >
                          Đã từ chối
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Hiển thị {data.number * data.size + 1} -{' '}
              {Math.min((data.number + 1) * data.size, data.totalElements)}{' '}
              trong tổng số {data.totalElements} kết quả
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {renderStatistics()}

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Kiểm duyệt thảo luận
          </CardTitle>
          <CardDescription>
            Quản lý và xử lý các bình luận bị gắn cờ vi phạm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Chờ xử lý ({statistics?.totalPendingFlags || 0})
              </TabsTrigger>

              <TabsTrigger value="history">
                Lịch sử (
                {(statistics?.totalPendingFlags || 0) +
                  (statistics?.totalRejectedFlags || 0)}
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {renderTable()}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              {renderTable()}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {renderTable()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailFlag}
        onOpenChange={(open) => {
          if (!open) setDetailFlag(null)
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Chi tiết bình luận bị gắn cờ</DialogTitle>
            <DialogDescription>
              Xem thông tin đầy đủ về bình luận và lý do gắn cờ
            </DialogDescription>
          </DialogHeader>

          {detailFlag && (
            <div className="space-y-4 text-sm text-gray-700">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${FLAG_TYPE_CONFIG[detailFlag.flagType].color} border`}
                  >
                    {FLAG_TYPE_CONFIG[detailFlag.flagType].label}
                  </Badge>
                  <span>
                    Mức độ:{' '}
                    {Math.round(
                      detailFlag.flagSeverity ??
                        (detailFlag as any).severity ??
                        0,
                    )}
                    /10
                  </span>
                  {((detailFlag as any).confidence ?? null) !== null && (
                    <span className="text-xs text-gray-500">
                      Confidence:{' '}
                      {((detailFlag as any).confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="font-medium break-words">
                  {detailFlag.comment ||
                    (detailFlag as any).discussion?.comment ||
                    ''}
                </p>
                {(detailFlag as any).reason && (
                  <p className="text-sm text-gray-600">
                    Lý do: {(detailFlag as any).reason}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Người dùng:</span>{' '}
                    {detailFlag.userFullName ||
                      (detailFlag as any).discussion?.userFullName ||
                      (detailFlag as any).userFullName}
                  </p>
                  <p>
                    <span className="font-semibold">User ID:</span>{' '}
                    {detailFlag.userId ||
                      (detailFlag as any).discussion?.userId}
                  </p>
                  <p>
                    <span className="font-semibold">Discussion ID:</span>{' '}
                    {detailFlag.discussionId ||
                      (detailFlag as any).discussion?.id}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Khóa học:</span>{' '}
                    {detailFlag.courseTitle ||
                      (detailFlag as any).courseName ||
                      (detailFlag as any).discussion?.courseName ||
                      'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Bài học:</span>{' '}
                    {detailFlag.lessonTitle ||
                      (detailFlag as any).discussion?.lessonTitle ||
                      'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">Thời gian gắn cờ:</span>{' '}
                    {format(
                      new Date(detailFlag.flaggedAt),
                      'dd/MM/yyyy HH:mm',
                      { locale: vi },
                    )}
                  </p>
                </div>
              </div>

              {detailFlag.moderationNotes && (
                <div className="space-y-1">
                  <p className="font-semibold">Ghi chú kiểm duyệt:</p>
                  <p className="whitespace-pre-wrap">
                    {detailFlag.moderationNotes}
                  </p>
                </div>
              )}

              {/* Notes for action */}
              {detailFlag &&
                (detailFlag.moderationStatus ||
                  (detailFlag as any).status ||
                  'PENDING') === 'PENDING' && (
                  <div className="space-y-2">
                    <p className="font-semibold">Ghi chú (tùy chọn)</p>
                    <Textarea
                      id="notes"
                      placeholder="Nhập ghi chú về quyết định của bạn..."
                      value={moderationNotes}
                      onChange={(e) => setModerationNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailFlag(null)}>
              Đóng
            </Button>
            {detailFlag &&
              (detailFlag.moderationStatus ||
                (detailFlag as any).status ||
                'PENDING') === 'PENDING' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    disabled={moderateMutation.isPending}
                    onClick={() => handleDetailAction('approve')}
                  >
                    {moderateMutation.isPending
                      ? 'Đang xử lý...'
                      : 'Xác nhận vi phạm'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={moderateMutation.isPending}
                    onClick={() => handleDetailAction('reject')}
                  >
                    {moderateMutation.isPending
                      ? 'Đang xử lý...'
                      : 'Từ chối cờ'}
                  </Button>
                </div>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
