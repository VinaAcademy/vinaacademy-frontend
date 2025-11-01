"use client";

import { FC, useState, useEffect } from 'react';
import { getQuiz, getSubmissionHistory, getLatestSubmission } from '@/services/quizService';
import { QuizDto, QuizSubmissionResultDto } from '@/types/quiz';
import { 
  AlertTriangle, Play, History, Award, Clock, CheckCircle, 
  XCircle, ArrowLeft, FileText, BarChart
} from 'lucide-react';
import QuizSubmissionHistory from '../quiz/QuizSubmissionHistory';
import QuizResults from '../quiz/QuizResults';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Quiz } from '@/types/lecture';
import { useQueryClient } from '@tanstack/react-query';
import {LESSON_KEYS} from "@/config/query-keys.config";

interface QuizLandingProps {
  quizId: string;
  onStartQuiz: () => void;
  onLessonCompleted?: () => void;
  courseSlug?: string;
  isCompleted?: boolean; // New prop to track if the lesson is already completed
}

const QuizLanding: FC<QuizLandingProps> = ({ quizId, onStartQuiz, onLessonCompleted, courseSlug, isCompleted = false }) => {
  const queryClient = useQueryClient();
  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<QuizSubmissionResultDto | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmissionResultDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmissionResultDto | null>(null);
  const [mappedQuiz, setMappedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        // Fetch quiz data
        const quizData = await getQuiz(quizId);
        if (quizData) {
          setQuiz(quizData);

          // Map API response to Quiz type for QuizResults component
          const mapped: Quiz = {
            title: quizData.title || 'Kiểm tra kiến thức',
            questions: quizData.questions.map(q => ({
              id: q.id,
              text: q.questionText,
              type: mapQuestionType(q.questionType),
              options: q.answers.map(a => ({
                id: a.id,
                text: a.answerText,
                isCorrect: a.isCorrect || false
              })),
              explanation: q.explanation,
              points: q.point,
              isRequired: true
            })),
            settings: {
              randomizeQuestions: quizData.randomizeQuestions,
              showCorrectAnswers: quizData.showCorrectAnswers,
              allowRetake: quizData.allowRetake,
              requirePassingScore: quizData.requirePassingScore,
              passingScore: quizData.passingScore,
              timeLimit: quizData.timeLimit
            },
            totalPoints: quizData.totalPoints,
          };

          setMappedQuiz(mapped);
        }

        const latestSub = await getLatestSubmission(quizId);
        if (latestSub) {
          setLatestSubmission(latestSub);
        }

      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to map API question types to UI types
    const mapQuestionType = (type: string): 'single_choice' | 'multiple_choice' | 'text' | 'true_false' => {
      switch (type) {
        case 'SINGLE_CHOICE':
          return 'single_choice';
        case 'MULTIPLE_CHOICE':
          return 'multiple_choice';
        case 'TEXT':
          return 'text';
        case 'TRUE_FALSE':
          return 'true_false';
        default:
          return 'single_choice';
      }
    };

    fetchQuizData().then();
  }, [quizId, isCompleted]);

  const handleViewHistory = async () => {
    setLoadingHistory(true);
    setShowHistory(true);
    setSelectedSubmission(null);

    try {
      const history = await getSubmissionHistory(quizId);
      setSubmissions(history);
    } catch (error) {
      console.error("Error fetching submission history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectSubmission = async (submission: QuizSubmissionResultDto) => {
    setSelectedSubmission(submission);

    // If the selected submission is passed and we have callbacks
    if (submission.isPassed && onLessonCompleted && courseSlug) {
      // Invalidate the query
      await queryClient.invalidateQueries({
        queryKey: LESSON_KEYS.listByCourse(courseSlug)
      });

      // Call the callback
      onLessonCompleted();
    }
  };

  const handleBackToHistory = () => {
    setSelectedSubmission(null);
    setShowHistory(true);
  };

  const handleBackToLanding = () => {
    setSelectedSubmission(null);
    setShowHistory(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: vi
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Không thể tải bài kiểm tra</h2>
        <p className="text-gray-600 mb-4 text-center max-w-md">Có lỗi xảy ra khi tải thông tin bài kiểm tra. Vui lòng thử lại sau.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  // Check if quiz is blocked due to previous attempts
  const isQuizBlocked = latestSubmission && !quiz.allowRetake;

  // If a submission is selected, show its detailed results
  if (selectedSubmission && mappedQuiz) {
    // Generate empty placeholder objects for selectedAnswers and textAnswers
    // In a real implementation, we'd fetch the actual user answers from the API
    const dummySelectedAnswers: Record<string, string[]> = {};
    const dummyTextAnswers: Record<string, string> = {};

    // Create dummy results to show the selected submission
    const submissionResults = {
      totalScore: selectedSubmission.score,
      maxScore: selectedSubmission.totalPoints,
      percentageScore: (selectedSubmission.score / selectedSubmission.totalPoints) * 100,
      passed: selectedSubmission.isPassed,
      results: selectedSubmission.answers.map(answer => ({
        questionId: answer.questionId,
        correct: answer.isCorrect,
        score: answer.earnedPoints,
        userAnswer: answer.textAnswer ? answer.textAnswer :
          answer.answers.filter(a => a.isSelected).map(a => a.id),
        explanation: answer.explanation,
        correctAnswers: answer.answers.filter(a => a.isCorrect).map(a => a.id)
      }))
    };

    // For each answer, populate the dummy objects with the user's selections
    selectedSubmission.answers.forEach(answer => {
      if (answer.textAnswer) {
        dummyTextAnswers[answer.questionId] = answer.textAnswer;
      } else {
        dummySelectedAnswers[answer.questionId] = answer.answers
          .filter(a => a.isSelected)
          .map(a => a.id);
      }
    });

    return (
      <div className="w-full px-4 max-w-4xl mx-auto py-6 md:py-8 animate-fadeIn">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-blue-800 font-medium">Xem kết quả bài làm</div>
              <div className="text-sm text-blue-600">
                Ngày làm bài: {formatDate(selectedSubmission.startTime)}
              </div>
            </div>
            <button
              onClick={handleBackToHistory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại lịch sử
            </button>
          </div>
        </div>

        <QuizResults
          quiz={mappedQuiz}
          quizResults={submissionResults}
          selectedAnswers={dummySelectedAnswers}
          textAnswers={dummyTextAnswers}
          apiResult={selectedSubmission}
          showCorrectAnswers={mappedQuiz.settings.showCorrectAnswers}
        />
      </div>
    );
  }

  return (
    <div className="w-full px-4 max-w-4xl mx-auto py-6 md:py-8 animate-fadeIn">
      {showHistory ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
          <div className="p-5 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <History className="h-5 w-5 text-blue-600 mr-2" />
              Lịch sử làm bài
            </h2>
            <button
              onClick={handleBackToLanding}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại bài kiểm tra
            </button>
          </div>
          <QuizSubmissionHistory
            quizId={quizId}
            submissions={submissions}
            isLoading={loadingHistory}
            onSelectSubmission={handleSelectSubmission}
          />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
          {/* Quiz Header with gradient background */}
          <div className="p-5 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>

          {/* Quiz Info Cards - Responsive grid layout */}
          <div className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-center transition-transform duration-200 hover:scale-105">
              <Award className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm text-blue-700 font-semibold">Điểm tối đa</div>
                <div className="text-xl font-bold">{quiz.totalPoints} điểm</div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg flex items-center transition-transform duration-200 hover:scale-105">
              <Clock className="h-8 w-8 text-amber-600 mr-3 flex-shrink-0" />
              <div>
                <div className="text-sm text-amber-700 font-semibold">Thời gian làm bài</div>
                <div className="text-xl font-bold">
                  {quiz.timeLimit > 0 ? `${quiz.timeLimit} phút` : 'Không giới hạn'}
                </div>
              </div>
            </div>

            <div className={`${quiz.requirePassingScore ? 'bg-green-50' : 'bg-violet-50'} p-4 rounded-lg flex items-center transition-transform duration-200 hover:scale-105`}>
              {quiz.requirePassingScore ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-green-700 font-semibold">Điểm đạt</div>
                    <div className="text-xl font-bold">{quiz.passingScore}%</div>
                  </div>
                </>
              ) : (
                <>
                  <BarChart className="h-8 w-8 text-violet-600 mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-violet-700 font-semibold">Số câu hỏi</div>
                    <div className="text-xl font-bold">{quiz.questions?.length || 0}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Latest submission info with conditional styling */}
          {latestSubmission && (
            <div className={`p-5 md:p-6 border-t border-b border-gray-200 ${
              latestSubmission.isPassed ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-red-50 to-red-100'
            }`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Lần làm gần đây nhất
              </h3>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    {latestSubmission.isPassed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-semibold ${latestSubmission.isPassed ? 'text-green-700' : 'text-red-700'}`}>
                      {latestSubmission.isPassed ? 'Đạt yêu cầu' : 'Chưa đạt yêu cầu'}
                    </span>
                  </div>
                  <div className="text-gray-700 flex flex-wrap items-center gap-x-6">
                    <span className="font-medium flex items-center">
                      <Award className="h-4 w-4 mr-1.5" />
                      Điểm số: <span className="font-semibold ml-1">{latestSubmission.score}/{latestSubmission.totalPoints}</span>
                    </span>
                    <span className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      Thời gian: <span className="ml-1">{getTimeAgo(latestSubmission.startTime)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleViewHistory}
                    className="px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors duration-200 flex items-center justify-center font-medium focus:ring-2 focus:ring-indigo-300"
                  >
                    <History className="h-4 w-4 mr-1.5" /> Xem lịch sử làm bài
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Rules with better visual grouping */}
          <div className="p-5 md:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Quy định bài kiểm tra
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                <span>Bài kiểm tra gồm <strong>{quiz.questions?.length || 0} câu hỏi</strong></span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                <span>
                  {quiz.timeLimit > 0
                    ? <><strong>Thời gian làm bài</strong>: {quiz.timeLimit} phút</>
                    : 'Không giới hạn thời gian làm bài'}
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                <span>
                  {quiz.requirePassingScore
                    ? <><strong>Điểm đạt tối thiểu</strong>: {quiz.passingScore}%</>
                    : 'Không yêu cầu điểm đạt tối thiểu'}
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                <span>
                  {quiz.allowRetake
                    ? <strong>Được phép làm lại bài nhiều lần</strong>
                    : <strong>Bài kiểm tra chỉ được làm một lần duy nhất</strong>}
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                <span>
                  {quiz.showCorrectAnswers
                    ? 'Đáp án đúng sẽ được hiển thị sau khi nộp bài'
                    : 'Đáp án đúng sẽ không được hiển thị sau khi nộp bài'}
                </span>
              </div>
              {quiz.randomizeQuestions && (
                <div className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  <span>Thứ tự câu hỏi sẽ được xáo trộn ngẫu nhiên</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons with improved styling and responsive layout */}
          <div className="p-5 md:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Quay lại bài học
            </button>

            {isQuizBlocked ? (
              <div className="flex items-center text-gray-600 bg-amber-50 px-4 py-2.5 rounded-md border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <span>Bạn đã hoàn thành bài kiểm tra này</span>
              </div>
            ) : (
              <button
                onClick={onStartQuiz}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Play className="h-4 w-4 mr-2" /> Bắt đầu làm bài
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default QuizLanding;