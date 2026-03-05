import React from "react";
import { Button, cn } from "../../components/reusable/atoms";
import { SectionCard } from "../../components/controlPanel";

export type ActivityItem = {
  t: string;
  d: string;
  when: string;
};

export function RecentActivitySection({
  items,
  onSettings,
  onBackHome,
}: {
  items: ActivityItem[];
  onSettings: () => void;
  onBackHome: () => void;
}) {
  return (
    <SectionCard title="Recent activity">
      <div className="grid gap-3">
        {items.map((x, idx) => (
          <div
            key={`${x.t}-${idx}`}
            className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{x.t}</p>
                <p className="mt-1 truncate text-xs text-zinc-300/70">{x.d}</p>
              </div>
              <span className="shrink-0 text-xs text-zinc-300/60">{x.when}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-950/25 p-4">
        <p className="text-xs text-zinc-300/70">
          Tip: Clear pending verifications first, then review anomalies for faster ops flow.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={onSettings}
          variant="secondary"
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-zinc-950/20 text-zinc-100",
            "hover:bg-white/5 transition"
          )}
        >
          Settings
        </Button>

        <Button
          onClick={onBackHome}
          variant="secondary"
          className={cn(
            "w-full rounded-2xl border border-white/10 bg-zinc-950/20 text-zinc-100",
            "hover:bg-white/5 transition"
          )}
        >
          Back to Home
        </Button>
      </div>
    </SectionCard>
  );
}