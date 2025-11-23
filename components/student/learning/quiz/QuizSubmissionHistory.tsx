import { FC } from 'react'
import { QuizSubmissionResultDto } from '@/types/quiz'
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { calculateDuration, getTimeAgo } from '@/utils/dateUtils'

interface QuizSubmissionHistoryProps {
  quizId: string
  submissions: QuizSubmissionResultDto[] | null
  isLoading: boolean
  onSelectSubmission: (submission: QuizSubmissionResultDto) => void
}

const QuizSubmissionHistory: FC<QuizSubmissionHistoryProps> = ({
  submissions,
  isLoading,
  onSelectSubmission,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-4" />
        <p className="text-gray-600">Đang tải lịch sử làm bài...</p>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Clock className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Chưa có lịch sử làm bài
        </h3>
        <p className="text-gray-500">
          Bạn chưa hoàn thành bài kiểm tra này lần nào.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900">
          Lịch sử làm bài ({submissions.length} lần)
        </h3>
        <p className="text-sm text-gray-500">
          Chọn một lần làm bài để xem chi tiết
        </p>
      </div>

      <div className="p-1 max-h-[400px] overflow-y-auto">
        <div className="space-y-1">
          {submissions.map((submission, index) => (
            <button
              key={submission.id}
              className="w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => onSelectSubmission(submission)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                      submission.isPassed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {submission.isPassed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Lần {submissions.length - index}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(submission.startTime)}
                      <span className="text-gray-400 text-xs ml-2">
                        ({getTimeAgo(submission.startTime)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.score}/{submission.totalPoints} điểm
                    </div>
                    <div className="text-xs text-gray-500">
                      Thời gian:{' '}
                      {calculateDuration(
                        submission.startTime,
                        submission.endTime,
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuizSubmissionHistory
