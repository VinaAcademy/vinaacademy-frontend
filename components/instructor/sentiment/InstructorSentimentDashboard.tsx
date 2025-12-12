'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SentimentDashboardResponse,
  AspectAnalysis,
  TrendDataPoint,
  getAspectCategoryLabel,
} from '@/types/sentiment'
import {
  getInstructorDashboard,
  getDateRange,
} from '@/services/sentimentService'

interface InstructorSentimentDashboardProps {
  courseId: string
}

/**
 * Dashboard phân tích sentiment chi tiết cho giảng viên
 * Hiển thị overview, trends, aspects, improvements, concerns
 */
export default function InstructorSentimentDashboard({
  courseId,
}: InstructorSentimentDashboardProps) {
  const [data, setData] = useState<SentimentDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>(
    'month',
  )

  useEffect(() => {
    loadDashboard()
  }, [courseId, period])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const range = getDateRange(period)
      const response = await getInstructorDashboard(
        courseId,
        range.startDate,
        range.endDate,
      )
      setData(response)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Không thể tải dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center text-gray-500 py-12">
        {error || 'Không có dữ liệu'}
      </div>
    )
  }

  const {
    overview,
    sentimentTrend,
    topAspects,
    recentImprovements,
    recentConcerns,
  } = data

  // Safe fallbacks for arrays
  const trend = sentimentTrend || []
  const aspectAnalysis = topAspects || []

  // Helper functions to safely access data with fallback
  const getSentimentCount = (type: string): number => {
    return (
      overview.sentimentDistribution?.[
        type as keyof typeof overview.sentimentDistribution
      ] || 0
    )
  }

  const getSentimentPercentage = (type: string): number => {
    return (
      overview.sentimentPercentages?.[
        type as keyof typeof overview.sentimentPercentages
      ] || 0
    )
  }

  // Extract individual counts for easier access
  const positiveCount = getSentimentCount('POSITIVE')
  const neutralCount = getSentimentCount('NEUTRAL')
  const negativeCount = getSentimentCount('NEGATIVE')
  const mixedCount = getSentimentCount('MIXED')

  const positivePercentage = getSentimentPercentage('POSITIVE')
  const neutralPercentage = getSentimentPercentage('NEUTRAL')
  const negativePercentage = getSentimentPercentage('NEGATIVE')
  const mixedPercentage = getSentimentPercentage('MIXED')

  const overallScore = overview.overallSentimentScore ?? 0

  // Calculate sentiment score color
  const getScoreColor = (score: number) => {
    if (score >= 0.3) return 'text-green-600'
    if (score <= -0.3) return 'text-red-600'
    return 'text-yellow-600'
  }

  const renderOverviewCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Reviews */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Tổng đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{overview.totalReviews}</div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Điểm tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
            {(overallScore * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {overallScore >= 0 ? 'Tích cực' : 'Cần cải thiện'}
          </div>
        </CardContent>
      </Card>

      {/* Positive Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Tỉ lệ tích cực
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {positivePercentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {positiveCount} / {overview.totalReviews}
          </div>
        </CardContent>
      </Card>

      {/* Toxic Reviews */}
      {overview.toxicReviewsCount > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Cảnh báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {overview.toxicReviewsCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">Đánh giá độc hại</div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderSentimentDistribution = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Phân bố cảm xúc
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Positive */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-600 font-medium">Tích cực</span>
              <span className="text-gray-600">{positiveCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${positivePercentage}%` }}
              />
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Trung lập</span>
              <span className="text-gray-600">{neutralCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-500 h-2 rounded-full"
                style={{ width: `${neutralPercentage}%` }}
              />
            </div>
          </div>

          {/* Negative */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-600 font-medium">Tiêu cực</span>
              <span className="text-gray-600">{negativeCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${negativePercentage}%` }}
              />
            </div>
          </div>

          {/* Mixed */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-600 font-medium">Hỗn hợp</span>
              <span className="text-gray-600">{mixedCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${mixedPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderAspectAnalysis = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Phân tích theo khía cạnh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aspectAnalysis
            .slice(0, 5)
            .map((aspect: AspectAnalysis, index: number) => {
              // Use totalMentions from backend
              const totalMentions = aspect.totalMentions || 0

              // Sentiment score is -1 to 1
              const sentimentScore = aspect.avgSentimentScore || 0
              const positiveRate = Math.max(0, sentimentScore * 100)
              const negativeRate = Math.max(0, -sentimentScore * 100)

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {aspect.category}
                      </div>
                      <div className="text-sm text-gray-500">
                        {totalMentions} lần đề cập
                      </div>
                    </div>
                    <Badge className={getScoreColor(sentimentScore)}>
                      {(sentimentScore * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  {/* Positive/Negative Bar */}
                  <div className="flex h-2 rounded-full overflow-hidden mb-3 bg-gray-200">
                    {positiveRate > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${positiveRate}%` }}
                      />
                    )}
                    {negativeRate > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${negativeRate}%` }}
                      />
                    )}
                  </div>

                  {/* Top Pros */}
                  {aspect.topPros && aspect.topPros.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-green-600 font-medium mb-1">
                        Điểm cộng:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aspect.topPros.slice(0, 3).map((phrase, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Cons */}
                  {aspect.topCons && aspect.topCons.length > 0 && (
                    <div>
                      <div className="text-xs text-red-600 font-medium mb-1">
                        Điểm trừ:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {aspect.topCons.slice(0, 3).map((phrase, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )

  const renderImprovementsAndConcerns = () => (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Recent Improvements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <TrendingUp className="h-5 w-5" />
            Cải thiện gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentImprovements.length > 0 ? (
            <ul className="space-y-2">
              {recentImprovements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Chưa có dữ liệu</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Concerns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <TrendingDown className="h-5 w-5" />
            Vấn đề cần chú ý
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentConcerns.length > 0 ? (
            <ul className="space-y-2">
              {recentConcerns.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Không có vấn đề nổi bật</div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Phân tích cảm xúc đánh giá
        </h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">7 ngày qua</SelectItem>
            <SelectItem value="month">30 ngày qua</SelectItem>
            <SelectItem value="quarter">3 tháng qua</SelectItem>
            <SelectItem value="year">12 tháng qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      {renderOverviewCard()}

      {/* Sentiment Distribution */}
      {renderSentimentDistribution()}

      {/* Aspect Analysis */}
      {renderAspectAnalysis()}

      {/* Improvements & Concerns */}
      {renderImprovementsAndConcerns()}
    </div>
  )
}
