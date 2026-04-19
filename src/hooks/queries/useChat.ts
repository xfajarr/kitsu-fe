import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useChat() {
  return useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: { portfolioUsd?: number; goalsCount?: number; densCount?: number; level?: number } }) => {
      const response = await apiClient.chat(message, context);
      return response.data.data.reply;
    },
  });
}
