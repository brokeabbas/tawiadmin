import React from "react";
import { cn } from "../reusable/atoms";
import type { AgentStatus } from "./types";
import { formatNumber } from "./utils";

export type AgentsSort =
  | "Default"
  | "Most approvals"
  | "Most jobs"
  | "Most flagged"
  | "Most recently active";

export function AgentsFiltersBar({
  q,
  onChangeQ,
  status,
  onChangeStatus,
  counts,
  stateFilter,
  onChangeStateFilter,
  stateOptions,
  sort,
  onChangeSort,
  onReset,
}: {
  q: string;
  onChangeQ: (v: string) => void;

  status: "All" | AgentStatus;
  onChangeStatus: (v: "All" | AgentStatus) => void;
  counts: Record<AgentStatus, number>;
  total: number;

  stateFilter: string; // "All" or state
  onChangeStateFilter: (v: string) => void;
  stateOptions: string[];

  sort: AgentsSort;
  onChangeSort: (v: AgentsSort) => void;

  onReset: () => void;
}) {
  const tabs = ["All", "Active", "Pending", "Offline", "Suspended"] as const;

  const badgeFor = (s: (typeof tabs)[number], allCount: number) => {
    if (s === "All") return allCount;
    return counts[s];
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((s) => {
            const active = s === status;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChangeStatus(s)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold shadow-soft backdrop-blur transition",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
                  active ? "border-emerald-200/80 bg-emerald-50/70 text-emerald-900" : "border-zinc-200 bg-white/60 text-zinc-700 hover:bg-white"
                )}
              >
                <span>{s}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px]",
                    active ? "border-emerald-200 bg-white/70" : "border-zinc-200 bg-white/70"
                  )}
                >
                  {formatNumber(badgeFor(s, stateOptions.length ? badgeFor("All", badgeFor("All", 0)) : 0) || badgeFor(s, badgeFor("All", 0)))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => onChangeQ(e.target.value)}
              placeholder="Search agents, states, IDs…"
              className={cn(
                "h-10 w-full sm:w-80 rounded-2xl border border-zinc-200/70 bg-white/60 px-4 text-sm text-zinc-900 shadow-soft backdrop-blur",
                "placeholder:text-zinc-500",
                "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
              )}
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <div className="relative">
              <select
                value={stateFilter}
                onChange={(e) => onChangeStateFilter(e.target.value)}
                className={cn(
                  "h-10 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              >
                <option value="All">All states</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => onChangeSort(e.target.value as AgentsSort)}
                className={cn(
                  "h-10 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              >
                {(["Default", "Most approvals", "Most jobs", "Most flagged", "Most recently active"] as const).map((x) => (
                  <option key={x} value={x}>
                    Sort: {x}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className={cn(
              "h-10 rounded-2xl border border-zinc-200 bg-white/60 px-3 text-xs font-semibold text-zinc-800 shadow-soft backdrop-blur",
              "hover:bg-white transition",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
            )}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}