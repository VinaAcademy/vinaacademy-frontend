import { Trash2, Lightbulb, ArrowUp, ArrowDown, Save } from 'lucide-react'
import { QuizQuestion } from '@/types/lecture'
import { QuestionType as QuizQuestionType } from '@/types/quiz'
import QuestionForm from './QuestionForm'
import QuestionOptions from './QuestionOptions'
import React, { useState } from 'react'
import { useQuizEdit } from '@/context/QuizEditContext'

// Helper to convert lecture question type (string) to quiz question type (enum)
const toQuizQuestionType = (type: string): QuizQuestionType => {
  switch (type) {
    case 'single_choice':
      return QuizQuestionType.SINGLE_CHOICE
    case 'multiple_choice':
      return QuizQuestionType.MULTIPLE_CHOICE
    case 'true_false':
      return QuizQuestionType.TRUE_FALSE
    default:
      return QuizQuestionType.SINGLE_CHOICE
  }
}

interface QuestionContentProps {
  question: QuizQuestion
  index: number
  totalQuestions: number
}

export default function QuestionContent({
  question,
  index,
  totalQuestions,
}: QuestionContentProps) {
  const {
    onUpdateQuestionText,
    onUpdateQuestionType,
    onUpdateExplanation,
    onUpdatePoints,
    onRemoveQuestion,
    onMoveQuestion,
  } = useQuizEdit()

  const [explanation, setExplanation] = useState(question.explanation || '')
  const [isExplanationChanged, setIsExplanationChanged] = useState(false)

  const handleExplanationChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setExplanation(e.target.value)
    setIsExplanationChanged(true)
  }

  const saveExplanation = () => {
    onUpdateExplanation(question.id || '', explanation)
    setIsExplanationChanged(false)
  }

  return (
    <div className="p-3 space-y-3 bg-white border-t border-gray-100">
      {/* Compact Navigation & Actions Bar */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => onMoveQuestion(question.id || '', 'up')}
            disabled={index === 0}
            className={`p-1.5 text-gray-600 hover:bg-gray-100 rounded text-xs ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Di chuyển lên"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveQuestion(question.id || '', 'down')}
            disabled={index === totalQuestions - 1}
            className={`p-1.5 text-gray-600 hover:bg-gray-100 rounded text-xs ${index === totalQuestions - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Di chuyển xuống"
          >
            <ArrowDown size={14} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRemoveQuestion(question.id || '')}
          className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors text-xs"
          title="Xóa câu hỏi"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Question Form - Text & Type & Points */}
      <QuestionForm
        text={question.text}
        type={toQuizQuestionType(question.type)}
        points={question.points}
        onUpdateText={(text) => onUpdateQuestionText(question.id || '', text)}
        onUpdateType={(type) => onUpdateQuestionType(question.id || '', type)}
        onUpdatePoints={(points) => onUpdatePoints(question.id || '', points)}
      />

      {/* Question Options */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <QuestionOptions
          questionId={question.id || ''}
          questionType={toQuizQuestionType(question.type)}
          options={question.options || []}
        />
      </div>

      {/* Question Explanation - Compact */}
      <div className="bg-amber-50/50 p-3 rounded-md border border-amber-200">
        <label
          htmlFor={`explanation-${question.id}`}
          className="flex items-center text-xs font-medium text-amber-800 mb-1.5"
        >
          <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
          Giải thích đáp án
        </label>
        <textarea
          id={`explanation-${question.id}`}
          value={explanation}
          onChange={handleExplanationChange}
          rows={2}
          className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full text-sm p-2 border-amber-200 rounded-md bg-white"
          placeholder="Nhập giải thích cho đáp án..."
        />
        {isExplanationChanged && (
          <div className="mt-1.5 flex justify-end">
            <button
              onClick={saveExplanation}
              className="flex items-center px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Lưu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
