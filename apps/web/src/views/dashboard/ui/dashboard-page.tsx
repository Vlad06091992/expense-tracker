'use client';

import { formatAmount, useTransactions } from '@/entities/transaction';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { RecentTransactions } from '@/widgets/recent-transactions';

export function DashboardPage() {
  const { data } = useTransactions({ page: 1, limit: 10 });
  const summary = data?.summary;

  const cards = [
    { label: 'Доходы', value: summary?.totalIncome ?? 0, className: 'text-emerald-600' },
    { label: 'Расходы', value: summary?.totalExpense ?? 0, className: 'text-destructive' },
    { label: 'Баланс', value: summary?.balance ?? 0, className: '' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Главная</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-2xl font-bold tabular-nums', card.className)}>
                {formatAmount(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RecentTransactions />
    </div>
  );
}
