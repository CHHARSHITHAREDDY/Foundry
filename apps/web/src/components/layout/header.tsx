"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  onSurpriseClick?: () => void;
  onIdeaClick?: () => void;
}

export function Header({ onSurpriseClick, onIdeaClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#ffffff] border-b border-[#e4e2dd]">
      <div className="h-16 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Brand Wordmark & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="font-headline text-[32px] font-bold tracking-tight text-[#111111]">
              Foundry
            </span>
            <span className="w-1.5 h-1.5 bg-[#ca4b00] inline-block ml-0.5 group-hover:scale-125 transition-transform" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="#how-it-works"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a4137] hover:text-[#111111] transition-colors py-1 px-2 rounded"
            >
              HOW IT WORKS
            </Link>
            <Link
              href="#capabilities"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a4137] hover:text-[#111111] transition-colors py-1 px-2 rounded"
            >
              CAPABILITIES
            </Link>
            <Link
              href="#examples"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a4137] hover:text-[#111111] transition-colors py-1 px-2 rounded"
            >
              EXAMPLES
            </Link>
            <Link
              href="#pricing"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a4137] hover:text-[#111111] transition-colors py-1 px-2 rounded"
            >
              PRICING
            </Link>
            <Link
              href="#faq"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5a4137] hover:text-[#111111] transition-colors py-1 px-2 rounded"
            >
              FAQ
            </Link>
          </nav>
        </div>

        {/* Action Controls & Profile Avatar */}
        <div className="flex items-center gap-4">
          <button
            onClick={onSurpriseClick}
            className="hidden sm:inline-flex items-center justify-center h-9 px-3 bg-[#EDEDEA] text-[#111111] border border-[#111111] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white transition-all gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px] text-[#F25C05]">bolt</span>
            <span>SURPRISE ME</span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center h-9 px-4 bg-[#ffffff] text-[#111111] border border-[#111111] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#f0eee8] transition-all"
          >
            LOG IN
          </Link>
          
          <button
            onClick={onIdeaClick}
            className="inline-flex items-center justify-center h-9 px-4 bg-[#30312d] text-[#f2f1eb] border border-[#30312d] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#a23a00] hover:border-[#a23a00] hover:text-white transition-all"
          >
            START FREE
          </button>

          <div
            className="w-8 h-8 rounded-full bg-[#a23a00] flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
            title="Active User Profile"
          >
            <span className="material-symbols-outlined text-white text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}

