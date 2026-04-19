import { useQuery } from '@tanstack/react-query';
import { apiClient, type Portfolio } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function usePortfolio() {
  return useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: async (): Promise<Portfolio> => {
      const response = await apiClient.getPortfolio();
      return response.data.data.portfolio;
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}

export function usePrices() {
  return useQuery({
    queryKey: queryKeys.prices,
    queryFn: async () => {
      const response = await apiClient.getPrices();
      return response.data.data.prices;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
