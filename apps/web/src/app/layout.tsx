import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Track your expenses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
