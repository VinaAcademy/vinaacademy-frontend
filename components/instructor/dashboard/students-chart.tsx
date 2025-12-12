'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getStudentsChart,
  type StudentsChartDto,
} from '@/services/instructorDashboardService'
import { toast } from 'react-hot-toast'

interface StudentsChartProps {
  period?: 'WEEK' | 'MONTH' | 'YEAR'
}

export default function StudentsChart({
  period = 'MONTH',
}: StudentsChartProps) {
  const [data, setData] = useState<StudentsChartDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudentsChart()
  }, [period])

  const loadStudentsChart = async () => {
    setLoading(true)
    const result = await getStudentsChart(period)
    if (result) {
      setData(result)
    } else {
      toast.error('Không thể tải biểu đồ học viên')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-base font-medium">
            Học viên mới theo tháng
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
          Học viên mới theo tháng
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {data && data.data && data.data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
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
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderColor: '#e5e7eb',
                }}
                formatter={(value: any) => [
                  `${value} học viên`,
                  'Học viên mới',
                ]}
              />
              <Bar
                dataKey="students"
                fill="#000000"
                radius={[4, 4, 0, 0]}
                name="Học viên mới"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Chưa có dữ liệu học viên
          </div>
        )}
      </CardContent>
    </Card>
  )
}
