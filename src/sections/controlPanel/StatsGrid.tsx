import React, { useMemo } from "react";
import { StatCard } from "../../components/controlPanel";

export function StatsGrid({
  range,
  stats,
}: {
  range: "Today" | "7d" | "30d";
  stats: { pending: number; approved: number; flagged: number; activeLocations: number };
}) {
  const deltas = useMemo(() => {
    if (range === "Today") return { pending: "+3", approved: "+18", flagged: "+1" };
    if (range === "30d") return { pending: "+12", approved: "+210", flagged: "+5" };
    return { pending: "+6", approved: "+65", flagged: "+2" };
  }, [range]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Pending verification"
        value={`${stats.pending}`}
        delta={deltas.pending}
        hint="Needs review in the queue"
      />
      <StatCard
        title="Approved"
        value={`${stats.approved}`}
        delta={deltas.approved}
        hint="Completed verifications"
      />
      <StatCard
        title="Flagged"
        value={`${stats.flagged}`}
        delta={deltas.flagged}
        hint="Requires follow-up"
      />
      <StatCard title="Active locations" value={`${stats.activeLocations}`} hint="Reporting in selected range" />
    </div>
  );
}