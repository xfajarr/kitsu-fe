import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  return useMutation({
    mutationFn: async ({ 
      message, 
      context, 
      history 
    }: { 
      message: string; 
      context?: { portfolioUsd?: number; goalsCount?: number; densCount?: number; level?: number };
      history?: ChatMessage[];
    }) => {
      const response = await apiClient.chat(message, context, history);
      return response.data.data.reply;
    },
  });
}
