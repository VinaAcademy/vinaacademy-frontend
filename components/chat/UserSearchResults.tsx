'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, MessageCircle } from 'lucide-react'
import { User } from '@/types/auth'
import { PaginatedResponse } from '@/types/api-response'
import { Avatar } from '@/components/ui/avatar'
import { getImageUrl } from '@/utils/imageUtils'

interface UserSearchResultsProps {
  results: PaginatedResponse<User> | null | undefined
  loading: boolean
  onStartChat: (userId: string, user: User) => void
}

export function UserSearchResults({
  results,
  loading,
  onStartChat,
}: UserSearchResultsProps) {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 divide-y divide-gray-100 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (!results || results.content.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full blur-xl opacity-20"></div>
            <div className="relative rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-6 shadow-inner">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy người dùng nào
          </h3>
          <p className="text-gray-600 max-w-md text-sm leading-relaxed">
            Hãy thử tìm kiếm với tên hoặc email khác
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {results.content.map((user, index) => {
          const displayName = user.fullName || user.username || 'Không có tên'

          return (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 p-4 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-colors duration-300 animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  src={getImageUrl(
                    user.avatarUrl || '/images/default-avatar.png',
                  )}
                  alt={displayName}
                  className="h-12 w-12 flex-shrink-0 ring-2 ring-gray-200"
                  size={48}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    @{user.username}
                  </p>
                  {user.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {user.description}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => onStartChat(user.id, user)}
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Nhắn tin</span>
              </Button>
            </div>
          )
        })}
      </div>

      {/* Pagination info */}
      {results && results.totalElements > 0 && (
        <div className="px-4 py-3 bg-gray-50/50 text-xs text-gray-600 text-center">
          Hiển thị {results.content.length} trên {results.totalElements} kết quả
        </div>
      )}
    </div>
  )
}
