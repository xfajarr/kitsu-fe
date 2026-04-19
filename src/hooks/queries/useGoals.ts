import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Goal } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/hooks/useAuthToken';

export function useGoals() {
  const token = useAuthToken();
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: async (): Promise<Goal[]> => {
      const response = await apiClient.getGoals();
      return response.data.data.goals;
    },
    enabled: !!token,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; emoji?: string; targetTon: string; visibility: 'private' | 'public'; strategy: 'tonstakers' | 'stonfi'; dueDate?: string }) => {
      const response = await apiClient.createGoal(data);
      return response.data.data;
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

export function useDepositGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, amountTon }: { id: string; amountTon: string }) => {
      const response = await apiClient.depositGoal(id, amountTon);
      return response.data.data.deposit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useClaimGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.claimGoal(id);
      return response.data.data.claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}
