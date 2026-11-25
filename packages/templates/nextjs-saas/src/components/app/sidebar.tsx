import Link from "next/link";

export function AppSidebar() {
  return (
    <aside className="w-60 border-r border-zinc-800 p-4 bg-zinc-950 flex flex-col justify-between">
      <div className="space-y-4">
        <Link href="/" className="font-bold text-white tracking-tight">Console</Link>
        <nav className="flex flex-col space-y-1 text-sm text-zinc-400">
          <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-white">Overview</Link>
          <Link href="/billing" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-white">Billing</Link>
          <Link href="/settings" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-white">Settings</Link>
        </nav>
      </div>
    </aside>
  );
}
