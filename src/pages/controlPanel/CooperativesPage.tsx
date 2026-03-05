// tawiadmin/src/pages/controlPanel/CooperativesPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

type CoopStatus = "Active" | "Pending" | "Suspended";

type Cooperative = {
  id: string;
  name: string;
  state?: string;
  lga?: string;
  members: number;
  farms: number;
  status: CoopStatus;
  contactName?: string;
  phone?: string;
  updatedAt: string; // ISO
  coverageSummary?: string; // derived from map selection
};

type WardPoint = { name: string; latitude: number; longitude: number };
type LgaNode = { name: string; wards: WardPoint[] };
type StateNode = { state: string; lgas: LgaNode[] };

type SelectMode = "LGAs" | "Wards";
type DataMode = "demo" | "live";

function uid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis as any;
  if (c.crypto?.randomUUID) return c.crypto.randomUUID();
  return `coop_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

// Deterministic small hash for stable "member/farm estimates"
function hash32(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function estimateMembers(key: string) {
  const h = hash32(key);
  // 25..220
  return 25 + (h % 196);
}

function estimateFarms(key: string) {
  const h = hash32(key + "|farms");
  // 6..55
  return 6 + (h % 50);
}

/**
 * =========================
 * Demo (no external files)
 * =========================
 * We build:
 *  - Demo state polygons as rectangles (GeoJSON)
 *  - Demo hierarchy (state -> LGAs -> wards) with deterministic jitter points
 */
type DemoLgaSpec = { name: string; center: [lat: number, lng: number]; wardCount: number };
type DemoStateSpec = { state: string; bbox: [minLng: number, minLat: number, maxLng: number, maxLat: number]; lgas: DemoLgaSpec[] };

const DEMO_SPECS: DemoStateSpec[] = [
  {
    state: "Oyo",
    // roughly southwestern NG
    bbox: [2.8, 7.0, 4.6, 8.8],
    lgas: [
      { name: "Ibadan North", center: [7.41, 3.91], wardCount: 11 },
      { name: "Akinyele", center: [7.52, 3.96], wardCount: 10 },
      { name: "Ogbomosho North", center: [8.13, 4.25], wardCount: 10 },
    ],
  },
  {
    state: "Rivers",
    bbox: [6.7, 4.3, 7.4, 5.3],
    lgas: [
      { name: "Obio-Akpor", center: [4.86, 7.03], wardCount: 12 },
      { name: "Port Harcourt", center: [4.78, 7.01], wardCount: 12 },
      { name: "Eleme", center: [4.80, 7.14], wardCount: 10 },
    ],
  },
  {
    state: "Kaduna",
    bbox: [6.0, 9.0, 8.9, 11.8],
    lgas: [
      { name: "Chikun", center: [10.47, 7.42], wardCount: 12 },
      { name: "Igabi", center: [10.72, 7.50], wardCount: 11 },
      { name: "Zaria", center: [11.08, 7.70], wardCount: 12 },
    ],
  },
  {
    state: "Plateau",
    bbox: [8.3, 8.4, 9.7, 10.2],
    lgas: [
      { name: "Jos North", center: [9.92, 8.90], wardCount: 10 },
      { name: "Jos South", center: [9.83, 8.86], wardCount: 10 },
      { name: "Barkin Ladi", center: [9.55, 8.92], wardCount: 9 },
    ],
  },
  {
    state: "Lagos",
    bbox: [3.1, 6.3, 3.8, 6.8],
    lgas: [
      { name: "Ikeja", center: [6.60, 3.34], wardCount: 10 },
      { name: "Alimosho", center: [6.61, 3.27], wardCount: 12 },
      { name: "Eti-Osa", center: [6.46, 3.55], wardCount: 10 },
    ],
  },
];

function prng01(seed: string) {
  // deterministic pseudo-random [0,1)
  const h = hash32(seed);
  return (h % 1_000_000) / 1_000_000;
}

function makeDemoWards(state: string, lga: string, center: [number, number], count: number): WardPoint[] {
  const [lat0, lng0] = center;
  const wards: WardPoint[] = [];
  // spread points in a small radius around center
  for (let i = 0; i < count; i++) {
    const a = prng01(`${state}|${lga}|a|${i}`) * Math.PI * 2;
    const r = 0.02 + prng01(`${state}|${lga}|r|${i}`) * 0.05; // degrees-ish
    const lat = lat0 + Math.cos(a) * r;
    const lng = lng0 + Math.sin(a) * r;
    wards.push({
      name: `Ward ${String(i + 1).padStart(2, "0")}`,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    });
  }
  return wards;
}

function buildDemoHierarchy(): StateNode[] {
  return DEMO_SPECS.map((s) => ({
    state: s.state,
    lgas: s.lgas.map((l) => ({
      name: l.name,
      wards: makeDemoWards(s.state, l.name, l.center, l.wardCount),
    })),
  }));
}

function bboxToFeature(stateName: string, bbox: [number, number, number, number]) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  // GeoJSON polygon coordinates are [lng, lat]
  const coords = [
    [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat],
    ],
  ];
  return {
    type: "Feature",
    properties: { shapeName: stateName },
    geometry: { type: "Polygon", coordinates: coords },
  };
}

function buildDemoStatesGeo() {
  return {
    type: "FeatureCollection",
    features: DEMO_SPECS.map((s) => bboxToFeature(s.state, s.bbox)),
  };
}

const DEMO_HIERARCHY: StateNode[] = buildDemoHierarchy();
const DEMO_STATES_GEO: any = buildDemoStatesGeo();

function StatusPill({ status }: { status: CoopStatus }) {
  const cls =
    status === "Active"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "Pending"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-soft backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
      {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [18, 18] });
  }, [bounds, map]);
  return null;
}

export default function CooperativesPage() {
  const [q, setQ] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  // data mode: demo (no external files) vs live (your previous fetch)
  const [dataMode, setDataMode] = useState<DataMode>("demo");

  // Map + selection
  const [mode, setMode] = useState<SelectMode>("LGAs");
  const [mapErr, setMapErr] = useState<string | null>(null);
  const [statesGeo, setStatesGeo] = useState<any | null>(null);
  const [ngHierarchy, setNgHierarchy] = useState<StateNode[] | null>(null);

  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLgas, setSelectedLgas] = useState<Set<string>>(new Set());
  const [selectedWards, setSelectedWards] = useState<Set<string>>(new Set()); // `${lga}||${ward}`

  const [lgaQuery, setLgaQuery] = useState("");
  const [wardQuery, setWardQuery] = useState("");

  const [openCreateFromSelection, setOpenCreateFromSelection] = useState(false);

  const [coops, setCoops] = useState<Cooperative[]>(() => [
    {
      id: uid(),
      name: "GreenHarvest Cooperative",
      state: "Oyo",
      lga: "Ibadan North",
      members: 128,
      farms: 312,
      status: "Active",
      contactName: "A. Ibrahim",
      phone: "+234 801 234 5678",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      coverageSummary: "Oyo • Ibadan North",
    },
    {
      id: uid(),
      name: "Riverlands Farmers Union",
      state: "Rivers",
      lga: "Obio-Akpor",
      members: 76,
      farms: 141,
      status: "Pending",
      contactName: "M. Okoro",
      phone: "+234 802 555 1212",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
      coverageSummary: "Rivers • Obio-Akpor",
    },
    {
      id: uid(),
      name: "Savannah Growers Cooperative",
      state: "Kaduna",
      lga: "Chikun",
      members: 210,
      farms: 530,
      status: "Active",
      contactName: "S. Bello",
      phone: "+234 803 987 1111",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      coverageSummary: "Kaduna • Chikun",
    },
    {
      id: uid(),
      name: "Highland Produce Group",
      state: "Plateau",
      lga: "Jos South",
      members: 44,
      farms: 88,
      status: "Suspended",
      contactName: "E. Danladi",
      phone: "+234 805 000 9090",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      coverageSummary: "Plateau • Jos South",
    },
  ]);

  // Load map data (demo or live)
  useEffect(() => {
    const ac = new AbortController();

    async function fetchJson(url: string) {
      const res = await fetch(url, { signal: ac.signal });
      if (!res.ok) throw new Error(`Failed ${res.status} for ${url}`);
      const text = await res.text();
      if (text.startsWith("version https://git-lfs.github.com/spec/v1")) {
        throw new Error("GeoJSON link returned Git-LFS pointer, not data.");
      }
      return JSON.parse(text);
    }

    async function loadLive() {
      try {
        setMapErr(null);

        const meta = await fetchJson("https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM1/");
        const tryUrls: string[] = [meta.simplifiedGeometryGeoJSON, meta.gjDownloadURL, meta.tjDownloadURL].filter(Boolean);

        let geo: any | null = null;
        let lastErr: any = null;

        for (const u of tryUrls) {
          try {
            if (!String(u).includes(".geojson")) continue;
            geo = await fetchJson(u);
            break;
          } catch (e) {
            lastErr = e;
          }
        }

        if (!geo) throw lastErr ?? new Error("Unable to load Nigeria ADM1 boundaries.");

        const hierarchy = await fetchJson(
          "https://raw.githubusercontent.com/temikeezy/nigeria-geojson-data/main/data/full.json"
        );

        setStatesGeo(geo);
        setNgHierarchy(hierarchy);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setMapErr(e?.message ?? "Failed to load live map data.");
        // fallback to demo so the page still works
        setStatesGeo(DEMO_STATES_GEO);
        setNgHierarchy(DEMO_HIERARCHY);
      }
    }

    if (dataMode === "demo") {
      setMapErr(null);
      setStatesGeo(DEMO_STATES_GEO);
      setNgHierarchy(DEMO_HIERARCHY);
    } else {
      loadLive();
    }

    return () => ac.abort();
  }, [dataMode]);

  // Reset lower selections when state changes
  useEffect(() => {
    setSelectedLgas(new Set());
    setSelectedWards(new Set());
    setMode("LGAs");
    setLgaQuery("");
    setWardQuery("");
  }, [selectedState]);

  const stateNode = useMemo(() => {
    if (!ngHierarchy || !selectedState) return null;
    return ngHierarchy.find((s) => s.state.toLowerCase() === selectedState.toLowerCase()) ?? null;
  }, [ngHierarchy, selectedState]);

  const filteredCoops = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return coops;
    return coops.filter((c) => {
      const hay = `${c.name} ${c.state ?? ""} ${c.lga ?? ""} ${c.status} ${c.coverageSummary ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [coops, q]);

  const stats = useMemo(() => {
    const total = coops.length;
    const members = coops.reduce((sum, c) => sum + c.members, 0);
    const farms = coops.reduce((sum, c) => sum + c.farms, 0);
    const pending = coops.filter((c) => c.status === "Pending").length;
    return { total, members, farms, pending };
  }, [coops]);

  function exportCSV() {
    const headers = ["Name", "Coverage", "Members", "Farms", "Status", "Updated"];
    const rows = coops.map((c) => [
      c.name,
      c.coverageSummary ?? `${c.state ?? ""}${c.lga ? ` • ${c.lga}` : ""}`.trim(),
      String(c.members),
      String(c.farms),
      c.status,
      fmtDate(c.updatedAt),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cooperatives_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Build LGA centroids (from ward points) for selected state
  const lgaCentroids = useMemo(() => {
    if (!stateNode) return [];
    return stateNode.lgas
      .map((lga) => {
        if (!lga.wards.length) return null;
        let lat = 0;
        let lng = 0;
        for (const w of lga.wards) {
          lat += w.latitude;
          lng += w.longitude;
        }
        lat /= lga.wards.length;
        lng /= lga.wards.length;
        return { lgaName: lga.name, lat, lng, wards: lga.wards };
      })
      .filter(Boolean) as { lgaName: string; lat: number; lng: number; wards: WardPoint[] }[];
  }, [stateNode]);

  const filteredLgas = useMemo(() => {
    const needle = lgaQuery.trim().toLowerCase();
    if (!needle) return lgaCentroids;
    return lgaCentroids.filter((x) => x.lgaName.toLowerCase().includes(needle));
  }, [lgaCentroids, lgaQuery]);

  const wardsInSelectedLgas = useMemo(() => {
    if (!stateNode) return [];
    const sel = selectedLgas;
    const all: { lgaName: string; ward: WardPoint }[] = [];
    for (const lga of stateNode.lgas) {
      if (!sel.has(lga.name)) continue;
      for (const w of lga.wards) all.push({ lgaName: lga.name, ward: w });
    }
    return all;
  }, [stateNode, selectedLgas]);

  const filteredWards = useMemo(() => {
    const needle = wardQuery.trim().toLowerCase();
    if (!needle) return wardsInSelectedLgas;
    return wardsInSelectedLgas.filter(
      (x) => x.ward.name.toLowerCase().includes(needle) || x.lgaName.toLowerCase().includes(needle)
    );
  }, [wardsInSelectedLgas, wardQuery]);

  const selectionTotals = useMemo(() => {
    if (!selectedState || !stateNode) return { members: 0, farms: 0, coverageSummary: "" };

    // If wards explicitly selected => use ward subset
    if (selectedWards.size > 0) {
      let members = 0;
      let farms = 0;

      for (const key of selectedWards) {
        const [lga, wardName] = key.split("||");
        const wardKey = `${selectedState}|${lga}|${wardName}`;
        members += estimateMembers(wardKey);
        farms += estimateFarms(wardKey);
      }

      const lgas = new Set<string>();
      for (const k of selectedWards) lgas.add(k.split("||")[0]);
      const lgaList = Array.from(lgas);

      const coverageSummary =
        `${selectedState} • ${lgaList.length} LGA(s) • ${selectedWards.size} ward(s)` +
        (lgaList.length <= 3 ? ` (${lgaList.join(", ")})` : "");

      return { members, farms, coverageSummary };
    }

    // Otherwise use all wards inside selected LGAs
    let members = 0;
    let farms = 0;

    for (const lga of stateNode.lgas) {
      if (!selectedLgas.has(lga.name)) continue;
      for (const w of lga.wards) {
        const wardKey = `${selectedState}|${lga.name}|${w.name}`;
        members += estimateMembers(wardKey);
        farms += estimateFarms(wardKey);
      }
    }

    const lgaList = Array.from(selectedLgas);
    const coverageSummary =
      selectedLgas.size === 0
        ? ""
        : `${selectedState} • ${selectedLgas.size} LGA(s)` + (selectedLgas.size <= 3 ? ` (${lgaList.join(", ")})` : "");

    return { members, farms, coverageSummary };
  }, [selectedState, stateNode, selectedLgas, selectedWards]);

  const selectedStateBounds = useMemo(() => {
    if (!statesGeo || !selectedState) return null;
    const features: any[] = statesGeo?.features ?? [];
    const feat =
      features.find(
        (f) =>
          String(f?.properties?.shapeName ?? f?.properties?.NAME_1 ?? "").toLowerCase() === selectedState.toLowerCase()
      ) ?? null;

    if (!feat) return null;
    try {
      const layer = L.geoJSON(feat as any);
      return layer.getBounds();
    } catch {
      return null;
    }
  }, [statesGeo, selectedState]);

  function toggleLga(name: string) {
    setSelectedLgas((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        // also clear wards from this lga
        setSelectedWards((wprev) => {
          const wnext = new Set(wprev);
          for (const k of Array.from(wnext)) {
            if (k.startsWith(`${name}||`)) wnext.delete(k);
          }
          return wnext;
        });
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function toggleWard(lga: string, ward: string) {
    const key = `${lga}||${ward}`;
    setSelectedWards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearSelection() {
    setSelectedState(null);
    setSelectedLgas(new Set());
    setSelectedWards(new Set());
    setMode("LGAs");
  }

  function createFromSelection() {
    if (!selectedState) return alert("Select a state on the map first.");
    if (selectedLgas.size === 0) return alert("Select one or more LGAs.");
    setOpenCreateFromSelection(true);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Cooperatives</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Demo: click a state → select LGAs → optionally wards → create a cooperative from selection.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2 shadow-soft backdrop-blur">
            <span className="text-xs font-semibold text-zinc-700">Data:</span>
            <button
              type="button"
              onClick={() => setDataMode("demo")}
              className={[
                "rounded-xl px-3 py-1 text-xs font-semibold transition",
                dataMode === "demo" ? "bg-emerald-600 text-white" : "bg-white/70 text-zinc-900 hover:bg-white",
              ].join(" ")}
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => setDataMode("live")}
              className={[
                "rounded-xl px-3 py-1 text-xs font-semibold transition",
                dataMode === "live" ? "bg-emerald-600 text-white" : "bg-white/70 text-zinc-900 hover:bg-white",
              ].join(" ")}
              title="Live loads boundaries from geoBoundaries + hierarchy from GitHub"
            >
              Live
            </button>
          </div>

          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cooperatives…"
              className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-2.5 text-sm text-zinc-900 shadow-soft outline-none backdrop-blur placeholder:text-zinc-400 focus:ring-4 focus:ring-emerald-500/20 sm:w-72"
            />
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-soft backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
          >
            New Cooperative
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} hint="Registered cooperatives" />
        <StatCard label="Members" value={stats.members.toLocaleString()} hint="Total member count" />
        <StatCard label="Farms" value={stats.farms.toLocaleString()} hint="Farms linked to co-ops" />
        <StatCard label="Pending" value={stats.pending} hint="Awaiting approval" />
      </div>

      {/* MAP + SELECTION */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <Card
          title={`Nigeria Coverage Map ${dataMode === "demo" ? "(Demo)" : "(Live)"}`}
          right={
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-zinc-600 sm:inline">
                {selectedState ? `Selected: ${selectedState}` : "Click a state to start"}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
              >
                Reset
              </button>
            </div>
          }
        >
          {mapErr ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {mapErr}
              <div className="mt-1 text-xs text-rose-700">Falling back to demo data so the demo stays interactive.</div>
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70">
            <MapContainer center={[9.082, 8.6753]} zoom={6} style={{ height: 560, width: "100%" }} scrollWheelZoom>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {selectedStateBounds ? <FitBounds bounds={selectedStateBounds} /> : null}

              {statesGeo ? (
                <GeoJSON
                  data={statesGeo as any}
                  style={(feature: any) => {
                    const name = String(feature?.properties?.shapeName ?? feature?.properties?.NAME_1 ?? "");
                    const active = selectedState && name.toLowerCase() === selectedState.toLowerCase();
                    return {
                      color: active ? "#059669" : "rgba(24,24,27,0.18)",
                      weight: active ? 2 : 1,
                      fillColor: active ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.25)",
                      fillOpacity: 1,
                    };
                  }}
                  onEachFeature={(feature: any, layer: any) => {
                    const name = String(feature?.properties?.shapeName ?? feature?.properties?.NAME_1 ?? "State");
                    layer.on("click", () => {
                      setSelectedState(name);
                    });
                    layer.on("mouseover", () => {
                      layer.setStyle({ weight: 2 });
                    });
                    layer.on("mouseout", () => {
                      layer.setStyle({
                        weight: selectedState && name.toLowerCase() === selectedState.toLowerCase() ? 2 : 1,
                      });
                    });
                    layer.bindTooltip(name, { sticky: true });
                  }}
                />
              ) : null}

              {/* LGA markers */}
              {selectedState && ngHierarchy && mode === "LGAs"
                ? filteredLgas.map((x) => {
                    const active = selectedLgas.has(x.lgaName);
                    return (
                      <CircleMarker
                        key={`lga-${x.lgaName}`}
                        center={[x.lat, x.lng]}
                        radius={active ? 9 : 7}
                        pathOptions={{
                          color: active ? "#047857" : "#0f172a",
                          weight: active ? 2 : 1,
                          fillColor: active ? "#10b981" : "#ffffff",
                          fillOpacity: active ? 0.75 : 0.6,
                        }}
                        eventHandlers={{ click: () => toggleLga(x.lgaName) }}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">{x.lgaName}</div>
                            <div className="mt-1 text-xs text-zinc-600">{selectedState}</div>
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => toggleLga(x.lgaName)}
                                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                {active ? "Remove" : "Select"}
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })
                : null}

              {/* Ward markers */}
              {selectedState && ngHierarchy && mode === "Wards"
                ? filteredWards.map((x) => {
                    const key = `${x.lgaName}||${x.ward.name}`;
                    const active = selectedWards.has(key);
                    return (
                      <CircleMarker
                        key={`ward-${key}`}
                        center={[x.ward.latitude, x.ward.longitude]}
                        radius={active ? 6 : 4.5}
                        pathOptions={{
                          color: active ? "#0f766e" : "rgba(24,24,27,0.65)",
                          weight: 1,
                          fillColor: active ? "#14b8a6" : "#ffffff",
                          fillOpacity: active ? 0.85 : 0.65,
                        }}
                        eventHandlers={{ click: () => toggleWard(x.lgaName, x.ward.name) }}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">{x.ward.name}</div>
                            <div className="mt-1 text-xs text-zinc-600">
                              {x.lgaName} • {selectedState}
                            </div>
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => toggleWard(x.lgaName, x.ward.name)}
                                className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                {active ? "Remove" : "Select"}
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })
                : null}
            </MapContainer>

            {!statesGeo || !ngHierarchy ? (
              <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur">
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 text-sm text-zinc-700 shadow-soft">
                  Loading map data…
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-zinc-700">Mode:</span>
              <button
                type="button"
                onClick={() => setMode("LGAs")}
                className={[
                  "rounded-2xl px-3 py-1.5 text-xs font-semibold transition",
                  mode === "LGAs"
                    ? "bg-emerald-600 text-white"
                    : "border border-zinc-200/70 bg-white/70 text-zinc-900 hover:bg-white",
                ].join(" ")}
                disabled={!selectedState}
                title={!selectedState ? "Select a state first" : ""}
              >
                LGAs
              </button>
              <button
                type="button"
                onClick={() => setMode("Wards")}
                className={[
                  "rounded-2xl px-3 py-1.5 text-xs font-semibold transition",
                  mode === "Wards"
                    ? "bg-emerald-600 text-white"
                    : "border border-zinc-200/70 bg-white/70 text-zinc-900 hover:bg-white",
                ].join(" ")}
                disabled={!selectedState || selectedLgas.size === 0}
                title={!selectedState ? "Select a state first" : selectedLgas.size === 0 ? "Select at least one LGA first" : ""}
              >
                Wards
              </button>

              <span className="ml-2 text-xs text-zinc-600">
                {selectedState ? (
                  <>
                    <span className="font-semibold text-zinc-900">{selectedLgas.size}</span> LGA(s)
                    {mode === "Wards" ? (
                      <>
                        {" "}
                        • <span className="font-semibold text-zinc-900">{selectedWards.size}</span> ward(s)
                      </>
                    ) : null}
                  </>
                ) : (
                  "Click a state polygon to begin."
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!selectedState || !stateNode) return;
                  setSelectedLgas(new Set(stateNode.lgas.map((l) => l.name)));
                }}
                className="rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                disabled={!selectedState || !stateNode}
              >
                Select all LGAs
              </button>

              <button
                type="button"
                onClick={createFromSelection}
                className="rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                disabled={!selectedState || selectedLgas.size === 0}
                title={!selectedState ? "Select a state first" : selectedLgas.size === 0 ? "Select at least one LGA" : ""}
              >
                Create cooperative from selection
              </button>
            </div>
          </div>
        </Card>

        {/* Selection Panel */}
        <Card title="Selection & Preview">
          <div className="grid gap-3">
            <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Selected Coverage</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">{selectedState ? selectedState : "—"}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    {selectionTotals.coverageSummary || "Select LGAs (and optionally wards) to compute totals."}
                  </p>
                </div>
                {selectedState ? (
                  <button
                    type="button"
                    onClick={() => setSelectedState(null)}
                    className="rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-soft transition hover:bg-white"
                  >
                    Change
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Members (est.)</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900">{selectionTotals.members.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-zinc-600">Derived from selected wards/LGAs (demo logic).</p>
                </div>
                <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Farms (est.)</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900">{selectionTotals.farms.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-zinc-600">Replace with your real registry later.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <p className="text-xs font-semibold text-zinc-700">LGAs</p>
                <input
                  value={lgaQuery}
                  onChange={(e) => setLgaQuery(e.target.value)}
                  placeholder={selectedState ? "Filter LGAs…" : "Select a state first…"}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                  disabled={!selectedState}
                />

                <div className="max-h-[220px] overflow-auto rounded-2xl border border-zinc-200/70 bg-white/50 p-2">
                  {!selectedState ? (
                    <div className="px-2 py-2 text-sm text-zinc-600">Click a state on the map to load its LGAs.</div>
                  ) : !stateNode ? (
                    <div className="px-2 py-2 text-sm text-zinc-600">Loading LGAs…</div>
                  ) : (
                    <div className="grid gap-1">
                      {filteredLgas.map((x) => {
                        const active = selectedLgas.has(x.lgaName);
                        return (
                          <button
                            key={`lga-btn-${x.lgaName}`}
                            type="button"
                            onClick={() => toggleLga(x.lgaName)}
                            className={[
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
                              active ? "bg-emerald-600 text-white" : "bg-white/70 text-zinc-900 hover:bg-white",
                            ].join(" ")}
                          >
                            <span className="font-semibold">{x.lgaName}</span>
                            <span className="text-xs opacity-90">{active ? "Selected" : "Select"}</span>
                          </button>
                        );
                      })}
                      {filteredLgas.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-zinc-600">No LGAs match your filter.</div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-700">Wards (optional)</p>
                  <button
                    type="button"
                    onClick={() => setSelectedWards(new Set())}
                    className="text-xs font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
                    disabled={selectedWards.size === 0}
                    title="Clear ward selection"
                  >
                    Clear wards
                  </button>
                </div>

                <input
                  value={wardQuery}
                  onChange={(e) => setWardQuery(e.target.value)}
                  placeholder={selectedLgas.size > 0 ? "Filter wards…" : "Select LGAs first…"}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                  disabled={!selectedState || selectedLgas.size === 0}
                />

                <div className="max-h-[220px] overflow-auto rounded-2xl border border-zinc-200/70 bg-white/50 p-2">
                  {!selectedState ? (
                    <div className="px-2 py-2 text-sm text-zinc-600">Select a state and LGAs to list wards.</div>
                  ) : selectedLgas.size === 0 ? (
                    <div className="px-2 py-2 text-sm text-zinc-600">Select one or more LGAs first.</div>
                  ) : (
                    <div className="grid gap-1">
                      {filteredWards.map((x) => {
                        const k = `${x.lgaName}||${x.ward.name}`;
                        const active = selectedWards.has(k);
                        return (
                          <button
                            key={`ward-btn-${k}`}
                            type="button"
                            onClick={() => toggleWard(x.lgaName, x.ward.name)}
                            className={[
                              "flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
                              active ? "bg-teal-600 text-white" : "bg-white/70 text-zinc-900 hover:bg-white",
                            ].join(" ")}
                          >
                            <div>
                              <div className="font-semibold">{x.ward.name}</div>
                              <div className={["mt-0.5 text-xs", active ? "text-white/80" : "text-zinc-600"].join(" ")}>
                                {x.lgaName}
                              </div>
                            </div>
                            <span className="text-xs opacity-90">{active ? "Selected" : "Select"}</span>
                          </button>
                        );
                      })}
                      {filteredWards.length === 0 ? (
                        <div className="px-2 py-2 text-sm text-zinc-600">No wards match your filter.</div>
                      ) : null}
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-600">
                  If you select wards, totals use only those wards. If you don’t, totals use all wards inside selected LGAs.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Directory */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3">
          <p className="text-sm font-semibold text-zinc-900">Directory</p>
          <p className="text-xs text-zinc-600">{filteredCoops.length} result(s)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200/70">
            <thead className="bg-white/50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Coverage</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Farms</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200/70">
              {filteredCoops.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer bg-white/40 hover:bg-white/70"
                  onClick={() => alert(`Open cooperative: ${c.name} (detail page can be added next)`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-900">{c.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-600">
                      {c.contactName ? `Contact: ${c.contactName}` : "—"} {c.phone ? `• ${c.phone}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-800">{c.coverageSummary ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-zinc-800">{c.members.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-zinc-800">{c.farms.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{fmtDate(c.updatedAt)}</td>
                </tr>
              ))}

              {filteredCoops.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-zinc-600" colSpan={6}>
                    No cooperatives found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual create modal */}
      {openCreate ? (
        <CreateCoopModal
          title="New Cooperative"
          subtitle="Create a cooperative profile (manual)."
          preset={null}
          onClose={() => setOpenCreate(false)}
          onCreate={(next) => {
            setCoops((prev) => [{ ...next, id: uid(), updatedAt: new Date().toISOString() }, ...prev]);
            setOpenCreate(false);
          }}
        />
      ) : null}

      {/* Create from selection modal */}
      {openCreateFromSelection ? (
        <CreateCoopModal
          title="Create Cooperative from Selection"
          subtitle="Coverage is prefilled from your map selection."
          preset={{
            state: selectedState ?? undefined,
            members: selectionTotals.members,
            farms: selectionTotals.farms,
            coverageSummary: selectionTotals.coverageSummary,
            status: "Pending",
          }}
          onClose={() => setOpenCreateFromSelection(false)}
          onCreate={(next) => {
            setCoops((prev) => [{ ...next, id: uid(), updatedAt: new Date().toISOString() }, ...prev]);
            setOpenCreateFromSelection(false);
          }}
        />
      ) : null}
    </div>
  );
}

function CreateCoopModal({
  title,
  subtitle,
  preset,
  onClose,
  onCreate,
}: {
  title: string;
  subtitle: string;
  preset: Partial<Omit<Cooperative, "id" | "updatedAt">> | null;
  onClose: () => void;
  onCreate: (c: Omit<Cooperative, "id" | "updatedAt">) => void;
}) {
  const [name, setName] = useState(preset?.name ?? "");
  const [state, setState] = useState(preset?.state ?? "");
  const [lga, setLga] = useState(preset?.lga ?? "");
  const [members, setMembers] = useState<number>(preset?.members ?? 0);
  const [farms, setFarms] = useState<number>(preset?.farms ?? 0);
  const [status, setStatus] = useState<CoopStatus>(preset?.status ?? "Pending");
  const [contactName, setContactName] = useState(preset?.contactName ?? "");
  const [phone, setPhone] = useState(preset?.phone ?? "");
  const [coverageSummary, setCoverageSummary] = useState(preset?.coverageSummary ?? "");
  const [err, setErr] = useState<string | null>(null);

  const presetLocked = Boolean(preset?.coverageSummary);

  function submit() {
    const n = name.trim();
    if (!n) return setErr("Name is required.");
    if ((members ?? 0) < 0 || (farms ?? 0) < 0) return setErr("Members/Farms cannot be negative.");
    setErr(null);

    onCreate({
      name: n,
      state: state.trim() || undefined,
      lga: lga.trim() || undefined,
      members: Number.isFinite(members) ? members : 0,
      farms: Number.isFinite(farms) ? farms : 0,
      status,
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      coverageSummary: coverageSummary.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between border-b border-zinc-200/70 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">{title}</p>
              <p className="mt-0.5 text-xs text-zinc-600">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3 px-5 py-4">
            {err ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{err}</div>
            ) : null}

            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                placeholder="e.g. Sunrise Cooperative"
              />
            </Field>

            <Field label="Coverage Summary">
              <input
                value={coverageSummary}
                onChange={(e) => setCoverageSummary(e.target.value)}
                className={[
                  "w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20",
                  presetLocked ? "opacity-90" : "",
                ].join(" ")}
                placeholder="e.g. Kaduna • 3 LGA(s) (Chikun, Igabi, Zaria)"
              />
              {presetLocked ? <p className="mt-1 text-xs text-zinc-600">Prefilled from map selection. You can still edit if needed.</p> : null}
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="State (optional)">
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
              </Field>

              <Field label="LGA (optional)">
                <input
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Members">
                <input
                  type="number"
                  value={members}
                  onChange={(e) => setMembers(Number(e.target.value))}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                  min={0}
                />
              </Field>

              <Field label="Farms">
                <input
                  type="number"
                  value={farms}
                  onChange={(e) => setFarms(Number(e.target.value))}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                  min={0}
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Contact Name (optional)">
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
              </Field>

              <Field label="Phone (optional)">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CoopStatus)}
                className="w-full rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20"
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200/70 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-zinc-900 shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
    </label>
  );
}