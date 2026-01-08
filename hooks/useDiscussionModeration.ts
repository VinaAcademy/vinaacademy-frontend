/**
 * Custom hooks for discussion moderation
 * React Query integration for staff/admin moderation features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFlaggedDiscussions,
  getModerationHistory,
  getCriticalFlags,
  moderateFlag,
  getModerationStatistics,
} from '@/services/discussionModerationService'
import type {
  ModerationStatus,
  DiscussionModerationActionRequest,
} from '@/types/discussion-moderation'

/**
 * Query key factory for discussion moderation
 */
export const DISCUSSION_MODERATION_KEYS = {
  all: ['discussionModeration'] as const,
  flagged: (status?: ModerationStatus, page?: number) =>
    ['discussionModeration', 'flagged', status, page] as const,
  history: (page?: number) =>
    ['discussionModeration', 'history', page] as const,
  critical: (page?: number) =>
    ['discussionModeration', 'critical', page] as const,
  statistics: () => ['discussionModeration', 'statistics'] as const,
}

/**
 * Get flagged discussions with optional status filter
 */
export function useFlaggedDiscussions(
  status?: ModerationStatus,
  page = 0,
  size = 20,
) {
  return useQuery({
    queryKey: DISCUSSION_MODERATION_KEYS.flagged(status, page),
    queryFn: () => getFlaggedDiscussions(status, page, size),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Get moderation history
 */
export function useModerationHistory(page = 0, size = 20) {
  return useQuery({
    queryKey: DISCUSSION_MODERATION_KEYS.history(page),
    queryFn: () => getModerationHistory(page, size),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Get critical flags
 */
export function useCriticalFlags(page = 0, size = 20) {
  return useQuery({
    queryKey: DISCUSSION_MODERATION_KEYS.critical(page),
    queryFn: () => getCriticalFlags(page, size),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Get moderation statistics
 */
export function useModerationStatistics() {
  return useQuery({
    queryKey: DISCUSSION_MODERATION_KEYS.statistics(),
    queryFn: getModerationStatistics,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto-refetch every minute
  })
}

/**
 * Mutation to moderate a flag
 */
export function useModerateFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      flagId,
      request,
    }: {
      flagId: number
      request: DiscussionModerationActionRequest
    }) => moderateFlag(flagId, request),
    onSuccess: () => {
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: DISCUSSION_MODERATION_KEYS.all,
      })
    },
  })
}
