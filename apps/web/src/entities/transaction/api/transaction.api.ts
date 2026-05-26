import type {
  CreateTransactionInput,
  TransactionDto,
  TransactionListResponse,
  UpdateTransactionInput,
} from '@repo/shared-types';

import { apiFetch } from '@/shared/api/http-client';

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
}

export function listTransactions(params: ListTransactionsParams = {}): Promise<TransactionListResponse> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return apiFetch<TransactionListResponse>(`/transactions${qs ? `?${qs}` : ''}`);
}

export function createTransaction(input: CreateTransactionInput): Promise<TransactionDto> {
  return apiFetch<TransactionDto>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTransaction(id: string, input: UpdateTransactionInput): Promise<TransactionDto> {
  return apiFetch<TransactionDto>(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTransaction(id: string): Promise<void> {
  return apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' });
}
