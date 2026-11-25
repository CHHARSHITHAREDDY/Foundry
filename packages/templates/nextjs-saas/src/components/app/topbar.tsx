export function AppTopbar({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
      <h1 className="text-sm font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Connected</span>
      </div>
    </header>
  );
}
