'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { useCurrentUser } from '@/entities/user';
import { useLogout } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: 'Главная' },
  { href: ROUTES.transactions, label: 'Транзакции' },
  { href: ROUTES.categories, label: 'Категории' },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const displayName = user?.name?.trim() || user?.email || 'Профиль';

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between gap-4">
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {displayName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name?.trim() || 'Без имени'}</span>
                {user?.email ? (
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
