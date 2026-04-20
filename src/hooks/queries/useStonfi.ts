import { useQuery } from '@tanstack/react-query';
import { apiClient, type StonfiConfig, type StonfiPool, type StonfiToken, type StonfiWalletAsset } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useWallet } from '@/hooks/useWallet';
import { useWalletNetwork } from '@/hooks/useWalletNetwork';

export function useStonfiConfig() {
  const { network } = useWalletNetwork();

  return useQuery({
    queryKey: queryKeys.stonfiConfig(network),
    queryFn: async (): Promise<StonfiConfig> => {
      const response = await apiClient.getStonfiConfig();
      return response.data.data.config;
    },
    staleTime: 1000 * 60,
  });
}

export function useStonfiAssets() {
  const { network } = useWalletNetwork();

  return useQuery({
    queryKey: queryKeys.stonfiAssets(network),
    queryFn: async (): Promise<StonfiToken[]> => {
      const response = await apiClient.getStonfiAssets();
      return response.data.data.assets;
    },
    staleTime: 1000 * 60,
  });
}

export function useStonfiPools() {
  const { network } = useWalletNetwork();

  return useQuery({
    queryKey: queryKeys.stonfiPools(network),
    queryFn: async (): Promise<StonfiPool[]> => {
      const response = await apiClient.getStonfiPools();
      return response.data.data.pools;
    },
    staleTime: 1000 * 60,
  });
}

/** Vetted high-liquidity STON.fi mainnet pairs (TON / USD₮ / STON); does not follow wallet network. */
export function useStonfiRecommendedPools() {
  return useQuery({
    queryKey: queryKeys.stonfiRecommendedPools,
    queryFn: async (): Promise<StonfiPool[]> => {
      const response = await apiClient.getStonfiRecommendedPools();
      return response.data.data.pools;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useStonfiWalletAssets() {
  const { network } = useWalletNetwork();
  const { address, connected } = useWallet();

  return useQuery({
    queryKey: queryKeys.stonfiWalletAssets(network, address || 'guest'),
    queryFn: async (): Promise<StonfiWalletAsset[]> => {
      if (!address) {
        return [];
      }
      const response = await apiClient.getStonfiWalletAssets(address);
      return response.data.data.assets;
    },
    enabled: connected && !!address,
    staleTime: 1000 * 30,
  });
}
