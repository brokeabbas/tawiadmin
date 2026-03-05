import React from "react";
import { Button, cn } from "../../components/reusable/atoms";
import { useControlPanelContext } from "../controlPanelPage";
import { SectionCard } from "./controlPanelCards";

export default function ControlPanelQueuePanel() {
  const { verificationQueue } = useControlPanelContext();

  return (
    <SectionCard title="Verification queue">
      <div className="grid gap-3">
        {verificationQueue.map((x) => (
          <div
            key={x.id}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900">{x.id}</p>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                  {x.type}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {x.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">
                {x.location} • {x.age}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={() => alert(`Approve ${x.id}`)}
                className={cn("rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500", "px-3 py-2 text-xs")}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => alert(`Flag ${x.id}`)}
                className={cn(
                  "rounded-2xl border border-zinc-200 bg-white text-zinc-900",
                  "hover:bg-zinc-50 transition",
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