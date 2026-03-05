import React from "react";
import { Button, cn } from "../reusable/atoms";

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconUpload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19.5 8.5a3 3 0 0 0-2-2.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 20a8 8 0 0 0-4-6.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AgentsHeader({
  rangeLabel,
  onInvite,
  onImport,
  onManageAgents,
}: {
  rangeLabel: string;
  onInvite: () => void;
  onImport: () => void;
  onManageAgents: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-zinc-900">Agents</p>
        <p className="mt-1 text-xs text-zinc-600">
          Directory, readiness, and QC performance for <span className="font-semibold">{rangeLabel}</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          onClick={onInvite}
          className={cn(
            "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft backdrop-blur",
            "hover:bg-white transition",
            "px-3 py-2 text-xs"
          )}
        >
          <span className="inline-flex items-center gap-2">
            <IconPlus className="h-4 w-4 text-zinc-700" />
            Invite agent
          </span>
        </Button>

        <Button
          variant="secondary"
          onClick={onImport}
          className={cn(
            "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft backdrop-blur",
            "hover:bg-white transition",
            "px-3 py-2 text-xs"
          )}
        >
          <span className="inline-flex items-center gap-2">
            <IconUpload className="h-4 w-4 text-zinc-700" />
            Bulk import
          </span>
        </Button>

        <Button
          onClick={onManageAgents}
          className={cn(
            "rounded-2xl bg-emerald-600 text-white shadow-soft transition",
            "hover:bg-emerald-500 hover:shadow-md"
          )}
        >
          <span className="inline-flex items-center gap-2">
            <IconUsers className="h-4 w-4 text-white/90" />
            Manage agents
          </span>
        </Button>
      </div>
    </div>
  );
}