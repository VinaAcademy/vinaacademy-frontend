// components/lecture/content/quiz/QuizEditor.tsx
import {useState, useEffect} from 'react';
import {Quiz, QuizQuestion, QuizOption, Lecture, QuestionType as UIQuestionType} from '@/types/lecture';
import QuizHeader from './QuizHeader';
import QuestionList from './QuestionList';
import QuizSettings from './QuizSettings';
import QuizPreview from './preview/QuizPreview';
import QuizTips from './QuizTips';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Import our new hooks for quiz instructor APIs
import { 
    useQuizForInstructor,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion,
    useCreateAnswer,
    useUpdateAnswer,
    useDeleteAnswer
} from '@/hooks/instructor/useQuizInstructor';
import { QuestionType as APIQuestionType } from '@/types/quiz'; // Import the QuestionType enum with alias
import { quizDtoToQuiz } from '@/adapters/quizAdapter';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert API question type to UI question type
const apiToUIQuestionType = (apiType: APIQuestionType): UIQuestionType => {
    switch(apiType) {
        case APIQuestionType.SINGLE_CHOICE:
            return 'single_choice';
        case APIQuestionType.MULTIPLE_CHOICE:
            return 'multiple_choice';
        case APIQuestionType.TRUE_FALSE:
            return 'true_false';
        case APIQuestionType.TEXT:
            return 'text';
        default:
            return 'single_choice';
    }
};

// Helper function to convert UI question type to API question type
const uiToAPIQuestionType = (uiType: UIQuestionType): APIQuestionType => {
    switch(uiType) {
        case 'single_choice':
            return APIQuestionType.SINGLE_CHOICE;
        case 'multiple_choice':
            return APIQuestionType.MULTIPLE_CHOICE;
        case 'true_false':
            return APIQuestionType.TRUE_FALSE;
        case 'text':
            return APIQuestionType.TEXT;
        default:
            return APIQuestionType.SINGLE_CHOICE;
    }
};

interface QuizEditorProps {
    lecture: Lecture;
    sectionId: string;
    setLecture: React.Dispatch<React.SetStateAction<Lecture>>;
}

export default function QuizEditor({lecture, setLecture, sectionId}: QuizEditorProps) {
    // -- State management --
    const [expandedQuestion, setExpandedQuestion] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const { toast } = useToast();
    
    // Use TanStack Query hooks for API interactions
    const quizQuery = useQuizForInstructor(lecture.id, !!lecture.id);
    const createQuestionMutation = useCreateQuestion();
    const updateQuestionMutation = useUpdateQuestion();
    const deleteQuestionMutation = useDeleteQuestion();
    const createAnswerMutation = useCreateAnswer();
    const updateAnswerMutation = useUpdateAnswer();
    const deleteAnswerMutation = useDeleteAnswer();
    
    // Track loading state
    const isLoading = quizQuery.isLoading;

    // Load quiz data from API when component mounts or lecture ID changes
    useEffect(() => {
        if (quizQuery.data) {
            const mappedQuiz = quizDtoToQuiz(quizQuery.data);
            
            // Update the lecture with the quiz data
            setLecture(prev => ({
                ...prev,
                quiz: mappedQuiz
            }));
            
            // Set the first question as expanded if there are questions
            if (mappedQuiz.questions.length > 0 && expandedQuestion === '') {
                setExpandedQuestion(mappedQuiz.questions[0].id);
            }
        }
    }, [quizQuery.data, expandedQuestion]);
    
    // Handle API errors
    useEffect(() => {
        if (quizQuery.error) {
            toast({
                title: "Lỗi tải dữ liệu",
                description: "Không thể tải thông tin bài kiểm tra",
                variant: "destructive"
            });
        }
    }, [quizQuery.error]);

    // Initialize default quiz if none exists
    const initializeDefaultQuiz = (): Quiz => {
        const defaultQuiz: Quiz = {
            questions: [],
            settings: {
                randomizeQuestions: false,
                showCorrectAnswers: true,
                allowRetake: true,
                requirePassingScore: false,
                passingScore: 70
            },
            totalPoints: 0,
            passPoint: 0,
            totalPoint: 0
        };
        
        return defaultQuiz;
    };

    // Safely get quiz object
    const getQuiz = (): Quiz => {
        return lecture.quiz || initializeDefaultQuiz();
    };
    
    const quiz = getQuiz();
    const questions = quiz.questions || [];

    // -- Quiz Management Functions --
    
    // Update settings
    const updateSettings = (field: keyof Quiz['settings'], value: boolean | number) => {
        const updatedSettings = {
            ...quiz.settings,
            [field]: value
        };
        
        const updatedQuiz = {
            ...quiz,
            settings: updatedSettings
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
    };

    // Add a new question
    const addQuestion = async () => {
        const newQuestion: QuizQuestion = {
            id: `q_${uuidv4()}`,
            text: '',
            type: 'single_choice',
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false }
            ],
            explanation: '',
            points: 1,
            isRequired: true
        };
        
        // Add the question to local state first (for immediate UI update)
        const updatedQuestions = [...questions, newQuestion];
        const totalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions,
            totalPoints
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        setExpandedQuestion(newQuestion.id);
        
        // If we have a quiz ID, create the question in the backend
        if (lecture.id) {
            try {
                await createQuestionMutation.mutateAsync({
                    quizId: lecture.id,
                    question: {
                        id: newQuestion.id,
                        questionText: newQuestion.text,
                        explanation: newQuestion.explanation || '',
                        point: newQuestion.points,
                        questionType: uiToAPIQuestionType(newQuestion.type),
                        answers: newQuestion.options.map(o => ({
                            answerText: o.text,
                            isCorrect: o.isCorrect
                        }))
                    }
                });
            } catch (error) {
                console.error('Error creating question:', error);
                // We don't revert the UI since the user may have already started editing
            }
        }
    };

    // Remove a question
    const removeQuestion = async (questionId: string) => {
        // Update local state first
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        const totalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions,
            totalPoints
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // If expandedQuestion was the one being removed, expand the first question if available
        if (expandedQuestion === questionId && updatedQuestions.length > 0) {
            setExpandedQuestion(updatedQuestions[0].id);
        } else if (expandedQuestion === questionId) {
            setExpandedQuestion('');
        }
        
        // Delete from backend if we have a quiz ID
        if (lecture.id) {
            try {
                await deleteQuestionMutation.mutateAsync({
                    quizId: lecture.id,
                    questionId
                });
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    // Update question text
    const updateQuestionText = async (questionId: string, text: string) => {
        // Update local state first
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? {...q, text} : q
        );
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Update in backend with debounce handling
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId,
                    quizId: lecture.id,
                    question: {
                        id: question.id,
                        questionText: question.text,
                        explanation: question.explanation || '',
                        point: question.points,
                        questionType: uiToAPIQuestionType(question.type as UIQuestionType),
                        answers: question.options.map(o => ({
                            id: o.id,
                            answerText: o.text,
                            isCorrect: o.isCorrect
                        }))
                    }
                });
            } catch (error) {
                console.error('Error updating question text:', error);
            }
        }
    };

    // Update question type
    const updateQuestionType = async (questionId: string, type: APIQuestionType) => {
        // Update local state first
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                let options = [...q.options];
                
                // Reset options based on question type
                if (type === APIQuestionType.SINGLE_CHOICE && uiToAPIQuestionType(q.type as UIQuestionType) !== APIQuestionType.SINGLE_CHOICE) {
                    options = options.map((opt, index) => ({
                        ...opt,
                        isCorrect: index === 0 // Only first option is correct
                    }));
                }
                
                // For true/false, create exactly 2 options
                if (type === APIQuestionType.TRUE_FALSE) {
                    options = [
                        { text: 'Đúng', isCorrect: true },
                        { text: 'Sai', isCorrect: false }
                    ];
                }
                
                // For text type, no options needed
                if (type === APIQuestionType.TEXT) {
                    options = [];
                }
                
                return {...q, type: apiToUIQuestionType(type), options};
            }
            return q;
        });
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Update in backend
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId,
                    quizId: lecture.id,
                    question: {
                        id: question.id,
                        questionText: question.text,
                        explanation: question.explanation || '',
                        point: question.points,
                        questionType: uiToAPIQuestionType(question.type as UIQuestionType),
                        answers: question.options.map(o => ({
                            id: o.id,
                            answerText: o.text,
                            isCorrect: o.isCorrect
                        }))
                    }
                });
            } catch (error) {
                console.error('Error updating question type:', error);
            }
        }
    };

    // Add an option to a question
    const addOption = async (questionId: string) => {
        // Update local state first
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                const newOption: QuizOption = {
                    text: '',
                    isCorrect: false
                };
                return {...q, options: [...q.options, newOption]};
            }
            return q;
        });
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Create option in backend
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            const newOption = question.options[question.options.length - 1];
            
            try {
                await createAnswerMutation.mutateAsync({
                    questionId,
                    quizId: lecture.id,
                    answer: {
                        id: newOption.id,
                        answerText: newOption.text,
                        isCorrect: newOption.isCorrect
                    }
                });
            } catch (error) {
                console.error('Error creating option:', error);
            }
        }
    };

    // Remove an option from a question
    const removeOption = async (questionId: string, optionId: string) => {
        // Update local state first
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                if (q.options.length <= 2) {
                    return q; // Don't remove if only 2 options left
                }
                return {...q, options: q.options.filter(o => o.id !== optionId)};
            }
            return q;
        });
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Delete option in backend
        if (lecture.id) {
            try {
                await deleteAnswerMutation.mutateAsync({
                    answerId: optionId,
                    questionId,
                    quizId: lecture.id
                });
            } catch (error) {
                console.error('Error deleting option:', error);
            }
        }
    };

    // Update option text
    const updateOptionText = async (questionId: string, optionId: string, text: string) => {
        // Update local state first
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                return {
                    ...q,
                    options: q.options.map(o =>
                        o.id === optionId ? {...o, text} : o
                    )
                };
            }
            return q;
        });
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Update option in backend
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            const option = question.options.find(o => o.id === optionId);
            if (!option) return;
            
            try {
                await updateAnswerMutation.mutateAsync({
                    answerId: optionId,
                    questionId,
                    quizId: lecture.id,
                    answer: {
                        id: option.id,
                        answerText: option.text,
                        isCorrect: option.isCorrect
                    }
                });
            } catch (error) {
                console.error('Error updating option text:', error);
            }
        }
    };

    // Toggle option correctness
    const toggleOptionCorrect = async (questionId: string, optionId: string) => {
        // Update local state first
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                if (q.type === 'single_choice' || q.type === 'true_false') {
                    // For single choice, only one option can be correct
                    return {
                        ...q,
                        options: q.options.map(o => ({
                            ...o,
                            isCorrect: o.id === optionId
                        }))
                    };
                } else {
                    // For multiple choice, toggle the option
                    return {
                        ...q,
                        options: q.options.map(o =>
                            o.id === optionId ? {...o, isCorrect: !o.isCorrect} : o
                        )
                    };
                }
            }
            return q;
        });
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Update option correctness in backend
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            const option = question.options.find(o => o.id === optionId);
            if (!option) return;
            
            try {
                await updateAnswerMutation.mutateAsync({
                    answerId: optionId,
                    questionId,
                    quizId: lecture.id,
                    answer: {
                        id: option.id,
                        answerText: option.text,
                        isCorrect: option.isCorrect
                    }
                });
            } catch (error) {
                console.error('Error updating option correctness:', error);
            }
        }
    };

    // Update question explanation
    const updateExplanation = async (questionId: string, explanation: string) => {
        // Update local state first
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? {...q, explanation} : q
        );
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Update in backend
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId,
                    quizId: lecture.id,
                    question: {
                        id: question.id,
                        questionText: question.text,
                        explanation: question.explanation || '',
                        point: question.points,
                        questionType: uiToAPIQuestionType(question.type as UIQuestionType),
                        answers: question.options.map(o => ({
                            id: o.id,
                            answerText: o.text,
                            isCorrect: o.isCorrect
                        }))
                    }
                });
            } catch (error) {
                console.error('Error updating question explanation:', error);
            }
        }
    };

    // Update question points
    const updatePoints = async (questionId: string, points: number) => {
        // Update local state first
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? {...q, points} : q
        );
        
        const totalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions,
            totalPoints
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Update in backend
        if (lecture.id) {
            const question = updatedQuestions.find(q => q.id === questionId);
            if (!question) return;
            
            try {
                await updateQuestionMutation.mutateAsync({
                    questionId,
                    quizId: lecture.id,
                    question: {
                        id: question.id,
                        questionText: question.text,
                        explanation: question.explanation || '',
                        point: question.points,
                        questionType: uiToAPIQuestionType(question.type as UIQuestionType),
                        answers: question.options.map(o => ({
                            id: o.id,
                            answerText: o.text,
                            isCorrect: o.isCorrect
                        }))
                    }
                });
            } catch (error) {
                console.error('Error updating question points:', error);
            }
        }
    };

    // Toggle required status for a question
    const toggleRequired = (questionId: string) => {
        // Update local state
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? {...q, isRequired: !q.isRequired} : q
        );
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Note: Currently no API call needed for isRequired as it's not stored in the backend
    };

    // Move a question up or down in the order
    const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
        const index = questions.findIndex(q => q.id === questionId);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) {
            return; // Can't move further
        }
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const updatedQuestions = [...questions];
        const [removed] = updatedQuestions.splice(index, 1);
        updatedQuestions.splice(newIndex, 0, removed);
        
        const updatedQuiz = {
            ...quiz,
            questions: updatedQuestions
        };
        
        setLecture({
            ...lecture,
            quiz: updatedQuiz
        });
        
        // Note: Currently no API call for reordering questions
    };

    // Kiểm tra xem quiz có ít nhất một câu hỏi hợp lệ hay không
    const hasValidQuestions = questions.some(q =>
        q.text.trim() !== '' &&
        (q.type === 'text' || q.options.some(o => o.text.trim() !== ''))
    );

    // Tính tổng điểm cho quiz
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Loading state UI
    if (isLoading) {
        return (
            <div className="py-20 flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-sm border border-blue-100">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <span className="text-lg font-medium text-blue-700">Đang tải dữ liệu bài kiểm tra...</span>
                <p className="text-blue-500 mt-2">Vui lòng đợi trong giây lát</p>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-8">
            {/* 1. Tiêu đề Quiz với nút Xem trước */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100 transition-all hover:shadow-md">
                <QuizHeader
                    totalPoints={totalPoints}
                    hasValidQuestions={hasValidQuestions}
                    onPreview={() => setShowPreview(true)}
                    lecture={lecture}
                    sectionId={sectionId}
                    onSaved={(updatedLecture) => setLecture(updatedLecture)}
                />
            </div>

            {/* 2. Danh sách câu hỏi */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <QuestionList
                    questions={questions}
                    expandedQuestion={expandedQuestion}
                    setExpandedQuestion={setExpandedQuestion}
                    onAddQuestion={addQuestion}
                    onRemoveQuestion={removeQuestion}
                    onDuplicateQuestion={() => {}}
                    onUpdateQuestionText={updateQuestionText}
                    onUpdateQuestionType={updateQuestionType}
                    onAddOption={addOption}
                    onRemoveOption={removeOption}
                    onUpdateOptionText={updateOptionText}
                    onToggleOptionCorrect={toggleOptionCorrect}
                    onUpdateExplanation={updateExplanation}
                    onUpdatePoints={updatePoints}
                    onToggleRequired={toggleRequired}
                    onMoveQuestion={moveQuestion}
                />
            </div>

            {/* 3. Cài đặt Quiz */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-100 transition-all hover:shadow-md">
                <QuizSettings
                    settings={quiz.settings}
                    onUpdateSettings={updateSettings}
                />
            </div>

            {/* 4. Mẹo Quiz */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-100">
                <QuizTips/>
            </div>

            {/* 5. Modal Xem trước Quiz */}
            {showPreview && quiz && (
                <QuizPreview 
                    quiz={quiz} 
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}