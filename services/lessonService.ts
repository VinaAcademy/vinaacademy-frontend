'use client'

import apiClient from '@/lib/apiClient'
import { AxiosResponse } from 'axios'
import { ApiResponse } from '@/types/api-response'
import {
  LessonDto,
  LessonRequest,
  TTSRequestDto,
  TTSResponseDto,
} from '@/types/lesson'
import { CourseDto, LessonType } from '@/types/course'

// 🔍 GET /lessons/{id}
export const getLessonById = async (id: string): Promise<LessonDto | null> => {
  const response: AxiosResponse<ApiResponse<LessonDto>> = await apiClient.get(
    `/lessons/${id}`,
  )
  return response.data.data
}

// 🔍 GET /lessons/section/{sectionId}
export const getLessonsBySectionId = async (
  sectionId: string,
): Promise<LessonDto[]> => {
  try {
    const response: AxiosResponse<ApiResponse<LessonDto[]>> =
      await apiClient.get(`/lessons/section/${sectionId}`)
    // Sắp xếp lại theo orderIndex để đảm bảo hiển thị đúng thứ tự
    const lessons = response.data.data
    return lessons.sort((a, b) => a.orderIndex - b.orderIndex)
  } catch (error) {
    console.error('getLessonsBySectionId error:', error)
    return []
  }
}

// ➕ POST /lessons
export const createLesson = async (
  lessonData: LessonRequest,
): Promise<LessonDto | null> => {
  try {
    // Không cần xử lý orderIndex, backend sẽ luôn đặt ở cuối
    const response: AxiosResponse<ApiResponse<LessonDto>> =
      await apiClient.post('/lessons', lessonData)
    return response.data.data
  } catch (error) {
    console.error('createLesson error:', error)
    return null
  }
}

// ✏️ PUT /lessons/{id}
export const updateLesson = async (
  id: string,
  lessonData: LessonRequest,
): Promise<LessonDto | null> => {
  try {
    // Đảm bảo có orderIndex khi cập nhật
    if (lessonData.orderIndex === undefined || lessonData.orderIndex === null) {
      // Lấy lesson hiện tại để lấy orderIndex
      const currentLesson = await getLessonById(id)
      if (currentLesson) {
        lessonData.orderIndex = currentLesson.orderIndex
      } else {
        throw new Error('Cannot update lesson with unknown orderIndex')
      }
    }

    // Handle quiz settings if this is a quiz
    if (lessonData.type === 'QUIZ' && lessonData.settings) {
      // Make sure settings is properly formatted for API
      console.log('Updating quiz with settings:', lessonData.settings)
    }

    const response: AxiosResponse<ApiResponse<LessonDto>> = await apiClient.put(
      `/lessons/${id}`,
      lessonData,
    )
    return response.data.data
  } catch (error) {
    console.error('updateLesson error:', error)
    return null
  }
}

// ❌ DELETE /lessons/{id}
export const deleteLesson = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/lessons/${id}`)
    return true
  } catch (error) {
    console.error('deleteLesson error:', error)
    return false
  }
}

// Thêm method để hỗ trợ reorder các lessons trong section
export const reorderLessons = async (
  sectionId: string,
  lessonIds: string[],
): Promise<boolean> => {
  try {
    // Lấy tất cả lessons hiện tại trong section
    const currentLessons = await getLessonsBySectionId(sectionId)

    // Tạo map để cập nhật dễ dàng
    const lessonMap = new Map<string, LessonDto>()
    currentLessons.forEach((lesson) => lessonMap.set(lesson.id, lesson))

    // Cập nhật từng lesson với orderIndex mới
    const updatePromises = lessonIds.map((lessonId, index) => {
      const lesson = lessonMap.get(lessonId)
      if (lesson) {
        return updateLesson(lessonId, {
          ...lesson,
          title: lesson.title,
          sectionId: sectionId,
          type: lesson.type,
          orderIndex: index,
        })
      }
      return Promise.resolve(null)
    })

    await Promise.all(updatePromises)
    return true
  } catch (error) {
    console.error('reorderLessons error:', error)
    return false
  }
}

// Thêm phương thức để chuyển đổi từ loại bài giảng sang text dễ hiểu cho frontend
export function mapLessonTypeToDisplay(type: LessonType | string): string {
  const upperCaseType =
    typeof type === 'string' ? (type.toUpperCase() as LessonType) : type

  switch (upperCaseType) {
    case 'VIDEO':
      return 'Video'
    case 'READING':
      return 'Bài đọc'
    case 'QUIZ':
      return 'Bài kiểm tra'
    default:
      return 'Bài học'
  }
}

// 🔍 GET /lesson-progress/{courseId}
export const getLessonProgressByCourse = async (
  courseId: string,
): Promise<any[]> => {
  try {
    const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get(
      `/lesson-progress/${courseId}`,
    )
    return response.data.data
  } catch (error) {
    console.error('getLessonProgressByCourse error:', error)
    return []
  }
}

export const markLessonComplete = async (
  lessonId: string,
): Promise<boolean> => {
  try {
    const response: AxiosResponse = await apiClient.post(
      `/lessons/${lessonId}/complete`,
    )
    return response.status === 200
  } catch (error) {
    console.error('markLessonComplete error:', error)
    return false
  }
}

// 🔊 Text-to-Speech Functions

/**
 * Generate audio for a Reading lesson
 * Returns audio as base64 encoded string
 */
export const generateLessonAudio = async (
  lessonId: string,
  request?: TTSRequestDto,
): Promise<TTSResponseDto | null> => {
  try {
    const payload: TTSRequestDto = {
      voice: request?.voice || 'vi-VN-HoaiMyNeural',
      speed: request?.speed || '1.0',
      pitch: request?.pitch || '0Hz',
      format: request?.format || 'base64',
    }

    const response: AxiosResponse<ApiResponse<TTSResponseDto>> =
      await apiClient.post(`/lessons/${lessonId}/tts`, payload)

    if (response.data.status === 'SUCCESS') {
      return response.data.data
    } else {
      console.error('TTS generation failed:', response.data.message)
      return null
    }
  } catch (error: any) {
    console.error('generateLessonAudio error:', error)
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Không thể tạo audio. Vui lòng thử lại sau.')
  }
}

/**
 * Get streaming audio URL for a Reading lesson
 * Returns URL that can be used directly in <audio> element
 */
export const getStreamingAudioUrl = (
  lessonId: string,
  voice: string = 'vi-VN-HoaiMyNeural',
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  return `${baseUrl}/api/v1/lessons/${lessonId}/tts/stream?voice=${encodeURIComponent(voice)}`
}

/**
 * Get available TTS voices
 */
export const getAvailableTTSVoices = async (): Promise<any> => {
  try {
    return {
      vietnamese: [
        {
          name: 'vi-VN-HoaiMyNeural',
          gender: 'Female',
          description: 'Giọng nữ tự nhiên',
        },
        {
          name: 'vi-VN-NamMinhNeural',
          gender: 'Male',
          description: 'Giọng nam tự nhiên',
        },
      ],
      english: [
        {
          name: 'en-US-JennyNeural',
          gender: 'Female',
          description: 'US English Female',
        },
        {
          name: 'en-US-GuyNeural',
          gender: 'Male',
          description: 'US English Male',
        },
      ],
    }
  } catch (error) {
    console.error('getAvailableTTSVoices error:', error)
    return null
  }
}
