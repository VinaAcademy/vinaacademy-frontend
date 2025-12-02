/**
 * AttachmentUploader Component
 * Allows instructors to upload and attach documents to lessons
 */

'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, FileText, AlertCircle } from 'lucide-react'
import { uploadDocument } from '@/services/documentService'
import { MediaFileDto as UploadedFileDto } from '@/types/file-type'
import { MediaFileDto } from '@/types/lesson'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'

interface AttachmentUploaderProps {
  onFileUploaded: (file: MediaFileDto) => void
  disabled?: boolean
  maxSizeMB?: number
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
]

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.zip',
]

export default function AttachmentUploader({
  onFileUploaded,
  disabled = false,
  maxSizeMB = 50,
}: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (
      !ALLOWED_EXTENSIONS.includes(extension) &&
      !ALLOWED_TYPES.includes(file.type)
    ) {
      return 'Định dạng file không được hỗ trợ. Chỉ chấp nhận: PDF, Word, Excel, PowerPoint, ZIP, TXT'
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      createErrorToast(validationError)
      return
    }

    setUploading(true)
    try {
      const uploadedFile = await uploadDocument(file)

      if (uploadedFile) {
        // Map from upload response to MediaFileDto
        const mediaFile: MediaFileDto = {
          id: uploadedFile.id,
          userId: uploadedFile.userId,
          fileName: uploadedFile.fileName,
          fileType: uploadedFile.fileType as any,
          mimeType: uploadedFile.mimeType,
          fileSize: uploadedFile.size,
          filePath: uploadedFile.filePath,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        }

        onFileUploaded(mediaFile)
        createSuccessToast('Tải file lên thành công!')
      } else {
        createErrorToast('Không thể tải file lên. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      createErrorToast('Đã có lỗi xảy ra khi tải file lên')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileInputChange}
        disabled={disabled || uploading}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50/50'}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Đang tải file lên...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Kéo thả file hoặc click để chọn
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Word, Excel, PowerPoint, ZIP, TXT (tối đa {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Tài liệu đính kèm sẽ hiển thị trong bài giảng để học viên có thể tải
          xuống. Hãy đảm bảo nội dung phù hợp và không vi phạm bản quyền.
        </p>
      </div>
    </div>
  )
}
