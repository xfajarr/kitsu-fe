import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Quest } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useQuests() {
  return useQuery({
    queryKey: queryKeys.quests,
    queryFn: async (): Promise<Quest[]> => {
      const response = await apiClient.getQuests();
      return response.data.data.quests;
    },
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
