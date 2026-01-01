import React, { useState } from 'react'
import {
  Book,
  ChevronLeft,
  Info,
  Loader2,
  PlusCircle,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CourseContentHeaderProps {
  courseId: string
  courseName?: string
  courseImage?: string
  courseStatus?: string
  onAddSection: () => void
  onSubmitForReview?: () => Promise<void>
}

export const CourseContentHeader = ({
  courseId,
  courseName = 'Khóa học',
  courseImage,
  courseStatus,
  onAddSection,
  onSubmitForReview,
}: CourseContentHeaderProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false)

  const handleSubmitForReview = async () => {
    if (!onSubmitForReview) return
    setIsSubmitting(true)
    try {
      await onSubmitForReview()
      setIsConfirmSubmitOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Bản nháp'
      case 'published':
        return 'Đã xuất bản'
      case 'pending':
        return 'Chờ duyệt'
      case 'rejected':
        return 'Bị từ chối'
      default:
        return 'Không xác định'
    }
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-start space-x-4">
            <Link
              href={`/instructor/courses/${courseId}/edit`}
              className="hidden sm:flex items-center justify-center p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </div>
            </Link>

            <div className="flex items-start sm:items-center flex-col sm:flex-row sm:space-x-4">
              {courseImage && (
                <div className="relative h-12 w-20 rounded-md overflow-hidden mb-2 sm:mb-0">
                  <Image
                    src={courseImage}
                    alt={courseName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md lg:max-w-lg">
                    {courseName}
                  </h1>
                  <Badge
                    className={`${getStatusColor(courseStatus)} text-xs font-medium py-1`}
                  >
                    {getStatusText(courseStatus)}
                  </Badge>
                </div>
                <div className="flex items-center mt-1">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 mr-2"
                  >
                    <Book className="h-3.5 w-3.5 mr-1" />
                    Nội dung
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-gray-500 cursor-help">
                          <Info className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-64 text-sm">
                          Thêm phần học và bài giảng cho khóa học của bạn. Bạn
                          có thể sắp xếp lại chúng bằng cách kéo thả.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {courseStatus?.toLowerCase() === 'draft' && onSubmitForReview && (
              <Button
                onClick={() => setIsConfirmSubmitOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Gửi phê duyệt</span>
                <span className="sm:hidden">Gửi</span>
              </Button>
            )}
            <Button
              onClick={onAddSection}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Thêm phần học mới
            </Button>
          </div>
        </div>
      </div>

      {/* Submit for Review Dialog */}
      <AlertDialog
        open={isConfirmSubmitOpen}
        onOpenChange={setIsConfirmSubmitOpen}
      >
        <AlertDialogContent className="bg-white rounded-xl shadow-xl border-0 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Gửi khóa học để phê duyệt
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn chuẩn bị gửi khóa học này để phê duyệt. Khóa học sẽ được quản
              trị viên xem xét trước khi được xuất bản. Bạn có muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isSubmitting}
              className="font-medium border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleSubmitForReview()
              }}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                'Xác nhận gửi'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
