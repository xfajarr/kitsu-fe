import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: async () => {
      const response = await apiClient.getLeaderboard();
      return response.data.data.leaderboard;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
