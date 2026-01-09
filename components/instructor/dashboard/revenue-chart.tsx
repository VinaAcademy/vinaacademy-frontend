'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getRevenueChart,
  type RevenueChartDto,
} from '@/services/instructorDashboardService'
import { toast } from 'react-hot-toast'

interface RevenueChartProps {
  period?: 'WEEK' | 'MONTH' | 'YEAR'
}

export default function RevenueChart({ period = 'MONTH' }: RevenueChartProps) {
  const [data, setData] = useState<RevenueChartDto | null>(null)
  const [loading, setLoading] = useState(true)

  const marginTop = useMemo(() => {
    if (!data?.data || data.data.length === 0) return 10
    const maxRevenue = Math.max(
      ...data.data.map((item: any) => Number(item.revenue)),
    )
    if (maxRevenue >= 1000000000) return 300
    if (maxRevenue >= 200000000) return 200
    if (maxRevenue >= 15000000) return 160
    if (maxRevenue >= 1000000) return 110
    if (maxRevenue >= 1000) return 50
    return 30
  }, [data])

  useEffect(() => {
    loadRevenueChart()
  }, [period])

  const loadRevenueChart = async () => {
    setLoading(true)
    const result = await getRevenueChart(period)
    if (result) {
      setData(result)
    } else {
      toast.error('Không thể tải biểu đồ doanh thu')
    }
    setLoading(false)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(num)
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-base font-medium">
            Doanh thu theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-base font-medium">
          Doanh thu theo tháng
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {data && data.data && data.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data.data}
              margin={{
                top: marginTop,
                right: 10,
                left: -30,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                padding={{ top: 30 }}
                width={80} // Giảm width nếu không cần hiển thị số quá dài
                domain={[0, 'auto']}
                tickFormatter={(value) => {
                  if (value >= 1_000_000_000) {
                    return `${(value / 1_000_000_000).toFixed(1)} tỷ`
                  }
                  if (value >= 1_000_000) {
                    return `${(value / 1_000_000).toFixed(0)}tr`
                  }
                  if (value >= 1_000) {
                    return `${(value / 1_000).toFixed(0)}k`
                  }
                  return value.toString()
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow:
                    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
                cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#8884d8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Chưa có dữ liệu doanh thu
          </div>
        )}
      </CardContent>
    </Card>
  )
}
