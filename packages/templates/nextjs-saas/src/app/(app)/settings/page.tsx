"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Environment Settings</h1>
        <p className="text-zinc-400 mt-1">Configure API keys, webhooks, and team access.</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle>API Tokens</CardTitle>
          <CardDescription className="text-zinc-400">Use this token to authenticate client requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Secret Key</Label>
            <Input id="token" readOnly value="sk_live_9201f8a847b2c9e01f" className="border-zinc-700 bg-zinc-950 font-mono text-xs text-zinc-300" />
          </div>
          <Button variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">Roll Secret Key</Button>
        </CardContent>
      </Card>
    </div>
  );
}
