'use client'

import { useState } from 'react'
import { QuizStudentAttemptsDto, QuizSubmissionResultDto } from '@/types/quiz'
import { X, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import QuizSubmissionDetail from './QuizSubmissionDetail'
import { calculateDuration, formatDate, getTimeAgo } from '@/utils/dateUtils'
import { getImageUrl } from '@/utils/imageUtils'

interface StudentAttemptsModalProps {
  student: QuizStudentAttemptsDto
  onClose: () => void
}

export default function StudentAttemptsModal({
  student,
  onClose,
}: StudentAttemptsModalProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<QuizSubmissionResultDto | null>(null)

  if (selectedSubmission) {
    return (
      <QuizSubmissionDetail
        submission={selectedSubmission}
        studentName={student.student.fullName}
        onBack={() => setSelectedSubmission(null)}
        onClose={onClose}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Lịch sử làm bài
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Student Info */}
          <div className="flex items-center space-x-4">
            <Avatar
              src={getImageUrl(student.student.avatarUrl || '')}
              alt={student.student.fullName}
              size={56}
              className="h-14 w-14"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {student.student.fullName}
              </h3>
              <p className="text-sm text-gray-500">{student.student.email}</p>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700">
              Tổng số lần làm bài:{' '}
              <span className="text-blue-600">{student.attempts.length}</span>
            </h4>
          </div>

          {student.attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-500">Sinh viên chưa có lần làm bài nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {student.attempts.map((submission, index) => (
                <button
                  key={submission.id}
                  className="w-full text-left px-4 py-4 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-200"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {/* Status Icon */}
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
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

                      {/* Attempt Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">
                            Lần {student.attempts.length - index}
                          </span>
                          {submission.isPassed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Đạt
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(submission.startTime)}
                          <span className="text-gray-400 text-xs ml-2">
                            ({getTimeAgo(submission.startTime)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
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
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
