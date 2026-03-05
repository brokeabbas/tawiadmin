import React from "react";
import { cn } from "../../components/reusable/atoms";
import { SectionCard } from "./controlPanelCards";

export default function ControlPanelActionsPanel() {
  return (
    <SectionCard title="Quick actions">
      <div className="grid gap-3">
        {[
          { title: "Add location", desc: "Register a new site for tracking", onClick: () => alert("Hook: create location") },
          { title: "Review anomalies", desc: "Spot drift and suspicious activity", onClick: () => alert("Hook: open anomalies") },
          { title: "Generate report", desc: "Create audit-ready export", onClick: () => alert("Hook: export report") },
        ].map((it) => (
          <button
            key={it.title}
            type="button"
            onClick={it.onClick}
            className={cn(
              "w-full rounded-2xl border border-zinc-200/80 bg-white/60 px-4 py-3 text-left transition",
              "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
            )}
          >
            <p className="text-sm font-semibold text-zinc-900">{it.title}</p>
            <p className="mt-1 text-xs text-zinc-600">{it.desc}</p>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}