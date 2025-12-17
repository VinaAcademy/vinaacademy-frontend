'use client'

import { useState, useEffect } from 'react'
import { useLectureEdit } from '@/context/LectureEditContext'
import { getStudentAttempts } from '@/services/quizService'
import { QuizStudentAttemptsDto, QuizSubmissionResultDto } from '@/types/quiz'
import {
  Loader2,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import StudentAttemptsModal from './StudentAttemptsModal'
import { getImageUrl } from '@/utils/imageUtils'

export default function SubmissionsTab() {
  const { lecture } = useLectureEdit()
  const [studentAttempts, setStudentAttempts] = useState<
    QuizStudentAttemptsDto[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] =
    useState<QuizStudentAttemptsDto | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchStudentAttempts = async () => {
      if (!lecture.id) return

      setIsLoading(true)
      const data = await getStudentAttempts(lecture.id)
      if (data) {
        setStudentAttempts(data)
      }
      setIsLoading(false)
    }

    fetchStudentAttempts().then((r) => r)
  }, [lecture.id])

  const handleStudentClick = (student: QuizStudentAttemptsDto) => {
    setSelectedStudent(student)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedStudent(null)
  }

  const calculateAverageScore = (attempts: QuizSubmissionResultDto[]) => {
    if (attempts.length === 0) return 0
    const total = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
    return (total / attempts.length).toFixed(1)
  }

  const getBestScore = (attempts: QuizSubmissionResultDto[]) => {
    if (attempts.length === 0) return 0
    return Math.max(...attempts.map((a) => a.score))
  }

  const getPassRate = () => {
    if (studentAttempts.length === 0) return 0
    const passedStudents = studentAttempts.filter((sa) =>
      sa.attempts.some((attempt) => attempt.isPassed),
    ).length
    return ((passedStudents / studentAttempts.length) * 100).toFixed(0)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <span className="text-lg font-medium text-blue-700">
          Đang tải dữ liệu bài làm sinh viên...
        </span>
        <p className="text-blue-500 mt-2">Vui lòng đợi trong giây lát</p>
      </div>
    )
  }

  if (studentAttempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Chưa có sinh viên nào làm bài
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Khi có sinh viên hoàn thành bài kiểm tra, bạn sẽ thấy danh sách và kết
          quả của họ tại đây.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Tổng sinh viên
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {studentAttempts.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Tỷ lệ học viên đạt
              </p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {getPassRate()}%
              </p>
            </div>
            <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">
                Tổng lượt làm
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {studentAttempts.reduce(
                  (sum, sa) => sum + sa.attempts.length,
                  0,
                )}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách sinh viên ({studentAttempts.length})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Nhấn vào sinh viên để xem chi tiết các lần làm bài
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {studentAttempts.map((studentAttempt) => {
            const avgScore = calculateAverageScore(studentAttempt.attempts)
            const bestScore = getBestScore(studentAttempt.attempts)
            const hasPassed = studentAttempt.attempts.some((a) => a.isPassed)

            return (
              <button
                key={studentAttempt.student.id}
                onClick={() => handleStudentClick(studentAttempt)}
                className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar */}
                    <Avatar
                      src={getImageUrl(
                        studentAttempt.student?.avatarUrl ||
                          '/images/default-avatar.png',
                      )}
                      alt={studentAttempt.student.fullName}
                      size={48}
                      className="h-12 w-12"
                    />

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {studentAttempt.student.fullName}
                        </p>
                        {hasPassed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Đạt
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {studentAttempt.student.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-8 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Số lần làm</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {studentAttempt.attempts.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Điểm TB</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {avgScore}/
                        {studentAttempt.attempts[0]?.totalPoints || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Điểm cao nhất</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {bestScore}/
                        {studentAttempt.attempts[0]?.totalPoints || 0}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal for Student Attempts */}
      {showModal && selectedStudent && (
        <StudentAttemptsModal
          student={selectedStudent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
