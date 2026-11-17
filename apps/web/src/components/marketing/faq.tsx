"use client";

import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Who owns the intellectual property and codebase?",
      a: "You own 100% of the generated IP, trade secrets, database records, and code. Foundry acts strictly as an automated contractor. Every repository can be exported directly to your private GitHub or GitLab organization with one click.",
    },
    {
      q: "Can I inspect and modify the raw source code?",
      a: "Yes. There is zero vendor lock-in. The output uses industry standard Next.js, Tailwind CSS, PostgreSQL, and Node.js. You can clone the repo locally, write manual commits, or instruct Ember to refactor components conversationally.",
    },
    {
      q: "How does Ember handle payment processing and compliance?",
      a: "Foundry generates pre-configured Stripe Connect routines with automatic webhooks for subscriptions, one-time checkouts, and customer self-serve billing portals. Your customers pay you directly into your merchant account.",
    },
    {
      q: "What happens if a generated web business needs custom logic?",
      a: "Ember is designed for progressive refinement. Submit conversational prompts, API documentation links, or comprehensive PRD specifications, and the engine isolates the relevant files, runs diff checks, and deploys updates seamlessly.",
    },
    {
      q: "Are there limits on hosting bandwidth or database storage?",
      a: "All tiers feature enterprise edge hosting backed by global CDN nodes. Baseline limits scale generously (up to 100,000 monthly unique visitors per project on the Founder tier) with zero penalty overages or unexpected cold boots.",
    },
    {
      q: "Can I bring my own existing domain name?",
      a: "Absolutely. You can link custom Apex domains or subdomains in seconds. Foundry handles automatic verification, edge routing, and automated SSL certificate renewals without requiring third-party proxy tools.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-20 border-b-[1.5px] border-[#D6D6D1]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b-[1.5px] border-[#111111] gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[#F25C05] font-bold block mb-1">
            SPECIFICATION INQUIRIES
          </span>
          <h2 className="font-headline text-[32px] md:text-[38px] text-[#111111] font-bold">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F5E5E] bg-[#EDEDEA] px-3 py-1 border border-[#111111] self-start md:self-end">
          [FAQ // PROTOCOL]
        </div>
      </div>

      {/* Accordion Stack */}
      <div className="space-y-4">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-[#FFFFFF] border-[1.5px] border-[#111111] p-5 cursor-pointer transition-all hover:shadow-[2px_2px_0px_0px_#111111]"
              onClick={() => toggle(idx)}
            >
              <div className="flex justify-between items-center font-headline text-[18px] font-bold text-[#111111] select-none">
                <span>{item.q}</span>
                <span
                  className={`font-mono text-[16px] font-bold transition-transform duration-200 shrink-0 ml-4 ${
                    isOpen ? "rotate-45 text-[#F25C05]" : "text-[#111111]"
                  }`}
                >
                  +
                </span>
              </div>
              {isOpen && (
                <p className="font-body text-[16px] text-[#474646] mt-4 pt-4 border-t border-[#D6D6D1] leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

