'use client'

import { useState, useEffect, useCallback } from 'react'
import { createQuiz } from '@/services/aiService'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'
import { QuestionDto } from '@/types/quiz'

// Loading steps configuration
export const LOADING_STEPS = [
  {
    id: 'analyze',
    label: 'Phân tích nội dung...',
    minDuration: 1500,
    maxDuration: 2500,
  },
  {
    id: 'questions',
    label: 'Đang soạn câu hỏi...',
    minDuration: 2000,
    maxDuration: 3500,
  },
  {
    id: 'answers',
    label: 'Đang tạo đáp án...',
    minDuration: 1500,
    maxDuration: 3000,
  },
  {
    id: 'explanations',
    label: 'Đang viết giải thích...',
    minDuration: 1500,
    maxDuration: 2500,
  },
  {
    id: 'finalize',
    label: 'Hoàn thiện kết quả...',
    minDuration: 1000,
    maxDuration: 2000,
  },
] as const

export type LoadingStep = (typeof LOADING_STEPS)[number]

// Helper function to get random duration
const getRandomDuration = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

interface UseAIQuizGeneratorProps {
  quizId: string
  onQuestionsGenerated: (questions: QuestionDto[]) => void
}

interface UseAIQuizGeneratorReturn {
  // Dialog state
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void

  // Form state
  prompt: string
  setPrompt: (value: string) => void

  // Loading state
  isGenerating: boolean
  currentLoadingStep: number

  // Actions
  handleGenerate: () => Promise<void>
}

export function useAIQuizGenerator({
  quizId,
  onQuestionsGenerated,
}: UseAIQuizGeneratorProps): UseAIQuizGeneratorReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0)
  const [apiCompleted, setApiCompleted] = useState(false)
  const [generatedData, setGeneratedData] = useState<QuestionDto[] | null>(null)

  // Reset states when dialog closes
  const resetStates = useCallback(() => {
    setCurrentLoadingStep(0)
    setApiCompleted(false)
    setGeneratedData(null)
  }, [])

  // Handle loading step progression
  useEffect(() => {
    if (!isGenerating) return

    // If API is completed, fast-forward through remaining steps
    if (apiCompleted && currentLoadingStep < LOADING_STEPS.length - 1) {
      const fastForwardTimer = setTimeout(() => {
        setCurrentLoadingStep((prev) => prev + 1)
      }, 300) // Fast transition
      return () => clearTimeout(fastForwardTimer)
    }

    // If we're at the last step and API is completed, finish
    if (apiCompleted && currentLoadingStep === LOADING_STEPS.length - 1) {
      const finishTimer = setTimeout(() => {
        // Complete the generation process
        if (generatedData && generatedData.length > 0) {
          onQuestionsGenerated(generatedData)
          createSuccessToast(
            `Đã tạo thành công ${generatedData.length} câu hỏi bằng AI`,
          )
          setIsOpen(false)
          setPrompt('')
        }
        setIsGenerating(false)
        resetStates()
      }, 500)
      return () => clearTimeout(finishTimer)
    }

    // Normal step progression (only if API not completed yet)
    if (!apiCompleted && currentLoadingStep < LOADING_STEPS.length - 1) {
      const currentStepConfig = LOADING_STEPS[currentLoadingStep]
      const duration = getRandomDuration(
        currentStepConfig.minDuration,
        currentStepConfig.maxDuration,
      )

      const timer = setTimeout(() => {
        setCurrentLoadingStep((prev) => prev + 1)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [
    isGenerating,
    currentLoadingStep,
    apiCompleted,
    generatedData,
    onQuestionsGenerated,
    resetStates,
  ])

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
    setCurrentLoadingStep(0)
    setApiCompleted(false)
    setGeneratedData(null)

    try {
      const generatedQuestions = await createQuiz(prompt, quizId)

      if (generatedQuestions && generatedQuestions.length > 0) {
        setGeneratedData(generatedQuestions)
        setApiCompleted(true)
      } else {
        createErrorToast(
          'Không thể tạo câu hỏi. Vui lòng thử lại với mô tả khác.',
        )
        setIsGenerating(false)
        resetStates()
      }
    } catch (error) {
      console.error('AI Quiz generation error:', error)
      createErrorToast('Đã xảy ra lỗi khi tạo câu hỏi bằng AI')
      setIsGenerating(false)
      resetStates()
    }
  }

  const openDialog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    if (!isGenerating) {
      setIsOpen(false)
      setPrompt('')
      resetStates()
    }
  }, [isGenerating, resetStates])

  return {
    isOpen,
    openDialog,
    closeDialog,
    prompt,
    setPrompt,
    isGenerating,
    currentLoadingStep,
    handleGenerate,
  }
}
