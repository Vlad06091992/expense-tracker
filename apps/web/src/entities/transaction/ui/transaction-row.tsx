import type { ReactNode } from 'react';
import type { TransactionDto } from '@repo/shared-types';

import { cn } from '@/shared/lib/utils';

import { formatAmount, formatDate } from '../lib/format';

interface TransactionRowProps {
  transaction: TransactionDto;
  categoryName?: string;
  actions?: ReactNode;
}

export function TransactionRow({ transaction, categoryName, actions }: TransactionRowProps) {
  const isIncome = transaction.type === 'INCOME';

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
            isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
          )}
        >
          {isIncome ? '+' : '−'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">{transaction.description || 'Без описания'}</p>
          <p className="text-xs text-slate-400">
            {formatDate(transaction.date)}
            {categoryName ? ` · ${categoryName}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'whitespace-nowrap text-sm font-semibold tabular-nums',
            isIncome ? 'text-emerald-600' : 'text-red-500',
          )}
        >
          {isIncome ? '+' : '−'}
          {formatAmount(transaction.amount)}
        </span>
        {actions}
      </div>
    </div>
  );
}
