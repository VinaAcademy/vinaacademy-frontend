'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InstructorSentimentDashboard from '@/components/instructor/sentiment/InstructorSentimentDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, BarChart3, MessageSquare } from 'lucide-react'

/**
 * Instructor Course Analytics Page
 * Hiển thị sentiment analysis dashboard cho giảng viên
 */
export default function CourseAnalyticsPage() {
  const params = useParams()
  const courseId = params.id as string
  const [activeTab, setActiveTab] = useState('sentiment')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Phân tích khóa học</h1>
        <p className="text-gray-600 mt-2">
          Theo dõi hiệu suất và phản hồi của học viên về khóa học
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Phản hồi
          </TabsTrigger>
        </TabsList>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="mt-6">
          <InstructorSentimentDashboard courseId={courseId} />
        </TabsContent>

        {/* Stats Tab - Placeholder */}
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê chi tiết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Tính năng thống kê chi tiết sẽ được bổ sung</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab - Placeholder */}
        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Phản hồi từ học viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Danh sách phản hồi sẽ được hiển thị tại đây</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
