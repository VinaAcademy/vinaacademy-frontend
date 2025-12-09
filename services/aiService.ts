'use client'

import apiClient from '@/lib/apiClient'
import { AxiosResponse } from 'axios'
import { API_ENDPOINTS } from '@/config/api.endpoint'
import { QuestionDto } from '@/types/quiz'

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
