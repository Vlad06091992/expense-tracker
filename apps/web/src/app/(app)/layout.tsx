'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { getToken } from '@/shared/lib/token';
import { Skeleton } from '@/shared/ui/skeleton';
import { AppHeader } from '@/widgets/app-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setAuthorized(true);
    } else {
      router.replace(ROUTES.signIn);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="w-60 shrink-0 bg-slate-900" />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-5 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
