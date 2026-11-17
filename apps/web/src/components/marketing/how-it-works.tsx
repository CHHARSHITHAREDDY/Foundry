export function HowItWorks() {
  const steps = [
    {
      step: "01 / IDEA",
      icon: "lightbulb",
      description:
        "Input a prompt, voice memo, or raw problem statement. Foundry's reasoning engine dissects market viability and technical scope within seconds.",
      footer: "INPUT: PROMPT // ARTIFACT",
      footerHighlight: false,
      featured: false,
    },
    {
      step: "02 / VALIDATION",
      icon: "query_stats",
      description:
        "Autonomous web scrapers analyze competitor pricing models, SEO search volume, and unit economics before generating full system blueprints.",
      footer: "METRIC: TAM / SAM ANALYSIS",
      footerHighlight: false,
      featured: false,
    },
    {
      step: "03 / YOUR APPROVAL",
      icon: "tune",
      description:
        "Review the generated wireframe, editorial copy, database entities, and revenue projections. One click accepts or conversational refinement refactors.",
      footer: "HUMAN-IN-THE-LOOP CHECK",
      footerHighlight: false,
      featured: false,
    },
    {
      step: "04 / LIVE APP",
      icon: "rocket_launch",
      description:
        "Production code deploys to high-speed global infra, Stripe keys link, and initial launch assets publish live to acquire your first paying customers.",
      footer: "STATUS: REVENUE READY",
      footerHighlight: true,
      featured: true,
    },
  ];

  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-20 border-b-[1.5px] border-[#D6D6D1]">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b-[1.5px] border-[#111111] gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[#F25C05] font-bold block mb-1">
            OPERATIONAL LIFECYCLE
          </span>
          <h2 className="font-headline text-[32px] md:text-[38px] text-[#111111] font-bold">
            How It Works
          </h2>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F5E5E] bg-[#EDEDEA] px-3 py-1 border border-[#111111] self-start md:self-end">
          [PHASES 01—04]
        </div>
      </div>

      {/* 4 Numbered Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`bg-[#FFFFFF] border-[1.5px] border-[#111111] p-6 transition-all flex flex-col justify-between ${
              s.featured
                ? "hover:shadow-[3px_3px_0px_0px_#F25C05] border-r-[3px]"
                : "hover:shadow-[3px_3px_0px_0px_#111111]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-[#D6D6D1] pb-3 mb-4">
                <span className="font-mono text-[12px] font-bold text-[#111111]">
                  {s.step}
                </span>
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    s.featured ? "text-[#F25C05]" : "text-[#5F5E5E]"
                  }`}
                >
                  {s.icon}
                </span>
              </div>
              <p className="font-body text-[16px] text-[#111111] leading-relaxed">
                {s.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EDEDEA]">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.08em] ${
                  s.footerHighlight ? "text-[#F25C05] font-bold" : "text-[#5F5E5E]"
                }`}
              >
                {s.footer}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

