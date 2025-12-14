'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalCourses: number
    publishedCourses: number
    pendingCourses: number
    avgRevenuePerCourse: number
    monthlyGrowth: {
      courses: number
      published: number
      pending: number
      revenue: number
    }
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  // Safe default for monthlyGrowth if not provided
  const monthlyGrowth = stats.monthlyGrowth || {
    courses: 0,
    published: 0,
    pending: 0,
    revenue: 0,
  }

  const cards = [
    {
      title: 'Tổng khóa học',
      value: stats.totalCourses,
      icon: BookOpen,
      growth: monthlyGrowth.courses,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Đã xuất bản',
      value: stats.publishedCourses,
      icon: CheckCircle,
      growth: monthlyGrowth.published,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Chờ phê duyệt',
      value: stats.pendingCourses,
      icon: Clock,
      growth: monthlyGrowth.pending,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Doanh thu TB/khóa',
      value: `${(stats.avgRevenuePerCourse / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      growth: Number(monthlyGrowth.revenue.toFixed(2)),
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isCurrency: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center mt-2">
              {card.growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-xs font-medium ${
                  card.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {card.growth > 0 ? '+' : ''}
                {card.growth}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                so với tháng trước
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
