'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  getPlatformStats,
  PlatformStats as PlatformStatsType,
} from '@/services/adminDashboardService'
import { Skeleton } from '@/components/ui/skeleton'

interface PlatformStatsProps {
  timeRange: 'week' | 'month' | 'year'
}

export default function PlatformStats({ timeRange }: PlatformStatsProps) {
  const [stats, setStats] = useState<PlatformStatsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getPlatformStats(timeRange)
        setStats(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching platform stats:', err)
        setError('Không thể tải thống kê nền tảng')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [timeRange])

  // Hàm định dạng số
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  // Hàm định dạng tiền tệ
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(num)
  }

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="h-3 w-[150px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error || 'Lỗi tải dữ liệu'}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.totalUsers)}
          </div>
          <div className="flex items-center pt-1 text-sm">
            {stats.userChange > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.userChange > 0 ? 'text-green-500' : 'text-red-500'
              }
            >
              {stats.userChange.toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">so với kỳ trước</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng khóa học</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.totalCourses)}
          </div>
          <div className="flex items-center pt-1 text-sm">
            {stats.courseChange > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.courseChange > 0 ? 'text-green-500' : 'text-red-500'
              }
            >
              {stats.courseChange.toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">so với kỳ trước</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng giảng viên</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.totalInstructors)}
          </div>
          <div className="flex items-center pt-1 text-sm">
            {stats.instructorChange > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.instructorChange > 0 ? 'text-green-500' : 'text-red-500'
              }
            >
              {stats.instructorChange.toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">so với kỳ trước</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="flex items-center pt-1 text-sm">
            {stats.revenueChange > 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.revenueChange > 0 ? 'text-green-500' : 'text-red-500'
              }
            >
              {stats.revenueChange.toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">so với kỳ trước</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
