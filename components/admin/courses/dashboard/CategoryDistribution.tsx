'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface CategoryDistributionProps {
  data: Array<{
    categoryName: string
    count: number
    percentage: number
  }>
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
]

export default function CategoryDistribution({
  data,
}: CategoryDistributionProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Phân bố theo danh mục</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div
              key={item.categoryName}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600">{item.categoryName}</span>
              </div>
              <span className="font-semibold">
                {item.count} khóa ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
