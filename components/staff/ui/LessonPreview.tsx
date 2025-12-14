'use client'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QuizDto, AnswerDto, QuestionType } from '@/types/quiz' // Adjust import path as needed
import { getQuizForInstructor } from '@/services/quizInstructorService' // Adjust import path as needed
import { AlertTriangle, Loader2, FileText, Download } from 'lucide-react'
import { useHLS } from '@/hooks/video/useHLS'
import SafeHtml from '@/components/common/safe-html'
import { getAttachmentDownloadUrl } from '@/services/lessonAttachmentService'
import { toast } from 'sonner'

interface HLSVideoPreviewProps {
  videoRef: React.MutableRefObject<HTMLVideoElement>
  lectureId: string
}

const HLSVideoPreview: React.FC<HLSVideoPreviewProps> = ({
  videoRef,
  lectureId,
}) => {
  // Use HLS hook to handle streaming
  const { isLoading, error } = useHLS(lectureId, videoRef)

  return (
    <div className="relative w-full aspect-video">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-center">{error}</p>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay
        playsInline
      ></video>
    </div>
  )
}

type lessonPreviewProps = {
  isOpen: boolean
  lessonId: string
  lessonType: string
  readingContent: string
  videoDuration?: number
  attachments?: any[]
  updatedDate?: string
  onClose: () => void
}

const LessonDialogPreview = ({
  isOpen,
  lessonId,
  lessonType,
  videoDuration,
  readingContent,
  attachments = [],
  updatedDate,
  onClose,
}: lessonPreviewProps) => {
  const [quiz, setQuiz] = useState<QuizDto | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsVideoRef = useRef<HTMLVideoElement>(
    null,
  ) as React.MutableRefObject<HTMLVideoElement>

  // Determine if the content is video type
  const isVideoType = lessonType.toLowerCase() === 'video'

  // All content now uses the Dialog, including video
  const dialogOpen = isOpen

  useEffect(() => {
    const fetchQuizData = async () => {
      if (isOpen && lessonType.toLowerCase() === 'quiz' && lessonId) {
        setLoading(true)
        setError(null)
        try {
          const quizData = await getQuizForInstructor(lessonId)
          setQuiz(quizData)
        } catch (err) {
          setError('Failed to load quiz data')
          console.error('Error loading quiz:', err)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchQuizData().then((r) => r)
  }, [isOpen, lessonId, lessonType])

  // Close video and stop playback
  const handleVideoClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    if (hlsVideoRef.current) {
      hlsVideoRef.current.pause()
    }
    onClose()
  }

  // Render answers for a question
  const renderAnswers = (answers: AnswerDto[]) => {
    return answers.map((answer) => (
      <div
        key={answer.id}
        className={`p-3 border rounded-md mb-2 flex items-center ${
          answer.isCorrect ? 'bg-green-50 border-green-300' : 'border-gray-200'
        }`}
      >
        {answer.isCorrect && (
          <svg
            className="w-5 h-5 mr-2 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        <span className={answer.isCorrect ? 'text-green-700 font-medium' : ''}>
          {answer.answerText}
        </span>
      </div>
    ))
  }

  // Render questions
  const renderQuestions = () => {
    if (!quiz || !quiz.questions) return null

    return quiz.questions.map((question, index) => (
      <div key={question.id} className="mb-8 p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between mb-2">
          <h3 className="text-lg font-medium">Question {index + 1}</h3>
          <span className="text-gray-500">{question.point} điểm</span>
        </div>
        <p className="mb-4">{question.questionText}</p>

        {/* Question type indicator */}
        <div className="mb-3 text-sm text-gray-500">
          {question.questionType === QuestionType.MULTIPLE_CHOICE &&
            'Nhiều đáp án'}
          {question.questionType === QuestionType.SINGLE_CHOICE &&
            'Chọn 1 đáp án'}
          {question.questionType === QuestionType.TRUE_FALSE && 'Đúng/Sai'}
        </div>

        {/* Answers */}
        <div className="mb-3">{renderAnswers(question.answers)}</div>

        {/* Explanation if available */}
        {question.explanation && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm font-medium text-blue-700">Giải thích:</p>
            <p className="text-sm text-blue-600">{question.explanation}</p>
          </div>
        )}
      </div>
    ))
  }

  // Render quiz content
  const renderQuizContent = () => {
    if (loading) {
      return <div className="text-center py-6">Đang tải quiz...</div>
    }

    if (error) {
      return <div className="text-center py-6 text-red-500">{error}</div>
    }

    if (!quiz) {
      return <div className="text-center py-6">Không có dữ liệu quiz</div>
    }

    return (
      <div className="py-2">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
          <p className="text-gray-600 mb-3">{quiz.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="font-medium">Tổng điểm:</span> {quiz.totalPoints}
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="font-medium">Điểm để đạt:</span>{' '}
              {quiz.passingScore}
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="font-medium">Thời gian:</span> {quiz.duration}
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="font-medium">Số câu hỏi:</span>{' '}
              {quiz.questions.length}
            </div>
          </div>
        </div>

        <div className="divide-y">{renderQuestions()}</div>
      </div>
    )
  }

  // Render video content
  const renderVideoContent = () => {
    return (
      <div className="py-2">
        <div className="bg-black rounded-lg overflow-hidden">
          {Number(videoDuration || 0) > 0 ? (
            <HLSVideoPreview
              videoRef={hlsVideoRef}
              lectureId={lessonId || ''}
            />
          ) : (
            <video ref={videoRef} className="w-full" controls autoPlay></video>
          )}
        </div>
      </div>
    )
  }

  // Render attachments section
  const renderAttachments = () => {
    if (!attachments || attachments.length === 0) return null

    const handleDownload = async (attachment: any) => {
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
        toast.success('Tải xuống đang bắt đầu...')
      } catch (error) {
        console.error('Download error:', error)
        toast.error('Không thể tải xuống tài liệu. Vui lòng thử lại sau.')
      } finally {
        setDownloadingId(null)
      }
    }

    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Tài liệu đính kèm ({attachments.length})
        </h3>
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id || index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {attachment.fileName || 'Tài liệu'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attachment.fileSize
                      ? `${(attachment.fileSize / 1024 / 1024).toFixed(2)} MB`
                      : 'N/A'}
                    {attachment.mimeType && ` • ${attachment.mimeType}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                  {attachment.fileType || 'DOCUMENT'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  disabled={downloadingId === attachment.id}
                  className="h-8 w-8 p-0"
                  title="Tải xuống"
                >
                  {downloadingId === attachment.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render unknown lesson type content
  const renderReadingContent = () => {
    return (
      <div className="text-gray-600 mb-4">
        <div className="w-full bg-gray-50 p-4 rounded-md border border-gray-200">
          <SafeHtml
            html={readingContent}
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-full"
          />
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return null
  }

  // Determine appropriate dialog size based on content type
  const dialogSizeClass = isVideoType
    ? 'sm:max-w-4xl overflow-hidden'
    : 'sm:max-w-5xl overflow-y-auto max-h-[80vh]'

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => !open && handleVideoClose()}
    >
      <DialogContent className={dialogSizeClass}>
        <DialogHeader>
          <DialogTitle>
            {lessonType.toLowerCase() === 'quiz'
              ? 'Xem trước bài kiểm tra'
              : lessonType.toLowerCase() === 'video'
                ? 'Xem trước video'
                : 'Xem trước bài đọc'}
          </DialogTitle>
          {updatedDate && (
            <p className="text-sm text-gray-500 mt-2">
              Cập nhật lần cuối:{' '}
              {new Date(updatedDate).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {lessonType.toLowerCase() === 'quiz'
            ? renderQuizContent()
            : lessonType.toLowerCase() === 'video'
              ? renderVideoContent()
              : renderReadingContent()}

          {/* Hiển thị attachments cho tất cả loại bài học */}
          {renderAttachments()}
        </div>

        <DialogFooter className="sm:justify-end items-end">
          <Button onClick={handleVideoClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LessonDialogPreview
