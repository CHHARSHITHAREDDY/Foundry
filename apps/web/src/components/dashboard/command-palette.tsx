"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
  onNewCompany?: () => void;
  onBuyCredits?: () => void;
  onSelectCompany?: (company: string) => void;
}

interface CommandItem {
  id: string;
  group: "pages" | "companies";
  title: string;
  subtitle: string;
  tag?: string;
  href: string;
}

const NAVIGATION_PAGES: CommandItem[] = [
  { id: "page-dashboard", group: "pages", title: "Dashboard", subtitle: "Overview & active companies", tag: "PAGE", href: "/dashboard" },
  { id: "page-billing", group: "pages", title: "Billing Overview", subtitle: "Credits balance & action pricing", tag: "PAGE", href: "/billing" },
  { id: "page-credits", group: "pages", title: "Credit Ledger", subtitle: "Immutable transaction history", tag: "PAGE", href: "/billing/credits" },
  { id: "page-plans", group: "pages", title: "Plans & Checkout", subtitle: "Top up compute credits", tag: "PAGE", href: "/billing/plans" },
  { id: "page-notifications", group: "pages", title: "Notifications", subtitle: "System alerts and approvals", tag: "PAGE", href: "/notifications" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const { data, isLoading } = useQuery({
    queryKey: ["companies", "command", query],
    queryFn: () => api.getCompanies({ search: query.trim() || undefined, limit: 8 }),
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const matchedPages = NAVIGATION_PAGES.filter(
    (p) => !q || p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
  );
  const companyItems: CommandItem[] = (data?.companies ?? []).map((c) => ({
    id: `company-${c.id}`,
    group: "companies",
    title: c.name,
    subtitle: c.tagline || c.subdomain || "Venture workspace",
    tag: c.status,
    href: `/companies/${c.id}`,
  }));

  const allItems = [...companyItems, ...matchedPages];

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-ink px-3 h-12">
          <span className="material-symbols-outlined text-[18px] text-muted mr-2">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your companies or jump to a page..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] px-2 py-0.5 border border-border-subtle text-muted hover:text-ink cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
          {isLoading && (
            <div className="p-4 text-xs text-muted">Searching companies...</div>
          )}

          {!isLoading && allItems.length === 0 && (
            <div className="p-6 text-center text-xs text-muted">No matching companies or pages found.</div>
          )}

          {allItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                router.push(item.href);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-stone flex items-center justify-between gap-3 cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-ink">{item.title}</p>
                <p className="text-[11px] text-muted truncate max-w-md">{item.subtitle}</p>
              </div>
              {item.tag && (
                <span className="text-[10px] px-1.5 py-0.5 border border-ink bg-paper text-ink uppercase shrink-0">
                  {item.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
