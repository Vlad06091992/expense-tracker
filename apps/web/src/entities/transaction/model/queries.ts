'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listTransactions, type ListTransactionsParams } from '../api/transaction.api';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (params: ListTransactionsParams) => ['transactions', 'list', params] as const,
};

export function useTransactions(params: ListTransactionsParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => listTransactions(params),
    placeholderData: keepPreviousData,
  });
}
