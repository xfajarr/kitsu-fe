import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Transaction } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/hooks/useAuthToken';

export function useTransactions() {
  const token = useAuthToken();
  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: async (): Promise<Transaction[]> => {
      const response = await apiClient.getTransactionHistory();
      return response.data.data.transactions;
    },
    enabled: !!token,
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { type: 'vault' | 'goal' | 'den'; targetId: string; amountTon: string }) => {
      const response = await apiClient.deposit(data);
      return response.data.data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { type: 'vault' | 'goal' | 'den'; sourceId: string; amountTon: string }) => {
      const response = await apiClient.withdraw(data);
      return response.data.data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}
