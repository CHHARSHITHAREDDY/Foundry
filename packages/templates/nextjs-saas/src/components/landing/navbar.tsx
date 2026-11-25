import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingNavbar({ appName = "Platform" }: { appName?: string }) {
  return (
    <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <Link href="/" className="font-bold text-base text-white tracking-tight">{appName}</Link>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-xs text-zinc-400 hover:text-white">Sign In</Link>
        <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}
