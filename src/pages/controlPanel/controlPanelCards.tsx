// tawiadmin/src/pages/controlPanel/controlPanelCards.tsx
import React from "react";

export function StatCard({
  title,
  value,
  delta,
  hint,
}: {
  title: string;
  value: string;
  delta?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        {delta ? (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {delta}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>

      {hint ? (
        <p className="mt-1 text-xs leading-5 text-zinc-600">{hint}</p>
      ) : (
        <p className="mt-1 text-xs leading-5 text-zinc-400">—</p>
      )}
    </div>
  );
}

export function SectionCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/70 p-6 shadow-soft backdrop-blur sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">{title}</h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}