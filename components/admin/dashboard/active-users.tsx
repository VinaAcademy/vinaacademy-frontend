'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  getActiveUsers,
  ActiveUsers as ActiveUsersType,
} from '@/services/adminDashboardService'
import { Skeleton } from '@/components/ui/skeleton'

interface ActiveUsersProps {
  className?: string
}

export default function ActiveUsers({ className }: ActiveUsersProps) {
  const [data, setData] = useState<ActiveUsersType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const usersData = await getActiveUsers()
        setData(usersData)
        setError(null)
      } catch (err) {
        console.error('Error fetching active users:', err)
        setError('Không thể tải dữ liệu người dùng')
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
          <CardTitle>Người dùng hoạt động</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Người dùng hoạt động</CardTitle>
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
        <CardTitle>Người dùng hoạt động</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Người dùng hoạt động"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="Người dùng mới"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg mt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-gray-500 text-sm">Tổng người dùng</h4>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {data.userGrowth > 0 ? '+' : ''}
              {data.userGrowth.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {data.totalUsers.toLocaleString('vi-VN')}
          </p>
          <div className="mt-4">
            <div className="flex justify-between mb-1 text-xs">
              <span>Học viên</span>
              <span>{data.studentPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${data.studentPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between mb-1 text-xs">
              <span>Giảng viên</span>
              <span>{data.instructorPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${data.instructorPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
