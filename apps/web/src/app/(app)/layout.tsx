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
      <div className="min-h-screen">
        <div className="border-b">
          <div className="container flex h-16 items-center">
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <main className="container py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-8">{children}</main>
    </div>
  );
}
