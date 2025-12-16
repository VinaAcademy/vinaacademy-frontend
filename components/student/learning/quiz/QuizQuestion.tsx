import { FC } from 'react'
import { CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { QuizQuestion as QuestionType } from '@/types/lecture'
import { useChatbotContext } from '@/context/ChatbotContext'
import { Button } from '@/components/ui/button'

interface QuizQuestionProps {
  question: QuestionType
  selectedAnswers: string[]
  textAnswer: string
  onSelectOption: (optionId: string) => void
  onTextChange: (text: string) => void
  showCorrectAnswers: boolean
  isSubmitted: boolean
  quizResults?: {
    questionId: string
    correct: boolean | null
    score: number
    userAnswer: string[] | string
    explanation?: string
    correctAnswers?: string[]
  }
}

const QuizQuestion: FC<QuizQuestionProps> = ({
  question,
  selectedAnswers,
  textAnswer,
  onSelectOption,
  onTextChange,
  showCorrectAnswers,
  isSubmitted,
  quizResults,
}) => {
  const { setCustomContext, openChatbot } = useChatbotContext()

  const handleAskAI = () => {
    const context = {
      type: 'QUIZ_QUESTION_HELP',
      questionText: question.text,
      questionType: question.type,
      options: question.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
      })),
      userSelectedAnswers: selectedAnswers,
      userTextAnswer: textAnswer,
      explanation: question.explanation,
      isCorrect: quizResults?.correct,
      score: quizResults?.score,
      userScore: quizResults?.score,
      instructions:
        'Giải thích ngắn gọn tại sao câu trả lời của người dùng là đúng hay sai, và cung cấp hướng dẫn để cải thiện nếu cần thiết.',
    }

    setCustomContext(context, question.text)
    openChatbot()
  }

  // Helper function for option container classes
  const getOptionClasses = (
    isSelected: boolean,
    isOptionCorrect: boolean,
    showCorrectness: boolean,
  ) => {
    let classes = 'p-4 sm:p-5 border rounded-md transition-all duration-200'
    classes += isSubmitted
      ? ' cursor-default'
      : ' cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
    classes += isSelected
      ? ' border-blue-500 bg-blue-50 shadow-sm'
      : ' border-gray-200'

    if (showCorrectness) {
      classes += isOptionCorrect
        ? ' bg-green-50 border-green-500 shadow-md'
        : isSelected
          ? ' bg-red-50 border-red-500 shadow-sm'
          : ''
    }

    return classes
  }

  // Helper function for checkbox/radio button classes
  const getSelectionIndicatorClasses = (
    isSelected: boolean,
    isOptionCorrect: boolean,
    showCorrectness: boolean,
    isMultipleChoice: boolean,
  ) => {
    let classes = `w-5 h-5 ${isMultipleChoice ? 'rounded' : 'rounded-full'} border flex items-center justify-center flex-shrink-0`

    classes += isSelected ? ' bg-blue-500 border-blue-500' : ' border-gray-300'
    if (showCorrectness && isOptionCorrect) {
      classes += ' bg-green-500 border-green-500'
    }

    return classes
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
        {question.text}
      </h3>

      {question.type === 'text' ? (
        <div>
          <textarea
            rows={6}
            value={textAnswer}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Nhập câu trả lời của bạn vào đây..."
            disabled={isSubmitted}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
            aria-label="Câu trả lời tự luận"
          ></textarea>
        </div>
      ) : (
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswers.includes(option.id || '')
            const showCorrectness = showCorrectAnswers && isSubmitted
            const isCorrectAnswer = quizResults?.correctAnswers?.includes(
              option.id || '',
            )
            const isOptionCorrect = isCorrectAnswer || option.isCorrect
            const isMultipleChoice = question.type === 'multiple_choice'
            const optionId = `option-${question.id}-${option.id}`

            return (
              <div
                key={option.id}
                className={getOptionClasses(
                  isSelected,
                  isOptionCorrect,
                  showCorrectness,
                )}
                onClick={() => !isSubmitted && onSelectOption(option.id || '')}
                role="option"
                aria-selected={isSelected}
                id={optionId}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <div
                      className={getSelectionIndicatorClasses(
                        isSelected,
                        isOptionCorrect,
                        showCorrectness,
                        isMultipleChoice,
                      )}
                    >
                      {isSelected && (
                        <div
                          className={`${isMultipleChoice ? 'w-3 h-3' : 'w-2 h-2 rounded-full'} bg-white`}
                        ></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-grow text-gray-800">{option.text}</div>

                  {showCorrectness && (
                    <div className="ml-3 flex-shrink-0">
                      {isOptionCorrect ? (
                        <CheckCircle
                          size={20}
                          className="text-green-500"
                          aria-label="Đáp án đúng"
                        />
                      ) : isSelected ? (
                        <XCircle
                          size={20}
                          className="text-red-500"
                          aria-label="Đáp án sai"
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Don't show explanation here if we're showing it from the quizResults */}
      {showCorrectAnswers &&
        isSubmitted &&
        !quizResults?.explanation &&
        question.explanation && (
          <div className="mt-5 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">
              Giải thích:
            </h4>
            <p className="text-blue-700">{question.explanation}</p>
          </div>
        )}

      {/* Ask AI Button for wrong answers - Redesigned */}
      {showCorrectAnswers && isSubmitted && (
        <div className="mt-6 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            onClick={handleAskAI}
            className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 px-8 py-6 rounded-full border-0 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
            <div className="relative flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <span className="font-bold text-lg tracking-wide">
                Hỏi AI ngay
              </span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}

export default QuizQuestion
