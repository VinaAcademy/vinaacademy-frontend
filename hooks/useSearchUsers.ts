import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/services/profileService';
import { QUERY_KEYS } from '@/config/query-keys.config';

/**
 * Hook to search users
 * Debouncing should be handled by the caller to avoid excessive API calls
 */
export const useSearchUsers = (keywords: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER.search(keywords),
    queryFn: () => searchUsers(keywords),
    enabled: enabled && keywords.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
