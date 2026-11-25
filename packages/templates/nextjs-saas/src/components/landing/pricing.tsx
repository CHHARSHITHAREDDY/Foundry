import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LandingPricing() {
  const tiers = [
    { name: "Starter", price: "$29", desc: "Essential for solo developers and micro-teams." },
    { name: "Pro", price: "$79", desc: "Full feature suite with high concurrency.", popular: true },
    { name: "Team", price: "$199", desc: "Dedicated worker pools and priority 24/7 SLA." },
  ];

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold text-white text-center mb-12">Simple, Transparent Pricing</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <Card key={t.name} className={`border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between ${t.popular ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10" : ""}`}>
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-bold text-white">{t.name}</CardTitle>
              <div className="text-3xl font-extrabold text-white mt-4">{t.price}<span className="text-sm font-normal text-zinc-400">/mo</span></div>
              <CardDescription className="text-xs text-zinc-400 mt-2">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                <Link href="/signup">Choose {t.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
