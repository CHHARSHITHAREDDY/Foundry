"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SurpriseModal } from "@/components/studio/surprise-modal";
import { IdeaModal } from "@/components/studio/idea-modal";
import { BuildModal } from "@/components/studio/build-modal";

export default function PricingPage() {
  const [cadence, setCadence] = useState<"monthly" | "yearly">("monthly");
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [activeIdea, setActiveIdea] = useState<any>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const handleApproveBuild = (idea: any) => {
    setActiveIdea(idea);
    setSurpriseOpen(false);
    setIdeaOpen(false);
    setBuildOpen(true);
  };

  const starterPrice = cadence === "yearly" ? "₹799" : "₹999";
  const starterPeriod = cadence === "yearly" ? "/ mo (billed yearly)" : "/ month";
  const proPrice = cadence === "yearly" ? "₹2,399" : "₹2,999";
  const proPeriod = cadence === "yearly" ? "/ mo (billed yearly)" : "/ month";

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-on-surface antialiased">
      {/* 1. Header with activePath="pricing" */}
      <Header
        activePath="pricing"
        onSurpriseClick={() => setSurpriseOpen(true)}
        onIdeaClick={() => setIdeaOpen(true)}
      />

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col w-full">
          {/* Top Archival Dossier Meta Stripe */}
          <section className="w-full bg-surface-container-low border-b border-[#D6D6D1] px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="inline-block w-2 h-2 bg-primary-container" />
                <span>INDEX REF: FND-PRC-2025.04</span>
                <span className="text-[#D6D6D1]">|</span>
                <span>AUTONOMOUS COMPILATION QUOTA: UNRESTRICTED</span>
              </div>
              <div className="flex items-center gap-space-md">
                <span>CURRENCY: INR (₹)</span>
                <span className="text-[#D6D6D1]">|</span>
                <span>SETTLEMENT: STRIATED MICRO-DEBITS</span>
              </div>
            </div>
          </section>

          {/* Editorial Hero Block */}
          <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-xl pb-space-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b-2 border-on-surface pb-space-lg gap-space-md">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-widest text-primary-container mb-space-xs">
                    <span className="w-1.5 h-1.5 bg-primary-container" />
                    <span>SYSTEM SCHEDULE 01 // TRANSPARENT UNIT ECONOMICS</span>
                  </div>
                  <h1 className="font-display text-display text-on-surface tracking-tight leading-[1.08] mb-space-sm font-serif">
                    Pay for what your AI team does.
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                    Deterministic token pricing calibrated to autonomous developer output. Zero idle worker fees, zero speculative seat licensing. Every build, mutation, and edge compilation is tracked to the exact credit.
                  </p>
                </div>

                {/* Cadence Switcher Component */}
                <div className="flex flex-col items-start md:items-end gap-space-xs shrink-0">
                  <span className="font-label-sm text-label-sm uppercase text-secondary">
                    SELECT INVOICE FREQUENCY
                  </span>
                  <div className="inline-flex items-center p-1 bg-surface-container-highest border border-on-surface rounded-none" role="group">
                    <button
                      onClick={() => setCadence("monthly")}
                      className={`px-space-md py-1 text-label-md font-label-md uppercase transition-all ${
                        cadence === "monthly"
                          ? "bg-surface-container-lowest text-on-surface shadow-[1px_1px_0px_#111111]"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      MONTHLY
                    </button>
                    <button
                      onClick={() => setCadence("yearly")}
                      className={`px-space-md py-1 text-label-md font-label-md uppercase transition-all flex items-center gap-1.5 ${
                        cadence === "yearly"
                          ? "bg-surface-container-lowest text-on-surface shadow-[1px_1px_0px_#111111]"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span>YEARLY</span>
                      <span className="bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded-[1px] tracking-normal">
                        SAVE 20%
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Pricing Tier Cards (Desktop 3-Column Grid) */}
          <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-lg">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
              {/* Plan 1: FREE */}
              <div className="flex flex-col justify-between bg-surface-container-lowest border-[1.5px] border-on-surface p-space-lg hover:shadow-[3px_3px_0px_0px_#111111] transition-shadow relative">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#D6D6D1] pb-space-sm mb-space-md">
                    <span className="font-label-md text-label-md uppercase font-bold tracking-widest text-on-surface">
                      TIER // 00
                    </span>
                    <span className="font-label-sm text-label-sm uppercase px-1.5 py-0.5 bg-surface-container text-on-surface-variant border border-[#D6D6D1]">
                      EVALUATION
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-serif">
                    Free
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md min-h-[40px]">
                    Curiosity, one-off exploration, and testing Ember agent mechanics before production deployment.
                  </p>
                  <div className="flex items-baseline gap-1 py-space-sm border-y border-[#D6D6D1] mb-space-md bg-surface-container-low px-space-sm">
                    <span className="font-display text-[38px] leading-tight text-on-surface font-serif">₹0</span>
                    <span className="font-label-sm text-label-sm uppercase text-secondary">/ forever</span>
                  </div>
                  <div className="mb-space-md">
                    <div className="flex items-center justify-between font-label-sm text-label-sm uppercase text-on-surface mb-1">
                      <span>QUOTA ALLOTMENT</span>
                      <span className="font-bold">20 CREDITS ON SIGNUP</span>
                    </div>
                    {/* Segmented block bar */}
                    <div className="flex gap-1">
                      <span className="h-2 w-4 bg-on-surface" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                    </div>
                  </div>
                  <div className="font-label-sm text-label-sm uppercase text-secondary tracking-widest mb-space-sm">
                    INCLUDED PROTOCOLS:
                  </div>
                  <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface border-t border-[#D6D6D1] pt-space-sm">
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>20 autonomous execution credits</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>1 active isolated sandbox preview</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Standard compilation queue</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Step-by-step manual gate approval</span>
                    </li>
                    <li className="flex items-start gap-space-xs text-secondary">
                      <span className="font-label-md text-label-md text-[#D6D6D1]">—</span>
                      <span className="line-through">Custom apex domains</span>
                    </li>
                    <li className="flex items-start gap-space-xs text-secondary">
                      <span className="font-label-md text-label-md text-[#D6D6D1]">—</span>
                      <span className="line-through">Automated autonomous loops</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-space-lg pt-space-md border-t border-[#D6D6D1]">
                  <button
                    onClick={() => setIdeaOpen(true)}
                    className="w-full inline-flex items-center justify-center h-10 px-space-md bg-surface-container-lowest text-on-surface border-[1.5px] border-on-surface rounded-[2px] font-label-md text-label-md uppercase tracking-widest hover:bg-surface-container hover:shadow-[2px_2px_0px_#111111] transition-all"
                  >
                    START FREE
                  </button>
                </div>
              </div>

              {/* Plan 2: STARTER */}
              <div className="flex flex-col justify-between bg-surface-container-lowest border-[1.5px] border-on-surface p-space-lg hover:shadow-[3px_3px_0px_0px_#111111] transition-shadow relative">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#D6D6D1] pb-space-sm mb-space-md">
                    <span className="font-label-md text-label-md uppercase font-bold tracking-widest text-on-surface">
                      TIER // 01
                    </span>
                    <span className="font-label-sm text-label-sm uppercase px-1.5 py-0.5 bg-[#EDEDEA] text-on-surface border border-on-surface">
                      DEPLOYED
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-serif">
                    Starter
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md min-h-[40px]">
                    Designed for indie hackers and solo founders shipping up to 3 live, monetized software businesses.
                  </p>
                  <div className="flex items-baseline gap-1 py-space-sm border-y border-[#D6D6D1] mb-space-md bg-surface-container-low px-space-sm">
                    <span className="font-display text-[38px] leading-tight text-on-surface font-serif">
                      {starterPrice}
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-secondary">
                      {starterPeriod}
                    </span>
                  </div>
                  <div className="mb-space-md">
                    <div className="flex items-center justify-between font-label-sm text-label-sm uppercase text-on-surface mb-1">
                      <span>QUOTA ALLOTMENT</span>
                      <span className="font-bold">300 CREDITS / MO</span>
                    </div>
                    {/* Segmented block bar */}
                    <div className="flex gap-1">
                      <span className="h-2 w-4 bg-on-surface" />
                      <span className="h-2 w-4 bg-on-surface" />
                      <span className="h-2 w-4 bg-on-surface" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                      <span className="h-2 w-4 bg-[#EDEDEA] border border-[#D6D6D1]" />
                    </div>
                  </div>
                  <div className="font-label-sm text-label-sm uppercase text-secondary tracking-widest mb-space-sm">
                    INCLUDED PROTOCOLS:
                  </div>
                  <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface border-t border-[#D6D6D1] pt-space-sm">
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span><strong>300 autonomous credits</strong> refreshed monthly</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Up to 3 live production deployments</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Custom subdomains on foundrypress.pub</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>PostgreSQL instance + Cloudflare Edge runtime</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Stripe &amp; Razorpay Connect integration</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Community Discord + ticket triage</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-space-lg pt-space-md border-t border-[#D6D6D1]">
                  <button
                    onClick={() => setIdeaOpen(true)}
                    className="w-full inline-flex items-center justify-center h-10 px-space-md bg-surface-container-lowest text-on-surface border-[1.5px] border-on-surface rounded-[2px] font-label-md text-label-md uppercase tracking-widest hover:bg-on-surface hover:text-surface transition-all"
                  >
                    SELECT STARTER
                  </button>
                </div>
              </div>

              {/* Plan 3: PRO (Featured Card with brutalist offset shadow) */}
              <div className="flex flex-col justify-between bg-surface-container-lowest border-[1.5px] border-on-surface p-space-lg shadow-[4px_4px_0px_0px_#111111] relative">
                {/* Best value tag banner */}
                <div className="absolute -top-3 right-6 bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest px-2 py-0.5 border border-on-surface font-bold">
                  RECOMMENDED // BEST VALUE
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-primary-container" />
                      <span className="font-label-md text-label-md uppercase font-bold tracking-widest text-on-surface">
                        TIER // 02
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase px-1.5 py-0.5 bg-primary-fixed text-on-primary-fixed-variant border border-primary font-bold">
                      AUTONOMOUS
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs flex items-center justify-between font-serif">
                    <span>Pro</span>
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold">AUTO-RUN</span>
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md min-h-[40px]">
                    Unfettered autonomous agent execution for power operators running unlimited venture architectures.
                  </p>
                  <div className="flex items-baseline gap-1 py-space-sm border-y border-on-surface mb-space-md bg-[#FFF3ED] px-space-sm">
                    <span className="font-display text-[38px] leading-tight text-on-surface font-serif">
                      {proPrice}
                    </span>
                    <span className="font-label-sm text-label-sm uppercase text-secondary">
                      {proPeriod}
                    </span>
                  </div>
                  <div className="mb-space-md">
                    <div className="flex items-center justify-between font-label-sm text-label-sm uppercase text-on-surface mb-1">
                      <span>QUOTA ALLOTMENT</span>
                      <span className="font-bold text-primary">1,200 CREDITS / MO</span>
                    </div>
                    {/* Segmented block bar full */}
                    <div className="flex gap-1">
                      <span className="h-2 w-4 bg-primary-container" />
                      <span className="h-2 w-4 bg-primary-container" />
                      <span className="h-2 w-4 bg-primary-container" />
                      <span className="h-2 w-4 bg-primary-container" />
                      <span className="h-2 w-4 bg-primary-container" />
                      <span className="h-2 w-4 bg-primary-container" />
                    </div>
                  </div>
                  <div className="font-label-sm text-label-sm uppercase text-on-surface tracking-widest mb-space-sm font-bold">
                    PRO PROTOCOLS INCLUDED:
                  </div>
                  <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface border-t border-on-surface pt-space-sm">
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span><strong>1,200 autonomous credits / mo</strong> (90-day rollover)</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span><strong>Unlimited active live companies</strong></span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span><strong>Auto Mode enabled</strong> (hands-free looping compilation)</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Custom domains + 60-second automated Let&apos;s Encrypt SSL</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Dedicated low-latency compiler queue</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Private Ember coprocessor node &amp; 99.99% edge SLA</span>
                    </li>
                    <li className="flex items-start gap-space-xs">
                      <span className="font-label-md text-label-md text-primary font-bold">✓</span>
                      <span>Priority direct Telegram/Signal engineer support</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-space-lg pt-space-md border-t border-on-surface">
                  <button
                    onClick={() => setIdeaOpen(true)}
                    className="w-full inline-flex items-center justify-center h-10 px-space-md bg-on-surface text-surface border-[1.5px] border-on-surface rounded-[2px] font-label-md text-label-md uppercase tracking-widest hover:bg-primary transition-all shadow-[2px_2px_0px_#111111]"
                  >
                    START PRO TRIAL
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Credit Packs On-Demand Refills */}
          <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="max-w-7xl mx-auto">
              <div className="border-t-[1.5px] border-on-surface pt-space-md mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
                <div>
                  <div className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container mb-1">
                    [ON-DEMAND CREDITS]
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-serif">
                    Need more throughput? Refill without upgrading.
                  </h2>
                </div>
                <p className="font-label-sm text-label-sm uppercase text-secondary max-w-md">
                  Credits never expire while your subscription is active. Usable across any company in your organization.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Pack 1 */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md flex flex-col justify-between hover:shadow-[3px_3px_0px_0px_#111111] transition-shadow">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#D6D6D1] pb-space-xs mb-space-sm">
                      <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">PACK 01</span>
                      <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">STANDARD</span>
                    </div>
                    <div className="flex items-baseline justify-between mb-space-xs">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-serif">100 Credits</span>
                      <span className="font-headline-md text-headline-md text-on-surface font-serif">₹499</span>
                    </div>
                    <div className="font-label-sm text-label-sm uppercase text-secondary mb-space-md">
                      RATE: ₹4.99 PER AUTONOMOUS CREDIT
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPack("PACK 01 - 100 Credits (₹499)")}
                    className="w-full h-9 bg-surface-container-lowest border border-on-surface font-label-md text-label-md uppercase tracking-wider text-on-surface hover:bg-surface-container transition-all"
                  >
                    BUY PACK
                  </button>
                </div>

                {/* Pack 2 (Popular) */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md flex flex-col justify-between shadow-[2px_2px_0px_0px_#111111] relative">
                  <div className="absolute -top-2.5 right-4 bg-on-surface text-surface font-label-sm text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold">
                    POPULAR REFILL
                  </div>
                  <div>
                    <div className="flex items-center justify-between border-b border-[#D6D6D1] pb-space-xs mb-space-sm">
                      <span className="font-label-sm text-label-sm uppercase text-primary font-bold">PACK 02</span>
                      <span className="font-label-sm text-label-sm uppercase px-1 bg-surface-container border border-[#D6D6D1]">
                        OPTIMIZED
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mb-space-xs">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-serif">500 Credits</span>
                      <span className="font-headline-md text-headline-md text-on-surface font-serif">₹1,999</span>
                    </div>
                    <div className="font-label-sm text-label-sm uppercase text-primary mb-space-md font-bold">
                      RATE: ₹3.99 PER AUTONOMOUS CREDIT (20% OFF)
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPack("PACK 02 - 500 Credits (₹1,999)")}
                    className="w-full h-9 bg-on-surface text-surface border border-on-surface font-label-md text-label-md uppercase tracking-wider hover:bg-primary transition-all"
                  >
                    BUY PACK
                  </button>
                </div>

                {/* Pack 3 (Bulk) */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md flex flex-col justify-between hover:shadow-[3px_3px_0px_0px_#111111] transition-shadow">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#D6D6D1] pb-space-xs mb-space-sm">
                      <span className="font-label-sm text-label-sm uppercase text-secondary font-bold">PACK 03</span>
                      <span className="font-label-sm text-label-sm uppercase text-primary font-bold">BULK EFFICIENCY</span>
                    </div>
                    <div className="flex items-baseline justify-between mb-space-xs">
                      <span className="font-headline-lg text-headline-lg text-on-surface font-serif">2,000 Credits</span>
                      <span className="font-headline-md text-headline-md text-on-surface font-serif">₹6,999</span>
                    </div>
                    <div className="font-label-sm text-label-sm uppercase text-secondary mb-space-md">
                      RATE: ₹3.50 PER AUTONOMOUS CREDIT (30% OFF)
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPack("PACK 03 - 2,000 Credits (₹6,999)")}
                    className="w-full h-9 bg-surface-container-lowest border border-on-surface font-label-md text-label-md uppercase tracking-wider text-on-surface hover:bg-surface-container transition-all"
                  >
                    BUY PACK
                  </button>
                </div>
              </div>

              {selectedPack && (
                <div className="mt-space-md p-space-sm bg-primary-fixed border border-primary text-on-primary-fixed-variant flex items-center justify-between font-label-sm text-label-sm">
                  <span>Selected for immediate provisioning: <strong>{selectedPack}</strong>. Instant settlement via UPI &amp; Stripe Connect ready.</span>
                  <button onClick={() => setSelectedPack(null)} className="underline uppercase font-bold">Dismiss</button>
                </div>
              )}
            </div>
          </section>

          {/* Credit Consumption Ledger / Broadside Table */}
          <section className="w-full bg-surface-container-low border-y border-on-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-md mb-space-md border-b border-[#D6D6D1] gap-space-sm">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container">
                    [AUDIT SCHEDULE 02]
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-serif">
                    What things cost in Foundry
                  </h2>
                </div>
                <div className="font-label-sm text-label-sm uppercase text-secondary">
                  STANDARDIZED OPERATIONAL BURN MATRIX // VERSION 3.2
                </div>
              </div>

              {/* Ledger Table */}
              <div className="w-full overflow-x-auto border-[1.5px] border-on-surface bg-surface-container-lowest">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b-[1.5px] border-on-surface font-label-md text-label-md uppercase tracking-wider text-on-surface">
                      <th className="py-space-sm px-space-md w-16">CODE</th>
                      <th className="py-space-sm px-space-md">TASK &amp; WORKFLOW DESCRIPTION</th>
                      <th className="py-space-sm px-space-md hidden sm:table-cell">DELIVERABLE ARTIFACT</th>
                      <th className="py-space-sm px-space-md text-right">COST PER RUN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6D6D1] font-body-sm text-body-sm">
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-01</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Idea validation &amp; market viability analysis
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        Competitor crawl, TAM estimate &amp; positioning memo
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-on-surface">
                        2 CREDITS
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-02</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Full website build &amp; frontend edge deployment
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        Complete multi-page responsive web app with SQLite schema
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-primary">
                        40 CREDITS
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-03</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Feature task or targeted code mutation
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        Component modification, schema migration, bug patching
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-on-surface">
                        1 – 5 CREDITS
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-04</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Asset generation (programmatic SVG &amp; imagery)
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        Logos, visual identity kits, vectorized product mockups
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-on-surface">
                        2 CREDITS
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-05</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Video &amp; animated media composition
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        Social demo video reel with synthesized voiceover
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-on-surface">
                        10 CREDITS
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-06</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Email campaign &amp; lifecycle sequence setup
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        5-part transactional copy, HTML templates &amp; webhook routing
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-on-surface">
                        5 CREDITS
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-07</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Ad campaign generation (Meta &amp; X creative copies)
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        20 variations A/B hook copy, audience targeting configs
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-on-surface">
                        8 CREDITS
                      </td>
                    </tr>
                    <tr className="bg-surface-container-high hover:bg-surface-container transition-colors">
                      <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary">OP-00</td>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Continuous edge monitoring, SSL &amp; health telemetry
                      </td>
                      <td className="py-space-sm px-space-md hidden sm:table-cell text-on-surface-variant">
                        24/7 worker heartbeat, auto-restarts, DDoS mitigation
                      </td>
                      <td className="py-space-sm px-space-md text-right font-label-md text-label-md uppercase font-bold text-primary">
                        0 CREDITS (INCLUDED)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Comprehensive Plan Comparison Matrix */}
          <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="max-w-7xl mx-auto">
              <div className="border-b-[1.5px] border-on-surface pb-space-sm mb-space-lg">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container">
                  [SCHEDULE 03]
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-serif">
                  Detailed Feature Specification Matrix
                </h2>
              </div>
              <div className="w-full overflow-x-auto border-[1.5px] border-on-surface bg-surface-container-lowest">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b-[1.5px] border-on-surface font-label-md text-label-md uppercase tracking-wider text-on-surface">
                      <th className="py-space-sm px-space-md w-1/3">CAPABILITY CATEGORY</th>
                      <th className="py-space-sm px-space-md text-center w-1/5">FREE</th>
                      <th className="py-space-sm px-space-md text-center w-1/5">STARTER ({starterPrice})</th>
                      <th className="py-space-sm px-space-md text-center w-1/4 bg-[#FFF3ED] border-l border-on-surface">
                        PRO ({proPrice})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6D6D1] font-body-sm text-body-sm">
                    {/* Category 1 */}
                    <tr className="bg-surface-container-high">
                      <td className="py-2 px-space-md font-label-sm text-label-sm uppercase tracking-widest font-bold text-on-surface" colSpan={4}>
                        1. Core Engine &amp; Autonomous Execution
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Monthly Baseline Credits
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">20 (one-time)</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">300 / mo</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1] text-primary">
                        1,200 / mo
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Credit Rollover Window
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm text-secondary">—</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">30 Days</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        90 Days
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Auto-Loop Execution (Hands-free)
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm text-secondary">Manual Only</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm text-secondary">Manual Only</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1] text-primary">
                        ✓ Autonomous Auto-Run
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Simultaneous Build Queues
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">1 Task</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">2 Tasks</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        8 Tasks Parallel
                      </td>
                    </tr>

                    {/* Category 2 */}
                    <tr className="bg-surface-container-high">
                      <td className="py-2 px-space-md font-label-sm text-label-sm uppercase tracking-widest font-bold text-on-surface" colSpan={4}>
                        2. Hosting &amp; Infrastructure
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Active Production Companies
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">1 Sandbox</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">3 Live</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1] text-primary">
                        Unlimited Live
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Apex Custom Domains
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm text-secondary">—</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">Subdomain Only</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        ✓ Free Automated SSL
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Edge Compute Locations
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">Single Region</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">Global CDN</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        Global Smart Routing
                      </td>
                    </tr>

                    {/* Category 3 */}
                    <tr className="bg-surface-container-high">
                      <td className="py-2 px-space-md font-label-sm text-label-sm uppercase tracking-widest font-bold text-on-surface" colSpan={4}>
                        3. Integrations &amp; Commerce
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Payment Gateway Connect
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm text-secondary">Test Mode</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">✓ Stripe &amp; Razorpay</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        ✓ Multi-Gateway Webhooks
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        PostgreSQL Relational DB
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">Ephemeral</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">1 GB Shared</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        10 GB Dedicated Cluster
                      </td>
                    </tr>

                    {/* Category 4 */}
                    <tr className="bg-surface-container-high">
                      <td className="py-2 px-space-md font-label-sm text-label-sm uppercase tracking-widest font-bold text-on-surface" colSpan={4}>
                        4. Support &amp; Governance
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Service Level Agreement (SLA)
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm text-secondary">Best Effort</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">99.9%</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1] text-primary">
                        99.99% Guaranteed
                      </td>
                    </tr>
                    <tr>
                      <td className="py-space-sm px-space-md font-headline-sm text-headline-sm text-on-surface font-serif">
                        Technical Support Channel
                      </td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">Discord Community</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm">Email (24h turnaround)</td>
                      <td className="py-space-sm px-space-md text-center font-label-sm text-label-sm font-bold bg-[#FFFBF9] border-l border-[#D6D6D1]">
                        Private Telegram + Video
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Mascot Ember Intervention / Guarantee Callout */}
          <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-md">
            <div className="max-w-7xl mx-auto border-[1.5px] border-on-surface bg-surface-container-lowest p-space-lg flex flex-col md:flex-row items-start md:items-center gap-space-lg shadow-[3px_3px_0px_0px_#111111]">
              {/* Visual Mascot (Ember) pure vector illustration */}
              <div className="shrink-0 flex items-center justify-center p-space-sm bg-surface-container border border-on-surface">
                <svg fill="none" height="72" viewBox="0 0 72 72" width="72" xmlns="http://www.w3.org/2000/svg">
                  {/* Ember head */}
                  <rect fill="#FFFFFF" height="46" rx="2" stroke="#111111" strokeWidth="2.5" width="56" x="8" y="14" />
                  {/* Antenna */}
                  <line stroke="#111111" strokeWidth="2.5" x1="36" x2="36" y1="6" y2="14" />
                  <circle cx="36" cy="5" fill="#F25C05" r="3" stroke="#111111" strokeWidth="1.5" />
                  {/* Eyes */}
                  <circle cx="24" cy="34" fill="#111111" r="3.5" />
                  <circle cx="48" cy="34" fill="#111111" r="3.5" />
                  {/* Mouth */}
                  <line stroke="#111111" strokeWidth="2.5" x1="26" x2="46" y1="46" y2="46" />
                  {/* Status signal orange square indicator */}
                  <rect fill="#F25C05" height="6" width="6" x="52" y="20" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase text-primary font-bold mb-1">
                  <span>EMBER SAFETY PROTOCOL // AUTOMATIC REVERSION REFUND</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs font-serif">
                  Zero risk execution. Stuck or failing runs cost ₹0.
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl leading-relaxed">
                  If an autonomous build breaks compilation, encounters an upstream API failure, or runs into an unresolvable logical loop, our deterministic arbiter terminates the run immediately and returns 100% of consumed credits to your vault in real-time.
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm uppercase bg-surface text-on-surface px-space-sm py-1 border border-on-surface">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>SYSTEM ACTIVE</span>
                </span>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions (FAQ) Grid */}
          <section className="w-full bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="max-w-7xl mx-auto">
              <div className="border-b-[1.5px] border-on-surface pb-space-sm mb-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-container">
                    [INQUIRY ARCHIVE]
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-serif">
                    Frequently Answered Protocols
                  </h2>
                </div>
                <div className="font-label-sm text-label-sm uppercase text-secondary">
                  5 ARTICLES CATALOGUED
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {/* FAQ 1 */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md">
                  <div className="font-label-sm text-label-sm uppercase text-primary font-bold mb-1">
                    FAQ // 01 · AGENT RESILIENCE
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-serif">
                    What happens if an AI agent run fails or gets stuck?
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Every task runs through a sandboxed step verification checkpoint. If any compiler error, package failure, or timeout occurs, the session is quarantined, rolled back to the previous atomic git commit, and credits are automatically credited back within 3 seconds.
                  </p>
                </div>
                {/* FAQ 2 */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md">
                  <div className="font-label-sm text-label-sm uppercase text-primary font-bold mb-1">
                    FAQ // 02 · ROLLOVERS
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-serif">
                    Do unused monthly credits expire or roll over?
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    On active paid plans (Starter and Pro), unspent credits roll over for up to 90 consecutive billing days. Purchased on-demand refill packs never expire under any circumstance as long as your account remains open.
                  </p>
                </div>
                {/* FAQ 3 */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md">
                  <div className="font-label-sm text-label-sm uppercase text-primary font-bold mb-1">
                    FAQ // 03 · CANCELLATION &amp; CODE PORTABILITY
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-serif">
                    Can I pause or cancel my subscription anytime?
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Yes. There are zero retention contracts. If you cancel, your deployed companies remain live until the end of your billing cycle. You can also trigger a one-click GitHub code export of full source code, database dumps, and assets with no platform lock-in.
                  </p>
                </div>
                {/* FAQ 4 */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md">
                  <div className="font-label-sm text-label-sm uppercase text-primary font-bold mb-1">
                    FAQ // 04 · DNS &amp; SECURITY
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-serif">
                    How do custom domains and SSL provisioning work?
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Point your domain’s CNAME or ALIAS record to <code className="font-label-sm bg-surface-container px-1 py-0.5 border border-on-surface">edge.foundrypress.pub</code>. Our automated certificate engine requests, verifies, and deploys a TLS 1.3 certificate in roughly 60 seconds across 300+ edge PoPs worldwide.
                  </p>
                </div>
                {/* FAQ 5 */}
                <div className="bg-surface-container-lowest border-[1.5px] border-on-surface p-space-md md:col-span-2">
                  <div className="font-label-sm text-label-sm uppercase text-primary font-bold mb-1">
                    FAQ // 05 · SETTLEMENT METHODS &amp; INVOICING
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-serif">
                    What payment methods and fiscal invoicing are supported?
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    We natively accept UPI (Google Pay, PhonePe, Paytm), Netbanking, and major Visa, MasterCard, and American Express cards via dual redundant gateways (Stripe &amp; Razorpay). All paid invoices include complete GSTIN tax breakdowns ready for accounting compliance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Closing Call to Action Banner */}
          <section className="w-full bg-surface-container-lowest border-t-[2px] border-on-surface px-margin-mobile md:px-margin-tablet lg:px-margin py-space-xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
              <div className="max-w-2xl">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase text-primary-container tracking-widest mb-space-xs">
                  <span className="w-1.5 h-1.5 bg-primary-container" />
                  <span>GET COMMENCED IMMEDIATELY</span>
                </div>
                <h2 className="font-display text-[36px] leading-[40px] text-on-surface mb-space-xs font-serif">
                  Ready to set your autonomous studio in motion?
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Begin with 20 complimentary credits. No credit card required. Deploys live in 90 seconds.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm shrink-0 w-full sm:w-auto">
                <Link
                  href="/#examples"
                  className="inline-flex items-center justify-center h-12 px-space-lg bg-surface-container-lowest text-on-surface border-[1.5px] border-on-surface rounded-[2px] font-label-md text-label-md uppercase tracking-widest hover:bg-surface-container transition-all"
                >
                  EXPLORE EXAMPLES
                </Link>
                <button
                  onClick={() => setIdeaOpen(true)}
                  className="inline-flex items-center justify-center h-12 px-space-lg bg-on-surface text-surface border-[1.5px] border-on-surface rounded-[2px] font-label-md text-label-md uppercase tracking-widest hover:bg-primary shadow-[3px_3px_0px_#111111] transition-all"
                >
                  CLAIM 20 FREE CREDITS
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-surface-container-highest py-space-xl">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-serif">Foundry</span>
            <span className="font-label-sm text-label-sm uppercase text-secondary">
              ARCHIVAL PRESS &amp; SYSTEM ENGINE
            </span>
          </div>
          <div className="font-label-sm text-label-sm uppercase text-on-surface-variant">
            © 2025 FOUNDRY LABS INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

      {/* Studio Interactive Modals */}
      <SurpriseModal
        isOpen={surpriseOpen}
        onClose={() => setSurpriseOpen(false)}
        onApproveBuild={handleApproveBuild}
      />
      <IdeaModal
        isOpen={ideaOpen}
        onClose={() => setIdeaOpen(false)}
        onApproveBuild={handleApproveBuild}
      />
      <BuildModal
        isOpen={buildOpen}
        idea={activeIdea}
        onClose={() => setBuildOpen(false)}
      />
    </div>
  );
}

