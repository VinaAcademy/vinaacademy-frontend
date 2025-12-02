/**
 * AttachmentList Component
 * Displays uploaded attachments with options to download or remove
 */

'use client'

import { FileText, Download, Trash2, File } from 'lucide-react'
import { MediaFileDto } from '@/types/lesson'

interface AttachmentListProps {
  attachments: MediaFileDto[]
  onRemove: (attachmentId: string) => void
  disabled?: boolean
}

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return File

  if (mimeType.includes('pdf')) return FileText
  if (mimeType.includes('word') || mimeType.includes('document'))
    return FileText
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return FileText
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return FileText

  return File
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A'

  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`

  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

export default function AttachmentList({
  attachments,
  onRemove,
  disabled = false,
}: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-6 px-4 border-2 border-dashed border-gray-200 rounded-lg">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chưa có tài liệu đính kèm nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.mimeType)

        return (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {attachment.fileName}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(attachment.fileSize)}
                  </span>
                  {attachment.mimeType && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 truncate">
                        {attachment.mimeType.split('/').pop()?.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {attachment.filePath && (
                <a
                  href={attachment.filePath}
                  download={attachment.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Tải xuống"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}

              <button
                type="button"
                onClick={() => onRemove(attachment.id)}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa tài liệu"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
