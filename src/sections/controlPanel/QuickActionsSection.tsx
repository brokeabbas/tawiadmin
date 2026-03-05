import React from "react";
import { cn } from "../../components/reusable/atoms";
import { SectionCard } from "../../components/controlPanel";

export function QuickActionsSection({
  onAddLocation,
  onReviewAnomalies,
  onGenerateReport,
}: {
  onAddLocation: () => void;
  onReviewAnomalies: () => void;
  onGenerateReport: () => void;
}) {
  return (
    <SectionCard title="Quick actions">
      <div className="grid gap-3">
        <button
          type="button"
          onClick={onAddLocation}
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-zinc-950/25 px-4 py-3 text-left transition",
            "hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
          )}
        >
          <p className="text-sm font-semibold text-zinc-100">Add location</p>
          <p className="mt-1 text-xs text-zinc-300/70">Register a new site for tracking</p>
        </button>

        <button
          type="button"
          onClick={onReviewAnomalies}
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-zinc-950/25 px-4 py-3 text-left transition",
            "hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
          )}
        >
          <p className="text-sm font-semibold text-zinc-100">Review anomalies</p>
          <p className="mt-1 text-xs text-zinc-300/70">Spot drift and suspicious activity</p>
        </button>

        <button
          type="button"
          onClick={onGenerateReport}
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-zinc-950/25 px-4 py-3 text-left transition",
            "hover:bg-white/5 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
          )}
        >
          <p className="text-sm font-semibold text-zinc-100">Generate report</p>
          <p className="mt-1 text-xs text-zinc-300/70">Create audit-ready export</p>
        </button>
      </div>
    </SectionCard>
  );
}