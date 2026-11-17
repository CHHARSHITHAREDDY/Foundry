export function Examples() {
  const portfolio = [
    {
      domain: "ledgerpulse.io",
      category: "FINTECH / WEB3",
      title: "LedgerPulse",
      desc: "Autonomous crypto compliance auditor for decentralized organizations and treasury operators.",
      lines: "4,800 LINES CODE",
      mrr: "$14.2K MRR",
      bars: ["w-3/4 bg-[#D6D6D1]", "w-1/2 bg-[#D6D6D1]", "w-5/6 bg-[#111111]"],
    },
    {
      domain: "omnibrief.ai",
      category: "MEDIA / SEC INTEL",
      title: "OmniBrief",
      desc: "Morning financial intelligence briefing curating 10-K and 8-K filings into actionable hedge-fund memos.",
      lines: "3,200 LINES CODE",
      mrr: "$8.9K MRR",
      bars: ["w-4/5 bg-[#D6D6D1]", "w-2/3 bg-[#111111]", "w-1/3 bg-[#D6D6D1]"],
    },
    {
      domain: "substacker.press",
      category: "PUBLISHING SAAS",
      title: "Substacker",
      desc: "Cross-platform newsletter syndication, custom reader analytics, and dynamic sponsorship placement engine.",
      lines: "6,100 LINES CODE",
      mrr: "$22.4K MRR",
      bars: ["w-1/2 bg-[#111111]", "w-5/6 bg-[#D6D6D1]", "w-3/4 bg-[#D6D6D1]"],
    },
  ];

  return (
    <section id="examples" className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-20 border-b-[1.5px] border-[#D6D6D1]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b-[1.5px] border-[#111111] gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[#F25C05] font-bold block mb-1">
            CASE STUDIES
          </span>
          <h2 className="font-headline text-[32px] md:text-[38px] text-[#111111] font-bold">
            Shipped By Foundry
          </h2>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F5E5E] bg-[#EDEDEA] px-3 py-1 border border-[#111111] self-start md:self-end">
          [PRODUCTION PORTFOLIO]
        </div>
      </div>

      {/* 3 Prominent Company Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {portfolio.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] border-[1.5px] border-[#111111] p-6 hover:shadow-[4px_4px_0px_0px_#111111] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Visual Header */}
              <div className="w-full h-44 bg-[#EDEDEA] border border-[#111111] mb-5 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] bg-[#FFFFFF] px-2 py-0.5 border border-[#111111] font-bold">
                    {item.category}
                  </span>
                  <span className="bg-[#FFFFFF] border border-[#F25C05] text-[#F25C05] font-mono text-[10px] px-1.5 py-0.5 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 bg-[#F25C05] rounded-full animate-ping" />
                    LIVE
                  </span>
                </div>

                {/* Technical Graphic / Wireframe preview */}
                <div className="space-y-1.5 font-mono text-[10px] text-[#5F5E5E]">
                  {item.bars.map((barClass, bIdx) => (
                    <div key={bIdx} className={`h-2 ${barClass}`} />
                  ))}
                </div>

                <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#111111] font-bold">
                  {item.domain}
                </div>
              </div>

              <h3 className="font-headline text-[22px] font-bold text-[#111111] mb-2">
                {item.title}
              </h3>
              <p className="font-body text-[16px] text-[#474646] mb-6 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-[#D6D6D1] flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em]">
              <span className="text-[#5F5E5E]">{item.lines}</span>
              <span className="font-bold text-[#111111] bg-[#EDEDEA] px-2 py-0.5 border border-[#111111]">
                {item.mrr}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

