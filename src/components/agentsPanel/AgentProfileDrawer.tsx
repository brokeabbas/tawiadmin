import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, cn } from "../reusable/atoms";
import type { Agent } from "./types";
import { formatNumber, initials, statusPill } from "./utils";

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconExternal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14 5h5v5M10 14l9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatRow({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: string;
  tone?: "zinc" | "emerald" | "rose" | "amber" | "sky";
}) {
  const toneMap: Record<string, string> = {
    zinc: "border-zinc-200 bg-white/60 text-zinc-800",
    emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-800",
    rose: "border-rose-200 bg-rose-50/70 text-rose-700",
    amber: "border-amber-200 bg-amber-50/70 text-amber-800",
    sky: "border-sky-200 bg-sky-50/70 text-sky-800",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-zinc-600">{label}</span>
      <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", toneMap[tone])}>{value}</span>
    </div>
  );
}

/**
 * If you later extend Agent with:
 *  - photoUrl?: string
 *  - lat?: number
 *  - lng?: number
 * this drawer will automatically use them.
 */
type AgentWithExtras = Agent & {
  photoUrl?: string;
  lat?: number;
  lng?: number;
};

type Coords = { lat: number; lng: number; accuracy: "Exact" | "Estimated"; label: string };

function hashToUnit(seed: string) {
  // deterministic 0..1 value
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // >>> 0 => unsigned
  return ((h >>> 0) % 10000) / 10000;
}

function getNigeriaStateCenter(state: string): { lat: number; lng: number } {
  // Approximate state/capital coordinates (good enough for UI preview).
  // Fallback: Abuja.
  const s = state.trim().toLowerCase();

  const table: Record<string, { lat: number; lng: number }> = {
    abia: { lat: 5.532, lng: 7.486 },
    adamawa: { lat: 9.203, lng: 12.495 },
    "akwa ibom": { lat: 5.039, lng: 7.922 },
    anambra: { lat: 6.149, lng: 6.785 },
    bauchi: { lat: 10.315, lng: 9.844 },
    bayelsa: { lat: 4.925, lng: 6.264 },
    benue: { lat: 7.732, lng: 8.539 },
    borno: { lat: 11.846, lng: 13.157 },
    "cross river": { lat: 4.952, lng: 8.322 },
    delta: { lat: 5.516, lng: 5.750 },
    ebonyi: { lat: 6.323, lng: 8.113 },
    edo: { lat: 6.338, lng: 5.625 },
    ekiti: { lat: 7.616, lng: 5.220 },
    enugu: { lat: 6.458, lng: 7.546 },
    gombe: { lat: 10.287, lng: 11.171 },
    imo: { lat: 5.485, lng: 7.035 },
    jigawa: { lat: 12.228, lng: 9.561 },
    kaduna: { lat: 10.523, lng: 7.438 },
    kano: { lat: 12.002, lng: 8.592 },
    katsina: { lat: 12.992, lng: 7.601 },
    kebbi: { lat: 12.453, lng: 4.199 },
    kogi: { lat: 7.802, lng: 6.733 },
    kwara: { lat: 8.496, lng: 4.542 },
    lagos: { lat: 6.524, lng: 3.379 },
    nasarawa: { lat: 8.491, lng: 8.515 },
    niger: { lat: 9.615, lng: 6.556 },
    ogun: { lat: 7.147, lng: 3.361 },
    ondo: { lat: 7.257, lng: 5.205 },
    osun: { lat: 7.772, lng: 4.561 },
    oyo: { lat: 7.377, lng: 3.947 },
    plateau: { lat: 9.896, lng: 8.859 },
    rivers: { lat: 4.815, lng: 7.050 },
    sokoto: { lat: 13.060, lng: 5.240 },
    taraba: { lat: 8.893, lng: 11.365 },
    yobe: { lat: 11.746, lng: 11.966 },
    zamfara: { lat: 12.170, lng: 6.664 },
    "fct": { lat: 9.076, lng: 7.398 },
    "abuja": { lat: 9.076, lng: 7.398 },
  };

  return table[s] ?? { lat: 9.076, lng: 7.398 };
}

function buildCoords(agent: AgentWithExtras): Coords {
  // Prefer exact coords if supplied later by API
  if (typeof agent.lat === "number" && typeof agent.lng === "number") {
    return {
      lat: agent.lat,
      lng: agent.lng,
      accuracy: "Exact",
      label: `${agent.lga}, ${agent.state}`,
    };
  }

  // Otherwise estimate from state + deterministic jitter based on agent.id
  const center = getNigeriaStateCenter(agent.state);
  const u1 = hashToUnit(agent.id + "::lat");
  const u2 = hashToUnit(agent.id + "::lng");

  // jitter within ~10–25km range depending on latitude; purely UI-level
  const latJitter = (u1 - 0.5) * 0.25; // ~ +/- 0.125 deg
  const lngJitter = (u2 - 0.5) * 0.25;

  return {
    lat: center.lat + latJitter,
    lng: center.lng + lngJitter,
    accuracy: "Estimated",
    label: `${agent.lga}, ${agent.state}`,
  };
}

function buildOsmEmbed({ lat, lng }: { lat: number; lng: number }) {
  const d = 0.12; // bbox span
  const minLon = (lng - d).toFixed(6);
  const minLat = (lat - d).toFixed(6);
  const maxLon = (lng + d).toFixed(6);
  const maxLat = (lat + d).toFixed(6);

  const markerLat = lat.toFixed(6);
  const markerLng = lng.toFixed(6);

  const src =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}` +
    `&layer=mapnik&marker=${markerLat}%2C${markerLng}`;

  const open =
    `https://www.openstreetmap.org/?mlat=${markerLat}&mlon=${markerLng}` +
    `#map=12/${markerLat}/${markerLng}`;

  return { src, open };
}

function avatarUrlFor(agent: AgentWithExtras) {
  if (agent.photoUrl) return agent.photoUrl;
  // crisp, professional “initials avatar” fallback that looks like a headshot placeholder
  const seed = encodeURIComponent(agent.name || agent.id);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundType=gradientLinear&fontFamily=Verdana&radius=16`;
}

export function AgentProfileDrawer({
  agent,
  open,
  onClose,
}: {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}) {
  const DURATION = 260; // ms (keep in sync with tailwind durations)
  const a = agent as AgentWithExtras | null;

  const [render, setRender] = useState(open);
  const [show, setShow] = useState(open);

  const lastFocusRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [imgOk, setImgOk] = useState(true);

  // mount/unmount for smooth exit animation
  useEffect(() => {
    if (open) {
      setRender(true);
      setImgOk(true);
      lastFocusRef.current = (document.activeElement as HTMLElement) ?? null;

      // next frame => animate in
      requestAnimationFrame(() => setShow(true));

      // move focus inside panel (basic accessibility)
      requestAnimationFrame(() => panelRef.current?.focus());
      return;
    }

    // animate out
    setShow(false);
    const t = window.setTimeout(() => setRender(false), DURATION);
    // restore focus
    window.setTimeout(() => lastFocusRef.current?.focus?.(), DURATION);

    return () => window.clearTimeout(t);
  }, [open]);

  // ESC to close (only while mounted)
  useEffect(() => {
    if (!render) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [render, onClose]);

  const coords = useMemo(() => (a ? buildCoords(a) : null), [a?.id, a?.state, a?.lga, a?.lat, a?.lng]);
  const map = useMemo(() => (coords ? buildOsmEmbed(coords) : null), [coords?.lat, coords?.lng]);

  if (!render || !a) return null;

  const st = statusPill(a.status);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-zinc-950/25 backdrop-blur-sm",
          "transition-opacity duration-300",
          show ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-label="Close agent drawer"
      />

      {/* Panel */}
      <aside
        className={cn(
          // full-screen on mobile; floating top-right on desktop
          "absolute right-0 top-0 h-full w-full",
          "sm:top-4 sm:right-4 sm:h-[calc(100%-2rem)] sm:w-[560px] sm:max-w-[calc(100%-2rem)]",
          "rounded-none sm:rounded-3xl",
          "border-l sm:border border-zinc-200/70",
          "bg-white/80 backdrop-blur-xl",
          "shadow-[0_20px_90px_rgba(0,0,0,0.28)]",
          // animation
          "transform-gpu transition-transform duration-300 ease-out",
          show ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Agent details"
        tabIndex={-1}
        ref={panelRef as any}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="relative border-b border-zinc-200/70 p-4">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -right-24 -top-28 h-56 w-56 rounded-full bg-zinc-900/5 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,0.12),transparent_50%)]" />
            </div>

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Headshot */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 shadow-soft">
                  {imgOk ? (
                    <img
                      src={avatarUrlFor(a)}
                      alt={a.name}
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                      onError={() => setImgOk(false)}
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-zinc-900">
                      {initials(a.name)}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-zinc-900/5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">{a.name}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-600">
                    {a.id} • {a.phone}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold", st.chip)}>
                      <span className={cn("h-2 w-2 rounded-full", st.dot)} />
                      {a.status}
                    </span>

                    {coords ? (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
                          coords.accuracy === "Exact"
                            ? "border-sky-200/70 bg-sky-50/70 text-sky-800"
                            : "border-amber-200/70 bg-amber-50/70 text-amber-800"
                        )}
                        title={coords.accuracy === "Exact" ? "GPS / exact coordinates" : "Estimated from state (UI placeholder)"}
                      >
                        {coords.accuracy === "Exact" ? "Exact location" : "Estimated location"}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={onClose}
                className={cn(
                  "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft",
                  "hover:bg-white transition"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <IconX className="h-4 w-4" />
                  Close
                </span>
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid gap-4">
              {/* Location */}
              <div className="rounded-3xl border border-zinc-200/70 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">Location</p>
                    <p className="mt-1 text-xs text-zinc-600">Map preview + region metadata</p>
                  </div>

                  {map ? (
                    <a
                      href={map.open}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/70 px-3 py-2 text-xs font-semibold text-zinc-800 shadow-soft",
                        "hover:bg-white transition",
                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                      )}
                    >
                      <IconExternal className="h-4 w-4" />
                      Open map
                    </a>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <StatRow label="State" value={a.state} />
                    <StatRow label="LGA" value={a.lga} />
                  </div>

                  {coords ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <StatRow label="Latitude" value={coords.lat.toFixed(5)} tone="sky" />
                      <StatRow label="Longitude" value={coords.lng.toFixed(5)} tone="sky" />
                    </div>
                  ) : null}

                  <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70">
                    {map ? (
                      <iframe
                        title={`Map: ${coords?.label ?? "Agent location"}`}
                        src={map.src}
                        className="h-56 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center">
                        <p className="text-xs font-semibold text-zinc-600">Map unavailable</p>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] font-semibold text-zinc-500">
                    {coords?.accuracy === "Exact"
                      ? "This location is based on coordinates provided by the agent record."
                      : "This location is a UI estimate derived from state-level coordinates. Wire real lat/lng from your API for accuracy."}
                  </p>
                </div>
              </div>

              {/* Readiness */}
              <div className="rounded-3xl border border-zinc-200/70 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5">
                <p className="text-sm font-semibold text-zinc-900">Assignment readiness</p>
                <p className="mt-1 text-xs text-zinc-600">Activity + capacity signals</p>

                <div className="mt-4 grid gap-3">
                  <StatRow label="Last active" value={a.lastActive} />
                  <StatRow label="Assigned jobs" value={formatNumber(a.assignedJobs)} tone="emerald" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => alert(`Hook: assign job to ${a.id}`)}
                    className={cn("rounded-2xl bg-emerald-600 text-white shadow-soft transition", "hover:bg-emerald-500 hover:shadow-md")}
                  >
                    Assign job
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => alert(`Hook: message agent ${a.id}`)}
                    className={cn(
                      "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft backdrop-blur",
                      "hover:bg-white transition"
                    )}
                  >
                    Message
                  </Button>
                </div>
              </div>

              {/* QC */}
              <div className="rounded-3xl border border-zinc-200/70 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5">
                <p className="text-sm font-semibold text-zinc-900">Quality control</p>
                <p className="mt-1 text-xs text-zinc-600">Approvals, rejections, and flagged items</p>

                <div className="mt-4 grid gap-3">
                  <StatRow label="Approvals" value={formatNumber(a.approvals)} tone="emerald" />
                  <StatRow label="Rejections" value={formatNumber(a.rejections)} tone="rose" />
                  <StatRow label="Flagged" value={formatNumber(a.flagged)} tone={a.flagged ? "amber" : "zinc"} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button
                    onClick={() => alert(`Hook: open QC history for ${a.id}`)}
                    className={cn("rounded-2xl bg-emerald-600 text-white shadow-soft transition", "hover:bg-emerald-500 hover:shadow-md")}
                  >
                    View QC history
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => alert(`Hook: view assignments for ${a.id}`)}
                    className={cn(
                      "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft backdrop-blur",
                      "hover:bg-white transition"
                    )}
                  >
                    View assignments
                  </Button>
                </div>
              </div>

              {/* Admin */}
              <div className="rounded-3xl border border-zinc-200/70 bg-white/60 p-4 shadow-soft ring-1 ring-inset ring-zinc-900/5">
                <p className="text-sm font-semibold text-zinc-900">Admin actions</p>
                <p className="mt-1 text-xs text-zinc-600">UI hooks; wire to API later</p>

                <div className="mt-4 grid gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => alert(`Hook: suspend agent ${a.id}`)}
                    className={cn(
                      "rounded-2xl border border-rose-200/70 bg-rose-50/70 text-rose-700 shadow-soft",
                      "hover:bg-rose-50 transition"
                    )}
                  >
                    Suspend agent
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => alert(`Hook: reset agent credentials ${a.id}`)}
                    className={cn(
                      "rounded-2xl border border-zinc-200/70 bg-white/70 text-zinc-900 shadow-soft",
                      "hover:bg-white transition"
                    )}
                  >
                    Reset credentials
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-200/70 bg-white/60 p-4">
            <p className="text-[11px] font-semibold text-zinc-500">
              Tip: press{" "}
              <span className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-zinc-700">Esc</span> to close
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}