import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Den, type DenWithMembers } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/hooks/useAuthToken';

export function useDens() {
  return useQuery({
    queryKey: queryKeys.dens,
    queryFn: async (): Promise<Den[]> => {
      const response = await apiClient.getDens();
      return response.data.data.dens;
    },
  });
}

export function useMyDens() {
  const token = useAuthToken();
  return useQuery({
    queryKey: queryKeys.densMine,
    queryFn: async (): Promise<Den[]> => {
      const response = await apiClient.getMyDens();
      return response.data.data.dens;
    },
    enabled: !!token,
  });
}

export function useDen(id: string) {
  return useQuery({
    queryKey: queryKeys.den(id),
    queryFn: async (): Promise<DenWithMembers> => {
      const response = await apiClient.getDen(id);
      return response.data.data.den;
    },
    enabled: !!id,
  });
}

export function useCreateDen() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; emoji?: string; isPublic: boolean; strategy: 'steady' | 'adventurous'; contractAddress?: string }) => {
      const response = await apiClient.createDen(data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dens });
      queryClient.invalidateQueries({ queryKey: queryKeys.densMine });
    },
  });
}

export function useJoinDen() {
  return useMutation({
    mutationFn: async ({ denId, amountTon }: { denId: string; amountTon: string }) => {
      const response = await apiClient.joinDen(denId, amountTon);
      return response.data.data;
    },
  });
}

export function useConfirmJoinDen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ denId, confirmationToken, txBoc }: { denId: string; confirmationToken: string; txBoc: string }) => {
      const response = await apiClient.confirmJoinDen(denId, { confirmationToken, txBoc });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dens });
      queryClient.invalidateQueries({ queryKey: queryKeys.densMine });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
  });
}

export function useSyncDen() {
  return useMutation({
    mutationFn: async (denId: string) => {
      const response = await apiClient.syncDen(denId);
      return response.data.data.sync;
    },
  });
}

export function useUnwindDen() {
  return useMutation({
    mutationFn: async ({ denId, mode }: { denId: string; mode?: 'standard' | 'instant' | 'best-rate' }) => {
      const response = await apiClient.unwindDen(denId, mode);
      return response.data.data.unwind;
    },
  });
}

export function useLeaveDen() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (denId: string) => {
      const response = await apiClient.leaveDen(denId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dens });
      queryClient.invalidateQueries({ queryKey: queryKeys.densMine });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
  });
}
