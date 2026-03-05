import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, cn } from "../../components/reusable/atoms";
import { useControlPanelContext } from "../controlPanelPage";
import { SectionCard } from "./controlPanelCards";

export default function ControlPanelActivityPanel() {
  const navigate = useNavigate();
  const { activity } = useControlPanelContext();

  return (
    <SectionCard title="Recent activity">
      <div className="grid gap-3">
        {activity.map((x, idx) => (
          <div key={`${x.t}-${idx}`} className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900">{x.t}</p>
                <p className="mt-1 truncate text-xs text-zinc-600">{x.d}</p>
              </div>
              <span className="shrink-0 text-xs text-zinc-500">{x.when}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200/80 bg-zinc-50 p-4">
        <p className="text-xs text-zinc-600">
          Tip: Clear pending verifications first, then review anomalies for faster ops flow.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => alert("Hook: open settings")}
          variant="secondary"
          className={cn(
            "w-full rounded-2xl border border-zinc-200 bg-white text-zinc-900",
            "hover:bg-zinc-50 transition"
          )}
        >
          Settings
        </Button>

        <Button
          onClick={() => navigate("/", { replace: true })}
          variant="secondary"
          className={cn(
            "w-full rounded-2xl border border-zinc-200 bg-white text-zinc-900",
            "hover:bg-zinc-50 transition"
          )}
        >
          Back to Home
        </Button>
      </div>
    </SectionCard>
  );
}