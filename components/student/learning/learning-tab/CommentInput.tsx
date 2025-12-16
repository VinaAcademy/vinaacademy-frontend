'use client'

import { FC, useState } from 'react'
import { Loader } from 'lucide-react'

interface CommentInputProps {
  onSubmit: (content: string) => Promise<boolean>
  placeholder?: string
  maxLength?: number
}

const CommentInput: FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Chia sẻ suy nghĩ của bạn với các học viên khác...',
  maxLength = 2000,
}) => {
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) return

    setSubmitting(true)
    try {
      const success = await onSubmit(comment)
      if (success) {
        setComment('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
      <h3 className="text-base md:text-lg font-medium mb-2 sm:mb-3 text-gray-800">
        Thêm bình luận vào thảo luận
      </h3>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800"
        placeholder={placeholder}
        rows={4}
        maxLength={maxLength}
      ></textarea>
      <div className="flex justify-between items-center mt-2 sm:mt-3">
        <span className="text-xs text-gray-500">
          {comment.length}/{maxLength}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim() || submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {submitting ? (
            <Loader className="animate-spin w-4 h-4" />
          ) : (
            'Đăng bình luận'
          )}
        </button>
      </div>
    </div>
  )
}

export default CommentInput
