import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionCard } from "./controlPanelCards";
import { useControlPanelContext } from "../controlPanelPage";

import {
  AgentProfileDrawer,
  AgentsHeader,
  AgentsKpis,
  AgentsTable,
  AgentCoverageHeatmap,
  AgentStatusBreakdown,
  generateAgents,
  formatNumber,
  lastActiveToMinutes,
  type Agent,
  type AgentStatus,
} from "../../components/agentsPanel";
import { AgentsFiltersBar, type AgentsSort } from "../../components/agentsPanel/AgentsFiltersBar";

function computeCounts(list: Agent[]) {
  const c: Record<AgentStatus, number> = { Active: 0, Pending: 0, Suspended: 0, Offline: 0 };
  for (const a of list) c[a.status] += 1;
  return c;
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

function sortAgents(list: Agent[], sort: AgentsSort) {
  if (sort === "Default") return list;

  const arr = [...list];
  arr.sort((a, b) => {
    if (sort === "Most approvals") return b.approvals - a.approvals;
    if (sort === "Most jobs") return b.assignedJobs - a.assignedJobs;
    if (sort === "Most flagged") return b.flagged - a.flagged;
    if (sort === "Most recently active") return lastActiveToMinutes(a.lastActive) - lastActiveToMinutes(b.lastActive);
    return 0;
  });
  return arr;
}

export default function ControlPanelAgentsPage() {
  const navigate = useNavigate();
  const { range, stats } = useControlPanelContext();

  // keep your original sampling logic, but move data gen out of the UI
  const desiredCount = useMemo(() => Math.min(80, Math.max(28, Math.round(stats.agents / 5))), [stats.agents]);
  const allAgents = useMemo(() => generateAgents(desiredCount), [desiredCount]);

  const counts = useMemo(() => computeCounts(allAgents), [allAgents]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | AgentStatus>("All");
  const [stateFilter, setStateFilter] = useState<string>("All");
  const [sort, setSort] = useState<AgentsSort>("Default");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selected, setSelected] = useState<Agent | null>(null);

  const stateOptions = useMemo(() => {
    const set = new Set(allAgents.map((a) => a.state));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allAgents]);

  const filtered = useMemo(() => {
    const base = allAgents.filter((a) => {
      const okStatus = status === "All" ? true : a.status === status;
      if (!okStatus) return false;

      const okState = stateFilter === "All" ? true : a.state === stateFilter;
      if (!okState) return false;

      return matchesQuery(a, q);
    });

    return sortAgents(base, sort);
  }, [allAgents, q, status, stateFilter, sort]);

  // reset paging when filters change
  React.useEffect(() => {
    setPage(1);
  }, [q, status, stateFilter, sort, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div className="grid gap-6">
<AgentsHeader
  rangeLabel={range}
  onInvite={() => alert("Hook: invite agent")}
  onImport={() => alert("Hook: bulk import")}
  onManageAgents={() => navigate("/control-panel/manage-agents")}
/>

      <AgentsKpis
        totalAgents={formatNumber(stats.agents)}
        activeSample={formatNumber(counts.Active)}
        approvals={formatNumber(stats.approved)}
        rejected={formatNumber(stats.rejected)}
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4 grid gap-6">
          <SectionCard title="Coverage">
            <AgentCoverageHeatmap />
          </SectionCard>

          <SectionCard title="Status">
            <AgentStatusBreakdown counts={counts} />
          </SectionCard>
        </div>

        <div className="xl:col-span-8">
          <SectionCard title="Directory">
            <div className="grid gap-4">
              <AgentsFiltersBar
                q={q}
                onChangeQ={setQ}
                status={status}
                onChangeStatus={(v) => setStatus(v)}
                counts={counts}
                total={allAgents.length}
                stateFilter={stateFilter}
                onChangeStateFilter={setStateFilter}
                stateOptions={stateOptions}
                sort={sort}
                onChangeSort={setSort}
                onReset={() => {
                  setQ("");
                  setStatus("All");
                  setStateFilter("All");
                  setSort("Default");
                }}
              />

              <AgentsTable
                agents={paged}
                total={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSelectAgent={(a) => setSelected(a)}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <AgentProfileDrawer agent={selected} open={!!selected} onClose={() => setSelected(null)} />
    </div>
  );
}