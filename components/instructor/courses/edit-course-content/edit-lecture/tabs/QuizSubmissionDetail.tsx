'use client'

import { QuizSubmissionResultDto } from '@/types/quiz'
import { X, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface QuizSubmissionDetailProps {
  submission: QuizSubmissionResultDto
  studentName: string
  onBack: () => void
  onClose: () => void
}

export default function QuizSubmissionDetail({
  submission,
  studentName,
  onBack,
  onClose,
}: QuizSubmissionDetailProps) {
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

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()

    const minutes = Math.floor(durationMs / (1000 * 60))
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

    return `${minutes} phút ${seconds} giây`
  }

  const correctAnswersCount = submission.answers.filter(
    (a) => a.isCorrect,
  ).length
  const percentage = (
    (submission.score / submission.totalPoints) *
    100
  ).toFixed(1)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết bài làm
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Sinh viên</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {studentName}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Điểm</p>
              <p className="text-sm font-semibold text-blue-600">
                {submission.score}/{submission.totalPoints} ({percentage}%)
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  submission.isPassed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {submission.isPassed ? 'Đạt' : 'Không đạt'}
              </span>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Thời gian</p>
              <p className="text-sm font-semibold text-gray-900">
                {calculateDuration(submission.startTime, submission.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Kết quả chi tiết ({correctAnswersCount}/
                {submission.answers.length} câu đúng)
              </h3>
              <p className="text-sm text-gray-500">
                Nộp lúc: {formatDate(submission.startTime)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {submission.answers.map((answer, index) => (
              <div
                key={answer.questionId}
                className={`border rounded-lg p-5 ${
                  answer.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        answer.isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {answer.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Câu {index + 1}: {answer.questionText}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span
                          className={`font-medium ${
                            answer.isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {answer.isCorrect ? 'Đúng' : 'Sai'}
                        </span>
                        <span className="text-gray-600">
                          {answer.earnedPoints}/{answer.points} điểm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                <div className="ml-11 space-y-2">
                  {answer.answers.map((ans, ansIndex) => {
                    const isCorrect = ans.isCorrect
                    const isSelected = ans.isSelected

                    return (
                      <div
                        key={ansIndex}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'border-green-300 bg-green-100'
                            : isSelected
                              ? 'border-red-300 bg-red-100'
                              : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isSelected && (
                            <div
                              className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                isCorrect
                                  ? 'border-green-600 bg-green-600'
                                  : 'border-red-600 bg-red-600'
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              ) : (
                                <XCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
                          )}
                          {!isSelected && isCorrect && (
                            <div className="flex-shrink-0 h-5 w-5 rounded-full border-2 border-green-600 bg-green-600 flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {!isSelected && !isCorrect && (
                            <div className="flex-shrink-0 h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                          <span
                            className={`text-sm ${
                              isCorrect
                                ? 'font-semibold text-green-900'
                                : isSelected
                                  ? 'font-semibold text-red-900'
                                  : 'text-gray-700'
                            }`}
                          >
                            {ans.text}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Explanation */}
                  {answer.explanation && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Giải thích:
                          </p>
                          <p className="text-sm text-blue-800">
                            {answer.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Quay lại
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
