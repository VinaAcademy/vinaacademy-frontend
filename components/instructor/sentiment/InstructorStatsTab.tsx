'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Award,
  Calendar,
} from 'lucide-react'
import { SentimentDashboardResponse } from '@/types/sentiment'
import {
  LineChart,
  Line,
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

interface InstructorStatsTabProps {
  data: SentimentDashboardResponse
}

const COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  mixed: '#eab308',
}

/**
 * Stats Tab - Hiển thị thống kê chi tiết với charts
 */
export default function InstructorStatsTab({ data }: InstructorStatsTabProps) {
  const { overview, sentimentTrend, topAspects } = data

  // Prepare sentiment distribution data for pie chart
  const sentimentDistributionData = [
    {
      name: 'Tích cực',
      value: overview.sentimentDistribution?.POSITIVE || 0,
      color: COLORS.positive,
    },
    {
      name: 'Tiêu cực',
      value: overview.sentimentDistribution?.NEGATIVE || 0,
      color: COLORS.negative,
    },
    {
      name: 'Trung lập',
      value: overview.sentimentDistribution?.NEUTRAL || 0,
      color: COLORS.neutral,
    },
    {
      name: 'Hỗn hợp',
      value: overview.sentimentDistribution?.MIXED || 0,
      color: COLORS.mixed,
    },
  ].filter((item) => item.value > 0)

  // Prepare trend data for line chart
  const trendChartData =
    sentimentTrend?.map((point) => ({
      date: new Date(point.date).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      }),
      'Tích cực': point.positiveCount,
      'Tiêu cực': point.negativeCount,
      'Trung lập': point.neutralCount,
      score: ((point.sentimentScore || 0) * 100).toFixed(0),
    })) || []

  // Prepare aspect data for bar chart
  const aspectChartData =
    topAspects?.slice(0, 8).map((aspect) => ({
      category: aspect.category,
      'Đề cập': aspect.totalMentions || 0,
      'Điểm số': Math.round((aspect.avgSentimentScore || 0) * 100),
    })) || []

  // Calculate statistics
  const totalReviews = overview.totalReviews || 0
  const positiveRate =
    overview.sentimentPercentages?.POSITIVE?.toFixed(1) || '0'
  const negativeRate =
    overview.sentimentPercentages?.NEGATIVE?.toFixed(1) || '0'

  // Calculate trend (compare first half vs second half of period)
  const calculateTrend = () => {
    if (!sentimentTrend || sentimentTrend.length < 2) return null

    const midPoint = Math.floor(sentimentTrend.length / 2)
    const firstHalf = sentimentTrend.slice(0, midPoint)
    const secondHalf = sentimentTrend.slice(midPoint)

    const avgFirst =
      firstHalf.reduce((sum, p) => sum + (p.sentimentScore || 0), 0) /
      firstHalf.length
    const avgSecond =
      secondHalf.reduce((sum, p) => sum + (p.sentimentScore || 0), 0) /
      secondHalf.length

    const change = ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100

    return {
      isPositive: change > 0,
      percentage: Math.abs(change).toFixed(1),
    }
  }

  const trend = calculateTrend()

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Tổng đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-gray-500 mt-1">Trong khoảng thời gian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Tỷ lệ tích cực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {positiveRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overview.sentimentDistribution?.POSITIVE || 0} đánh giá
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Tỷ lệ tiêu cực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {negativeRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overview.sentimentDistribution?.NEGATIVE || 0} đánh giá
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-600" />
              Xu hướng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trend ? (
              <>
                <div
                  className={`text-2xl font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {trend.isPositive ? '+' : '-'}
                  {trend.percentage}%
                </div>
                <p className="text-xs text-gray-500 mt-1">So với nửa đầu kỳ</p>
              </>
            ) : (
              <div className="text-sm text-gray-500">Chưa đủ dữ liệu</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Sentiment Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Xu hướng cảm xúc theo thời gian
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Tích cực"
                  stroke={COLORS.positive}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Tiêu cực"
                  stroke={COLORS.negative}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Trung lập"
                  stroke={COLORS.neutral}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có dữ liệu xu hướng
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row 2: Distribution & Aspects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố cảm xúc</CardTitle>
          </CardHeader>
          <CardContent>
            {sentimentDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) =>
                      `${entry.name}: ${entry.value} (${((entry.value / totalReviews) * 100).toFixed(1)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Aspects Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Khía cạnh được đề cập</CardTitle>
          </CardHeader>
          <CardContent>
            {aspectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aspectChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Đề cập" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không có dữ liệu khía cạnh
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aspect Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bảng điểm theo khía cạnh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Khía cạnh</th>
                  <th className="text-center py-3 px-4">Số lần đề cập</th>
                  <th className="text-center py-3 px-4">Điểm sentiment</th>
                  <th className="text-center py-3 px-4">Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {topAspects && topAspects.length > 0 ? (
                  topAspects.map((aspect, index) => {
                    const score = (aspect.avgSentimentScore || 0) * 100
                    const getScoreColor = (s: number) => {
                      if (s >= 30) return 'text-green-600'
                      if (s <= -30) return 'text-red-600'
                      return 'text-yellow-600'
                    }
                    const getScoreLabel = (s: number) => {
                      if (s >= 30) return 'Tốt'
                      if (s <= -30) return 'Cần cải thiện'
                      return 'Trung bình'
                    }

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {aspect.category}
                        </td>
                        <td className="text-center py-3 px-4">
                          {aspect.totalMentions || 0}
                        </td>
                        <td
                          className={`text-center py-3 px-4 font-bold ${getScoreColor(score)}`}
                        >
                          {score.toFixed(0)}%
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              score >= 30
                                ? 'bg-green-100 text-green-800'
                                : score <= -30
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {getScoreLabel(score)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Không có dữ liệu khía cạnh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
              <div>
                <p className="font-medium">Tổng số đánh giá</p>
                <p className="text-sm text-gray-600">
                  Khóa học đã nhận được {totalReviews} đánh giá trong khoảng
                  thời gian được chọn.
                </p>
              </div>
            </div>

            {overview.overallSentimentScore !== undefined && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Điểm cảm xúc tổng thể</p>
                  <p className="text-sm text-gray-600">
                    Điểm sentiment tổng thể là{' '}
                    {(overview.overallSentimentScore * 100).toFixed(0)}%,{' '}
                    {overview.overallSentimentScore >= 0.3
                      ? 'cho thấy phản hồi tích cực từ học viên'
                      : overview.overallSentimentScore <= -0.3
                        ? 'cần cải thiện để nâng cao trải nghiệm học viên'
                        : 'ở mức trung bình, có thể cải thiện thêm'}
                    .
                  </p>
                </div>
              </div>
            )}

            {topAspects && topAspects.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Khía cạnh nổi bật</p>
                  <p className="text-sm text-gray-600">
                    Khía cạnh được đề cập nhiều nhất là "
                    {topAspects[0].category}" với {topAspects[0].totalMentions}{' '}
                    lần.
                  </p>
                </div>
              </div>
            )}

            {overview.toxicReviewsCount > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Cảnh báo</p>
                  <p className="text-sm text-gray-600">
                    Có {overview.toxicReviewsCount} đánh giá bị đánh dấu là độc
                    hại cần được kiểm duyệt.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
