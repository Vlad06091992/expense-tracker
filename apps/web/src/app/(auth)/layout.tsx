import { Wallet } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-white">Expense Tracker</h1>
      </div>
      {children}
    </div>
  );
}
