'use client'

import React, { useState } from 'react'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createQuiz } from '@/services/aiService'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'
import { QuestionDto } from '@/types/quiz'

interface AIQuizGeneratorProps {
  quizId: string
  onQuestionsGenerated: (questions: QuestionDto[]) => void
}

const PROMPT_PLACEHOLDER = `Ví dụ: Tạo 5 câu hỏi trắc nghiệm về React cơ bản (component, props, state...)`

const EXAMPLE_PROMPTS = [
  'Tạo 10 câu hỏi trắc nghiệm về JavaScript ES6',
  'Tạo 7 câu hỏi về cấu trúc dữ liệu (stack, queue, tree...)',
  'Tạo bài quiz về HTML/CSS ở mức độ cơ bản',
]

export default function AIQuizGenerator({
  quizId,
  onQuestionsGenerated,
}: AIQuizGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      createErrorToast('Vui lòng nhập mô tả để tạo câu hỏi')
      return
    }

    if (!quizId) {
      createErrorToast('Không tìm thấy ID bài kiểm tra')
      return
    }

    setIsGenerating(true)
    try {
      const generatedQuestions = await createQuiz(prompt, quizId)

      if (generatedQuestions && generatedQuestions.length > 0) {
        onQuestionsGenerated(generatedQuestions)
        createSuccessToast(
          `Đã tạo thành công ${generatedQuestions.length} câu hỏi bằng AI`,
        )
        setIsOpen(false)
        setPrompt('')
      } else {
        createErrorToast(
          'Không thể tạo câu hỏi. Vui lòng thử lại với mô tả khác.',
        )
      }
    } catch (error) {
      console.error('AI Quiz generation error:', error)
      createErrorToast('Đã xảy ra lỗi khi tạo câu hỏi bằng AI')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      setIsOpen(false)
      setPrompt('')
    }
  }

  return (
    <>
      {/* AI Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                    bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 
                    hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600
                    text-white font-medium text-sm shadow-lg shadow-purple-500/25
                    transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Tạo bằng AI</span>

        {/* Animated glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
      </button>

      {/* AI Generation Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Tạo câu hỏi bằng AI
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Mô tả nội dung bạn muốn tạo câu hỏi. AI sẽ tự động tạo các câu hỏi
              phù hợp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label
                htmlFor="ai-prompt"
                className="text-sm font-medium text-gray-700"
              >
                Mô tả nội dung
              </label>
              <Textarea
                id="ai-prompt"
                placeholder={PROMPT_PLACEHOLDER}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="min-h-[120px] resize-none focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500">
                💡 Mẹo: Mô tả càng chi tiết, câu hỏi được tạo càng chính xác.
              </p>
            </div>

            {/* Example prompts */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Gợi ý mẫu:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setPrompt(suggestion)}
                    disabled={isGenerating}
                    className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-700 
                                            hover:bg-purple-100 hover:text-purple-700 transition-colors
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo câu hỏi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
