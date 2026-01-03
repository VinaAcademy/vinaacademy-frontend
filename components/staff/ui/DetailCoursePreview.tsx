import { Loader, CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { CourseDetailsResponse, LessonType, LessonStatus } from '@/types/course'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { moderateLessons } from '@/services/lessonService'
import { useToast } from '@/hooks/use-toast'

// Course details preview dialog component
const CourseDetailsPreview = ({
  courseDetails,
  isOpen,
  onClose,
  onLessonClick,
  onLessonApprove,
}: {
  courseDetails: CourseDetailsResponse | null
  isOpen: boolean
  onClose: () => void
  onLessonClick: (
    lessonId: string,
    lessonType: LessonType,
    videoDuration?: number,
    readingContent?: string,
    attachments?: any[],
    updatedDate?: string | number[],
    lessonStatus?: LessonStatus,
  ) => void
  onLessonApprove?: () => void
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [rejectLessonId, setRejectLessonId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [rejectSubmitting, setRejectSubmitting] = useState<boolean>(false)
  const { toast } = useToast()

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleApproveLesson = async (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation()
    try {
      const success = await moderateLessons({
        lessonIds: [lessonId],
        status: 'PUBLISHED',
      })
      if (success) {
        toast({
          title: 'Thành công',
          description: 'Đã phê duyệt bài học',
          variant: 'default',
          className: 'bg-green-500 text-white border-none',
        })
        onLessonApprove?.()
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể phê duyệt bài học',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi',
        variant: 'destructive',
      })
    }
  }

  const handleRejectLesson = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation()
    setRejectLessonId(lessonId)
    setRejectReason('')
  }

  const handleConfirmReject = async () => {
    if (!rejectLessonId) return
    if (!rejectReason.trim()) {
      toast({
        title: 'Thiếu lý do',
        description: 'Vui lòng nhập lý do từ chối bài học.',
        variant: 'destructive',
      })
      return
    }

    try {
      setRejectSubmitting(true)
      const success = await moderateLessons({
        lessonIds: [rejectLessonId],
        status: 'REJECTED',
        content: rejectReason.trim(),
      })
      if (success) {
        toast({
          title: 'Thành công',
          description: 'Đã từ chối bài học',
          variant: 'default',
          className: 'bg-green-500 text-white border-none',
        })
        onLessonApprove?.()
        setRejectLessonId(null)
        setRejectReason('')
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể từ chối bài học',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi',
        variant: 'destructive',
      })
    } finally {
      setRejectSubmitting(false)
    }
  }

  if (!isOpen) return null
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogTitle className="sr-only">Chi tiết bài học</DialogTitle>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : courseDetails && courseDetails?.sections ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {courseDetails.name}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Nội dung khóa học</h3>
                <div className="space-y-4">
                  {courseDetails.sections.map((section) => (
                    <div
                      key={section.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 p-3 font-medium">
                        {section.orderIndex}. {section.title}
                      </div>
                      <ul className="divide-y">
                        {section.lessons?.map((lesson) => {
                          // Format updatedDate
                          const formatUpdatedDate = (
                            updatedDate?: string | number[],
                          ) => {
                            if (!updatedDate) return ''

                            try {
                              let date: Date
                              if (Array.isArray(updatedDate)) {
                                // Spring Boot array format: [year, month, day, hour, minute, second]
                                date = new Date(
                                  updatedDate[0],
                                  updatedDate[1] - 1,
                                  updatedDate[2],
                                  updatedDate[3] || 0,
                                  updatedDate[4] || 0,
                                )
                              } else {
                                // ISO string format
                                date = new Date(updatedDate)
                              }

                              return date.toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            } catch (error) {
                              return ''
                            }
                          }

                          return (
                            <li
                              key={lesson.id}
                              className="p-3 cursor-pointer hover:bg-gray-50"
                              onClick={() =>
                                onLessonClick(
                                  lesson.id,
                                  lesson.type,
                                  lesson.videoDuration,
                                  lesson.content,
                                  lesson.attachments,
                                  lesson.updatedDate,
                                  lesson.lessonStatus,
                                )
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start flex-1">
                                  {lesson.type === 'VIDEO' && (
                                    <svg
                                      className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                      ></path>
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      ></path>
                                    </svg>
                                  )}
                                  {lesson.type === 'READING' && (
                                    <svg
                                      className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                      ></path>
                                    </svg>
                                  )}
                                  {lesson.type === 'QUIZ' && (
                                    <svg
                                      className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      ></path>
                                    </svg>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span>
                                        {lesson.orderIndex}. {lesson.title}
                                      </span>
                                      {lesson.free && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                          Free
                                        </span>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={getStatusColor(
                                          lesson.lessonStatus,
                                        )}
                                      >
                                        {getStatusText(lesson.lessonStatus)}
                                      </Badge>
                                    </div>
                                    {lesson.updatedDate && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Cập nhật:{' '}
                                        {formatUpdatedDate(lesson.updatedDate)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  {lesson.lessonStatus === 'PENDING' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                                        onClick={(e) =>
                                          handleRejectLesson(e, lesson.id)
                                        }
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Từ chối
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                                        onClick={(e) =>
                                          handleApproveLesson(e, lesson.id)
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Duyệt
                                      </Button>
                                    </>
                                  )}
                                  {lesson.type === 'VIDEO' &&
                                    lesson.videoDuration && (
                                      <span className="text-sm text-gray-500 whitespace-nowrap">
                                        {Math.floor(lesson.videoDuration / 60)}:
                                        {String(
                                          lesson.videoDuration % 60,
                                        ).padStart(2, '0')}
                                      </span>
                                    )}
                                  {lesson.type === 'QUIZ' &&
                                    lesson.duration && (
                                      <span className="text-sm text-gray-500 whitespace-nowrap">
                                        {lesson.passPoint}/{lesson.totalPoint}{' '}
                                        điểm - {lesson.duration}p
                                      </span>
                                    )}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy bài học nào</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectLessonId}
        onOpenChange={(open) => {
          if (!open) {
            setRejectLessonId(null)
            setRejectReason('')
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nhập lý do từ chối</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Vui lòng cung cấp lý do từ chối để giảng viên có thể chỉnh sửa lại
              nội dung bài học.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRejectLessonId(null)
                setRejectReason('')
              }}
              disabled={rejectSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmReject} disabled={rejectSubmitting}>
              {rejectSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CourseDetailsPreview
