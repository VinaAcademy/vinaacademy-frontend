'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ProsConsSummary from '@/components/courses/sentiment/ProsConsSummary'
import SentimentFilter from '@/components/courses/sentiment/SentimentFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Filter, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Student Sentiment Analysis Page
 * Xem phân tích sentiment của các đánh giá khóa học
 */
export default function CourseSentimentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [activeTab, setActiveTab] = useState('summary')

  // Note: In a real implementation, you would unwrap params like this:
  // const { slug } = use(params);
  // For now, we'll use a placeholder courseId
  const courseId = 'demo-course-id'

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          Phân tích đánh giá thông minh
        </h1>
        <p className="text-gray-600 mt-2">
          AI phân tích các đánh giá để giúp bạn hiểu rõ hơn về khóa học
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Chúng tôi sử dụng công nghệ AI để phân tích hàng nghìn đánh giá, giúp
          bạn nhanh chóng nắm bắt điểm mạnh và điểm cần cải thiện của khóa học.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tóm tắt
          </TabsTrigger>
          <TabsTrigger value="filter" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc đánh giá
          </TabsTrigger>
        </TabsList>

        {/* Pros/Cons Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <ProsConsSummary courseId={courseId} limit={10} />
        </TabsContent>

        {/* Sentiment Filter Tab */}
        <TabsContent value="filter" className="mt-6">
          <SentimentFilter courseId={courseId} />
        </TabsContent>
      </Tabs>

      {/* Additional Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cách chúng tôi phân tích</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🤖 AI Sentiment Analysis
              </h4>
              <p>
                Sử dụng Azure Text Analytics để phân tích cảm xúc của mỗi đánh
                giá, phân loại thành tích cực, tiêu cực, trung lập hoặc hỗn hợp.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🔑 Key Phrases Extraction
              </h4>
              <p>
                Tự động trích xuất các cụm từ quan trọng từ đánh giá, phân loại
                thành điểm cộng, điểm trừ và các khía cạnh khác nhau (nội dung,
                giảng viên, kỹ thuật, v.v.)
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                ⚡ Real-time Processing
              </h4>
              <p>
                Mỗi đánh giá mới được phân tích tự động trong vài giây, đảm bảo
                dữ liệu luôn cập nhật và chính xác.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                🛡️ Moderation
              </h4>
              <p>
                Hệ thống tự động phát hiện nội dung độc hại hoặc không phù hợp,
                gửi cảnh báo cho quản trị viên để xem xét.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
