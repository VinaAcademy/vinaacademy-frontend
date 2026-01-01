'use client'

import { useState, useEffect } from 'react'
import { Calendar, ChevronDown, FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PlatformStats from '@/components/admin/dashboard/platform-stats'
import RevenueOverview from '@/components/admin/dashboard/revenue-overview'
import ActiveUsers from '@/components/admin/dashboard/active-users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  getRecentActivities,
  getQuickActions,
  RecentActivities,
  QuickActions,
  getPlatformStats,
  getRevenueOverview,
  getActiveUsers,
} from '@/services/adminDashboardService'
import { exportAdminDashboardToExcel } from '@/utils/adminExport'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [activities, setActivities] = useState<RecentActivities | null>(null)
  const [quickActions, setQuickActions] = useState<QuickActions | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, actionsData] = await Promise.all([
          getRecentActivities(),
          getQuickActions(),
        ])
        setActivities(activitiesData)
        setQuickActions(actionsData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExportToExcel = async () => {
    setExporting(true)
    const toastId = toast.loading('Đang xuất file Excel...')

    try {
      // Fetch all data in parallel
      const [platformStats, revenueOverview, activeUsers, recentActivities] =
        await Promise.all([
          getPlatformStats(timeRange),
          getRevenueOverview(),
          getActiveUsers(),
          getRecentActivities(),
        ])

      // Export to Excel
      await exportAdminDashboardToExcel(
        {
          platformStats,
          revenueOverview,
          activeUsers,
          recentActivities,
        },
        timeRange,
      )

      toast.success('Xuất Excel thành công!', { id: toastId })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Lỗi khi xuất file Excel', { id: toastId })
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
    return `${Math.floor(diffDays / 30)} tháng trước`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-9 gap-1.5 bg-white"
            onClick={handleExportToExcel}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            <span>Xuất Excel</span>
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5 bg-white"
            onClick={() => {}}
          >
            <Calendar className="h-4 w-4" />
            <span>
              {timeRange === 'week' && '7 ngày qua'}
              {timeRange === 'month' && '30 ngày qua'}
              {timeRange === 'year' && '365 ngày qua'}
            </span>
          </Button>
          <div className="bg-white border rounded-md overflow-hidden flex">
            <button
              className={`px-3 py-1.5 text-sm ${timeRange === 'week' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange('week')}
            >
              Tuần
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${timeRange === 'month' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange('month')}
            >
              Tháng
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${timeRange === 'year' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange('year')}
            >
              Năm
            </button>
          </div>
        </div>
      </div>

      {/* Platform statistics */}
      <PlatformStats timeRange={timeRange} />

      {/* Revenue overview and active users */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RevenueOverview className="col-span-1 md:col-span-2" />
        <ActiveUsers className="col-span-1" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Khóa học chờ phê duyệt</h3>
          <p className="mt-1 text-3xl font-semibold text-black">
            {loading ? '...' : (quickActions?.pendingCourses ?? 0)}
          </p>
          <div className="mt-2">
            <Link
              href="/admin/courses/pending"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Xem ngay →
            </Link>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Yêu cầu rút tiền</h3>
          <p className="mt-1 text-3xl font-semibold text-black">
            {loading ? '...' : (quickActions?.pendingWithdrawals ?? 0)}
          </p>
          <div className="mt-2">
            <Link
              href="/admin/payments/withdrawals"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Xem ngay →
            </Link>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Báo cáo vi phạm</h3>
          <p className="mt-1 text-3xl font-semibold text-black">
            {loading ? '...' : (quickActions?.reportedViolations ?? 0)}
          </p>
          <div className="mt-2">
            <Link
              href="/admin/reports/violations"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Xem ngay →
            </Link>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-900">Hỗ trợ chưa giải đáp</h3>
          <p className="mt-1 text-3xl font-semibold text-black">
            {loading ? '...' : (quickActions?.pendingSupports ?? 0)}
          </p>
          <div className="mt-2">
            <Link
              href="/admin/supports"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Xem ngay →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
