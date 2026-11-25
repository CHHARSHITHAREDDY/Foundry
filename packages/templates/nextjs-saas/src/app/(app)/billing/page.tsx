"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BillingPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Subscription & Billing</h1>
        <p className="text-zinc-400 mt-1">Manage your active tier, team seats, and invoices.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-zinc-800 bg-zinc-900 text-zinc-100 p-6 flex flex-col justify-between">
          <div>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">STARTER</Badge>
            <div className="text-3xl font-extrabold mt-4">$29<span className="text-sm font-normal text-zinc-400">/mo</span></div>
            <p className="text-sm text-zinc-400 mt-2">Essential automation for solo founders and micro-teams.</p>
          </div>
          <Button variant="outline" className="w-full mt-6 border-zinc-700 text-zinc-200 hover:bg-zinc-800">Switch Plan</Button>
        </Card>

        <Card className="border-indigo-500/50 bg-gradient-to-b from-indigo-950/20 to-zinc-900 text-zinc-100 p-6 flex flex-col justify-between relative shadow-lg">
          <Badge className="absolute top-4 right-4 bg-indigo-600 text-white">CURRENT PLAN</Badge>
          <div>
            <Badge variant="outline" className="border-indigo-400 text-indigo-300">PRO TIER</Badge>
            <div className="text-3xl font-extrabold mt-4">$79<span className="text-sm font-normal text-zinc-400">/mo</span></div>
            <p className="text-sm text-zinc-400 mt-2">High concurrency pipelines, automated failover, and Slack alerts.</p>
          </div>
          <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium">Manage via Stripe</Button>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 text-zinc-100 p-6 flex flex-col justify-between">
          <div>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">ENTERPRISE</Badge>
            <div className="text-3xl font-extrabold mt-4">$299<span className="text-sm font-normal text-zinc-400">/mo</span></div>
            <p className="text-sm text-zinc-400 mt-2">Dedicated worker pools, SOC-2 compliance logs, and 99.99% SLA.</p>
          </div>
          <Button variant="outline" className="w-full mt-6 border-zinc-700 text-zinc-200 hover:bg-zinc-800">Contact Sales</Button>
        </Card>
      </div>
    </div>
  );
}
