import * as React from "react";
import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md">
              VS
            </div>
            <span className="font-semibold tracking-tight text-white">Console</span>
          </div>

          <nav className="flex flex-col space-y-1">
            <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              Overview
            </Link>
            <Link href="/billing" className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              Billing
            </Link>
            <Link href="/settings" className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              Settings
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300">
              FO
            </div>
            <div className="text-xs">
              <p className="font-medium text-white">Operator</p>
              <p className="text-zinc-400">admin@app.internal</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-zinc-950">
        {children}
      </main>
    </div>
  );
}
