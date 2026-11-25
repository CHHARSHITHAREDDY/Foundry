import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-800 py-8 px-6 text-center text-xs text-zinc-500 bg-zinc-950">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} Venture Studio Inc. All rights reserved.</div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
