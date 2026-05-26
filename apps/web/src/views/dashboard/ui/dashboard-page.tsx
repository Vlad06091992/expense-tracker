'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

import { formatAmount, useTransactions } from '@/entities/transaction';
import { cn } from '@/shared/lib/utils';
import { RecentTransactions } from '@/widgets/recent-transactions';

const CARD_CONFIG = [
  {
    label: 'Доходы',
    key: 'totalIncome' as const,
    icon: TrendingUp,
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
    borderColor: 'border-l-emerald-400',
  },
  {
    label: 'Расходы',
    key: 'totalExpense' as const,
    icon: TrendingDown,
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    valueColor: 'text-red-600',
    borderColor: 'border-l-red-400',
  },
  {
    label: 'Баланс',
    key: 'balance' as const,
    icon: Wallet,
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
    borderColor: 'border-l-blue-400',
  },
] as const;

export function DashboardPage() {
  const { data } = useTransactions({ page: 1, limit: 10 });
  const summary = data?.summary;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Главная</h1>
        <p className="mt-1 text-sm text-slate-500">Обзор ваших финансов</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {CARD_CONFIG.map(
          ({ label, key, icon: Icon, bg, iconBg, iconColor, valueColor, borderColor }) => (
            <div
              key={label}
              className={cn('rounded-2xl border-l-4 p-6 shadow-sm', bg, borderColor)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className={cn('mt-2 text-3xl font-bold tabular-nums', valueColor)}>
                    {formatAmount(summary?.[key] ?? 0)}
                  </p>
                </div>
                <div
                  className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}
                >
                  <Icon className={cn('h-5 w-5', iconColor)} />
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <RecentTransactions />
    </div>
  );
}
