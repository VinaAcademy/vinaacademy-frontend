'use client'

import React, { useState, useEffect } from 'react'
import { Filter, Star, Smile, Meh, Frown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  SentimentType,
  ReviewWithSentimentDto,
  PageResponse,
  getSentimentLabel,
  getSentimentColor,
  getSentimentBgColor,
} from '@/types/sentiment'
import { getReviewsBySentiment } from '@/services/sentimentService'
import { formatDate } from '@/utils/dateUtils'

interface SentimentFilterProps {
  courseId: string
  onReviewsChange?: (reviews: ReviewWithSentimentDto[]) => void
}

/**
 * Component filter đánh giá theo sentiment
 * Cho phép học viên lọc review theo cảm xúc
 */
export default function SentimentFilter({
  courseId,
  onReviewsChange,
}: SentimentFilterProps) {
  const [selectedSentiment, setSelectedSentiment] = useState<
    SentimentType | 'ALL'
  >('ALL')
  const [reviews, setReviews] = useState<ReviewWithSentimentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  })

  useEffect(() => {
    loadReviews(0)
  }, [selectedSentiment, courseId])

  const loadReviews = async (page: number) => {
    try {
      setLoading(true)
      const sentiment =
        selectedSentiment === 'ALL' ? undefined : selectedSentiment
      const response = await getReviewsBySentiment(
        courseId,
        sentiment,
        page,
        10,
      )

      // Debug: Log dữ liệu review đầu tiên
      if (response.content && response.content.length > 0) {
        console.log('Review sample:', response.content[0])
        console.log('updatedDate:', response.content[0].review.updatedDate)
        console.log('reviewText:', response.content[0].review.review)
        console.log('rating:', response.content[0].review.rating)
      }

      setReviews(response.content)
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      })

      if (onReviewsChange) {
        onReviewsChange(response.content)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSentimentChange = (value: string) => {
    setSelectedSentiment(value as SentimentType | 'ALL')
  }

  const getSentimentIcon = (sentiment: SentimentType) => {
    switch (sentiment) {
      case SentimentType.POSITIVE:
        return <Smile className="h-4 w-4" />
      case SentimentType.NEGATIVE:
        return <Frown className="h-4 w-4" />
      case SentimentType.NEUTRAL:
        return <Meh className="h-4 w-4" />
      case SentimentType.MIXED:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const renderReviewCard = (review: ReviewWithSentimentDto) => {
    const sentimentColor = getSentimentColor(review.sentiment.sentiment)
    const sentimentBg = getSentimentBgColor(review.sentiment.sentiment)

    return (
      <div
        key={review.review.id}
        className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium text-gray-900">
              {review.review.userFullName || 'Người dùng'}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.review.updatedDate as any, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {/* Sentiment Badge */}
            <Badge className={`${sentimentBg} ${sentimentColor} border-0`}>
              <span className="flex items-center gap-1">
                {getSentimentIcon(review.sentiment.sentiment)}
                {getSentimentLabel(review.sentiment.sentiment)}
              </span>
            </Badge>
          </div>
        </div>

        {/* Review Text */}
        <p className="text-gray-700">
          {review.review.review || 'Không có nội dung đánh giá'}
        </p>

        {/* Key Phrases */}
        {review.keyPhrases.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.keyPhrases.slice(0, 5).map((phrase, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {phrase.phrase}
              </Badge>
            ))}
          </div>
        )}

        {/* Toxicity Warning */}
        {review.sentiment.isToxic && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            <span>Đánh giá này đã được đánh dấu để kiểm duyệt</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Filter className="h-5 w-5 text-gray-600" />
        <span className="font-medium text-gray-700">Lọc theo cảm xúc:</span>
        <Select value={selectedSentiment} onValueChange={handleSentimentChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value={SentimentType.POSITIVE}>
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 text-green-600" />
                Tích cực
              </div>
            </SelectItem>
            <SelectItem value={SentimentType.NEGATIVE}>
              <div className="flex items-center gap-2">
                <Frown className="h-4 w-4 text-red-600" />
                Tiêu cực
              </div>
            </SelectItem>
            <SelectItem value={SentimentType.NEUTRAL}>
              <div className="flex items-center gap-2">
                <Meh className="h-4 w-4 text-gray-600" />
                Trung lập
              </div>
            </SelectItem>
            <SelectItem value={SentimentType.MIXED}>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                Hỗn hợp
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500 ml-auto">
          {pagination.totalElements} đánh giá
        </span>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải...</div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">{reviews.map(renderReviewCard)}</div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Không có đánh giá nào phù hợp với bộ lọc
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.currentPage === 0 || loading}
            onClick={() => loadReviews(pagination.currentPage - 1)}
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Trang {pagination.currentPage + 1} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={
              pagination.currentPage >= pagination.totalPages - 1 || loading
            }
            onClick={() => loadReviews(pagination.currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
