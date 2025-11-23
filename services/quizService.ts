'use client'

import apiClient from '@/lib/apiClient'
import { ApiResponse } from '@/types/api-response'
import {
  QuizDto,
  QuizSubmissionRequest,
  QuizSubmissionResultDto,
  QuizSession,
  UserAnswerRequest,
  QuizStudentAttemptsDto,
} from '@/types/quiz'
import { AxiosResponse } from 'axios'
import { API_ENDPOINTS } from '@/config/api.endpoint'

/**
 * Get a quiz for a student
 * @param id UUID of the quiz
 * @returns Quiz data or null if there's an error
 */
export async function getQuiz(id: string): Promise<QuizDto | null> {
  try {
    const response: AxiosResponse<ApiResponse<QuizDto>> = await apiClient.get(
      API_ENDPOINTS.QUIZ.BY_ID(id),
    )
    return response.data.data
  } catch (error) {
    console.error(`Error fetching quiz with ID ${id}:`, error)
    return null
  }
}

/**
 * Start a quiz session to track student's progress
 * @param quizId UUID of the quiz
 * @returns Quiz session data or null if startup fails
 */
export async function startQuiz(quizId: string): Promise<QuizSession | null> {
  try {
    const response: AxiosResponse<ApiResponse<QuizSession>> =
      await apiClient.post(API_ENDPOINTS.QUIZ.START(quizId))
    return response.data.data
  } catch (error) {
    console.error(`Error starting quiz session for quiz ${quizId}:`, error)
    return null
  }
}

/**
 * Submit quiz answers
 * @param request Quiz submission data
 * @returns Quiz submission result or null if submission fails
 */
export async function submitQuiz(
  request: QuizSubmissionRequest,
): Promise<QuizSubmissionResultDto | null> {
  try {
    const response: AxiosResponse<ApiResponse<QuizSubmissionResultDto>> =
      await apiClient.post(API_ENDPOINTS.QUIZ.SUBMIT, request)
    return response.data.data
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return null
  }
}

/**
 * Get the latest quiz submission for a particular quiz
 * @param quizId UUID of the quiz
 * @returns Latest quiz submission result or null if not found
 */
export async function getLatestSubmission(
  quizId: string,
): Promise<QuizSubmissionResultDto | null> {
  try {
    const response: AxiosResponse<ApiResponse<QuizSubmissionResultDto>> =
      await apiClient.get(API_ENDPOINTS.QUIZ.LATEST_SUBMISSION(quizId))
    return response.data.data
  } catch (error) {
    console.error(`Error fetching latest submission for quiz ${quizId}:`, error)
    return null
  }
}

/**
 * Get submission history for a quiz
 * @param quizId UUID of the quiz
 * @returns List of quiz submission results or null if an error occurs
 */
export async function getSubmissionHistory(
  quizId: string,
): Promise<QuizSubmissionResultDto[] | null> {
  try {
    const response: AxiosResponse<ApiResponse<QuizSubmissionResultDto[]>> =
      await apiClient.get(API_ENDPOINTS.QUIZ.SUBMISSION_HISTORY(quizId))
    return response.data.data
  } catch (error) {
    console.error(
      `Error fetching submission history for quiz ${quizId}:`,
      error,
    )
    return null
  }
}

/**
 * Cache a question answer during quiz attempt
 * @param quizId UUID of the quiz
 * @param answer Answer data to cache
 * @returns True if caching was successful, false otherwise
 */
export async function cacheQuizAnswer(
  quizId: string,
  answer: UserAnswerRequest,
): Promise<boolean> {
  try {
    await apiClient.post(API_ENDPOINTS.QUIZ.CACHE_ANSWER(quizId), answer)
    return true
  } catch (error) {
    console.error(`Error caching answer for quiz ${quizId}:`, error)
    return false
  }
}

/**
 * Get all cached answers for a quiz session
 * @param quizId UUID of the quiz
 * @param sessionId UUID of the quiz session
 * @returns Map of questionId to answer data, or null if retrieval fails
 */
export async function getCachedAnswers(
  quizId: string,
  sessionId: string,
): Promise<Record<string, UserAnswerRequest> | null> {
  try {
    const response: AxiosResponse<
      ApiResponse<Record<string, UserAnswerRequest>>
    > = await apiClient.get(
      API_ENDPOINTS.QUIZ.GET_CACHED_ANSWERS(quizId, sessionId),
    )
    return response.data.data
  } catch (error) {
    console.error(`Error fetching cached answers for quiz ${quizId}:`, error)
    return null
  }
}

/**
 * Get all student attempts for a specific quiz (Instructor only)
 * @param quizId UUID of the quiz
 * @returns List of student attempts grouped by student, or null if retrieval fails
 */
export async function getStudentAttempts(
  quizId: string,
): Promise<QuizStudentAttemptsDto[] | null> {
  try {
    const response: AxiosResponse<ApiResponse<QuizStudentAttemptsDto[]>> =
      await apiClient.get(API_ENDPOINTS.QUIZ.STUDENT_ATTEMPTS(quizId))
    return response.data.data
  } catch (error) {
    console.error(`Error fetching student attempts for quiz ${quizId}:`, error)
    return null
  }
}
