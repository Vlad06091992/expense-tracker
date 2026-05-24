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
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {transaction.description || 'Без описания'}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDate(transaction.date)}
          {categoryName ? ` · ${categoryName}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'whitespace-nowrap font-semibold tabular-nums',
            isIncome ? 'text-emerald-600' : 'text-destructive',
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
