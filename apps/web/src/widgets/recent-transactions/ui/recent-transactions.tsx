'use client';

import { useState } from 'react';

import { useCategories } from '@/entities/category';
import { TransactionRow, useTransactions } from '@/entities/transaction';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

const PAGE_SIZE = 10;

export function RecentTransactions() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isPlaceholderData } = useTransactions({
    page,
    limit: PAGE_SIZE,
  });
  const { data: categories } = useCategories();

  const categoryName = (id: string | null) =>
    id ? categories?.find((category) => category.id === id)?.name : undefined;

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние транзакции</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Не удалось загрузить транзакции
          </p>
        ) : !data || data.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Транзакций пока нет
          </p>
        ) : (
          <div className="divide-y">
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
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Стр. {meta.page} из {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isPlaceholderData}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Назад
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isPlaceholderData}
                onClick={() => setPage((current) => current + 1)}
              >
                Вперёд
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
