export function Capabilities() {
  const capabilities = [
    {
      code: "FE_01",
      icon: "web",
      title: "Website",
      desc: "Responsive editorial layouts, blazing fast server-rendered micro-frontends, typography hierarchies, and mobile touchpoints.",
    },
    {
      code: "DEV_02",
      icon: "terminal",
      title: "Code",
      desc: "Clean Next.js & React repositories with TypeScript, PostgreSQL schemas, typed API routes, and edge runtime workers.",
    },
    {
      code: "MAIL_03",
      icon: "mail",
      title: "Email",
      desc: "Transactional order confirmation emails, onboarding drip sequences, and automatic SPF/DKIM DNS record provisioning.",
    },
    {
      code: "MKT_04",
      icon: "share",
      title: "X Posts",
      desc: "Scheduled launch threads, technical build-in-public devlogs, and autonomous replies crafted to engage niche industry buyers.",
    },
    {
      code: "AD_05",
      icon: "campaign",
      title: "Meta Ads",
      desc: "Dynamic ad copy, multi-hook carousel assets, and audience segmentation profiles matched to early conversion intent.",
    },
    {
      code: "MEDIA_06",
      icon: "view_in_ar",
      title: "Media",
      desc: "Programmatic SVG vector assets, technical system schematics, brand badges, and responsive metadata social cards.",
    },
    {
      code: "DOC_07",
      icon: "description",
      title: "Documents",
      desc: "Complete technical API documentation, investor one-pagers, data models, terms of service, and compliant privacy policies.",
    },
    {
      code: "PAY_08",
      icon: "payments",
      title: "Payments",
      desc: "Integrated Stripe checkout sessions, self-serve billing portals, usage-based metering, and automated cross-border tax calculation.",
    },
  ];

  return (
    <section id="capabilities" className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-20 border-b-[1.5px] border-[#D6D6D1]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b-[1.5px] border-[#111111] gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[#F25C05] font-bold block mb-1">
            SUBSYSTEM CAPABILITIES
          </span>
          <h2 className="font-headline text-[32px] md:text-[38px] text-[#111111] font-bold">
            Full-Stack Agency. In A Single Autonomous Loop.
          </h2>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F5E5E] bg-[#EDEDEA] px-3 py-1 border border-[#111111] self-start md:self-end">
          [CAPABILITIES]
        </div>
      </div>

      {/* 8 Grid Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {capabilities.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] border-[1.5px] border-[#111111] p-5 hover:shadow-[3px_3px_0px_0px_#111111] hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] bg-[#EDEDEA] px-2 py-0.5 border border-[#111111] font-bold">
                {item.code}
              </span>
              <span className="material-symbols-outlined text-[20px] text-[#111111] group-hover:text-[#F25C05] transition-colors">
                {item.icon}
              </span>
            </div>
            <h3 className="font-headline text-[18px] font-bold mb-2 text-[#111111]">
              {item.title}
            </h3>
            <p className="font-body text-[14px] text-[#474646] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
