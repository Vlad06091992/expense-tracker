'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config/routes';
import { getToken } from '@/shared/lib/token';
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
    return null;
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-8">{children}</main>
    </div>
  );
}
