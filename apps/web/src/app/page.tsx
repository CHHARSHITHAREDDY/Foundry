"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/marketing/hero";
import { TickerStrip } from "@/components/marketing/ticker-strip";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Capabilities } from "@/components/marketing/capabilities";
import { Examples } from "@/components/marketing/examples";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { FinalCTA } from "@/components/marketing/final-cta";
import { Footer } from "@/components/layout/footer";
import { SurpriseModal } from "@/components/studio/surprise-modal";
import { IdeaModal } from "@/components/studio/idea-modal";
import { BuildModal } from "@/components/studio/build-modal";

export default function HomePage() {
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [activeIdea, setActiveIdea] = useState<any>(null);

  const handleApproveBuild = (idea: any) => {
    setActiveIdea(idea);
    setSurpriseOpen(false);
    setIdeaOpen(false);
    setBuildOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body text-on-surface antialiased">
      {/* 1. Fixed Header */}
      <Header
        onSurpriseClick={() => setSurpriseOpen(true)}
        onIdeaClick={() => setIdeaOpen(true)}
      />

      {/* Main Body */}
      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col w-full text-[#111111] bg-[#FAFAF8]">
          {/* 2. Hero Section */}
          <Hero
            onSurpriseClick={() => setSurpriseOpen(true)}
            onIdeaClick={() => setIdeaOpen(true)}
          />

          {/* 3. Ticker Strip */}
          <TickerStrip />

          {/* 4. How It Works */}
          <HowItWorks />

          {/* 5. Capability Grid (8 Bento Cards) */}
          <Capabilities />

          {/* 6. Examples Showcase (3 Portfolio Companies) */}
          <Examples />

          {/* 7. Transparent Pricing Plans */}
          <Pricing />

          {/* 8. FAQ Accordion */}
          <FAQ />

          {/* 9. Final CTA Band */}
          <FinalCTA
            onStartClick={() => setIdeaOpen(true)}
            onExploreClick={() => {
              const el = document.getElementById("examples");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* 10. Footer */}
          <Footer />
        </div>
      </main>

      {/* Interactive Studio Modals */}
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
