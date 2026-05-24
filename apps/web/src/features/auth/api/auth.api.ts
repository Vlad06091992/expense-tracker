import type { AuthResponse, LoginInput, RegisterInput } from '@repo/shared-types';

import { API_URL } from '@/shared/config/api';
import { ApiError } from '@/shared/api/http-client';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (Array.isArray(body.message) ? body.message[0] : body.message) ?? 'Something went wrong';
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export async function signIn(data: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}

export async function signUp(data: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<AuthResponse>(res);
}
