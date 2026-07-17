import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface MessageData {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export function useMessagesQuery(userId: string | null) {
  return useQuery<MessageData[]>({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await api.get(`/messages?userId=${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

interface SendMessagePayload {
  receiverId: string;
  content: string;
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation<MessageData, Error, SendMessagePayload>({
    mutationFn: async (payload) => {
      const response = await api.post('/messages', payload);
      return response.data;
    },
    onSuccess: (newMessage, variables) => {
      const convoId = variables.receiverId;
      // Manually append the new message to TanStack Query's cache
      queryClient.setQueryData<MessageData[]>(['messages', convoId], (oldMessages) => {
        if (!oldMessages) return [newMessage];
        // Prevent duplicate appending if the socket already pushed it
        if (oldMessages.some((m) => m.id === newMessage.id)) return oldMessages;
        return [...oldMessages, newMessage];
      });
    },
  });
}
