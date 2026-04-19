import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Goal } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useGoals() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: async (): Promise<Goal[]> => {
      const response = await apiClient.getGoals();
      return response.data.data.goals;
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { title: string; emoji?: string; targetUsd: string; dueDate?: string }) => {
      const response = await apiClient.createGoal(data);
      return response.data.data.goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; emoji: string; targetUsd: string; dueDate: string | null }> }) => {
      const response = await apiClient.updateGoal(id, data);
      return response.data.data.goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteGoal(id);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}
