'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Users, TrendingUp } from 'lucide-react'
import Image from 'next/image'

interface TopCoursesProps {
  courses: Array<{
    id: string
    title: string
    instructor: string
    thumbnail: string
    students: number
    rating: number
    revenue: number
  }>
}

export default function TopCourses({ courses }: TopCoursesProps) {
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
          <TrendingUp className="h-5 w-5 mr-2 text-yellow-500" />
          Top 10 khóa học xuất sắc
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-8 text-center">
                <Badge
                  variant={index < 3 ? 'default' : 'secondary'}
                  className={
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                          ? 'bg-orange-600'
                          : ''
                  }
                >
                  #{index + 1}
                </Badge>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  width={60}
                  height={40}
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {course.title}
                </p>
                <p className="text-xs text-gray-500">{course.instructor}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  {course.students.toLocaleString()}
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {course.rating}
                </div>
                <div className="font-semibold text-green-600 min-w-[60px] text-right">
                  {formatCurrency(course.revenue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
