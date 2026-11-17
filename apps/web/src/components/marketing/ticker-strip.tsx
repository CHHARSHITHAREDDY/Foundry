export function TickerStrip() {
  const items = [
    "SEARCHES IDEAS",
    "VALIDATES MARKET",
    "WRITES CODE",
    "BUILDS SYSTEM",
    "HOSTS ON EDGE",
    "LAUNCHES CAMPAIGNS",
    "MARKETS PRODUCT",
    "PROCESSES PAYMENTS",
  ];

  return (
    <div className="w-full bg-[#EDEDEA] border-y-[1.5px] border-[#111111] py-3 overflow-hidden select-none">
      <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
        {/* Track 1 */}
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111111] font-bold">
          {items.map((item, idx) => (
            <span key={`t1-${idx}`} className="flex items-center gap-6">
              <span>{item}</span>
              <span className="w-2 h-2 bg-[#F25C05] inline-block shrink-0" />
            </span>
          ))}
        </div>

        {/* Track 2 for seamless loop */}
        <div
          aria-hidden="true"
          className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111111] font-bold"
        >
          {items.map((item, idx) => (
            <span key={`t2-${idx}`} className="flex items-center gap-6">
              <span>{item}</span>
              <span className="w-2 h-2 bg-[#F25C05] inline-block shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
