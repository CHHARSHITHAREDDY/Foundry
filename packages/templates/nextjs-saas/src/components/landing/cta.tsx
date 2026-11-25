import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-20 px-6 text-center bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Ready to streamline your operations?</h2>
        <p className="text-sm text-zinc-400">Join forward-thinking engineering and operations teams today.</p>
        <div className="pt-2">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
            <Link href="/signup">Get Started Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
