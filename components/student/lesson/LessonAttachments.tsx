/**
 * LessonAttachments Component (Student View)
 * Displays downloadable attachments for students in lesson view
 */

'use client'

import {
  FileText,
  Download,
  File,
  FileSpreadsheet,
  FileImage,
  Video,
  ExternalLink,
} from 'lucide-react'
import { MediaFileDto } from '@/types/lesson'
import { motion } from 'framer-motion'
import { getAttachmentDownloadUrl } from '@/services/lessonAttachmentService'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'
import { useState } from 'react'

interface LessonAttachmentsProps {
  lessonId: string
  attachments?: MediaFileDto[]
}

const getFileIcon = (mimeType?: string, fileName?: string) => {
  if (!mimeType && !fileName) return <File className="h-5 w-5 text-gray-500" />

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
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toUpperCase() || 'FILE'
}

export default function LessonAttachments({
  lessonId,
  attachments,
}: LessonAttachmentsProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  if (!attachments || attachments.length === 0) {
    return null
  }

  const handleDownload = async (attachment: MediaFileDto) => {
    setDownloadingId(attachment.id)

    try {
      // Get presigned URL from backend
      const presignedUrl = await getAttachmentDownloadUrl(
        lessonId,
        attachment.id,
      )

      if (!presignedUrl) {
        throw new Error('Failed to get download URL')
      }

      // Open presigned URL in new tab to trigger download
      window.open(presignedUrl, '_blank')
      createSuccessToast('Tải xuống đang bắt đầu...')
    } catch (error) {
      console.error('Download error:', error)
      createErrorToast('Không thể tải xuống tài liệu. Vui lòng thử lại sau.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Tài liệu đính kèm
            </h3>
            <p className="text-sm text-gray-600">
              {attachments.length} tài liệu có sẵn để tải xuống
            </p>
          </div>
        </div>
      </div>

      {/* Attachment List */}
      <div className="p-6 space-y-3">
        {attachments.map((attachment, index) => (
          <motion.div
            key={attachment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="group relative"
          >
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-white hover:shadow-md transition-all duration-200">
              {/* File Icon */}
              <div className="flex-shrink-0 p-3 bg-white border border-gray-200 rounded-lg transition-all">
                {getFileIcon(attachment.mimeType, attachment.fileName)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
                  {attachment.fileName}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    {getFileExtension(attachment.fileName)}
                  </span>
                  {attachment.fileSize && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-600">
                        {formatFileSize(attachment.fileSize)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(attachment)}
                disabled={downloadingId === attachment.id}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {downloadingId === attachment.id ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span className="hidden sm:inline">Đang tải...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {/* <span className="hidden sm:inline">Tải xuống</span> */}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <ExternalLink className="h-3.5 w-3.5" />
          <p>
            Tài liệu này được cung cấp bởi giảng viên để hỗ trợ quá trình học
            tập của bạn
          </p>
        </div>
      </div>
    </div>
  )
}
