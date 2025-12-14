'use client'

import { useEffect, useState } from 'react'
import StatsCards from '@/components/admin/courses/dashboard/StatsCards'
import TrendChart from '@/components/admin/courses/dashboard/TrendChart'
import CategoryDistribution from '@/components/admin/courses/dashboard/CategoryDistribution'
import TopCourses from '@/components/admin/courses/dashboard/TopCourses'
import TopInstructors from '@/components/admin/courses/dashboard/TopInstructors'
import RecentCourses from '@/components/admin/courses/dashboard/RecentCourses'
import AlertsAndMetrics from '@/components/admin/courses/dashboard/AlertsAndMetrics'
import {
  getDashboardStats,
  getCategoryDistribution,
  getCourseTrend,
  getTopCourses,
  getTopInstructors,
  getRecentCourses,
  getAlertsAndMetrics,
  CourseDashboardStats,
  CategoryDistribution as CategoryDistributionData,
  CourseTrend,
  TopCourses as TopCoursesData,
  TopInstructors as TopInstructorsData,
  RecentCourses as RecentCoursesData,
  AlertsAndMetrics as AlertsAndMetricsData,
} from '@/services/courseDashboardService'

export default function AdminCoursesPage() {
  const [statsData, setStatsData] = useState<CourseDashboardStats | null>(null)
  const [categoryData, setCategoryData] =
    useState<CategoryDistributionData | null>(null)
  const [trendData, setTrendData] = useState<CourseTrend | null>(null)
  const [topCoursesData, setTopCoursesData] = useState<TopCoursesData | null>(
    null,
  )
  const [topInstructorsData, setTopInstructorsData] =
    useState<TopInstructorsData | null>(null)
  const [recentCoursesData, setRecentCoursesData] =
    useState<RecentCoursesData | null>(null)
  const [alertsAndMetricsData, setAlertsAndMetricsData] =
    useState<AlertsAndMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch all dashboard data in parallel
        const [
          stats,
          categories,
          trend,
          topCourses,
          topInstructors,
          recentCourses,
          alertsMetrics,
        ] = await Promise.all([
          getDashboardStats(),
          getCategoryDistribution(),
          getCourseTrend(6),
          getTopCourses(10),
          getTopInstructors(10),
          getRecentCourses(12),
          getAlertsAndMetrics(),
        ])

        setStatsData(stats)
        setCategoryData(categories)
        setTrendData(trend)
        setTopCoursesData(topCourses)
        setTopInstructorsData(topInstructors)
        setRecentCoursesData(recentCourses)
        setAlertsAndMetricsData(alertsMetrics)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Quản Lý Khóa Học
          </h1>
          <p className="text-gray-600 mt-2">
            Tổng quan và phân tích toàn bộ khóa học trên nền tảng
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && statsData && (
        <>
          {/* Stats Cards */}
          <StatsCards stats={statsData} />

          {/* Trend Chart & Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TrendChart data={trendData?.trends || []} />
            <CategoryDistribution data={categoryData?.categories || []} />
          </div>

          {/* Top Courses */}
          <TopCourses courses={topCoursesData?.courses || []} />

          {/* Recent Courses */}
          <RecentCourses courses={recentCoursesData?.courses || []} />

          {/* Top Instructors */}
          <TopInstructors instructors={topInstructorsData?.instructors || []} />

          {/* Alerts & Metrics */}
          <AlertsAndMetrics
            metrics={
              alertsAndMetricsData?.metrics || {
                approvalRate: 0,
                avgApprovalTime: 0,
                rejectionRate: 0,
              }
            }
            alerts={alertsAndMetricsData?.alerts || []}
          />
        </>
      )}
    </div>
  )
}
