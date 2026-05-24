import type { UserDto } from '@repo/shared-types';

import { apiFetch } from '@/shared/api/http-client';

export function getCurrentUser(): Promise<UserDto> {
  return apiFetch<UserDto>('/users/me');
}
