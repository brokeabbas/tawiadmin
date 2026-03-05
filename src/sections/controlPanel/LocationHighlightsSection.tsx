import React from "react";
import { SectionCard } from "../../components/controlPanel";

export type LocationHighlight = {
  name: string;
  meta: string;
  badge: string;
};

export function LocationHighlightsSection({
  items,
}: {
  items: LocationHighlight[];
}) {
  return (
    <SectionCard title="Location highlights">
      <div className="grid gap-3">
        {items.map((x) => (
          <div key={x.name} className="rounded-2xl border border-white/10 bg-zinc-950/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-100">{x.name}</p>
                <p className="mt-1 text-xs text-zinc-300/70">{x.meta}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-zinc-950/35 px-2 py-0.5 text-[11px] font-semibold text-zinc-200/80">
                {x.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}