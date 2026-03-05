import React, { useMemo } from "react";
import { cn } from "../reusable/atoms";
import type { AgentStatus } from "./types";
import { formatNumber } from "./utils";

export function AgentStatusBreakdown({
  counts,
}: {
  counts: Record<AgentStatus, number>;
}) {
  const total = (counts.Active + counts.Pending + counts.Offline + counts.Suspended) || 1;

  const rows = useMemo(
    () =>
      ([
        { k: "Active" as const, label: "Active", bar: "bg-emerald-500", text: "text-emerald-800", chip: "bg-emerald-50 border-emerald-200/70" },
        { k: "Pending" as const, label: "Pending", bar: "bg-sky-500", text: "text-sky-800", chip: "bg-sky-50 border-sky-200/70" },
        { k: "Offline" as const, label: "Offline", bar: "bg-zinc-400", text: "text-zinc-700", chip: "bg-white/60 border-zinc-200" },
        { k: "Suspended" as const, label: "Suspended", bar: "bg-rose-500", text: "text-rose-700", chip: "bg-rose-50 border-rose-200/70" },
      ] as const).map((x) => ({ ...x, value: counts[x.k], pct: Math.round((counts[x.k] / total) * 100) })),
    [counts, total]
  );

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Status breakdown</p>
          <p className="mt-1 text-xs text-zinc-600">Snapshot of the current sample</p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-zinc-700">
          Total: {formatNumber(total)}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-[1fr,auto] items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-zinc-900">{r.label}</span>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", r.chip, r.text)}>
                  {formatNumber(r.value)} • {r.pct}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200/70">
                <div className={cn("h-full rounded-full", r.bar)} style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}