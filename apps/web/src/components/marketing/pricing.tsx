"use client";

import { useState } from "react";

export function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("founder");

  return (
    <section id="pricing" className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-20 border-b-[1.5px] border-[#D6D6D1]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b-[1.5px] border-[#111111] gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-[#F25C05] font-bold block mb-1">
            CAPITAL ALLOCATION
          </span>
          <h2 className="font-headline text-[32px] md:text-[38px] text-[#111111] font-bold">
            Transparent Unit Economics
          </h2>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F5E5E] bg-[#EDEDEA] px-3 py-1 border border-[#111111] self-start md:self-end">
          [TOKEN-BACKED PLANS]
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Tier 1: STARTER */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#111111] p-8 flex flex-col justify-between hover:shadow-[3px_3px_0px_0px_#111111] transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] bg-[#EDEDEA] px-2.5 py-1 border border-[#111111]">
                STARTER
              </span>
              <span className="font-mono text-[10px] text-[#5F5E5E]">SOLO BUILDER</span>
            </div>
            <div className="mb-4">
              <span className="font-display text-[48px] font-bold text-[#111111] leading-none">$49</span>
              <span className="font-mono text-[11px] text-[#5F5E5E] ml-1">/MONTH</span>
            </div>
            <p className="font-body text-[16px] text-[#474646] mb-8 pb-6 border-b border-[#D6D6D1] leading-relaxed">
              For solo builders validating hypotheses and establishing initial product-market fit.
            </p>
            <ul className="space-y-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111111] mb-8">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>50 Build Credits / Mo</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>2 Live Active Ventures</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Shared Edge Database</span>
              </li>
              <li className="flex items-center gap-2.5 text-[#5F5E5E]">
                <span className="w-1.5 h-1.5 bg-[#D6D6D1]" />
                <span>Standard Community Support</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => setSelectedPlan("starter")}
            className="w-full h-11 bg-[#FFFFFF] text-[#111111] font-mono text-[11px] uppercase tracking-[0.08em] border-[1.5px] border-[#111111] hover:bg-[#EDEDEA] hover:shadow-[2px_2px_0px_0px_#111111] transition-all cursor-pointer"
          >
            SELECT PLAN
          </button>
        </div>

        {/* Tier 2: FOUNDER (Featured) */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#111111] p-8 flex flex-col justify-between shadow-[5px_5px_0px_0px_#111111] relative">
          {/* Accent Pill */}
          <div className="absolute -top-3.5 left-8 bg-[#F25C05] text-[#FFFFFF] font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-1 font-bold border border-[#111111]">
            MOST POPULAR // SERIAL TIER
          </div>
          <div>
            <div className="flex justify-between items-center mb-4 pt-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#FFFFFF] bg-[#111111] px-2.5 py-1 border border-[#111111]">
                FOUNDER
              </span>
              <span className="font-mono text-[10px] text-[#F25C05] font-bold">UNRESTRICTED</span>
            </div>
            <div className="mb-4">
              <span className="font-display text-[48px] font-bold text-[#111111] leading-none">$149</span>
              <span className="font-mono text-[11px] text-[#5F5E5E] ml-1">/MONTH</span>
            </div>
            <p className="font-body text-[16px] text-[#474646] mb-8 pb-6 border-b border-[#D6D6D1] leading-relaxed">
              For serial operators shipping continuously, iterating across multiple commercial domains.
            </p>
            <ul className="space-y-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111111] mb-8">
              <li className="flex items-center gap-2.5 font-bold">
                <span className="w-1.5 h-1.5 bg-[#F25C05]" />
                <span>250 Build Credits / Mo</span>
              </li>
              <li className="flex items-center gap-2.5 font-bold">
                <span className="w-1.5 h-1.5 bg-[#F25C05]" />
                <span>10 Live Active Ventures</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Custom Domains + SSL In 60s</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Stripe Connect Integration</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Dedicated Compilation Queue</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => setSelectedPlan("founder")}
            className="w-full h-11 bg-[#111111] text-[#FFFFFF] font-mono text-[11px] uppercase tracking-[0.08em] border-[1.5px] border-[#111111] hover:shadow-[3px_3px_0px_0px_#F25C05] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-bold"
          >
            START 14-DAY TRIAL
          </button>
        </div>

        {/* Tier 3: SYNDICATE */}
        <div className="bg-[#FFFFFF] border-[1.5px] border-[#111111] p-8 flex flex-col justify-between hover:shadow-[3px_3px_0px_0px_#111111] transition-all">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] bg-[#EDEDEA] px-2.5 py-1 border border-[#111111]">
                SYNDICATE
              </span>
              <span className="font-mono text-[10px] text-[#5F5E5E]">VENTURE DESK</span>
            </div>
            <div className="mb-4">
              <span className="font-display text-[48px] font-bold text-[#111111] leading-none">$499</span>
              <span className="font-mono text-[11px] text-[#5F5E5E] ml-1">/MONTH</span>
            </div>
            <p className="font-body text-[16px] text-[#474646] mb-8 pb-6 border-b border-[#D6D6D1] leading-relaxed">
              For incubators, studios, and high-cadence investment funds spinning up real portfolio assets.
            </p>
            <ul className="space-y-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111111] mb-8">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Unlimited Autonomous Credits</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Unlimited Live Apps &amp; Domains</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Isolated Docker Sandbox Runtime</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Guaranteed 99.99% Node SLA</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-[#111111]" />
                <span>Private Ember Coprocessor</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => setSelectedPlan("syndicate")}
            className="w-full h-11 bg-[#FFFFFF] text-[#111111] font-mono text-[11px] uppercase tracking-[0.08em] border-[1.5px] border-[#111111] hover:bg-[#EDEDEA] hover:shadow-[2px_2px_0px_0px_#111111] transition-all cursor-pointer"
          >
            CONTACT DESK
          </button>
        </div>
      </div>
    </section>
  );
}

