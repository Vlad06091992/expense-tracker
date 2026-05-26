'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useCategories } from '@/entities/category';
import { TransactionRow, useTransactions } from '@/entities/transaction';
import { PAGE_SIZE } from '@/shared/config/pagination';
import { Skeleton } from '@/shared/ui/skeleton';

export function RecentTransactions() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isPlaceholderData } = useTransactions({
    page,
    limit: PAGE_SIZE,
  });
  const { data: categories } = useCategories();

  const categoryName = (id: string | null) => (id ? categories?.find((c) => c.id === id)?.name : undefined);

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Последние транзакции</h2>
        {meta && meta.total > 0 ? (
          <span className="text-sm text-slate-400">
            {meta.page} / {totalPages}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-10 text-center text-sm text-slate-400">Не удалось загрузить транзакции</p>
      ) : !data || data.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Транзакций пока нет</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {data.items.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              categoryName={categoryName(transaction.categoryId)}
            />
          ))}
        </div>
      )}

      {meta && meta.total > 0 ? (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
            disabled={page <= 1 || isPlaceholderData}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
            disabled={page >= totalPages || isPlaceholderData}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
