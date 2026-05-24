'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { clearToken } from '@/shared/lib/token';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    router.replace(ROUTES.signIn);
  };
}
