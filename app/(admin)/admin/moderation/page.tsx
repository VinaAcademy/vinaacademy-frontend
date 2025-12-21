'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ModerationQueue from '@/components/admin/sentiment/ModerationQueue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import ModerationHistory from '@/components/admin/sentiment/ModerationHistory'

/**
 * Admin Moderation Page
 * Quản lý kiểm duyệt đánh giá bị flag
 */
export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('queue')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Kiểm duyệt nội dung
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý và xử lý các đánh giá bị đánh dấu vi phạm
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  <Clock className="h-6 w-6 inline mr-2" />
                  Chờ xử lý
                </div>
                <div className="text-sm text-gray-600">Đánh giá pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  <AlertTriangle className="h-6 w-6 inline mr-2" />
                  Ưu tiên cao
                </div>
                <div className="text-sm text-gray-600">Cần xử lý ngay</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  <CheckCircle className="h-6 w-6 inline mr-2" />
                  Đã duyệt
                </div>
                <div className="text-sm text-gray-600">Hôm nay</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  <Shield className="h-6 w-6 inline mr-2" />
                  Tổng cộng
                </div>
                <div className="text-sm text-gray-600">Tất cả flags</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Hàng đợi
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Moderation Queue Tab */}
        <TabsContent value="queue" className="mt-6">
          <ModerationQueue />
        </TabsContent>

        {/* History Tab - Placeholder */}
        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <ModerationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
