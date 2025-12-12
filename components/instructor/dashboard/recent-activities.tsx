'use client'

import { useEffect, useState } from 'react'
import { Star, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getRecentActivities,
  type RecentActivitiesDto,
} from '@/services/instructorDashboardService'
import { toast } from 'react-hot-toast'

interface RecentActivitiesProps {
  className?: string
}

export default function RecentActivities({ className }: RecentActivitiesProps) {
  const [data, setData] = useState<RecentActivitiesDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    setLoading(true)
    const result = await getRecentActivities(5)
    if (result) {
      setData(result)
    } else {
      toast.error('Không thể tải hoạt động gần đây')
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div>
            <div className="flex items-center">
              <h4 className="text-sm font-semibold mb-2">Đăng ký mới</h4>
              <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {data?.recentEnrollments.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {data && data.recentEnrollments.length > 0 ? (
                data.recentEnrollments.slice(0, 3).map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {enrollment.studentAvatar ? (
                        <img
                          src={enrollment.studentAvatar}
                          alt={enrollment.studentName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {enrollment.studentName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {enrollment.courseName}
                      </p>
                    </div>
                    <div className="flex-shrink-0 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(enrollment.enrolledAt)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có đăng ký mới
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <h4 className="text-sm font-semibold mb-2">Đánh giá mới</h4>
              <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {data?.recentReviews.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {data && data.recentReviews.length > 0 ? (
                data.recentReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {review.studentAvatar ? (
                        <img
                          src={review.studentAvatar}
                          alt={review.studentName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate mr-1">
                          {review.studentName}
                        </p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 fill-current ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {review.courseName}
                      </p>
                      {review.comment && (
                        <p className="text-xs text-gray-700 line-clamp-2 mt-0.5">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có đánh giá mới
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
