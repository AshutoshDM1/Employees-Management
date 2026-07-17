import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useUsersQuery() {
  return useQuery<UserInfo[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });
}
