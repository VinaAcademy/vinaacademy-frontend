'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  startQuizGeneration,
  getQuizGenerationProgress,
  QuizGenerationStatus,
} from '@/services/aiService'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'

// Polling configuration
const POLLING_INTERVAL = 2000 // 2 seconds
const MAX_POLLING_ATTEMPTS = 150 // 5 minutes max (150 * 2s = 300s)

// Loading steps configuration - now mapped from backend progress
export const LOADING_STEPS = [
  {
    id: 'pending',
    label: 'Đang khởi tạo...',
    progressRange: [0, 10],
  },
  {
    id: 'analyze',
    label: 'Phân tích nội dung...',
    progressRange: [10, 30],
  },
  {
    id: 'questions',
    label: 'Đang soạn câu hỏi...',
    progressRange: [30, 60],
  },
  {
    id: 'answers',
    label: 'Đang tạo đáp án...',
    progressRange: [60, 80],
  },
  {
    id: 'finalize',
    label: 'Hoàn thiện kết quả...',
    progressRange: [80, 100],
  },
] as const

export type LoadingStep = (typeof LOADING_STEPS)[number]

// Helper function to get current step from progress percentage
const getStepFromProgress = (progress: number): number => {
  for (let i = LOADING_STEPS.length - 1; i >= 0; i--) {
    if (progress >= LOADING_STEPS[i].progressRange[0]) {
      return i
    }
  }
  return 0
}

interface UseAIQuizGeneratorProps {
  quizId: string
  onQuestionsGenerated: () => void
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
  progress: number
  statusMessage: string

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
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')

  // Refs for polling control
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingAttemptsRef = useRef(0)
  const isAnimatingCompletionRef = useRef(false)

  // Cleanup polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    pollingAttemptsRef.current = 0
  }, [])

  // Reset states when dialog closes
  const resetStates = useCallback(() => {
    setCurrentLoadingStep(0)
    setProgress(0)
    setStatusMessage('')
    isAnimatingCompletionRef.current = false
    stopPolling()
  }, [stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  // Animate through remaining steps before completing
  const animateRemainingSteps = useCallback(async (fromStep: number) => {
    isAnimatingCompletionRef.current = true
    const STEP_ANIMATION_DELAY = 400 // 400ms per step

    for (let i = fromStep; i < LOADING_STEPS.length; i++) {
      if (!isAnimatingCompletionRef.current) break // Stop if reset

      setCurrentLoadingStep(i)
      setProgress(LOADING_STEPS[i].progressRange[1])
      setStatusMessage(LOADING_STEPS[i].label)

      // Wait before moving to next step
      await new Promise((resolve) => setTimeout(resolve, STEP_ANIMATION_DELAY))
    }

    // Ensure we show 100% complete
    setProgress(100)
    setCurrentLoadingStep(LOADING_STEPS.length - 1)

    // Small delay to show the final state
    await new Promise((resolve) => setTimeout(resolve, 500))

    isAnimatingCompletionRef.current = false
  }, [])

  // Handle generation completion
  const handleGenerationComplete = useCallback(
    async (currentStep: number) => {
      stopPolling()

      // Animate through remaining steps before closing
      await animateRemainingSteps(currentStep)

      onQuestionsGenerated()
      createSuccessToast('Câu hỏi đã được tạo thành công bằng AI!')
      setIsOpen(false)
      setPrompt('')
      setIsGenerating(false)
      resetStates()
    },
    [onQuestionsGenerated, stopPolling, resetStates, animateRemainingSteps],
  )

  // Handle generation error
  const handleGenerationError = useCallback(
    (errorMessage: string) => {
      stopPolling()
      createErrorToast(errorMessage || 'Đã xảy ra lỗi khi tạo câu hỏi bằng AI')
      setIsGenerating(false)
      resetStates()
    },
    [stopPolling, resetStates],
  )

  // Poll for progress
  const pollProgress = useCallback(async () => {
    // Skip if we're animating completion
    if (isAnimatingCompletionRef.current) return

    pollingAttemptsRef.current += 1

    // Check max attempts
    if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
      handleGenerationError('Quá thời gian chờ. Vui lòng thử lại.')
      return
    }

    const progressData = await getQuizGenerationProgress(quizId)

    if (!progressData) {
      // Network error, continue polling
      console.warn('Failed to get progress, retrying...')
      return
    }

    // Update UI state
    const currentStep = getStepFromProgress(progressData.progress)
    setProgress(progressData.progress)
    setStatusMessage(progressData.message)
    setCurrentLoadingStep(currentStep)

    // Handle status
    const status: QuizGenerationStatus = progressData.status

    if (status === 'COMPLETED') {
      // Questions are saved to quiz, animate remaining steps then complete
      await handleGenerationComplete(currentStep)
    } else if (status === 'FAILED') {
      handleGenerationError(
        progressData.error || 'Không thể tạo câu hỏi. Vui lòng thử lại.',
      )
    }
    // Continue polling for PENDING and PROCESSING statuses
  }, [quizId, handleGenerationComplete, handleGenerationError])

  // Start polling
  const startPolling = useCallback(() => {
    stopPolling() // Clear any existing polling
    pollingAttemptsRef.current = 0

    // Initial poll
    pollProgress().then((r) => r)

    // Set up interval
    pollingIntervalRef.current = setInterval(pollProgress, POLLING_INTERVAL)
  }, [pollProgress, stopPolling])

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
    setProgress(0)
    setStatusMessage('Đang khởi tạo...')

    try {
      const startResponse = await startQuizGeneration(prompt, quizId)

      if (!startResponse) {
        createErrorToast('Không thể bắt đầu tạo câu hỏi. Vui lòng thử lại.')
        setIsGenerating(false)
        resetStates()
        return
      }

      // Start polling for progress
      setStatusMessage(startResponse.message)
      startPolling()
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
    progress,
    statusMessage,
    handleGenerate,
  }
}
