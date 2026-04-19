import { useQuery, useMutation } from '@tanstack/react-query';
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
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; emoji?: string; targetTon: string; visibility: 'private' | 'public'; strategy: 'tonstakers' | 'stonfi'; dueDate?: string }) => {
      const response = await apiClient.createGoal(data);
      return response.data.data;
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
  return useMutation({
    mutationFn: async ({ id, amountTon }: { id: string; amountTon: string }) => {
      const response = await apiClient.depositGoal(id, amountTon);
      return response.data.data.deposit;
    },
  });
}

export function useClaimGoal() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.claimGoal(id);
      return response.data.data.claim;
    },
  });
}
