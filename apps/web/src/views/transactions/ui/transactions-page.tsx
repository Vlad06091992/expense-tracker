'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import type { TransactionDto } from '@repo/shared-types';

import { useCategories } from '@/entities/category';
import { formatAmount, formatDate, useTransactions } from '@/entities/transaction';
import { TransactionFormDialog, useDeleteTransaction } from '@/features/transaction-form';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

const PAGE_SIZE = 10;

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionDto | undefined>(undefined);

  const { data, isLoading, isError, isPlaceholderData } = useTransactions({
    page,
    limit: PAGE_SIZE,
  });
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteTransaction();

  const categoryName = (id: string | null) =>
    id ? categories?.find((category) => category.id === id)?.name : undefined;

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(transaction: TransactionDto) {
    setEditing(transaction);
    setFormOpen(true);
  }

  async function handleDelete(transaction: TransactionDto) {
    if (!window.confirm('Удалить транзакцию?')) return;
    try {
      await deleteMutation.mutateAsync(transaction.id);
      toast.success('Транзакция удалена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Транзакции</h1>
        <Button onClick={openCreate}>Добавить</Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Описание</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Не удалось загрузить транзакции
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Транзакций пока нет
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {transaction.description || 'Без описания'}
                  </TableCell>
                  <TableCell>{categoryName(transaction.categoryId) ?? '—'}</TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold tabular-nums',
                      transaction.type === 'INCOME'
                        ? 'text-emerald-600'
                        : 'text-destructive',
                    )}
                  >
                    {transaction.type === 'INCOME' ? '+' : '−'}
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(transaction)}>
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDelete(transaction)}
                        >
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.total > 0 ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Стр. {meta.page} из {totalPages} · всего {meta.total}
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

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editing}
      />
    </div>
  );
}
