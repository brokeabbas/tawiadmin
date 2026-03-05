import React, { useMemo } from "react";
import { cn } from "../reusable/atoms";
import { bucketIndex, compactNumber, formatNumber } from "./utils";
import { stateInsights } from "../../pages/controlPanel/controlPanelData";

export function AgentCoverageHeatmap() {
  const top = useMemo(() => [...stateInsights].sort((a, b) => b.agents - a.agents).slice(0, 12), []);
  const min = Math.min(...top.map((x) => x.agents));
  const max = Math.max(...top.map((x) => x.agents));

  const steps = [
    "bg-emerald-50 text-emerald-900 ring-emerald-200",
    "bg-emerald-100 text-emerald-900 ring-emerald-200",
    "bg-emerald-200 text-emerald-950 ring-emerald-300",
    "bg-emerald-300 text-emerald-950 ring-emerald-300",
    "bg-emerald-400 text-white ring-emerald-400",
    "bg-emerald-500 text-white ring-emerald-500",
    "bg-emerald-600 text-white ring-emerald-600",
  ];

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Coverage</p>
          <p className="mt-1 text-xs text-zinc-600">Top states by agent distribution</p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500">
          <span>Low</span>
          <div className="flex items-center gap-1">
            {steps.map((cls, i) => (
              <span
                key={i}
                className={cn(
                  "h-2.5 w-2.5 rounded-sm ring-1 ring-inset",
                  cls.split(" ").find((x) => x.startsWith("bg-")) ?? "bg-zinc-200",
                  cls.split(" ").find((x) => x.startsWith("ring-")) ?? "ring-zinc-200"
                )}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {top.map((x) => {
          const b = bucketIndex(x.agents, min, max, steps.length);
          return (
            <div
              key={x.state}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 p-3",
                "hover:bg-white motion-safe:transition"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-900">{x.state}</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{formatNumber(x.locations)} locations</p>
                </div>
                <div className={cn("shrink-0 rounded-2xl px-3 py-2 ring-1 ring-inset", steps[b])}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Agents</p>
                  <p className="text-sm font-extrabold leading-none">{compactNumber(x.agents)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}