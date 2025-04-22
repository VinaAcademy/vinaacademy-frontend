"use client";

import {FC, useState, useEffect, useRef} from 'react';
import {ChevronLeft, ChevronRight, Check, Clock, AlertCircle} from 'lucide-react';
import {Quiz, QuizQuestion as QuizQuestionType} from '@/types/lecture';
import QuizProgress from '../quiz/QuizProgress';
import QuizQuestion from '../quiz/QuizQuestion';
import QuizResults from '../quiz/QuizResults';
import QuizTimer from '../quiz/QuizTimer';
import { getQuiz, startQuiz, submitQuiz, getLatestSubmission, cacheQuizAnswer, getCachedAnswers } from '@/services/quizService';
import { QuizDto, QuizSubmissionRequest, QuizSubmissionResultDto, UserAnswerRequest, QuizSession } from '@/types/quiz';

interface QuizContentProps {
    courseId: string;
    lectureId: string;
}

const QuizContent: FC<QuizContentProps> = ({courseId, lectureId}) => {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
    const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [requireConfirmation, setRequireConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quizResult, setQuizResult] = useState<QuizSubmissionResultDto | null>(null);
    const [previousSubmission, setPreviousSubmission] = useState<QuizSubmissionResultDto | null>(null);
    const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch quiz data and previous submissions from API
    useEffect(() => {
        const fetchQuizData = async () => {
            setLoading(true);
            try {
                // First check if user has already submitted this quiz
                const latestSubmission = await getLatestSubmission(lectureId);
                
                if (latestSubmission) {
                    setPreviousSubmission(latestSubmission);
                }
                
                // Then fetch quiz data
                const quizData = await getQuiz(lectureId);
                
                if (!quizData) {
                    setError("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
                    setLoading(false);
                    return;
                }
                
                // Map API response to our Quiz type
                const mappedQuiz: Quiz = {
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
                        isRequired: true // Default to required for now
                    })),
                    settings: {
                        randomizeQuestions: quizData.randomizeQuestions,
                        showCorrectAnswers: quizData.showCorrectAnswers,
                        allowRetake: quizData.allowRetake,
                        requirePassingScore: quizData.requirePassingScore,
                        passingScore: quizData.passingScore,
                        timeLimit: quizData.timeLimit
                    },
                    totalPoints: quizData.totalPoint
                };
                
                // If randomization is enabled, randomize the questions
                if (mappedQuiz.settings.randomizeQuestions) {
                    mappedQuiz.questions = [...mappedQuiz.questions].sort(() => Math.random() - 0.5);
                }
                
                setQuiz(mappedQuiz);
                
                // Show previous results if quiz doesn't allow retakes and user has already taken it
                if (latestSubmission && !mappedQuiz.settings.allowRetake) {
                    setQuizResult(latestSubmission);
                    setShowResults(true);
                    setLoading(false);
                    return;
                }

                // If the quiz allows retakes and the user wishes to see their previous results
                if (latestSubmission && mappedQuiz.settings.allowRetake) {
                    // Optional: show a button to view previous results or continue to new attempt
                    // For now, we'll just continue with a new attempt
                }
                
                // Start quiz session
                const session = await startQuiz(lectureId);
                
                if (session) {
                    setQuizSession(session);
                    
                    // Initialize timer based on session expiry time if available
                    if (session.expiryTime) {
                        const now = new Date();
                        const expiryTime = new Date(session.expiryTime);
                        const diffInSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);
                        
                        // If the session has already expired
                        if (diffInSeconds <= 0) {
                            setSessionExpired(true);
                            setError("Phiên làm bài đã hết hạn. Vui lòng bắt đầu lại.");
                        } else {
                            setRemainingTime(diffInSeconds);
                        }
                    } else if (mappedQuiz.settings.timeLimit) {
                        // If server doesn't provide expiry time but quiz has time limit
                        setRemainingTime(mappedQuiz.settings.timeLimit * 60); // Convert minutes to seconds
                    }
                    
                    // Retrieve cached answers if any
                    try {
                        const cachedAnswers = await getCachedAnswers(lectureId, session.id);
                        
                        if (cachedAnswers && Object.keys(cachedAnswers).length > 0) {
                            // Process and apply cached answers to current state
                            const newSelectedAnswers: Record<string, string[]> = {};
                            const newTextAnswers: Record<string, string> = {};
                            
                            // Iterate through cached answers to separate selection and text answers
                            Object.values(cachedAnswers).forEach(answer => {
                                if (answer.textAnswer && answer.textAnswer.trim().length > 0) {
                                    newTextAnswers[answer.questionId] = answer.textAnswer;
                                }
                                
                                if (answer.selectedAnswerIds && answer.selectedAnswerIds.length > 0) {
                                    newSelectedAnswers[answer.questionId] = answer.selectedAnswerIds;
                                }
                            });
                            
                            // Update state with cached answers
                            setSelectedAnswers(newSelectedAnswers);
                            setTextAnswers(newTextAnswers);
                            
                            console.log("Loaded cached answers:", Object.keys(cachedAnswers).length);
                        }
                    } catch (err) {
                        console.error("Error loading cached answers:", err);
                        // Non-fatal error, continue with the quiz
                    }
                } else {
                    // Couldn't create a session, but still allow the quiz to proceed with client-side timer
                    if (mappedQuiz.settings.timeLimit) {
                        setRemainingTime(mappedQuiz.settings.timeLimit * 60);
                    }
                    console.warn("Failed to start quiz session. Using client-side timer instead.");
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching quiz:", err);
                setError("Đã xảy ra lỗi khi tải bài kiểm tra. Vui lòng thử lại sau.");
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

        fetchQuizData();
        
        // Clean up timer on unmount
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [lectureId]);

    // Xử lý đếm ngược nếu có giới hạn thời gian
    useEffect(() => {
        if (!remainingTime || isSubmitted || showResults) return;

        // Clear any existing timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        timerIntervalRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev && prev > 0) {
                    return prev - 1;
                } else {
                    // Hết thời gian, tự động submit
                    clearInterval(timerIntervalRef.current!);
                    setSessionExpired(true);
                    handleSubmitQuiz();
                    return 0;
                }
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [remainingTime, isSubmitted, showResults]);

    // Format answers for API submission
    const formatAnswersForSubmission = (): UserAnswerRequest[] => {
        return quiz?.questions.map(question => {
            const selectedIds = selectedAnswers[question.id] || [];
            const textAnswer = textAnswers[question.id] || '';
            
            return {
                questionId: question.id,
                selectedAnswerIds: question.type === 'text' ? [] : selectedIds,
                textAnswer: question.type === 'text' ? textAnswer : undefined
            };
        }) || [];
    };

    // Submit quiz to API
    const submitQuizToApi = async () => {
        if (!quiz) return false;
        
        try {
            const submissionRequest: QuizSubmissionRequest = {
                quizId: lectureId,
                answers: formatAnswersForSubmission()
            };
            
            const result = await submitQuiz(submissionRequest);
            
            if (!result) {
                setError("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
                return false;
            }
            
            // Store the quiz result for display
            setQuizResult(result);
            return true;
        } catch (err) {
            console.error("Error submitting quiz:", err);
            setError("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.");
            return false;
        }
    };

    // Updated handleSubmitQuiz to call API and use the results
    const handleSubmitQuiz = async () => {
        setIsSubmitted(true);
        const submitted = await submitQuizToApi();
        
        if (submitted) {
            setShowResults(true);
            setRequireConfirmation(false);
            
            // Clear the timer
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        } else {
            // Keep showing the quiz if submission failed
            setIsSubmitted(false);
        }
    };

    // Xử lý khi lựa chọn đáp án
    const handleSelectOption = (questionId: string, optionId: string) => {
        const question = quiz?.questions.find(q => q.id === questionId);

        if (!question) return;

        let newSelections: string[] = [];

        if (question.type === 'single_choice' || question.type === 'true_false') {
            // Đối với câu hỏi một lựa chọn, chỉ chọn một đáp án
            newSelections = [optionId];
            setSelectedAnswers({
                ...selectedAnswers,
                [questionId]: newSelections
            });
        } else if (question.type === 'multiple_choice') {
            // Đối với câu hỏi nhiều lựa chọn, toggle lựa chọn
            const currentSelections = selectedAnswers[questionId] || [];
            newSelections = currentSelections.includes(optionId)
                ? currentSelections.filter(id => id !== optionId)
                : [...currentSelections, optionId];

            setSelectedAnswers({
                ...selectedAnswers,
                [questionId]: newSelections
            });
        }

        // Cache the answer selection if we have an active quiz session
        if (quizSession && lectureId) {
            const answerRequest: UserAnswerRequest = {
                questionId: questionId,
                selectedAnswerIds: newSelections,
            };
            
            cacheQuizAnswer(lectureId, answerRequest)
                .catch(error => console.error("Failed to cache answer:", error));
        }
    };

    // Xử lý khi nhập câu trả lời tự luận
    const handleTextAnswer = (questionId: string, text: string) => {
        setTextAnswers({
            ...textAnswers,
            [questionId]: text
        });

        // Cache the text answer if we have an active quiz session
        if (quizSession && lectureId) {
            const answerRequest: UserAnswerRequest = {
                questionId: questionId,
                selectedAnswerIds: [],
                textAnswer: text
            };
            
            cacheQuizAnswer(lectureId, answerRequest)
                .catch(error => console.error("Failed to cache text answer:", error));
        }
    };

    // Kiểm tra xem câu hỏi hiện tại đã được trả lời chưa
    const isCurrentQuestionAnswered = () => {
        if (!currentQuestion) return false;
        
        if (currentQuestion.type === 'text') {
            return textAnswers[currentQuestion.id]?.trim().length > 0;
        } else {
            return selectedAnswers[currentQuestion.id]?.length > 0;
        }
    };

    // Kiểm tra xem tất cả câu hỏi bắt buộc đã được trả lời chưa
    const areRequiredQuestionsAnswered = () => {
        if (!quiz) return false;
        
        return quiz.questions.every(question => {
            if (!question.isRequired) return true;

            if (question.type === 'text') {
                return textAnswers[question.id]?.trim().length > 0;
            } else {
                return selectedAnswers[question.id]?.length > 0;
            }
        });
    };

    // Parse API quiz results to UI-friendly format
    const parseQuizResults = () => {
        if (!quiz || !quizResult) {
            return {
                totalScore: 0,
                maxScore: 0,
                percentageScore: 0,
                passed: false,
                results: []
            };
        }
        
        const results = quiz.questions.map(question => {
            // Find corresponding answer from API response
            const apiAnswer = quizResult.answers.find(a => a.questionId === question.id);

            if (!apiAnswer) {
                return {
                    questionId: question.id,
                    correct: false,
                    score: 0,
                    userAnswer: selectedAnswers[question.id] || []
                };
            }
            
            // For text questions
            if (question.type === 'text') {
                return {
                    questionId: question.id,
                    correct: apiAnswer.isCorrect,
                    score: apiAnswer.earnedPoints,
                    userAnswer: textAnswers[question.id] || '',
                    explanation: apiAnswer.explanation
                };
            }
            
            // For choice questions
            const userAnswerIds = selectedAnswers[question.id] || [];
            
            return {
                questionId: question.id,
                correct: apiAnswer.isCorrect,
                score: apiAnswer.earnedPoints,
                userAnswer: userAnswerIds,
                explanation: apiAnswer.explanation,
                correctAnswers: apiAnswer.answers
                    ? apiAnswer.answers
                        .filter(ans => ans.isCorrect)
                        .map(ans => ans.id)
                    : []
            };
        });
        
        return {
            totalScore: quizResult.score,
            maxScore: quizResult.totalPoints,
            percentageScore: (quizResult.score / quizResult.totalPoints) * 100,
            passed: quizResult.isPassed,
            results,
            timeSpent: quizResult.startTime && quizResult.endTime ? 
                new Date(quizResult.endTime).getTime() - new Date(quizResult.startTime).getTime() : 0
        };
    };

    // Di chuyển đến câu hỏi tiếp theo
    const goToNextQuestion = () => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // Di chuyển đến câu hỏi trước đó
    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Mở xác nhận nộp bài
    const handleConfirmSubmit = () => {
        // Kiểm tra nếu tất cả câu hỏi bắt buộc đã được trả lời
        if (!areRequiredQuestionsAnswered()) {
            setRequireConfirmation(true);
        } else {
            handleSubmitQuiz();
        }
    };

    // Quay lại làm bài
    const handleContinueQuiz = () => {
        setRequireConfirmation(false);
    };

    // Bắt đầu làm lại bài
    const handleRetakeQuiz = async () => {
        setSelectedAnswers({});
        setTextAnswers({});
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setShowResults(false);
        setQuizResult(null);
        setSessionExpired(false);
        
        // Start a new quiz session
        const session = await startQuiz(lectureId);
        
        if (session) {
            setQuizSession(session);
            
            // Initialize timer based on session expiry time if available
            if (session.expiryTime) {
                const now = new Date();
                const expiryTime = new Date(session.expiryTime);
                const diffInSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);
                
                if (diffInSeconds <= 0) {
                    setSessionExpired(true);
                    setError("Phiên làm bài đã hết hạn. Vui lòng thử lại sau.");
                } else {
                    setRemainingTime(diffInSeconds);
                }
            } else if (quiz?.settings.timeLimit) {
                setRemainingTime(quiz.settings.timeLimit * 60);
            }
        } else if (quiz?.settings.timeLimit) {
            setRemainingTime(quiz.settings.timeLimit * 60);
        }
    };

    if (loading || !quiz) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Đã xảy ra lỗi</h3>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }
    
    if (sessionExpired) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md">
                    <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Phiên làm bài đã hết hạn</h3>
                    <p className="text-gray-600 mb-4">Thời gian làm bài đã kết thúc.</p>
                    {quiz.settings.allowRetake ? (
                        <button 
                            onClick={handleRetakeQuiz} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Làm lại bài kiểm tra
                        </button>
                    ) : (
                        <button 
                            onClick={() => window.history.back()}
                            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Quay lại bài học
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (showResults) {
        return (
            <QuizResults
                quiz={quiz}
                quizResults={parseQuizResults()}
                selectedAnswers={selectedAnswers}
                textAnswers={textAnswers}
                onRetake={quiz.settings.allowRetake ? handleRetakeQuiz : undefined}
                apiResult={quizResult}
                showCorrectAnswers={quiz.settings.showCorrectAnswers}
            />
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-4">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Bài kiểm tra: {quiz.title || 'Kiểm tra kiến thức'}</h1>

                        {/* Nếu có thời gian giới hạn, hiển thị đồng hồ đếm ngược */}
                        {remainingTime !== null && (
                            <QuizTimer remainingTime={remainingTime}/>
                        )}
                    </div>

                    {/* Thanh tiến trình */}
                    <div className="mt-4">
                        <QuizProgress
                            currentQuestion={currentQuestionIndex + 1}
                            totalQuestions={quiz.questions.length}
                            questions={quiz.questions}
                            selectedAnswers={selectedAnswers}
                            textAnswers={textAnswers}
                            onSelectQuestion={(index) => setCurrentQuestionIndex(index)}
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="text-gray-500 text-sm mb-2">
                            Câu hỏi {currentQuestionIndex + 1} / {quiz.questions.length}
                            {currentQuestion.isRequired && <span className="text-red-500 ml-1">*</span>}
                            <span className="ml-2 font-medium">{currentQuestion.points} điểm</span>
                        </div>

                        <QuizQuestion
                            question={currentQuestion}
                            selectedAnswers={selectedAnswers[currentQuestion.id] || []}
                            textAnswer={textAnswers[currentQuestion.id] || ''}
                            onSelectOption={(optionId) => handleSelectOption(currentQuestion.id, optionId)}
                            onTextChange={(text) => handleTextAnswer(currentQuestion.id, text)}
                            showCorrectAnswers={false}
                            isSubmitted={isSubmitted}
                        />
                    </div>

                    {/* Điều hướng */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className={`flex items-center px-4 py-2 border rounded-md ${currentQuestionIndex === 0
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <ChevronLeft size={16} className="mr-1"/> Câu hỏi trước
                        </button>

                        {currentQuestionIndex < quiz.questions.length - 1 ? (
                            <button
                                onClick={goToNextQuestion}
                                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Câu hỏi tiếp theo <ChevronRight size={16} className="ml-1"/>
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirmSubmit}
                                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                                <Check size={16} className="mr-1"/> Nộp bài
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Xác nhận nộp bài */}
            {requireConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-6 w-6 text-yellow-500"/>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">Có câu hỏi bắt buộc chưa trả lời</h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Bạn chưa trả lời tất cả các câu hỏi bắt buộc. Bạn có chắc chắn muốn nộp bài?</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleContinueQuiz}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Quay lại làm bài
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitQuiz}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                            >
                                Nộp bài ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizContent;