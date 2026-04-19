import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type User } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      const response = await apiClient.getMe();
      return response.data.data.user;
    },
    retry: false,
  });
}

export function useConnectWallet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ address, signature, timestamp }: { address: string; signature: string; timestamp: number }) => {
      const response = await apiClient.connect(address, signature, timestamp);
      return response.data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(queryKeys.user, data.user);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { username?: string; tonHandle?: string }) => {
      const response = await apiClient.updateProfile(updates);
      return response.data.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.user, user);
    },
  });
}
