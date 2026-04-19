import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Quest } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/hooks/useAuthToken';

export function useQuests() {
  const token = useAuthToken();
  return useQuery({
    queryKey: queryKeys.quests,
    queryFn: async (): Promise<Quest[]> => {
      const response = await apiClient.getQuests();
      return response.data.data.quests;
    },
    enabled: !!token,
  });
}

export function useClaimQuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (questId: string) => {
      const response = await apiClient.claimQuest(questId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quests });
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}
