'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Search,
} from 'lucide-react'
import { instructorStudentsService } from '@/services/instructorStudentsService'
import {
  StudentsOverview,
  StudentDetail,
  StudentsProgressChart,
  TimeRange,
  ProgressStatus,
} from '@/types/instructor/students'

export default function InstructorStudentsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('MONTH')
  const [overview, setOverview] = useState<StudentsOverview | null>(null)
  const [students, setStudents] = useState<StudentDetail[]>([])
  const [chartData, setChartData] = useState<StudentsProgressChart | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Load overview data
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data =
          await instructorStudentsService.getStudentsOverview(timeRange)
        setOverview(data)
      } catch (error) {
        console.error('Failed to fetch overview:', error)
      }
    }
    fetchOverview()
  }, [timeRange])

  // Load students list
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const filters: any = { page, size: 10 }
        // Status filter removed - backend now shows all enrollments per user
        if (keyword) filters.keyword = keyword

        const data = await instructorStudentsService.getStudentsList(filters)
        setStudents(data.content)
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      } catch (error) {
        console.error('Failed to fetch students:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [page, keyword]) // Removed statusFilter dependency

  // Load chart data
  useEffect(() => {
    const fetchChart = async () => {
      try {
        const data =
          await instructorStudentsService.getStudentsProgressChart(timeRange)
        setChartData(data)
      } catch (error) {
        console.error('Failed to fetch chart:', error)
      }
    }
    fetchChart()
  }, [timeRange])

  const getStatusBadge = (status: ProgressStatus) => {
    const variants: Record<ProgressStatus, { label: string; variant: any }> = {
      IN_PROGRESS: { label: 'Đang học', variant: 'default' },
      COMPLETED: { label: 'Hoàn thành', variant: 'default' },
    }
    const config = variants[status]
    return (
      <Badge
        variant={config.variant}
        className={status === 'COMPLETED' ? 'bg-green-500' : ''}
      >
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Học viên</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý học viên của bạn
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WEEK">7 ngày qua</SelectItem>
            <SelectItem value="MONTH">30 ngày qua</SelectItem>
            <SelectItem value="QUARTER">3 tháng qua</SelectItem>
            <SelectItem value="YEAR">1 năm qua</SelectItem>
            <SelectItem value="ALL">Tất cả</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Học viên
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalStudents.count}
              </div>
              <p className="text-xs text-muted-foreground">
                +{overview.newStudents.count} học viên mới
                {overview.newStudents.growthRate &&
                  ` (${Number(overview.newStudents.growthRate).toFixed(1)}%)`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đang hoạt động
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.completionStats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">Học viên đang học</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.completionStats.completed}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(overview.completionStats.averageCompletionRate).toFixed(
                  1,
                )}
                % tỷ lệ hoàn thành
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiến độ TB</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(overview.completionStats.averageCompletionRate).toFixed(
                  1,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Tỷ lệ hoàn thành trung bình
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Courses */}
      {overview && overview.topCoursesByStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Khóa học nhiều học viên nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topCoursesByStudents.map((course) => (
                <div key={course.courseId} className="flex items-center gap-4">
                  <img
                    src={course.courseThumbnail || '/placeholder-course.jpg'}
                    alt={course.courseTitle}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{course.courseTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.studentCount} học viên
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Chart */}
      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Tiến độ Học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  name="Đang học"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  name="Hoàn thành"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newEnrollments"
                  stroke="#f59e0b"
                  name="Mới đăng ký"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="mb-2">Danh sách Học viên</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setPage(0)
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có học viên nào
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số khóa học</TableHead>
                    <TableHead>Tiến độ TB</TableHead>
                    <TableHead>Hoạt động gần nhất</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.userId}>
                      <TableCell>
                        <p className="font-medium">
                          {student.fullName || 'Người dùng chưa đặt tên'}
                        </p>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.enrollments?.length || 0} khóa
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{student.averageProgress.toFixed(1)}%</span>
                          </div>
                          <Progress
                            value={student.averageProgress}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.lastActive
                          ? new Date(student.lastActive).toLocaleDateString(
                              'vi-VN',
                            )
                          : 'Chưa có'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {page * 10 + 1} -{' '}
                  {Math.min((page + 1) * 10, totalElements)} trong tổng{' '}
                  {totalElements} học viên
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
