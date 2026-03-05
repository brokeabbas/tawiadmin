import React from "react";
import { Button, cn } from "../../components/reusable/atoms";
import { SectionCard } from "../../components/controlPanel";

export type VerificationQueueItem = {
  id: string;
  location: string;
  type: string;
  age: string;
  status: string;
};

export function VerificationQueueSection({
  items,
  onViewAll,
  onApprove,
  onFlag,
}: {
  items: VerificationQueueItem[];
  onViewAll: () => void;
  onApprove: (id: string) => void;
  onFlag: (id: string) => void;
}) {
  return (
    <SectionCard
      title="Verification queue"
      right={
        <button
          type="button"
          onClick={onViewAll}
          className={cn(
            "rounded-xl px-2.5 py-1.5 text-xs font-semibold transition",
            "text-zinc-200/80 hover:bg-white/5 hover:text-zinc-100",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/20"
          )}
        >
          View all
        </button>
      }
    >
      <div className="grid gap-3">
        {items.map((x) => (
          <div
            key={x.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/25 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-zinc-100">{x.id}</p>
                <span className="rounded-full border border-white/10 bg-zinc-950/35 px-2 py-0.5 text-[11px] font-semibold text-zinc-200/80">
                  {x.type}
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                  {x.status}
                </span>
              </div>

              <p className="mt-1 text-xs text-zinc-300/70">
                {x.location} • {x.age}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={() => onApprove(x.id)}
                className={cn(
                  "rounded-2xl bg-emerald-400 text-zinc-950 hover:bg-emerald-300",
                  "px-3 py-2 text-xs"
                )}
              >
                Approve
              </Button>

              <Button
                variant="secondary"
                onClick={() => onFlag(x.id)}
                className={cn(
                  "rounded-2xl border border-white/10 bg-zinc-950/20 text-zinc-100",
                  "hover:bg-white/5 transition",
                  "px-3 py-2 text-xs"
                )}
              >
                Flag
              </Button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}