'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Clock,
  Star,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCourseOverview,
  type CourseOverviewDto,
} from '@/services/instructorDashboardService'
import { toast } from 'react-hot-toast'

interface CourseOverviewProps {
  className?: string
}

export default function CourseOverview({ className }: CourseOverviewProps) {
  const [data, setData] = useState<CourseOverviewDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'POPULAR' | 'RECENT' | 'REVENUE'>(
    'POPULAR',
  )
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    loadCourseOverview()
  }, [sortBy])

  useEffect(() => {
    // Reset to page 1 when sort changes
    setCurrentPage(1)
  }, [sortBy])

  const loadCourseOverview = async () => {
    setLoading(true)
    const result = await getCourseOverview(sortBy)
    if (result) {
      setData(result)
    } else {
      toast.error('Không thể tải tổng quan khóa học')
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tổng quan khóa học</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  // Pagination calculations
  const totalPages = Math.ceil(data.courses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCourses = data.courses.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Calculate page numbers to display (max 5 pages)
  const getPageNumbers = () => {
    const maxPagesToShow = 5
    const pages: number[] = []

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Calculate range around current page
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, currentPage + 2)

      // Adjust if at the beginning
      if (currentPage <= 3) {
        startPage = 1
        endPage = maxPagesToShow
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1
        endPage = totalPages
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tổng quan khóa học</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng khóa học</p>
                  <h3 className="text-2xl font-bold">
                    {data.summary.totalCourses}
                  </h3>
                </div>
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
                  <h3 className="text-2xl font-bold">
                    {data.summary.averageCompletionRate.toFixed(1)}%
                  </h3>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng học viên</p>
                  <h3 className="text-2xl font-bold">
                    {data.summary.totalStudents}
                  </h3>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng doanh thu</p>
                  <h3 className="text-2xl font-bold">
                    {(data.summary.totalRevenue / 1000000).toFixed(1)}M
                  </h3>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Sort Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant={sortBy === 'POPULAR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('POPULAR')}
            >
              Phổ biến
            </Button>
            <Button
              variant={sortBy === 'RECENT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('RECENT')}
            >
              Mới nhất
            </Button>
            <Button
              variant={sortBy === 'REVENUE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('REVENUE')}
            >
              Doanh thu
            </Button>
          </div>

          {/* Course Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-100 py-2 px-4 text-sm font-medium text-gray-500">
              <div className="col-span-4">Tên khóa học</div>
              <div className="col-span-2 text-center">Học viên</div>
              <div className="col-span-2 text-center">Đánh giá</div>
              <div className="col-span-2 text-center">Hoàn thành</div>
              <div className="col-span-2 text-right">Doanh thu</div>
            </div>

            <div className="divide-y">
              {data.courses.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  Chưa có khóa học nào
                </div>
              ) : (
                currentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-12 py-3 px-4 items-center hover:bg-gray-50"
                  >
                    <div className="col-span-4">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-xs text-gray-500">
                        Cập nhật: {formatDate(course.lastUpdated)}
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      {course.students}
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span>{course.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">
                          ({course.totalReviews})
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      {course.completionRate.toFixed(0)}%
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {formatCurrency(course.revenue)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {data.courses.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-4">
              <div className="text-sm text-gray-500">
                Hiển thị {startIndex + 1} -{' '}
                {Math.min(endIndex, data.courses.length)} trong tổng số{' '}
                {data.courses.length} khóa học
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  title="Trang đầu"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-1">
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Trang cuối"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Link href="/instructor/courses">
              <Button
                variant="outline"
                className="border-black bg-white text-black hover:bg-gray-100"
              >
                Xem tất cả khóa học
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
