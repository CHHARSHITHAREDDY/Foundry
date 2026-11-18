"use client";

interface DashboardHeaderProps {
  currentBreadcrumb?: string;
  onOpenCommandPalette: () => void;
  onNotificationsClick?: () => void;
}

export function DashboardHeader({
  currentBreadcrumb = "Companies",
  onOpenCommandPalette,
  onNotificationsClick,
}: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-surface/90 backdrop-blur-md border-b border-[#111111] z-40 px-space-md flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-space-md">
        <div className="font-label-md text-label-md text-secondary uppercase flex items-center gap-1.5 font-mono">
          <span className="text-on-surface font-semibold">Workspace</span>
          <span>//</span>
          <span>Syndicate-01</span>
          <span>/</span>
          <span className="text-primary font-bold">{currentBreadcrumb}</span>
        </div>
      </div>

      {/* Search Input Trigger */}
      <div className="flex-1 max-w-sm mx-space-lg">
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center cursor-pointer group"
        >
          <span className="material-symbols-outlined absolute left-2.5 text-[16px] text-secondary group-hover:text-primary transition-colors">
            search
          </span>
          <input
            readOnly
            onClick={onOpenCommandPalette}
            type="text"
            placeholder="Search entities, records, logs..."
            className="w-full h-8 pl-8 pr-12 bg-surface-container-lowest border border-[#111111] font-label-sm text-label-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary rounded-DEFAULT cursor-pointer select-none"
          />
          <div className="absolute right-2 px-1 py-0.5 border border-surface-variant bg-surface-container font-label-sm text-label-sm text-secondary uppercase font-mono">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md">
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-surface-container border border-surface-variant font-label-sm text-label-sm text-secondary font-mono">
          <span className="w-1.5 h-1.5 bg-[#15803D]" />
          <span>SYS_OK</span>
          <span className="text-surface-variant">|</span>
          <span>LATENCY 18ms</span>
        </div>

        <button
          onClick={onNotificationsClick}
          type="button"
          className="relative p-1 text-on-surface hover:text-primary transition-colors cursor-pointer"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary" />
        </button>

        <div className="h-4 w-px bg-surface-variant" />

        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-sm">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}

