'use client'

import apiClient from '@/lib/apiClient'
import { AxiosResponse } from 'axios'
import { API_ENDPOINTS } from '@/config/api.endpoint'
import { QuestionDto } from '@/types/quiz'

// ==================== Types ====================

export type QuizGenerationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'

export interface QuizGenerationStartResponse {
  quiz_id: string
  message: string
}

export interface QuizGenerationProgressResponse {
  status: QuizGenerationStatus
  progress: number
  message: string
  total_questions: number
  error: string | null
  questions?: QuestionDto[]
}

// ==================== API Functions ====================

/**
 * Start quiz generation in background
 * Returns immediately with quiz_id for polling
 */
export async function startQuizGeneration(
  prompt: string,
  quizId: string,
): Promise<QuizGenerationStartResponse | null> {
  try {
    const response: AxiosResponse = await apiClient.post(
      API_ENDPOINTS.AI.GENERATE_QUIZ,
      { prompt, quiz_id: quizId },
    )
    return response.data.data
  } catch (error) {
    console.error('Start Quiz Generation error:', error)
    return null
  }
}

/**
 * Get quiz generation progress
 * Use polling to check status until COMPLETED or FAILED
 */
export async function getQuizGenerationProgress(
  quizId: string,
): Promise<QuizGenerationProgressResponse | null> {
  try {
    const response: AxiosResponse = await apiClient.get(
      API_ENDPOINTS.AI.QUIZ_PROGRESS(quizId),
    )
    return response.data.data
  } catch (error) {
    console.error('Get Quiz Generation Progress error:', error)
    return null
  }
}

/**
 * @deprecated Use startQuizGeneration + getQuizGenerationProgress instead
 */
export async function createQuiz(
  prompt: string,
  quizId: string,
): Promise<QuestionDto[] | null> {
  try {
    const response: AxiosResponse = await apiClient.post(
      API_ENDPOINTS.AI.GENERATE_QUIZ,
      { prompt, quiz_id: quizId },
    )
    return response.data['data']
  } catch (error) {
    console.error('Create Quiz error:', error)
    return null
  }
}
