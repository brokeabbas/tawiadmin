// tawiadmin/src/components/controlPanel/ControlPanelTopBar.tsx
import React, { useMemo, useState } from "react";
import { Button, cn } from "../reusable/atoms";
import logo from "../../assets/logo.png";

export type Range = "Today" | "7d" | "30d";

function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDownload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4 17.5V20a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 20v-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLogout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M10 17l-1 0a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 12l-3-3M15 12l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PillTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border border-zinc-200/70 bg-white/60 p-1 shadow-soft backdrop-blur",
        "ring-1 ring-inset ring-zinc-900/5"
      )}
      role="tablist"
      aria-label="Date range"
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            role="tab"
            aria-selected={active}
            className={cn(
              "relative rounded-xl px-3 py-1.5 text-xs font-semibold transition",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
              active ? "bg-emerald-600 text-white shadow-soft" : "text-zinc-700 hover:bg-white/70 hover:text-zinc-900"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StatusPill({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-soft backdrop-blur",
        "ring-1 ring-inset ring-zinc-900/5",
        online ? "border-emerald-200/70 bg-emerald-50/60 text-emerald-800" : "border-zinc-200 bg-white/60 text-zinc-700"
      )}
      aria-label={online ? "System status online" : "System status offline"}
    >
      <span className={cn("h-2 w-2 rounded-full", online ? "bg-emerald-500" : "bg-zinc-400")} />
      {online ? "Online" : "Offline"}
    </span>
  );
}

type TopBarMeta = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
};

const PAGE_META: Record<string, TopBarMeta> = {
  insights: {
    title: "Insights",
    subtitle: "Analytics • trends • exports",
    searchPlaceholder: "Search states, LGAs, farms, IDs…",
  },
  agents: {
    title: "Agents",
    subtitle: "Registration • management • assignments",
    searchPlaceholder: "Search agents, phone numbers, IDs…",
  },
  locations: {
    title: "Locations",
    subtitle: "States/LGAs • coverage • monitoring",
    searchPlaceholder: "Search states, LGAs, wards…",
  },
  farms: {
    title: "Farms",
    subtitle: "Farm records • polygons • verification",
    searchPlaceholder: "Search farms, owners, IDs…",
  },
  queue: {
    title: "QC Queue",
    subtitle: "Approvals • flags • validation",
    searchPlaceholder: "Search queue items, locations, IDs…",
  },
  activity: {
    title: "Activity",
    subtitle: "Audit trail • events • system pulse",
    searchPlaceholder: "Search events, users, actions…",
  },
  actions: {
    title: "Actions",
    subtitle: "Bulk operations • workflows",
    searchPlaceholder: "Search actions, jobs, tasks…",
  },
  overview: {
    title: "Insights",
    subtitle: "Analytics • trends • exports",
    searchPlaceholder: "Search states, LGAs, farms, IDs…",
  },
};

export function ControlPanelTopBar({
  range,
  onRangeChange,
  onExport,
  onLogout,
  onGoHome,
  onOpenSidebar,
  online = true,
  activeId = "insights",
}: {
  range: Range;
  onRangeChange: (v: Range) => void;
  onExport: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenSidebar?: () => void;
  online?: boolean;
  activeId?: string;
}) {
  const [q, setQ] = useState("");

  const meta = useMemo(() => PAGE_META[activeId ?? "insights"] ?? PAGE_META.insights, [activeId]);

  return (
    <header className="shrink-0">
      <div className="relative border-b border-zinc-200/70 bg-white/55 backdrop-blur supports-[backdrop-filter]:bg-white/45">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -right-24 -top-28 h-56 w-56 rounded-full bg-zinc-900/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,0.10),transparent_45%)]" />
        </div>

        <div className="relative px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenSidebar}
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/60 p-2.5 text-zinc-900 shadow-soft backdrop-blur transition",
                    "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
                    "lg:hidden"
                  )}
                  aria-label="Open sidebar"
                >
                  <IconMenu className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={onGoHome}
                  className={cn(
                    "group inline-flex items-center gap-3 rounded-2xl",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                  )}
                  aria-label="Go to home"
                >
                  <span className="relative inline-flex h-10 items-center">
                    <img
                      src={logo}
                      alt="Tawi"
                      className="h-10 w-auto object-contain"
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  </span>

                  <div className="leading-tight text-left">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold tracking-tight text-zinc-900">{meta.title}</div>
                      <span className="hidden sm:inline-flex rounded-full border border-zinc-200 bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 shadow-soft">
                        Secure
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600">{meta.subtitle}</div>
                  </div>
                </button>
              </div>

              <div className="hidden sm:block lg:hidden">
                <StatusPill online={online} />
              </div>
            </div>

            <div className="hidden lg:block lg:flex-1 lg:px-6">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <IconSearch className="h-4 w-4" />
                </div>

                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={meta.searchPlaceholder}
                  className={cn(
                    "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/55 pl-10 pr-16 text-sm text-zinc-900 shadow-soft backdrop-blur",
                    "placeholder:text-zinc-500",
                    "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                  )}
                />

                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <span className="inline-flex items-center rounded-xl border border-zinc-200 bg-white/60 px-2 py-1 text-[10px] font-semibold text-zinc-600">
                    ⌘K
                  </span>
                </div>

                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <div className="hidden lg:block">
                <StatusPill online={online} />
              </div>

              <PillTabs value={range} onChange={onRangeChange} options={["Today", "7d", "30d"] as const} />

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={onExport}
                  className={cn(
                    "group rounded-2xl border border-zinc-200/70 bg-white/60 text-zinc-900 shadow-soft backdrop-blur transition",
                    "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <IconDownload className="h-4 w-4 text-zinc-700 group-hover:text-zinc-900" />
                    Export
                  </span>
                </Button>

                <Button
                  onClick={onLogout}
                  className={cn(
                    "group rounded-2xl bg-emerald-600 text-white shadow-soft transition",
                    "hover:bg-emerald-500 hover:shadow-md",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <IconLogout className="h-4 w-4 text-white/90" />
                    Logout
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 lg:hidden">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <IconSearch className="h-4 w-4" />
              </div>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={meta.searchPlaceholder}
                className={cn(
                  "h-11 w-full rounded-2xl border border-zinc-200/70 bg-white/55 pl-10 pr-4 text-sm text-zinc-900 shadow-soft backdrop-blur",
                  "placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-300"
                )}
              />

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}