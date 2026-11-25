"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface SidebarProps {
  currentTab?: string;
  onTabChange?: (tab: any) => void;
  onNewCompany?: () => void;
  onBuyCredits?: () => void;
  onSelectCompany?: (companyId: string) => void;
}

export function Sidebar({ onNewCompany }: SidebarProps) {
  const pathname = usePathname();

  const {
    data: companiesData,
    isLoading: companiesLoading,
    isError: companiesError,
    refetch: refetchCompanies,
  } = useQuery({
    queryKey: ["companies", "sidebar"],
    queryFn: () => api.getCompanies({ limit: 10 }),
  });

  const { data: creditsData, isLoading: creditsLoading } = useQuery({
    queryKey: ["billing", "credits"],
    queryFn: () => api.getCredits(),
  });

  const companies = companiesData?.companies ?? [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface-container-low border-r border-ink z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand */}
        <div className="h-14 px-4 border-b border-ink flex items-center justify-between bg-surface shrink-0">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <span className="font-serif text-xl font-bold tracking-tight text-ink">Foundry</span>
            <span className="w-1.5 h-1.5 bg-accent mt-1" />
          </Link>
          <span className="text-[10px] text-muted uppercase px-1.5 py-0.5 border border-border-subtle bg-stone font-mono">
            LIVE
          </span>
        </div>

        {/* Primary Action */}
        <div className="p-3 border-b border-border-subtle shrink-0">
          {onNewCompany ? (
            <button
              onClick={onNewCompany}
              type="button"
              className="w-full h-9 bg-ink text-on-primary font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-ink hover:bg-accent hover:border-accent transition-all shadow-editorial-sm cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Company</span>
            </button>
          ) : (
            <Link
              href="/new"
              className="w-full h-9 bg-ink text-on-primary font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-ink hover:bg-accent hover:border-accent transition-all shadow-editorial-sm font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Company</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2 flex flex-col gap-1 overflow-y-auto flex-1">
          <Link
            href="/dashboard"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              pathname === "/dashboard"
                ? "bg-ink text-on-primary font-bold"
                : "text-on-surface-variant hover:bg-stone hover:text-ink"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/billing"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              pathname.startsWith("/billing")
                ? "bg-ink text-on-primary font-bold"
                : "text-on-surface-variant hover:bg-stone hover:text-ink"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>Billing</span>
          </Link>

          <Link
            href="/notifications"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              pathname.startsWith("/notifications")
                ? "bg-ink text-on-primary font-bold"
                : "text-on-surface-variant hover:bg-stone hover:text-ink"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span>Notifications</span>
          </Link>

          {/* Companies List */}
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <div className="px-2.5 mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
                Your Companies
              </span>
              <span className="font-mono text-[10px] text-muted">{companiesData?.total ?? 0}</span>
            </div>

            {companiesLoading ? (
              <div className="px-2.5 space-y-2">
                <div className="h-6 bg-stone animate-pulse" />
                <div className="h-6 bg-stone animate-pulse" />
              </div>
            ) : companiesError ? (
              <div className="px-2.5 py-2 text-[11px] font-mono text-error space-y-1">
                <p>Failed to load companies.</p>
                <button
                  type="button"
                  onClick={() => refetchCompanies()}
                  className="underline text-link cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : companies.length === 0 ? (
              <p className="px-2.5 py-1 text-[11px] font-mono text-muted">No companies yet.</p>
            ) : (
              <div className="space-y-1">
                {companies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/companies/${c.id}`}
                    className="flex items-center justify-between px-2.5 py-1.5 text-xs font-mono hover:bg-stone text-ink transition-colors"
                  >
                    <span className="truncate pr-2">{c.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {c.demo && (
                        <span className="text-[9px] px-1 bg-warning-soft text-warning border border-warning uppercase">
                          DEMO
                        </span>
                      )}
                      <span
                        className={`w-1.5 h-1.5 ${
                          c.status === "LIVE"
                            ? "bg-success"
                            : c.status === "FAILED"
                            ? "bg-error"
                            : "bg-accent"
                        }`}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Credits Badge */}
      <div className="p-3 border-t border-ink bg-surface shrink-0">
        <Link
          href="/billing/credits"
          className="block p-2.5 bg-surface-container-lowest border border-ink shadow-editorial-sm hover:shadow-editorial transition-all"
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase text-muted mb-1">
            <span>Credits Balance</span>
            <span className="text-accent font-bold">LIVE</span>
          </div>
          {creditsLoading ? (
            <div className="h-6 w-20 bg-stone animate-pulse" />
          ) : (
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-xl font-bold text-ink" data-testid="sidebar-credits-balance">
                {creditsData?.balance ?? 0}
              </span>
              <span className="font-mono text-[10px] text-link underline">Ledger →</span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}

export { Sidebar as DashboardSidebar };
