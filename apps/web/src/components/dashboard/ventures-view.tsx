"use client";

interface VenturesViewProps {
  onNewCompany: () => void;
  onSelectCompany: (company: string) => void;
}

export function VenturesView({ onNewCompany, onSelectCompany }: VenturesViewProps) {
  return (
    <div className="p-space-lg lg:p-space-xl max-w-6xl mx-auto w-full flex flex-col gap-space-xl">
      {/* Top Stat Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-lg">
        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Active Entities</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">04</div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">SYNDICATE NODE // CLUSTER A</div>
        </div>

        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Aggregate MRR</span>
            <span className="font-label-sm text-label-sm text-primary font-mono font-bold">+18.4%</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">$8,940</div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">CURRENCY // USD LEDGER</div>
        </div>

        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Allotted Compute</span>
            <span className="font-label-sm text-label-sm text-secondary font-mono">72%</span>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface font-serif">
            184<span className="text-headline-sm font-label-md text-secondary ml-1 font-mono">CR</span>
          </div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">RESERVES DEPLETION // 14D</div>
        </div>

        <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111]">
          <div className="flex items-center justify-between mb-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-secondary font-mono">Attention Needed</span>
            <span className="w-2 h-2 rounded-full bg-error" />
          </div>
          <div className="font-headline-lg text-headline-lg text-error font-serif">01</div>
          <div className="font-label-sm text-label-sm text-secondary mt-1 font-mono">PULSE WIRE // BUILD FATAL</div>
        </div>
      </div>

      {/* Active Ventures Section */}
      <div className="mb-space-lg">
        <div className="flex items-center justify-between mb-space-sm pb-1 border-b border-surface-variant">
          <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface font-mono font-bold">
            Active Ventures // Dispatch Queue
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-mono">4 TOTAL INSTANCES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Card 1: Dispatch */}
          <div
            onClick={() => onSelectCompany("Dispatch")}
            className="bg-surface-container-lowest p-space-lg border border-on-surface shadow-[2px_2px_0px_0px_#111111] hover:shadow-[4px_4px_0px_0px_#111111] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase font-mono font-bold">PROTOCOL_01</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5 font-serif">Dispatch</h3>
              </div>
              <span className="px-2 py-0.5 border border-on-surface font-label-sm text-label-sm uppercase bg-surface-container font-mono">
                Live
              </span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-space-sm leading-relaxed">
              Autonomous publication engine curating daily specialized intelligence briefs.
            </p>
            <div className="mt-space-md pt-space-sm border-t border-surface-variant flex items-center justify-between font-label-sm text-label-sm font-mono">
              <span className="text-secondary">MRR: $1,420</span>
              <span className="text-on-surface font-semibold">UPTIME 99.98%</span>
            </div>
          </div>

          {/* Card 2: Codex AI */}
          <div
            onClick={() => onSelectCompany("Codex AI")}
            className="bg-surface-container-lowest p-space-lg border border-on-surface shadow-[2px_2px_0px_0px_#111111] hover:shadow-[4px_4px_0px_0px_#111111] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase font-mono">PROTOCOL_02</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5 font-serif">Codex AI</h3>
              </div>
              <span className="px-2 py-0.5 border border-primary font-label-sm text-label-sm text-primary uppercase bg-surface-container font-mono font-bold">
                Sprint 03
              </span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-space-sm leading-relaxed">
              Technical documentation synthesizer parsing AST transformations into readable manifests.
            </p>
            <div className="mt-space-md pt-space-sm border-t border-surface-variant flex items-center justify-between font-label-sm text-label-sm font-mono">
              <span className="text-secondary">MRR: $4,200</span>
              <span className="text-on-surface font-semibold">SYNTH RUNNING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Image Accent Panel */}
      <div className="bg-surface-container-lowest p-space-md border border-on-surface shadow-[2px_2px_0px_0px_#111111] flex flex-col sm:flex-row items-center gap-space-lg">
        {/* Vector SVG fallback / stylized illustration representing the printing press workshop */}
        <div className="w-full sm:w-36 h-24 bg-surface-container border border-on-surface flex items-center justify-center shrink-0 p-2">
          <svg viewBox="0 0 100 70" fill="none" className="w-full h-full text-on-surface" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="10" width="90" height="50" stroke="currentColor" strokeWidth="2" fill="#fff" />
            <circle cx="35" cy="35" r="18" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="35" cy="35" r="8" fill="#F25C05" />
            <line x1="60" y1="20" x2="85" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="60" y1="30" x2="85" y2="30" stroke="currentColor" strokeWidth="2" />
            <line x1="60" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="2" />
            <line x1="60" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="flex-1">
          <span className="font-label-sm text-label-sm text-secondary uppercase font-mono">
            Syndicate Directive // Weekly Press
          </span>
          <h4 className="font-headline-sm text-headline-sm text-on-surface font-serif">
            Autonomous Capital Allocation Strategy V2.4
          </h4>
          <p className="font-body-sm text-body-sm text-secondary mt-1">
            Deterministic token routing guarantees that non-performing venture branches are quarantined with zero credit waste.
          </p>
        </div>
        <button
          onClick={onNewCompany}
          className="px-space-md py-2 bg-[#111111] text-[#ffffff] font-label-md text-label-md uppercase font-mono hover:bg-primary transition-colors shrink-0 shadow-[2px_2px_0px_0px_#111111]"
        >
          Deploy Protocol ➔
        </button>
      </div>
    </div>
  );
}

