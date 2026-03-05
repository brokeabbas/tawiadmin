import React from "react";
import { cn } from "../reusable/atoms";

function KpiCard({
  label,
  value,
  hint,
  tone = "emerald",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "emerald" | "rose" | "sky" | "zinc";
}) {
  const toneMap: Record<string, string> = {
    emerald: "bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.12),transparent_45%)] text-emerald-700",
    rose: "bg-[radial-gradient(circle_at_20%_0%,rgba(244,63,94,0.10),transparent_45%)] text-rose-600",
    sky: "bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.10),transparent_45%)] text-sky-700",
    zinc: "bg-[radial-gradient(circle_at_20%_0%,rgba(24,24,27,0.06),transparent_45%)] text-zinc-700",
  };

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5")}>
      <div className={cn("pointer-events-none absolute inset-0", toneMap[tone].split(" ").find((x) => x.startsWith("bg-")))} />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
        {hint ? <p className={cn("mt-1 text-xs font-semibold", toneMap[tone].split(" ").slice(-1)[0])}>{hint}</p> : null}
      </div>
    </div>
  );
}

export function AgentsKpis({
  totalAgents,
  activeSample,
  approvals,
  rejected,
}: {
  totalAgents: string;
  activeSample: string;
  approvals: string;
  rejected: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Total agents" value={totalAgents} hint="Registered + active" tone="zinc" />
      <KpiCard label="Active (sample)" value={activeSample} hint="Ready for assignments" tone="emerald" />
      <KpiCard label="Approvals" value={approvals} hint="QC completed" tone="emerald" />
      <KpiCard label="Rejected" value={rejected} hint="Failed validation" tone="rose" />
    </div>
  );
}