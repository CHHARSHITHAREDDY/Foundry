"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompanyRecord {
  id: string;
  name: string;
  slug: string;
  status: "LIVE" | "BUILDING" | "STAGING" | "PAUSED";
  subdomain: string;
  sslActive: boolean;
  version: string;
  metrics?: {
    arr: string;
    visitors: number;
    merchants: number;
  };
}

interface VenturesViewProps {
  onNewCompany: () => void;
  onSelectCompany: (company: string) => void;
}

export function VenturesView({ onNewCompany, onSelectCompany }: VenturesViewProps) {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetch("http://localhost:3001/api/companies");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.companies)) {
            setCompanies(data.companies);
          }
        }
      } catch (err) {
        console.warn("Failed to load companies from Postgres API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  return (
    <div className="p-space-lg lg:p-space-xl max-w-6xl mx-auto w-full flex flex-col gap-space-xl">
      {/* Top Stat Row (Editorial Mono Design) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Active Entities</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">
            {String(companies.length).padStart(2, "0")}
          </div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">POSTGRES LEDGER // CLUSTER A</div>
        </div>

        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Allotted Compute</span>
            <span className="font-label-sm text-label-sm text-secondary font-mono">245 CR</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">
            8/8<span className="text-headline-sm font-label-md text-secondary ml-1 font-mono">AGENTS</span>
          </div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">AUTONOMOUS SWARM // ACTIVE</div>
        </div>

        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Live Data Feeds</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">
            04
          </div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">HN · GITHUB · REDDIT · DEV.TO</div>
        </div>

        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Network Policy</span>
            <span className="font-label-sm text-label-sm font-mono font-bold text-primary">LIVE_STRICT</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">0.8s</div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">ZERO STATIC SEEDS ALLOWED</div>
        </div>
      </div>

      {/* Active Ventures Section (Editorial Mono Design) */}
      <div className="mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm pb-1 border-b border-surface-variant">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-mono font-bold">
            Active Ventures // Dispatch Queue (PostgreSQL Sourced)
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-mono">
            {companies.length} TOTAL INSTANCES
          </span>
        </div>

        {loading ? (
          <div className="p-space-lg text-center font-mono text-secondary text-sm">
            [QUERYING_POSTGRESQL // CONNECTING]
          </div>
        ) : companies.length === 0 ? (
          <div className="p-space-xl border-2 border-dashed border-[#111111] bg-surface-container-lowest text-center flex flex-col items-center">
            <p className="font-serif text-lg text-on-surface mb-2">No ventures generated yet.</p>
            <p className="font-mono text-xs text-secondary max-w-md mb-4">
              Trigger "Surprise Me" to scout live unscripted problems from Hacker News, GitHub, and Dev.to and scaffold a complete company.
            </p>
            <button
              onClick={onNewCompany}
              className="px-4 py-2 border border-[#111111] bg-[#111111] text-[#ffffff] font-mono text-xs uppercase font-bold shadow-[2px_2px_0px_0px_#111111]"
            >
              Scout First Company
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {companies.map((company, idx) => (
              <div
                key={company.id || idx}
                onClick={() => onSelectCompany(company.name)}
                className="bg-surface-container-lowest p-space-lg border border-on-surface shadow-[2px_2px_0px_0px_#111111] hover:shadow-[4px_4px_0px_0px_#111111] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-primary uppercase font-mono font-bold">
                        PROTOCOL_0{idx + 1}
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5 font-serif">
                        {company.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 border border-on-surface font-label-sm text-label-sm uppercase bg-surface-container font-mono">
                      {company.status}
                    </span>
                  </div>

                  <p className="font-body-md text-body-md text-secondary mt-space-sm leading-relaxed font-sans">
                    Autonomous Next.js 15 application scaffolded with Drizzle ORM schema, API routes, and landing pages.
                  </p>
                </div>

                <div className="mt-space-md pt-space-sm border-t border-surface-variant flex items-center justify-between font-label-sm text-label-sm font-mono">
                  <span className="text-secondary">{company.subdomain}</span>
                  <Link
                    href={company.id.startsWith("run_") ? `/preview/${company.id}` : `/preview/run_${company.id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-0.5 border border-[#111111] bg-[#111111] text-[#ffffff] text-[10px] uppercase font-bold hover:bg-primary"
                  >
                    Launch Studio ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
