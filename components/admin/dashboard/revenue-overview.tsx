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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tổng quan doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Doanh thu theo tháng
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyRevenue}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#8884d8"
                    tickFormatter={(value) =>
                      value >= 1000000
                        ? `${(value / 1000000).toFixed(0)}tr`
                        : value.toString()
                    }
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'revenue')
                        return [formatCurrency(value as number), 'Doanh thu']
                      return [value, 'Số khóa học']
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="courses"
                    name="Số khóa học"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Phân bố doanh thu theo danh mục
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="categoryName"
                    label={({ categoryName, percentage }) =>
                      `${categoryName}: ${percentage.toFixed(0)}%`
                    }
                  >
                    {data.distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm">Doanh thu năm</h4>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(data.yearlyRevenue)}
            </p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <svg
                className="w-4 h-4 mr-1"
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

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm">Phí nền tảng</h4>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(data.platformFee)}
            </p>
            <p className="text-sm text-gray-500 mt-1">20% tổng doanh thu</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm">Thu nhập giảng viên</h4>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(data.instructorEarnings)}
            </p>
            <p className="text-sm text-gray-500 mt-1">80% tổng doanh thu</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-gray-500 text-sm">Giá trị đơn hàng TB</h4>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(data.averageOrderValue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Trung bình mỗi đơn</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
