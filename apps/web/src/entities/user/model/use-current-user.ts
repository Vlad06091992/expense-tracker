'use client';

import { useQuery } from '@tanstack/react-query';

import { getCurrentUser } from '../api/user.api';

export const userKeys = {
  current: ['user', 'me'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current,
    queryFn: getCurrentUser,
  });
}
