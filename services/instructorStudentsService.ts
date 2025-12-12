import apiClient from '@/lib/apiClient'
import { ApiResponse } from '@/types/api-response'
import {
  StudentsOverview,
  StudentDetail,
  StudentsProgressChart,
  TimeRange,
  StudentsFilters,
} from '@/types/instructor/students'

export const instructorStudentsService = {
  /**
   * Get students overview statistics
   */
  async getStudentsOverview(
    timeRange: TimeRange = 'MONTH',
  ): Promise<StudentsOverview> {
    const response = await apiClient.get<ApiResponse<StudentsOverview>>(
      `/instructor/students/overview`,
      {
        params: { timeRange },
      },
    )
    return response.data.data
  },

  /**
   * Get paginated list of students with filters
   */
  async getStudentsList(
    filters: StudentsFilters = {},
  ): Promise<{
    content: StudentDetail[]
    totalElements: number
    totalPages: number
  }> {
    const params: any = {
      page: filters.page ?? 0,
      size: filters.size ?? 10,
    }

    if (filters.courseId) params.courseId = filters.courseId
    if (filters.status) params.status = filters.status
    if (filters.minProgress !== undefined)
      params.minProgress = filters.minProgress
    if (filters.maxProgress !== undefined)
      params.maxProgress = filters.maxProgress
    if (filters.keyword) params.keyword = filters.keyword

    const response = await apiClient.get<
      ApiResponse<{
        content: StudentDetail[]
        totalElements: number
        totalPages: number
      }>
    >(`/instructor/students`, {
      params,
    })
    return response.data.data
  },

  /**
   * Get students progress chart data
   */
  async getStudentsProgressChart(
    period: TimeRange = 'MONTH',
  ): Promise<StudentsProgressChart> {
    const response = await apiClient.get<ApiResponse<StudentsProgressChart>>(
      `/instructor/students/progress-chart`,
      {
        params: { period },
      },
    )
    return response.data.data
  },
}
