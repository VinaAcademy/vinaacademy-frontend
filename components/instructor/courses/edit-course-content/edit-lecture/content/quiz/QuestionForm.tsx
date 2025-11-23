import { useState, useEffect } from 'react'
import { QuestionType } from '@/types/quiz' // Import the QuestionType enum
import { Save, PenSquare } from 'lucide-react'

interface QuestionFormProps {
  text: string
  type: QuestionType // Updated type
  points: number
  onUpdateText: (text: string) => void
  onUpdateType: (type: QuestionType) => void // Updated type
  onUpdatePoints: (points: number) => void
}

export default function QuestionForm({
  text,
  type,
  points,
  onUpdateText,
  onUpdateType,
  onUpdatePoints,
}: QuestionFormProps) {
  // Local state to track form values
  const [localText, setLocalText] = useState(text)
  const [localType, setLocalType] = useState(type)
  const [localPoints, setLocalPoints] = useState(points)
  const [isEditing, setIsEditing] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setLocalText(text)
    setLocalType(type)
    setLocalPoints(points)
  }, [text, type, points])

  // Save all question changes at once
  const handleSaveChanges = () => {
    onUpdateText(localText)
    onUpdateType(localType)
    onUpdatePoints(localPoints)
    setIsEditing(false)
  }

  // Get CSS class for question type
  const getTypeClass = () => {
    switch (localType) {
      case QuestionType.SINGLE_CHOICE:
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case QuestionType.MULTIPLE_CHOICE:
        return 'bg-green-100 text-green-700 border-green-200'
      case QuestionType.TRUE_FALSE:
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-3 bg-white p-3 rounded-md border border-gray-100">
      {/* Question text */}
      <div>
        <label
          htmlFor="question-text"
          className="flex items-center text-xs font-medium text-gray-700 mb-1"
        >
          <PenSquare className="h-3.5 w-3.5 mr-1" />
          Nội dung câu hỏi <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          type="text"
          id="question-text"
          value={localText}
          onChange={(e) => {
            setLocalText(e.target.value)
            setIsEditing(true)
          }}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm p-2 border-gray-300 rounded-md bg-white transition-all"
          placeholder="Nhập nội dung câu hỏi"
        />
      </div>

      {/* Question type and points - Compact Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="question-type"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Loại câu hỏi
          </label>

          {/* Optional: small badge preview using getTypeClass */}
          <div className="mb-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${getTypeClass()}`}
            >
              {localType === QuestionType.SINGLE_CHOICE && 'Chọn một'}
              {localType === QuestionType.MULTIPLE_CHOICE && 'Chọn nhiều'}
              {localType === QuestionType.TRUE_FALSE && 'Đúng/Sai'}
            </span>
          </div>

          <select
            id="question-type"
            value={localType}
            onChange={(e) => {
              setLocalType(e.target.value as QuestionType)
              setIsEditing(true)
            }}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm p-2 border-gray-300 rounded-md bg-white"
          >
            <option value={QuestionType.SINGLE_CHOICE}>Chọn một</option>
            <option value={QuestionType.MULTIPLE_CHOICE}>Chọn nhiều</option>
            <option value={QuestionType.TRUE_FALSE}>Đúng/Sai</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="question-points"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Điểm số
          </label>
          <input
            type="number"
            id="question-points"
            min="0"
            step="0.5"
            value={localPoints}
            onChange={(e) => {
              setLocalPoints(parseFloat(e.target.value) || 0)
              setIsEditing(true)
            }}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm p-2 border-gray-300 rounded-md bg-white"
          />
        </div>
      </div>

      {/* Save button - Only show when editing */}
      {isEditing && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-4 py-1.5 flex items-center bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            Lưu
          </button>
        </div>
      )}
    </div>
  )
}
