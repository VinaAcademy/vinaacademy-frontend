/**
 * Discussion Moderation Service
 * API calls for staff/admin to moderate flagged discussions
 */

import apiClient from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/config/api.endpoint'
import type {
  FlaggedDiscussionDto,
  DiscussionModerationActionRequest,
  DiscussionModerationStatisticsDto,
  PaginatedResponse,
  ModerationStatus,
} from '@/types/discussion-moderation'

/**
 * Get paginated list of flagged discussions
 */
export async function getFlaggedDiscussions(
  status?: ModerationStatus,
  page = 0,
  size = 20,
): Promise<PaginatedResponse<FlaggedDiscussionDto> | null> {
  try {
    const params: any = { page, size }
    if (status) {
      params.status = status
    }

    const response = await apiClient.get(
      API_ENDPOINTS.DISCUSSION_MODERATION.FLAGGED,
      {
        params,
      },
    )
    return response.data.data
  } catch (error) {
    console.error('getFlaggedDiscussions error:', error)
    return null
  }
}

/**
 * Get moderation history (processed flags)
 */
export async function getModerationHistory(
  page = 0,
  size = 20,
): Promise<PaginatedResponse<FlaggedDiscussionDto> | null> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.DISCUSSION_MODERATION.HISTORY,
      {
        params: { page, size },
      },
    )
    return response.data.data
  } catch (error) {
    console.error('getModerationHistory error:', error)
    return null
  }
}

/**
 * Get critical flagged discussions (PENDING only)
 */
export async function getCriticalFlags(
  page = 0,
  size = 20,
): Promise<PaginatedResponse<FlaggedDiscussionDto> | null> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.DISCUSSION_MODERATION.CRITICAL,
      {
        params: { page, size },
      },
    )
    return response.data.data
  } catch (error) {
    console.error('getCriticalFlags error:', error)
    return null
  }
}

/**
 * Moderate a flagged discussion (approve or reject)
 */
export async function moderateFlag(
  flagId: number,
  request: DiscussionModerationActionRequest,
): Promise<boolean> {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.DISCUSSION_MODERATION.MODERATE(flagId),
      request,
    )
    return response.data.status === 'success'
  } catch (error) {
    console.error(`moderateFlag error for flagId ${flagId}:`, error)
    return false
  }
}

/**
 * Get moderation statistics
 */
export async function getModerationStatistics(): Promise<DiscussionModerationStatisticsDto | null> {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.DISCUSSION_MODERATION.STATISTICS,
    )
    return response.data.data
  } catch (error) {
    console.error('getModerationStatistics error:', error)
    return null
  }
}
