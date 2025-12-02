/**
 * AttachmentList Component
 * Displays and manages lesson attachments for instructors
 */

'use client'

import { useState } from 'react'
import {
  FileText,
  Download,
  Trash2,
  File,
  FileSpreadsheet,
  FileImage,
  Video,
  X,
} from 'lucide-react'
import { MediaFileDto } from '@/types/lesson'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'
import { motion, AnimatePresence } from 'framer-motion'

interface AttachmentListProps {
  attachments: MediaFileDto[]
  onRemove: (fileId: string) => void
  editable?: boolean
}

const getFileIcon = (mimeType?: string, fileName?: string) => {
  if (!mimeType && !fileName) return <File className="h-5 w-5" />

  const type = mimeType?.toLowerCase() || ''
  const ext = fileName?.toLowerCase().split('.').pop() || ''

  if (type.includes('pdf') || ext === 'pdf') {
    return <FileText className="h-5 w-5 text-red-500" />
  }
  if (type.includes('word') || ext === 'doc' || ext === 'docx') {
    return <FileText className="h-5 w-5 text-blue-500" />
  }
  if (
    type.includes('excel') ||
    type.includes('spreadsheet') ||
    ext === 'xls' ||
    ext === 'xlsx'
  ) {
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />
  }
  if (
    type.includes('powerpoint') ||
    type.includes('presentation') ||
    ext === 'ppt' ||
    ext === 'pptx'
  ) {
    return <FileImage className="h-5 w-5 text-orange-500" />
  }
  if (
    type.includes('video') ||
    ext === 'mp4' ||
    ext === 'avi' ||
    ext === 'mov'
  ) {
    return <Video className="h-5 w-5 text-purple-500" />
  }
  if (
    type.includes('image') ||
    ext === 'jpg' ||
    ext === 'png' ||
    ext === 'gif'
  ) {
    return <FileImage className="h-5 w-5 text-pink-500" />
  }

  return <File className="h-5 w-5 text-gray-500" />
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentList({
  attachments,
  onRemove,
  editable = true,
}: AttachmentListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemove = async (fileId: string) => {
    if (!editable) return

    setRemovingId(fileId)
    try {
      await onRemove(fileId)
    } finally {
      setRemovingId(null)
    }
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600">Chưa có tài liệu đính kèm</p>
        {editable && (
          <p className="text-xs text-gray-500 mt-1">
            Thêm tài liệu để học viên có thể tải xuống
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {attachments.map((attachment, index) => (
          <motion.div
            key={attachment.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group relative flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(attachment.mimeType, attachment.fileName)}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.fileName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatFileSize(attachment.fileSize)}
                </span>
                {attachment.mimeType && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-500">
                      {attachment.mimeType.split('/')[1]?.toUpperCase() ||
                        'FILE'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {editable && (
                <button
                  onClick={() => handleRemove(attachment.id)}
                  disabled={removingId === attachment.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  title="Xóa tài liệu"
                >
                  {removingId === attachment.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Remove indicator */}
            {removingId === attachment.id && (
              <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                <div className="text-sm text-gray-600">Đang xóa...</div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Summary */}
      <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{attachments.length} tài liệu đính kèm</span>
        <span>
          Tổng:{' '}
          {formatFileSize(
            attachments.reduce((sum, file) => sum + (file.fileSize || 0), 0),
          )}
        </span>
      </div>
    </div>
  )
}
