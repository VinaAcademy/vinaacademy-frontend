'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  getRevenueOverview,
  RevenueOverview as RevenueOverviewType,
} from '@/services/adminDashboardService'
import { Skeleton } from '@/components/ui/skeleton'
import { max } from 'date-fns'

interface RevenueOverviewProps {
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// Format to currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value)
}

// Compact number formatter for chart axes (e.g., 1.5 tỷ, 500 tr)
const formatCompactNumber = (number: number) => {
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + ' tỷ'
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(0) + ' tr'
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(0) + 'k'
  }
  return number.toString()
}

export default function RevenueOverview({ className }: RevenueOverviewProps) {
  const [data, setData] = useState<RevenueOverviewType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const revenueData = await getRevenueOverview()
        setData(revenueData)
        setError(null)
      } catch (err) {
        console.error('Error fetching revenue overview:', err)
        setError('Không thể tải dữ liệu doanh thu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tổng quan doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-80 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tổng quan doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-center py-4">
            {error || 'Lỗi tải dữ liệu'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxRevenue = data.monthlyRevenue.reduce(
    (max, item) => Math.max(max, item.revenue),
    0,
  )
  console.log('Max Revenue:', maxRevenue)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tổng quan doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-10">
          <div className="w-full">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Doanh thu theo tháng
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyRevenue}
                  margin={{
                    top: Math.max(10, (5 * maxRevenue) / 1e6 + 35),
                    right: 10,
                    left: 0,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    tickFormatter={formatCompactNumber}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#82ca9d"
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value, name) => {
                      if (name === 'revenue' || name === 'Doanh thu')
                        return [formatCurrency(value as number), 'Doanh thu']
                      return [value, 'Số khóa học']
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="courses"
                    name="Số khóa học"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full border-t pt-8 border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-6">
              Phân bố doanh thu theo danh mục
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    innerRadius={75}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="categoryName"
                    paddingAngle={4}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      if (percent < 0.05) return null

                      const RADIAN = Math.PI / 180
                      // Calculate position exactly in the middle of the slice arc
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5
                      const x = cx + radius * Math.cos(-midAngle * RADIAN)
                      const y = cy + radius * Math.sin(-midAngle * RADIAN)

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={12}
                          fontWeight="bold"
                          className="drop-shadow-sm shadow-black"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      )
                    }}
                  >
                    {data.distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        stroke="#fff"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      'Tỷ lệ',
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '24px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 transition-all hover:bg-blue-50 hover:shadow-sm">
            <h4 className="text-blue-600/80 text-sm font-medium">
              Doanh thu năm
            </h4>
            <p
              className="text-2xl sm:text-3xl font-bold mt-2 text-blue-700 break-words"
              title={formatCurrency(data.yearlyRevenue)}
            >
              {formatCompactNumber(data.yearlyRevenue) ===
              data.yearlyRevenue.toString()
                ? formatCurrency(data.yearlyRevenue)
                : formatCompactNumber(data.yearlyRevenue)}
            </p>
            <p className="text-xs text-blue-600/70 flex items-center mt-2 font-medium">
              <svg
                className="w-3.5 h-3.5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                ></path>
              </svg>
              Tổng doanh thu 12 tháng
            </p>
          </div>

          <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100 transition-all hover:bg-purple-50 hover:shadow-sm">
            <h4 className="text-purple-600/80 text-sm font-medium">
              Phí nền tảng
            </h4>
            <div className="mt-2 min-h-[36px] flex items-end">
              <p
                className="text-2xl font-bold text-purple-700 break-words"
                title={formatCurrency(data.platformFee)}
              >
                {formatCompactNumber(data.platformFee) ===
                data.platformFee.toString()
                  ? formatCurrency(data.platformFee)
                  : formatCompactNumber(data.platformFee)}
              </p>
            </div>
            <p className="text-xs text-purple-600/70 mt-2 font-medium">
              30% tổng doanh thu
            </p>
          </div>

          <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 transition-all hover:bg-emerald-50 hover:shadow-sm">
            <h4 className="text-emerald-600/80 text-sm font-medium">
              Thu nhập giảng viên
            </h4>
            <div className="mt-2 min-h-[36px] flex items-end">
              <p
                className="text-2xl font-bold text-emerald-700 break-words"
                title={formatCurrency(data.instructorEarnings)}
              >
                {formatCompactNumber(data.instructorEarnings) ===
                data.instructorEarnings.toString()
                  ? formatCurrency(data.instructorEarnings)
                  : formatCompactNumber(data.instructorEarnings)}
              </p>
            </div>
            <p className="text-xs text-emerald-600/70 mt-2 font-medium">
              70% tổng doanh thu
            </p>
          </div>

          <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100 transition-all hover:bg-orange-50 hover:shadow-sm">
            <h4 className="text-orange-600/80 text-sm font-medium">
              Giá trị đơn hàng TB
            </h4>
            <div className="mt-2 min-h-[36px] flex items-end">
              <p
                className="text-2xl font-bold text-orange-700 break-words"
                title={formatCurrency(data.averageOrderValue)}
              >
                {formatCurrency(data.averageOrderValue)}
              </p>
            </div>
            <p className="text-xs text-orange-600/70 mt-2 font-medium">
              Trung bình mỗi đơn
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
