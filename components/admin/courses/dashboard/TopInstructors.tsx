'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, BookOpen, Users, Star, TrendingUp } from 'lucide-react'

interface TopInstructorsProps {
  instructors: Array<{
    instructorId: string
    name: string
    courseCount: number
    totalStudents: number
    avgRating: number
    revenue: number
  }>
}

export default function TopInstructors({ instructors }: TopInstructorsProps) {
  const formatCurrency = (amount: number) => {
    return (
      new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
      }).format(amount / 1000000) + 'M'
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-purple-500" />
          Top giảng viên
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">
                  Giảng viên
                </th>
                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase">
                  Khóa học
                </th>
                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase">
                  Học viên
                </th>
                <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 uppercase">
                  Rating
                </th>
                <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 uppercase">
                  Doanh thu
                </th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor, index) => (
                <tr
                  key={instructor.instructorId}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {instructor.name.charAt(0)}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {instructor.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {instructor.courseCount}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {instructor.totalStudents.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center text-sm text-yellow-500">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      {instructor.avgRating}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-sm font-semibold text-green-600">
                    {formatCurrency(instructor.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
