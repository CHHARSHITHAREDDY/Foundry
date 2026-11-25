import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingHero({ title = "Automate Workflows with Confidence", tagline = "The high-utility operational platform built for modern teams." }: { title?: string; tagline?: string }) {
  return (
    <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h1>
      <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
        {tagline}
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
          <Link href="/signup">Start Free Trial</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
          <Link href="/login">Live Demo</Link>
        </Button>
      </div>
    </section>
  );
}
