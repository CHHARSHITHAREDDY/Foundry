import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string | number;
  change?: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-100 p-5">
      <CardContent className="p-0">
        <div className="text-xs text-zinc-400 font-medium">{label}</div>
        <div className="text-2xl font-bold mt-2 font-mono">{value}</div>
        {change && <div className="text-xs text-emerald-400 mt-1">{change}</div>}
      </CardContent>
    </Card>
  );
}
