'use client'

import { useState } from 'react'
import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

import StatsCards from '@/components/instructor/dashboard/stats-cards'
import RevenueChart from '@/components/instructor/dashboard/revenue-chart'
import StudentsChart from '@/components/instructor/dashboard/students-chart'
import CourseOverview from '@/components/instructor/dashboard/course-overview'
import RecentActivities from '@/components/instructor/dashboard/recent-activities'
import CourseDetails from '@/components/instructor/dashboard/course-details'
import { exportDashboardToExcel } from '@/utils/instructorExport'
import {
  getDashboardStatistics,
  getRevenueChart,
  getCourseOverview,
} from '@/services/instructorDashboardService'

export default function InstructorDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [isExporting, setIsExporting] = useState(false)

  const handleExportToExcel = async () => {
    setIsExporting(true)
    const loadingToast = toast.loading('Đang xuất báo cáo...')

    try {
      // Fetch all data
      const period = timeRange.toUpperCase() as 'WEEK' | 'MONTH' | 'YEAR'

      const [
        stats,
        revenueChart,
        popularCourses,
        recentCourses,
        revenueCourses,
      ] = await Promise.all([
        getDashboardStatistics(period),
        getRevenueChart(period),
        getCourseOverview('POPULAR'),
        getCourseOverview('RECENT'),
        getCourseOverview('REVENUE'),
      ])

      // Export to Excel
      exportDashboardToExcel(
        {
          stats,
          revenueChart,
          popularCourses,
          recentCourses,
          revenueCourses,
        },
        timeRange === 'week'
          ? '7 ngày qua'
          : timeRange === 'month'
            ? '30 ngày qua'
            : '365 ngày qua',
      )

      toast.success('Xuất báo cáo thành công!', { id: loadingToast })
    } catch (error) {
      console.error('Error exporting dashboard:', error)
      toast.error('Có lỗi xảy ra khi xuất báo cáo', { id: loadingToast })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-6 bg-gray-50">
      {/* Header with time range selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 gap-1.5 bg-white"
            onClick={handleExportToExcel}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}</span>
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5 bg-white"
            onClick={() => {}}
          >
            <Calendar className="h-4 w-4" />
            <span>
              {timeRange === 'week' && '7 ngày qua'}
              {timeRange === 'month' && '30 ngày qua'}
              {timeRange === 'year' && '365 ngày qua'}
            </span>
          </Button>
          <div className="bg-white border rounded-md overflow-hidden flex">
            <button
              className={`px-3 py-1.5 text-sm ${timeRange === 'week' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange('week')}
            >
              Tuần
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${timeRange === 'month' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange('month')}
            >
              Tháng
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${timeRange === 'year' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => setTimeRange('year')}
            >
              Năm
            </button>
          </div>
        </div>
      </div>

      {/* Main stats cards */}
      <StatsCards timeRange={timeRange} />

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <RevenueChart
          period={timeRange.toUpperCase() as 'WEEK' | 'MONTH' | 'YEAR'}
        />
        <StudentsChart
          period={timeRange.toUpperCase() as 'WEEK' | 'MONTH' | 'YEAR'}
        />
      </div>

      {/* Course overview and recent activities */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <CourseOverview className="col-span-1 md:col-span-2" />
        <RecentActivities className="col-span-1" />
      </div>

      {/* Course details with tabs */}
      <div className="grid gap-4 grid-cols-1">
        <CourseDetails />
      </div>
    </div>
  )
}
