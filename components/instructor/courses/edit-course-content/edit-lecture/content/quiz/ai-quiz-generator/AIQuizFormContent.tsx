'use client'

import React from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const PROMPT_PLACEHOLDER = `Ví dụ: Tạo 5 câu hỏi trắc nghiệm về React cơ bản (component, props, state...)`

const EXAMPLE_PROMPTS = [
  'Tạo 10 câu hỏi trắc nghiệm về JavaScript ES6',
  'Tạo 7 câu hỏi về cấu trúc dữ liệu (stack, queue, tree...)',
  'Tạo bài quiz về HTML/CSS ở mức độ cơ bản',
]

interface AIQuizFormContentProps {
  prompt: string
  setPrompt: (value: string) => void
  isGenerating: boolean
  onGenerate: () => void
  onClose: () => void
}

export default function AIQuizFormContent({
  prompt,
  setPrompt,
  isGenerating,
  onGenerate,
  onClose,
}: AIQuizFormContentProps) {
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
          Mô tả nội dung bạn muốn tạo câu hỏi. AI sẽ tự động tạo các câu hỏi phù
          hợp.
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
          onClick={onClose}
          disabled={isGenerating}
        >
          Hủy
        </Button>
        <Button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Tạo câu hỏi
        </Button>
      </DialogFooter>
    </motion.div>
  )
}
