'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { TransactionDto } from '@repo/shared-types';

import { useCategories } from '@/entities/category';
import { formatAmount, formatDate, useTransactions } from '@/entities/transaction';
import { TransactionFormDialog, useDeleteTransaction } from '@/features/transaction-form';
import { PAGE_SIZE } from '@/shared/config/pagination';
import { cn } from '@/shared/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
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

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionDto | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<TransactionDto | undefined>(undefined);

  const { data, isLoading, isError, isPlaceholderData } = useTransactions({ page, limit: PAGE_SIZE });
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteTransaction();

  const categoryName = (id: string | null) =>
    id ? categories?.find((c) => c.id === id)?.name : undefined;

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

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if (page > 1 && data?.items.length === 1) setPage((p) => p - 1);
      toast.success('Транзакция удалена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Не удалось удалить');
    } finally {
      setDeleteTarget(undefined);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Транзакции</h1>
          <p className="mt-1 text-sm text-slate-500">История доходов и расходов</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100">
              <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-400">Описание</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-400">Категория</TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-400">Дата</TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-slate-400">Сумма</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Не удалось загрузить транзакции
                </TableCell>
              </TableRow>
            ) : !data || data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Транзакций пока нет
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((transaction) => (
                <TableRow key={transaction.id} className="border-slate-100 transition-colors hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                          transaction.type === 'INCOME'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-500',
                        )}
                      >
                        {transaction.type === 'INCOME' ? '+' : '−'}
                      </div>
                      <span className="font-medium text-slate-800">
                        {transaction.description || 'Без описания'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {categoryName(transaction.categoryId) ?? 'Без категории'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{formatDate(transaction.date)}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold tabular-nums',
                      transaction.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500',
                    )}
                  >
                    {transaction.type === 'INCOME' ? '+' : '−'}
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => openEdit(transaction)}>
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onSelect={() => setDeleteTarget(transaction)}
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
          <span className="text-sm text-slate-400">
            Стр. {meta.page} из {totalPages} · всего {meta.total}
          </span>
          <div className="flex gap-2">
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
        </div>
      ) : null}

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} transaction={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить транзакцию?</AlertDialogTitle>
            <AlertDialogDescription>
              «{deleteTarget?.description || 'Без описания'}» будет удалена без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={confirmDelete}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
