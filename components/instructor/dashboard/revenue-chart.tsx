'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
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
            <LineChart
              data={data.data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(0)}tr`
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`
                  }
                  return value.toString()
                }}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb',
                }}
                formatter={(value: any) => [formatCurrency(value), 'Doanh thu']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#000000"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Doanh thu"
              />
            </LineChart>
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
