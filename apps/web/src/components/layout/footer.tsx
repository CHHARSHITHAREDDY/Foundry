import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#EDEDEA] text-[#111111] py-16 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b-[1.5px] border-[#D6D6D1]">
          {/* Brand Wordmark */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="font-headline text-[32px] font-bold text-[#111111]">
                Foundry
              </span>
              <span className="w-1.5 h-1.5 bg-[#F25C05] inline-block mb-1" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E] block mb-4">
              AUTONOMOUS VENTURE STUDIO &amp; SYSTEM ENGINE
            </span>
            <p className="font-body text-[14px] text-[#474646] leading-relaxed">
              Machined systems for the next wave of high-leverage intellectual business owners.
            </p>
          </div>

          {/* Col 1: Product */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] mb-4 pb-2 border-b border-[#D6D6D1]">
              Product
            </h4>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#474646]">
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#capabilities">
                  Capabilities
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Ember Coprocessor
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Changelog
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Infrastructure
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Showcase */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] mb-4 pb-2 border-b border-[#D6D6D1]">
              Showcase
            </h4>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#474646]">
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#examples">
                  LedgerPulse
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#examples">
                  OmniBrief
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#examples">
                  Substacker
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Community Registry
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] mb-4 pb-2 border-b border-[#D6D6D1]">
              Resources
            </h4>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#474646]">
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Documentation
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  API Reference
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  System Status
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Token Economy
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Operator Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] font-bold text-[#111111] mb-4 pb-2 border-b border-[#D6D6D1]">
              Company
            </h4>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#474646]">
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Editorial Manifesto
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Press Kit
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Careers [2 Hires]
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#F25C05] transition-colors" href="#">
                  Contact Desk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F5E5E]">
          <div>
            &copy; {new Date().getFullYear()} FOUNDRY LABS INC. ALL RIGHTS RESERVED.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link className="hover:text-[#111111] transition-colors" href="#">
              TERMS OF SERVICE
            </Link>
            <Link className="hover:text-[#111111] transition-colors" href="#">
              PRIVACY POLICY
            </Link>
            <Link className="hover:text-[#111111] transition-colors" href="#">
              SECURITY DISCLOSURES
            </Link>
            <div className="flex items-center gap-1.5 text-[#15803D] font-bold">
              <span className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-pulse" />
              SYS_OK 99.99%
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

