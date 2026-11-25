"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", href: "/billing" },
  { label: "Credits Ledger", href: "/billing/credits" },
  { label: "Plans & Top-Up", href: "/billing/plans" },
  { label: "Invoices", href: "/billing/invoices" },
];

export function BillingNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink pb-3 font-mono text-xs">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-1.5 border uppercase font-bold transition-colors ${
              active
                ? "bg-ink text-on-primary border-ink"
                : "bg-surface-container-lowest text-ink border-ink hover:bg-stone"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
