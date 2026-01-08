/**
 * Discussion Moderation Page for Admin
 * Dedicated page for moderating flagged discussions
 */

'use client'

import DiscussionModerationComponent from '@/components/staff/DiscussionModerationComponent'

export default function DiscussionModerationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Kiểm duyệt thảo luận
        </h1>
        <p className="text-gray-600 mt-2">
          Quản lý và xử lý các bình luận thảo luận bị gắn cờ vi phạm
        </p>
      </div>

      {/* Main Component */}
      <DiscussionModerationComponent />
    </div>
  )
}
