import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, cn } from "../reusable/atoms";
import { useControlPanelContext } from "../../pages/controlPanelPage";
import { SectionCard } from "../../pages/controlPanel/controlPanelCards";

import {
  AgentProfileDrawer,
  generateAgents,
  formatNumber,
  lastActiveToMinutes,
  type Agent,
  type AgentStatus,
} from ".";

type SortKey =
  | "name"
  | "status"
  | "state"
  | "lga"
  | "approvals"
  | "rejections"
  | "flagged"
  | "jobs"
  | "lastActive";

type SortDir = "asc" | "desc";

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDownload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4 17.5V20a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 20v-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function parseNum(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return n;
}

function statusOrder(s: AgentStatus): number {
  const order: Record<AgentStatus, number> = { Active: 0, Pending: 1, Offline: 2, Suspended: 3 };
  return order[s] ?? 9;
}

function matchesQuery(a: Agent, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return (
    a.name.toLowerCase().includes(s) ||
    a.id.toLowerCase().includes(s) ||
    a.phone.toLowerCase().includes(s) ||
    a.state.toLowerCase().includes(s) ||
    a.lga.toLowerCase().includes(s)
  );
}

function sortByKey(list: Agent[], key: SortKey, dir: SortDir) {
  const sign = dir === "asc" ? 1 : -1;
  const arr = [...list];

  arr.sort((a, b) => {
    let va: string | number = 0;
    let vb: string | number = 0;

    switch (key) {
      case "name":
        va = a.name;
        vb = b.name;
        break;
      case "status":
        va = statusOrder(a.status);
        vb = statusOrder(b.status);
        break;
      case "state":
        va = a.state;
        vb = b.state;
        break;
      case "lga":
        va = a.lga;
        vb = b.lga;
        break;
      case "approvals":
        va = a.approvals;
        vb = b.approvals;
        break;
      case "rejections":
        va = a.rejections;
        vb = b.rejections;
        break;
      case "flagged":
        va = a.flagged;
        vb = b.flagged;
        break;
      case "jobs":
        va = a.assignedJobs;
        vb = b.assignedJobs;
        break;
      case "lastActive":
        va = lastActiveToMinutes(a.lastActive);
        vb = lastActiveToMinutes(b.lastActive);
        break;
      default:
        break;
    }

    if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
    return String(va).localeCompare(String(vb)) * sign;
  });

  return arr;
}

function HeaderCell({
  label,
  colKey,
  sortKey,
  sortDir,
  onSort,
  className,
}: {
  label: string;
  colKey: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === colKey;
  return (
    <button
      type="button"
      onClick={() => onSort(colKey)}
      className={cn(
        "group inline-flex items-center gap-2 text-left",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15 rounded-lg",
        className
      )}
      title="Sort"
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold",
          active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white/60 text-zinc-500"
        )}
      >
        {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

export default function ManageAgentsPage() {
  const navigate = useNavigate();
  const { stats } = useControlPanelContext();

  // “nationwide database” sample size — keep it performant
  const desiredCount = useMemo(() => Math.min(650, Math.max(280, Math.round(stats.agents / 2) || 420)), [stats.agents]);
  const allAgents = useMemo(() => generateAgents(desiredCount), [desiredCount]);

  // Filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | AgentStatus>("All");
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [lgaFilter, setLgaFilter] = useState<string>("All");

  const [flaggedFilter, setFlaggedFilter] = useState<"All" | "Flagged" | "Not flagged">("All");
  const [lastActiveFilter, setLastActiveFilter] = useState<"Any" | "≤ 1h" | "≤ 24h" | "≤ 7d">("Any");

  const [minApprovals, setMinApprovals] = useState("");
  const [maxRejections, setMaxRejections] = useState("");
  const [minJobs, setMinJobs] = useState("");
  const [maxJobs, setMaxJobs] = useState("");

  // Sorting / paging
  const [sortKey, setSortKey] = useState<SortKey>("approvals");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection + drawer
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const stateOptions = useMemo(() => {
    const s = new Set(allAgents.map((a) => a.state));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allAgents]);

  const lgaOptions = useMemo(() => {
    const base = stateFilter === "All" ? allAgents : allAgents.filter((a) => a.state === stateFilter);
    const s = new Set(base.map((a) => a.lga));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allAgents, stateFilter]);

  // auto-reset LGA when state changes
  useEffect(() => {
    setLgaFilter("All");
  }, [stateFilter]);

  const filtered = useMemo(() => {
    const minA = parseNum(minApprovals);
    const maxR = parseNum(maxRejections);
    const minJ = parseNum(minJobs);
    const maxJ = parseNum(maxJobs);

    const lastMaxMinutes =
      lastActiveFilter === "≤ 1h"
        ? 60
        : lastActiveFilter === "≤ 24h"
          ? 60 * 24
          : lastActiveFilter === "≤ 7d"
            ? 60 * 24 * 7
            : null;

    const base = allAgents.filter((a) => {
      if (status !== "All" && a.status !== status) return false;
      if (stateFilter !== "All" && a.state !== stateFilter) return false;
      if (lgaFilter !== "All" && a.lga !== lgaFilter) return false;

      if (flaggedFilter === "Flagged" && a.flagged <= 0) return false;
      if (flaggedFilter === "Not flagged" && a.flagged > 0) return false;

      if (minA !== null && a.approvals < minA) return false;
      if (maxR !== null && a.rejections > maxR) return false;
      if (minJ !== null && a.assignedJobs < minJ) return false;
      if (maxJ !== null && a.assignedJobs > maxJ) return false;

      if (lastMaxMinutes !== null && lastActiveToMinutes(a.lastActive) > lastMaxMinutes) return false;

      return matchesQuery(a, q);
    });

    return sortByKey(base, sortKey, sortDir);
  }, [
    allAgents,
    q,
    status,
    stateFilter,
    lgaFilter,
    flaggedFilter,
    lastActiveFilter,
    minApprovals,
    maxRejections,
    minJobs,
    maxJobs,
    sortKey,
    sortDir,
  ]);

  // reset paging when filters change
  useEffect(() => {
    setPage(1);
  }, [q, status, stateFilter, lgaFilter, flaggedFilter, lastActiveFilter, minApprovals, maxRejections, minJobs, maxJobs, pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // selection helpers
  const pageAllSelected = useMemo(() => paged.length > 0 && paged.every((a) => selectedIds.has(a.id)), [paged, selectedIds]);
  const selectedCount = selectedIds.size;

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (pageAllSelected) {
        paged.forEach((a) => next.delete(a.id));
      } else {
        paged.forEach((a) => next.add(a.id));
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setQ("");
    setStatus("All");
    setStateFilter("All");
    setLgaFilter("All");
    setFlaggedFilter("All");
    setLastActiveFilter("Any");
    setMinApprovals("");
    setMaxRejections("");
    setMinJobs("");
    setMaxJobs("");
    setSortKey("approvals");
    setSortDir("desc");
  }

  function onSort(nextKey: SortKey) {
    if (sortKey === nextKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(nextKey);
      setSortDir(nextKey === "name" || nextKey === "state" || nextKey === "lga" ? "asc" : "desc");
    }
  }

  const appliedFiltersCount = useMemo(() => {
    let n = 0;
    if (q.trim()) n += 1;
    if (status !== "All") n += 1;
    if (stateFilter !== "All") n += 1;
    if (lgaFilter !== "All") n += 1;
    if (flaggedFilter !== "All") n += 1;
    if (lastActiveFilter !== "Any") n += 1;
    if (minApprovals.trim()) n += 1;
    if (maxRejections.trim()) n += 1;
    if (minJobs.trim()) n += 1;
    if (maxJobs.trim()) n += 1;
    return n;
  }, [q, status, stateFilter, lgaFilter, flaggedFilter, lastActiveFilter, minApprovals, maxRejections, minJobs, maxJobs]);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Manage agents</p>
          <p className="mt-1 text-xs text-zinc-600">
            Nationwide database table • advanced search & filters • sample dataset for UI
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => alert("Hook: export agents CSV")}
            className={cn(
              "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft backdrop-blur",
              "hover:bg-white transition"
            )}
          >
            <span className="inline-flex items-center gap-2">
              <IconDownload className="h-4 w-4 text-zinc-700" />
              Export
            </span>
          </Button>

          <Button
            onClick={() => navigate("/control-panel/agents")}
            className={cn(
              "rounded-2xl bg-emerald-600 text-white shadow-soft transition",
              "hover:bg-emerald-500 hover:shadow-md"
            )}
          >
            Back to agents
          </Button>
        </div>
      </div>

      {/* Filters */}
      <SectionCard title="Search & filters">
        <div className="grid gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-[520px]">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <IconSearch className="h-4 w-4" />
              </div>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, ID, phone, state, LGA…"
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 pl-10 pr-4 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-soft">
                Total: {formatNumber(allAgents.length)}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-[11px] font-semibold text-emerald-800 shadow-soft">
                Results: {formatNumber(filtered.length)}
              </span>
              {appliedFiltersCount ? (
                <span className="rounded-full border border-amber-200 bg-amber-50/70 px-3 py-1 text-[11px] font-semibold text-amber-800 shadow-soft">
                  Filters: {formatNumber(appliedFiltersCount)}
                </span>
              ) : null}

              <button
                type="button"
                onClick={clearFilters}
                className={cn(
                  "h-9 rounded-2xl border border-zinc-200 bg-white/60 px-3 text-xs font-semibold text-zinc-800 shadow-soft backdrop-blur",
                  "hover:bg-white transition",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                )}
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Advanced filters grid */}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Offline">Offline</option>
                <option value="Suspended">Suspended</option>
              </select>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
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
                value={lgaFilter}
                onChange={(e) => setLgaFilter(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              >
                <option value="All">All LGAs</option>
                {lgaOptions.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <select
                value={flaggedFilter}
                onChange={(e) => setFlaggedFilter(e.target.value as any)}
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              >
                <option value="All">Flagged: any</option>
                <option value="Flagged">Flagged only</option>
                <option value="Not flagged">Not flagged</option>
              </select>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <select
                value={lastActiveFilter}
                onChange={(e) => setLastActiveFilter(e.target.value as any)}
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              >
                <option value="Any">Last active: any</option>
                <option value="≤ 1h">Last active ≤ 1h</option>
                <option value="≤ 24h">Last active ≤ 24h</option>
                <option value="≤ 7d">Last active ≤ 7d</option>
              </select>
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <input
                value={minApprovals}
                onChange={(e) => setMinApprovals(e.target.value)}
                placeholder="Min approvals"
                inputMode="numeric"
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <input
                value={maxRejections}
                onChange={(e) => setMaxRejections(e.target.value)}
                placeholder="Max rejections"
                inputMode="numeric"
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <input
                value={minJobs}
                onChange={(e) => setMinJobs(e.target.value)}
                placeholder="Min jobs"
                inputMode="numeric"
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>

            <div className="relative">
              <input
                value={maxJobs}
                onChange={(e) => setMaxJobs(e.target.value)}
                placeholder="Max jobs"
                inputMode="numeric"
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/60 px-3 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Table */}
      <SectionCard title="Agents database">
        <div className="grid gap-3">
          {/* Bulk actions */}
          {selectedCount ? (
            <div className="flex flex-col gap-2 rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-emerald-900">
                {formatNumber(selectedCount)} selected
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => alert(`Hook: message ${selectedCount} agents`)}
                  className={cn("rounded-2xl border border-emerald-200/70 bg-white/70 text-emerald-900 shadow-soft", "hover:bg-white")}
                >
                  Message
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => alert(`Hook: suspend ${selectedCount} agents`)}
                  className={cn("rounded-2xl border border-rose-200/70 bg-rose-50/70 text-rose-700 shadow-soft", "hover:bg-rose-50")}
                >
                  Suspend
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => alert(`Hook: export ${selectedCount} agents`)}
                  className={cn("rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft", "hover:bg-white")}
                >
                  Export selection
                </Button>

                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className={cn(
                    "h-10 rounded-2xl border border-emerald-200/70 bg-white/70 px-3 text-xs font-semibold text-emerald-900 shadow-soft",
                    "hover:bg-white transition"
                  )}
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/60 shadow-soft ring-1 ring-inset ring-zinc-900/5">
            {/* Table top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-zinc-50/60 px-4 py-3">
              <p className="text-xs font-semibold text-zinc-700">
                Showing <span className="text-zinc-900">{formatNumber(paged.length)}</span> rows •{" "}
                <span className="text-zinc-900">{formatNumber(filtered.length)}</span> results
              </p>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-zinc-500">Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={cn(
                    "h-8 rounded-xl border border-zinc-200/70 bg-white/70 px-2 text-xs font-semibold text-zinc-800 shadow-soft",
                    "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                  )}
                >
                  {[15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

            {/* Table */}
            <div className="max-h-[640px] overflow-auto">
              <div
                className={cn(
                  "sticky top-0 z-10",
                  "grid grid-cols-[40px,1.6fr,0.9fr,0.9fr,1.1fr,0.7fr,0.7fr,0.7fr,0.7fr,auto] items-center gap-3",
                  "border-b border-zinc-200/70 bg-white/85 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 backdrop-blur"
                )}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={pageAllSelected}
                    onChange={toggleAllOnPage}
                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/30"
                    aria-label="Select all on page"
                  />
                </div>

                <HeaderCell label="Agent" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="Status" colKey="status" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="State" colKey="state" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="LGA" colKey="lga" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="Approvals" colKey="approvals" sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="justify-start" />
                <HeaderCell label="Reject" colKey="rejections" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="Flagged" colKey="flagged" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="Jobs" colKey="jobs" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <HeaderCell label="Last" colKey="lastActive" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
                <div className="text-right">Open</div>
              </div>

              {paged.map((a) => {
                const checked = selectedIds.has(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAgent(a)}
                    className={cn(
                      "w-full text-left",
                      "grid grid-cols-[40px,1.6fr,0.9fr,0.9fr,1.1fr,0.7fr,0.7fr,0.7fr,0.7fr,auto] items-center gap-3 px-4 py-3",
                      "border-b border-zinc-200/60 last:border-b-0",
                      "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
                    )}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(a.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500/30"
                        aria-label={`Select ${a.id}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-zinc-900">{a.name}</p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        {a.id} • {a.phone}
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-zinc-800">{a.status}</div>
                    <div className="truncate text-xs font-semibold text-zinc-800">{a.state}</div>
                    <div className="truncate text-xs font-semibold text-zinc-800">{a.lga}</div>

                    <div className="text-xs font-semibold text-emerald-700">{formatNumber(a.approvals)}</div>
                    <div className="text-xs font-semibold text-rose-600">{formatNumber(a.rejections)}</div>
                    <div className={cn("text-xs font-semibold", a.flagged ? "text-amber-800" : "text-zinc-500")}>
                      {formatNumber(a.flagged)}
                    </div>
                    <div className="text-xs font-semibold text-zinc-900">{formatNumber(a.assignedJobs)}</div>
                    <div className="text-xs font-semibold text-zinc-600">{a.lastActive}</div>

                    <div className="flex items-center justify-end">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white/70 px-3 py-2 text-xs font-semibold text-zinc-800 shadow-soft",
                          "hover:bg-white transition"
                        )}
                      >
                        Open <IconChevron className="h-4 w-4 text-zinc-600" />
                      </span>
                    </div>
                  </button>
                );
              })}

              {!paged.length ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-semibold text-zinc-900">No agents found</p>
                  <p className="mt-1 text-xs text-zinc-600">Try adjusting your filters or search terms.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Drawer (advanced) */}
      <AgentProfileDrawer agent={selectedAgent} open={!!selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  );
}