import { useState, useEffect } from 'react'
import { Trash2, Check, Save, X } from 'lucide-react'
import { QuizOption } from '@/types/lecture'
import { QuestionType } from '@/types/quiz'
import { useQuizEdit } from '@/context/QuizEditContext'

interface OptionItemProps {
  questionId: string
  option: QuizOption
  optionIndex: number
  questionType: QuestionType
  canRemove: boolean
}

export default function OptionItem({
  questionId,
  option,
  optionIndex,
  questionType,
  canRemove,
}: OptionItemProps) {
  const { onRemoveOption, onUpdateOptionText, onToggleOptionCorrect } =
    useQuizEdit()

  // Local state for option text
  const [localText, setLocalText] = useState(option.text)
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Update local state when option changes
  useEffect(() => {
    setLocalText(option.text)
  }, [option.text])

  // Save option text changes
  const handleSaveText = () => {
    onUpdateOptionText(questionId, option.id || '', localText)
    setIsEditing(false)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setLocalText(option.text)
    setIsEditing(false)
  }

  // Get the letter for the option
  const optionLetter = String.fromCharCode(65 + optionIndex)

  return (
    <div
      className={`flex items-center space-x-2 ${option.isCorrect ? 'border border-green-400 bg-green-50/50' : 'border border-gray-200 bg-white'} rounded-md p-2 transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox or radio button based on question type */}
      <div>
        {questionType === QuestionType.MULTIPLE_CHOICE ? (
          <div
            onClick={() => onToggleOptionCorrect(questionId, option.id || '')}
            className={`h-4 w-4 flex items-center justify-center border ${option.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-400'} rounded cursor-pointer transition-colors`}
          >
            {option.isCorrect && <Check size={12} className="text-white" />}
          </div>
        ) : (
          <div
            onClick={() => onToggleOptionCorrect(questionId, option.id || '')}
            className={`h-4 w-4 flex items-center justify-center border ${option.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-400'} rounded-full cursor-pointer transition-colors`}
          >
            {option.isCorrect && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
          </div>
        )}
      </div>

      {/* Option letter badge - Smaller */}
      <div
        className={`flex items-center justify-center min-w-[22px] h-5 ${option.isCorrect ? 'bg-green-600' : 'bg-gray-500'} text-white rounded-full text-xs font-medium transition-colors`}
      >
        {optionLetter}
      </div>

      {/* Option text input - More compact */}
      <div className="flex-1">
        <input
          type="text"
          value={localText}
          onChange={(e) => {
            setLocalText(e.target.value)
            setIsEditing(true)
          }}
          className={`block w-full text-sm py-1.5 px-2 ${option.isCorrect ? 'bg-green-50 border-green-200 focus:ring-green-500 focus:border-green-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md transition-all`}
          placeholder={`Lựa chọn ${optionLetter}`}
        />
      </div>

      {/* Action buttons - Smaller */}
      <div className="flex items-center space-x-1">
        {isEditing ? (
          <>
            {/* Save button */}
            <button
              type="button"
              onClick={handleSaveText}
              className="inline-flex items-center p-1 text-sm text-white bg-green-500 hover:bg-green-600 rounded transition-colors"
              title="Lưu"
            >
              <Save size={12} />
            </button>

            {/* Cancel button */}
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center p-1 text-sm text-white bg-gray-400 hover:bg-gray-500 rounded transition-colors"
              title="Hủy"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          isHovered &&
          canRemove && (
            <button
              type="button"
              onClick={() => onRemoveOption(questionId, option.id || '')}
              className="inline-flex items-center p-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
              title="Xóa"
            >
              <Trash2 size={12} />
            </button>
          )
        )}
      </div>
    </div>
  )
}
