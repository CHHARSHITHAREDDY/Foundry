interface FinalCTAProps {
  onStartClick?: () => void;
  onExploreClick?: () => void;
}

export function FinalCTA({ onStartClick, onExploreClick }: FinalCTAProps) {
  return (
    <section className="w-full bg-[#111111] text-[#FFFFFF] py-24 px-4 md:px-8 lg:px-12 border-b-[1.5px] border-[#111111]">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="w-2 h-2 bg-[#F25C05]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#FFFFFF] bg-[#222222] px-3 py-1 border border-[#333333]">
            TERMINAL READY FOR INITIALIZATION
          </span>
        </div>

        <h2 className="font-display text-[38px] md:text-[48px] text-[#FFFFFF] mb-6 max-w-3xl leading-[1.1]">
          Your next company is one prompt away.
        </h2>

        <p className="font-body text-[18px] text-[#EDEDEA] mb-10 max-w-xl leading-relaxed">
          Autonomous engineering, typesetting, marketing collateral, and customer billing rails ready in under ten minutes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartClick}
            className="h-12 px-8 bg-[#F25C05] text-[#FFFFFF] font-mono text-[11px] uppercase tracking-[0.08em] font-bold border border-[#F25C05] hover:bg-[#CA4B00] transition-all flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#FFFFFF]"
          >
            <span>LAUNCH WITH FOUNDRY [START FREE]</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>

          <button
            onClick={onExploreClick}
            className="h-12 px-8 bg-transparent text-[#FFFFFF] font-mono text-[11px] uppercase tracking-[0.08em] border border-[#FFFFFF] hover:bg-[#222222] transition-all cursor-pointer"
          >
            EXPLORE SHOWCASE
          </button>
        </div>
      </div>
    </section>
  );
}

