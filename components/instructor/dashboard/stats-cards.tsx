'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getDashboardStatistics,
  DashboardStatisticsDto,
} from '@/services/instructorDashboardService'
import toast from 'react-hot-toast'

interface StatsCardsProps {
  timeRange: 'week' | 'month' | 'year'
}

export default function StatsCards({ timeRange }: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStatisticsDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const data = await getDashboardStatistics(
          timeRange.toUpperCase() as 'WEEK' | 'MONTH' | 'YEAR',
        )
        if (data) {
          setStats(data)
        } else {
          toast.error('Không thể tải thống kê dashboard')
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        toast.error('Có lỗi xảy ra khi tải thống kê')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [timeRange])

  // Format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  // Format to currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(num)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        Không thể tải thống kê. Vui lòng thử lại sau.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.revenue.current)}
          </div>
          <div className="flex items-center pt-1 text-sm">
            {stats.revenue.isIncrease ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.revenue.isIncrease ? 'text-green-500' : 'text-red-500'
              }
            >
              {Math.abs(stats.revenue.change).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">so với kỳ trước</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Học viên mới</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats.newStudents.current)}
          </div>
          <div className="flex items-center pt-1 text-sm">
            {stats.newStudents.isIncrease ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                stats.newStudents.isIncrease ? 'text-green-500' : 'text-red-500'
              }
            >
              {Math.abs(stats.newStudents.change).toFixed(1)}%
            </span>
            <span className="text-gray-500 ml-1">so với kỳ trước</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Đánh giá trung bình
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageRating.current.toFixed(1)}
          </div>
          <div className="flex items-center space-x-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 fill-current ${i < Math.floor(stats.averageRating.current) ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
