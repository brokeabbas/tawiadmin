import React from "react";
import { cn } from "../reusable/atoms";
import type { Agent } from "./types";
import { formatNumber, initials, statusPill } from "./utils";

export function AgentsTable({
  agents,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectAgent,
}: {
  agents: Agent[];
  total: number;
  page: number; // 1-based
  pageSize: number;
  onPageChange: (v: number) => void;
  onPageSizeChange: (v: number) => void;
  onSelectAgent: (a: Agent) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/60 shadow-soft ring-1 ring-inset ring-zinc-900/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-zinc-50/60 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-700">
          Showing <span className="text-zinc-900">{formatNumber(start)}</span>–<span className="text-zinc-900">{formatNumber(end)}</span>{" "}
          of <span className="text-zinc-900">{formatNumber(total)}</span>
        </p>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500">Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              "h-8 rounded-xl border border-zinc-200/70 bg-white/70 px-2 text-xs font-semibold text-zinc-800 shadow-soft",
              "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
            )}
          >
            {[10, 15, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className={cn(
              "h-8 rounded-xl border border-zinc-200 bg-white/60 px-3 text-xs font-semibold text-zinc-800 shadow-soft",
              "hover:bg-white transition disabled:opacity-50"
            )}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className={cn(
              "h-8 rounded-xl border border-zinc-200 bg-white/60 px-3 text-xs font-semibold text-zinc-800 shadow-soft",
              "hover:bg-white transition disabled:opacity-50"
            )}
            disabled={page >= totalPages}
          >
            Next
          </button>

          <span className="text-[11px] font-semibold text-zinc-500">
            Page <span className="text-zinc-800">{page}</span> / {totalPages}
          </span>
        </div>
      </div>

      <div className="max-h-[560px] overflow-auto">
        <div className="sticky top-0 z-10 grid grid-cols-[1.35fr,1fr,auto,auto,auto,auto] gap-3 border-b border-zinc-200/70 bg-white/80 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 backdrop-blur">
          <div>Agent</div>
          <div>Region</div>
          <div>Status</div>
          <div>QC</div>
          <div>Jobs</div>
          <div>Last</div>
        </div>

        {agents.map((a) => {
          const st = statusPill(a.status);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelectAgent(a)}
              className={cn(
                "w-full text-left",
                "grid grid-cols-[1.35fr,1fr,auto,auto,auto,auto] items-center gap-3 px-4 py-3",
                "border-b border-zinc-200/60 last:border-b-0",
                "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/70 text-xs font-extrabold text-zinc-800 shadow-soft">
                    {initials(a.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-900">{a.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                      {a.id} • {a.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-800">{a.state}</p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-500">{a.lga}</p>
              </div>

              <div>
                <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", st.chip)}>
                  <span className={cn("h-2 w-2 rounded-full", st.dot)} />
                  {a.status}
                </span>
              </div>

              <div className="text-xs font-semibold text-zinc-800">
                <span className="text-emerald-700">{formatNumber(a.approvals)}</span>
                <span className="text-zinc-400"> / </span>
                <span className="text-rose-600">{formatNumber(a.rejections)}</span>
                {a.flagged ? (
                  <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    {formatNumber(a.flagged)} flagged
                  </span>
                ) : null}
              </div>

              <div className="text-xs font-semibold text-zinc-900">{formatNumber(a.assignedJobs)}</div>
              <div className="text-xs font-semibold text-zinc-600">{a.lastActive}</div>
            </button>
          );
        })}

        {!agents.length ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-semibold text-zinc-900">No agents found</p>
            <p className="mt-1 text-xs text-zinc-600">Try adjusting filters or search terms.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}