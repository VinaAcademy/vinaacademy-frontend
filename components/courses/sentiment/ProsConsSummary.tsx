'use client'

import React, { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, TrendingUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProsConsResponse, KeyPhraseItem } from '@/types/sentiment'
import { getProsConsSummary } from '@/services/sentimentService'

interface ProsConsSummaryProps {
  courseId: string
  limit?: number
}

/**
 * Component hiển thị tóm tắt điểm cộng/điểm trừ từ sentiment analysis
 * Dành cho Student view
 */
export default function ProsConsSummary({
  courseId,
  limit = 10,
}: ProsConsSummaryProps) {
  const [data, setData] = useState<ProsConsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProsConsSummary()
  }, [courseId, limit])

  const loadProsConsSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getProsConsSummary(courseId, limit)
      setData(response)
    } catch (err) {
      console.error('Error loading pros/cons summary:', err)
      setError('Không thể tải tóm tắt đánh giá')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48 text-gray-500">
          {error || 'Chưa có dữ liệu phân tích'}
        </CardContent>
      </Card>
    )
  }

  const renderPhraseItem = (item: KeyPhraseItem, isPro: boolean) => (
    <div
      key={item.phrase}
      className="flex items-start gap-2 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
    >
      <div className={`mt-1 ${isPro ? 'text-green-600' : 'text-red-600'}`}>
        {isPro ? (
          <ThumbsUp className="h-4 w-4" />
        ) : (
          <ThumbsDown className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900">{item.phrase}</span>
          {item.category && (
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {item.count} học viên đề cập
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Phân tích từ {data.totalReviews} đánh giá
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pros (Điểm cộng) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <span>Điểm cộng nổi bật</span>
              <Badge variant="secondary" className="ml-auto">
                {data.pros.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.pros.length > 0 ? (
              <div className="space-y-2">
                {data.pros.map((item) => renderPhraseItem(item, true))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Chưa có điểm cộng nào được phát hiện
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cons (Điểm trừ) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              <span>Điểm cần cải thiện</span>
              <Badge variant="secondary" className="ml-auto">
                {data.cons.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.cons.length > 0 ? (
              <div className="space-y-2">
                {data.cons.map((item) => renderPhraseItem(item, false))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Chưa có điểm trừ nào được phát hiện
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
