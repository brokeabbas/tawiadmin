import React, { useEffect, useId, useMemo, useState } from "react";
import { SectionCard } from "./controlPanelCards";

/**
 * Locations page v3:
 * - Table view (Approved vs Pending)
 * - Click row -> right sidebar opens with details + map + manager + agents + approvals/rejects + approval metadata
 * - Pending tab supports Approve / Reject
 * - No "Create location" button
 */

const MOCK_LOCATIONS = [
  {
    id: "loc_oyo_site3",
    name: "Oyo • Site 3",
    state: "Oyo",
    lga: "Ibadan North",
    code: "OYO-003",
    status: "approved", // approved | pending | rejected
    manager: { name: "Ayo Adeyemi", email: "ayo.adeyemi@ops.ng", phone: "+234 803 000 1122" },
    coordinates: { lat: 7.3775, lng: 3.9470 },
    agentsCount: 42,
    approvesCount: 318,
    rejectsCount: 21,
    syncPercent: 98,
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    approvedBy: "Admin (HQ)",
    notes: "Stable operations, low incident rate.",
  },
  {
    id: "loc_kwara_site1",
    name: "Kwara • Site 1",
    state: "Kwara",
    lga: "Ilorin West",
    code: "KWA-001",
    status: "approved",
    manager: { name: "Zainab Sanni", email: "zainab.sanni@ops.ng", phone: "+234 805 111 9001" },
    coordinates: { lat: 8.4799, lng: 4.5418 },
    agentsCount: 28,
    approvesCount: 151,
    rejectsCount: 14,
    syncPercent: 92,
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    approvedBy: "Admin (North Central)",
    notes: "Intermittent sensor drift flagged last week.",
  },
  {
    id: "loc_kaduna_site2",
    name: "Kaduna • Site 2",
    state: "Kaduna",
    lga: "Chikun",
    code: "KAD-002",
    status: "approved",
    manager: { name: "Musa Bello", email: "musa.bello@ops.ng", phone: "+234 809 222 7744" },
    coordinates: { lat: 10.5105, lng: 7.4165 },
    agentsCount: 35,
    approvesCount: 207,
    rejectsCount: 33,
    syncPercent: 76,
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
    approvedBy: "Admin (North West)",
    notes: "Low signal event yesterday; monitoring ongoing.",
  },
  // Pending
  {
    id: "loc_lagos_site7",
    name: "Lagos • Site 7",
    state: "Lagos",
    lga: "Ikeja",
    code: "LAG-007",
    status: "pending",
    manager: { name: "Tosin Okafor", email: "tosin.okafor@ops.ng", phone: "+234 802 555 0181" },
    coordinates: { lat: 6.6018, lng: 3.3515 },
    agentsCount: 0,
    approvesCount: 0,
    rejectsCount: 0,
    syncPercent: 0,
    lastSeenAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    approvedAt: null,
    approvedBy: null,
    notes: "New location request from regional lead.",
  },
  {
    id: "loc_enugu_site2",
    name: "Enugu • Site 2",
    state: "Enugu",
    lga: "Enugu North",
    code: "ENU-002",
    status: "pending",
    manager: { name: "Chidera Nwosu", email: "chidera.nwosu@ops.ng", phone: "+234 806 991 2200" },
    coordinates: { lat: 6.4584, lng: 7.5464 },
    agentsCount: 0,
    approvesCount: 0,
    rejectsCount: 0,
    syncPercent: 0,
    lastSeenAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    approvedAt: null,
    approvedBy: null,
    notes: "Awaiting verification documents.",
  },
];

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatRelative(iso) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  const delta = Date.now() - t;
  const s = Math.max(0, Math.floor(delta / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    // Safari fallback
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    setMatches(mql.matches);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, [query]);

  return matches;
}

function Tabs({ value, onChange, items }) {
  return (
    <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
              active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles =
    status === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800";

  const label = status === "approved" ? "Approved" : status === "pending" ? "Pending" : "Rejected";

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", styles)}>
      {label}
    </span>
  );
}

function SyncPill({ syncPercent }) {
  const val = typeof syncPercent === "number" ? syncPercent : 0;
  const styles =
    val >= 95
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : val >= 85
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : val > 0
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", styles)}>
      {val > 0 ? `${val}%` : "—"}
    </span>
  );
}

function Drawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-zinc-950/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[min(520px,92vw)]">
        <div className="h-full rounded-l-3xl border-l border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">{title}</p>
              <p className="mt-0.5 text-xs text-zinc-600">Location details</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Close
            </button>
          </div>
          <div className="h-[calc(100%-60px)] overflow-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
      <p className="text-xs font-semibold text-zinc-600">{label}</p>
      <p className="text-xs text-zinc-900 text-right">{value ?? "—"}</p>
    </div>
  );
}

function OSMEmbed({ lat, lng, height = 220 }) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return (
      <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-xs text-zinc-600">No coordinates available for map preview.</p>
      </div>
    );
  }

  const pad = 0.03; // bbox padding in degrees
  const left = lng - pad;
  const right = lng + pad;
  const top = lat + pad;
  const bottom = lat - pad;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    `${left},${bottom},${right},${top}`
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <iframe
        title="Location map"
        src={src}
        style={{ width: "100%", height }}
        className="block"
        loading="lazy"
      />
      <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2">
        <p className="text-[11px] font-semibold text-zinc-600">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <a
          className="text-[11px] font-semibold text-zinc-900 hover:underline"
          target="_blank"
          rel="noreferrer"
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`}
        >
          Open map →
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function ActionsBar({ location, onApprove, onReject }) {
  if (!location) return null;
  if (location.status !== "pending") return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onApprove(location.id)}
        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
      >
        Approve
      </button>
      <button
        onClick={() => onReject(location.id)}
        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100"
      >
        Reject
      </button>
    </div>
  );
}

function LocationDetailsPanel({ location, onApprove, onReject }) {
  if (!location) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/60 p-6">
        <p className="text-sm font-semibold text-zinc-900">Select a location</p>
        <p className="mt-1 text-xs text-zinc-600">Click a row in the table to view details here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">{location.name}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {location.code} • {location.state}
            {location.lga ? ` • ${location.lga}` : ""}
          </p>
        </div>
        <StatusBadge status={location.status} />
      </div>

      <ActionsBar location={location} onApprove={onApprove} onReject={onReject} />

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Agents" value={location.agentsCount ?? 0} />
        <StatCard label="Approves" value={location.approvesCount ?? 0} />
        <StatCard label="Rejects" value={location.rejectsCount ?? 0} />
      </div>

      <OSMEmbed lat={location.coordinates?.lat} lng={location.coordinates?.lng} />

      <div className="grid gap-2">
        <DetailRow label="Location manager" value={location.manager?.name ?? "—"} />
        <DetailRow label="Manager email" value={location.manager?.email ?? "—"} />
        <DetailRow label="Manager phone" value={location.manager?.phone ?? "—"} />
        <DetailRow label="State" value={location.state ?? "—"} />
        <DetailRow label="LGA" value={location.lga ?? "—"} />
        <DetailRow label="Sync" value={location.status === "approved" ? `${location.syncPercent}%` : "—"} />
        <DetailRow
          label="Last seen"
          value={location.status === "approved" ? `${formatRelative(location.lastSeenAt)} (${formatDateTime(location.lastSeenAt)})` : "—"}
        />
        <DetailRow label="Created" value={formatDateTime(location.createdAt)} />
        <DetailRow
          label="Approved"
          value={
            location.status === "approved"
              ? `${formatDateTime(location.approvedAt)}${location.approvedBy ? ` • by ${location.approvedBy}` : ""}`
              : "—"
          }
        />
        <DetailRow label="Notes" value={location.notes ?? "—"} />
      </div>
    </div>
  );
}

export default function ControlPanelLocationsPanel() {
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [view, setView] = useState("approved"); // approved | pending
  const [locations, setLocations] = useState(MOCK_LOCATIONS);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");

  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const states = useMemo(() => {
    const uniq = Array.from(new Set(locations.map((l) => l.state))).sort();
    return ["All", ...uniq];
  }, [locations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return locations
      .filter((l) => (view === "approved" ? l.status === "approved" : l.status === "pending"))
      .filter((l) => (stateFilter === "All" ? true : l.state === stateFilter))
      .filter((l) => {
        if (!q) return true;
        const hay = `${l.name} ${l.code} ${l.state} ${l.lga ?? ""} ${l.manager?.name ?? ""} ${l.manager?.email ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        // approved: show lower sync first; pending: newest first
        if (view === "approved") return (a.syncPercent ?? 0) - (b.syncPercent ?? 0);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [locations, view, search, stateFilter]);

  const selected = useMemo(() => locations.find((l) => l.id === selectedId) ?? null, [locations, selectedId]);

  const metrics = useMemo(() => {
    const approvedCount = locations.filter((l) => l.status === "approved").length;
    const pendingCount = locations.filter((l) => l.status === "pending").length;
    const avgSyncApproved = (() => {
      const approved = locations.filter((l) => l.status === "approved");
      if (approved.length === 0) return 0;
      return Math.round(approved.reduce((s, l) => s + (l.syncPercent ?? 0), 0) / approved.length);
    })();
    return { approvedCount, pendingCount, avgSyncApproved };
  }, [locations]);

  // Keep selection valid when switching views/filters
  useEffect(() => {
    // if selected not in filtered list, pick first
    const inFiltered = filtered.some((l) => l.id === selectedId);
    if (!inFiltered) setSelectedId(filtered[0]?.id ?? null);
  }, [filtered, selectedId]);

  function openDetails(id) {
    setSelectedId(id);
    if (!isLg) setDrawerOpen(true);
  }

  function approveLocation(id) {
    const now = new Date().toISOString();
    setLocations((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "approved",
              approvedAt: now,
              approvedBy: "You",
              // After approval, you can set baseline operational metrics
              syncPercent: l.syncPercent && l.syncPercent > 0 ? l.syncPercent : 100,
              lastSeenAt: l.lastSeenAt ?? now,
            }
          : l
      )
    );
    // if currently in pending view, selection may disappear
    if (view === "pending") {
      // close drawer on mobile to avoid showing a row that no longer exists in pending
      if (!isLg) setDrawerOpen(false);
    }
  }

  function rejectLocation(id) {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, status: "rejected" } : l)));
    if (view === "pending") {
      if (!isLg) setDrawerOpen(false);
    }
  }

  return (
    <SectionCard title="Locations">
      <div className="grid gap-4">
        {/* Header Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Tabs
              value={view}
              onChange={setView}
              items={[
                { value: "approved", label: `Approved (${metrics.approvedCount})` },
                { value: "pending", label: `Pending (${metrics.pendingCount})` },
              ]}
            />
            <span className="hidden sm:inline-flex rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700">
              Avg sync (approved): <span className="ml-1 font-semibold text-zinc-900">{metrics.avgSyncApproved}%</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location, code, manager…"
              className="w-full sm:w-72 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All states" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Layout: Table + Right Sidebar */}
        <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
          {/* Table */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/60">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full border-collapse">
                <thead className="bg-white">
                  <tr className="border-b border-zinc-100">
                    <Th>Location</Th>
                    <Th>State</Th>
                    <Th>Manager</Th>
                    <Th className="text-right">Agents</Th>
                    <Th className="text-right">Approves / Rejects</Th>
                    <Th>Sync</Th>
                    <Th>Last seen</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6">
                        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-center">
                          <p className="text-sm font-semibold text-zinc-900">No locations found</p>
                          <p className="mt-1 text-xs text-zinc-600">Try adjusting search or filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((l) => {
                      const active = l.id === selectedId;
                      return (
                        <tr
                          key={l.id}
                          className={cn(
                            "border-b border-zinc-100 transition",
                            active ? "bg-zinc-900/[0.03]" : "hover:bg-white"
                          )}
                        >
                          <Td>
                            <button
                              onClick={() => openDetails(l.id)}
                              className="group flex w-full items-center gap-3 text-left"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-zinc-900 group-hover:underline">
                                  {l.name}
                                </p>
                                <p className="mt-1 text-xs text-zinc-600">{l.code}</p>
                              </div>
                            </button>
                          </Td>

                          <Td>
                            <p className="text-sm font-semibold text-zinc-900">{l.state}</p>
                            <p className="mt-1 text-xs text-zinc-600">{l.lga ?? "—"}</p>
                          </Td>

                          <Td>
                            <p className="text-sm font-semibold text-zinc-900">{l.manager?.name ?? "—"}</p>
                            <p className="mt-1 text-xs text-zinc-600">{l.manager?.email ?? "—"}</p>
                          </Td>

                          <Td className="text-right">
                            <span className="text-sm font-semibold text-zinc-900">
                              {view === "approved" ? (l.agentsCount ?? 0) : "—"}
                            </span>
                          </Td>

                          <Td className="text-right">
                            <span className="text-sm font-semibold text-zinc-900">
                              {view === "approved" ? `${l.approvesCount ?? 0} / ${l.rejectsCount ?? 0}` : "—"}
                            </span>
                          </Td>

                          <Td>
                            <SyncPill syncPercent={view === "approved" ? l.syncPercent : 0} />
                          </Td>

                          <Td>
                            <p className="text-sm font-semibold text-zinc-900">
                              {view === "approved" ? formatRelative(l.lastSeenAt) : "—"}
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                              {view === "approved" ? formatDateTime(l.lastSeenAt) : formatRelative(l.createdAt)}
                            </p>
                          </Td>

                          <Td>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={l.status} />
                              {view === "pending" ? (
                                <div className="ml-auto flex items-center gap-2">
                                  <button
                                    onClick={() => approveLocation(l.id)}
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => rejectLocation(l.id)}
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </Td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 bg-white px-4 py-3">
              <p className="text-xs text-zinc-600">
                Showing <span className="font-semibold text-zinc-900">{filtered.length}</span>{" "}
                {view === "approved" ? "approved" : "pending"} locations
              </p>
              <p className="text-xs text-zinc-500">
                Tip: click a row to open full details {isLg ? "on the right" : "in the sidebar"}.
              </p>
            </div>
          </div>

          {/* Right Sidebar (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-4 rounded-3xl border border-zinc-200 bg-white/60 p-5">
              <LocationDetailsPanel
                location={selected && (view === "approved" ? selected.status === "approved" : selected.status === "pending") ? selected : null}
                onApprove={approveLocation}
                onReject={rejectLocation}
              />
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={selected?.name ?? "Location details"}
        >
          <LocationDetailsPanel
            location={selected}
            onApprove={approveLocation}
            onReject={rejectLocation}
          />
        </Drawer>
      </div>
    </SectionCard>
  );
}

function Th({ children, className }) {
  return (
    <th className={cn("px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500", className)}>
      {children}
    </th>
  );
}

function Td({ children, className }) {
  return <td className={cn("px-4 py-4 align-top", className)}>{children}</td>;
}