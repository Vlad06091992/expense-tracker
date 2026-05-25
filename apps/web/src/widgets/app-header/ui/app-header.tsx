'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Tags, LogOut, Wallet } from 'lucide-react';

import { useCurrentUser } from '@/entities/user';
import { useLogout } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';

const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: 'Главная', icon: LayoutDashboard },
  { href: ROUTES.transactions, label: 'Транзакции', icon: ArrowLeftRight },
  { href: ROUTES.categories, label: 'Категории', icon: Tags },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Профиль';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-900 px-4 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">Expense Tracker</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <div className="mb-2 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{displayName}</p>
            {user?.email ? (
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            ) : null}
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
