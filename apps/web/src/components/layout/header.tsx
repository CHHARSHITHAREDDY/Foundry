"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  activePath?: "home" | "how-it-works" | "examples" | "pricing";
  onSurpriseClick?: () => void;
  onIdeaClick?: () => void;
}

export function Header({
  activePath = "home",
  onSurpriseClick,
  onIdeaClick,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-surface-container-highest">
      <div className="h-16 max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin flex items-center justify-between">
        {/* Brand Wordmark & Navigation */}
        <div className="flex items-center gap-space-xl">
          <Link href="/" className="flex items-center gap-space-xs group" data-path="home">
            <span className="font-headline-lg text-headline-lg tracking-tight text-on-surface font-serif">
              Foundry
            </span>
            <span className="w-1.5 h-1.5 bg-primary-container inline-block ml-0.5 group-hover:scale-125 transition-transform" />
          </Link>

          <nav className="hidden md:flex items-center gap-space-lg ml-space-lg">
            <Link
              href="/how-it-works"
              data-path="how-it-works"
              className={`font-label-md text-label-md uppercase transition-colors py-space-xs px-space-sm rounded ${
                activePath === "how-it-works"
                  ? "bg-surface-container text-on-surface font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              HOW IT WORKS
            </Link>
            <Link
              href="/#examples"
              data-path="examples"
              className={`font-label-md text-label-md uppercase transition-colors py-space-xs px-space-sm rounded ${
                activePath === "examples"
                  ? "bg-surface-container text-on-surface font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              EXAMPLES
            </Link>
            <Link
              href="/pricing"
              data-path="pricing"
              className={`font-label-md text-label-md uppercase transition-colors py-space-xs px-space-sm rounded ${
                activePath === "pricing"
                  ? "bg-surface-container text-on-surface font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              PRICING
            </Link>
          </nav>
        </div>

        {/* Action Controls & Profile Avatar */}
        <div className="flex items-center gap-space-md">
          {onSurpriseClick && (
            <button
              onClick={onSurpriseClick}
              className="hidden sm:inline-flex items-center justify-center h-9 px-space-sm bg-[#EDEDEA] text-on-surface border border-on-surface font-label-md text-label-md uppercase tracking-[0.08em] hover:bg-on-surface hover:text-surface transition-all gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] text-ember">bolt</span>
              <span>SURPRISE ME</span>
            </button>
          )}

          <Link
            href="/login"
            data-path="login"
            className="hidden sm:inline-flex items-center justify-center h-9 px-space-md bg-surface-container-lowest text-on-surface border border-on-surface rounded font-label-md text-label-md uppercase hover:bg-surface-container hover:text-on-surface transition-all"
          >
            LOG IN
          </Link>

          <button
            onClick={onIdeaClick}
            data-path="signup"
            className="inline-flex items-center justify-center h-9 px-space-md bg-inverse-surface text-inverse-on-surface border border-inverse-surface rounded font-label-md text-label-md uppercase hover:bg-primary hover:border-primary hover:text-on-primary transition-all"
          >
            START FREE
          </button>

          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
            title="Active Founder Profile"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
