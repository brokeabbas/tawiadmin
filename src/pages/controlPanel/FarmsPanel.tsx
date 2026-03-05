// tawiadmin/src/pages/controlPanel/FarmsPanel.tsx
import React, { useEffect, useId, useMemo, useState } from "react";
import { Button, cn } from "../../components/reusable/atoms";
import { SectionCard } from "./controlPanelCards";

type LatLng = { lat: number; lng: number };

type FarmStatus = "verified" | "pending" | "flagged" | "duplicate";

type Farm = {
  id: string;
  code: string;
  name: string;
  state: string;
  lga?: string;
  community?: string;

  ownerName: string;
  ownerPhone?: string;

  cropPrimary: string;
  cropSecondary?: string;

  areaHa: number;
  agentsCount: number;

  status: FarmStatus;
  createdAt: string;
  updatedAt: string;

  verifiedAt?: string | null;
  verifiedBy?: string | null;

  duplicateGroupId?: string | null;

  polygon: LatLng[]; // farm boundary
};

const STATUS_OPTIONS: Array<{ value: "All" | FarmStatus; label: string }> = [
  { value: "All", label: "All statuses" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "duplicate", label: "Duplicates" },
];

const MOCK_FARMS: Farm[] = [
  {
    id: "farm_oyo_001",
    code: "OYO-F-001",
    name: "Akinyele Maize Cluster",
    state: "Oyo",
    lga: "Akinyele",
    community: "Moniya",
    ownerName: "Adebayo Ogunleye",
    ownerPhone: "+234 803 123 4500",
    cropPrimary: "Maize",
    cropSecondary: "Cassava",
    areaHa: 2.8,
    agentsCount: 3,
    status: "verified",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    verifiedBy: "Verifier • Southwest",
    duplicateGroupId: null,
    polygon: [
      { lat: 7.4268, lng: 3.9052 },
      { lat: 7.4262, lng: 3.9068 },
      { lat: 7.4252, lng: 3.9063 },
      { lat: 7.4257, lng: 3.9047 },
    ],
  },
  {
    id: "farm_kwara_014",
    code: "KWA-F-014",
    name: "Ilorin Rice Belt Plot 14",
    state: "Kwara",
    lga: "Ilorin West",
    community: "Oja-Oba",
    ownerName: "Zainab Sanni",
    ownerPhone: "+234 805 111 9001",
    cropPrimary: "Rice",
    cropSecondary: "Vegetables",
    areaHa: 1.6,
    agentsCount: 2,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    duplicateGroupId: null,
    polygon: [
      { lat: 8.4747, lng: 4.5422 },
      { lat: 8.4742, lng: 4.5438 },
      { lat: 8.4732, lng: 4.5431 },
      { lat: 8.4737, lng: 4.5418 },
    ],
  },
  {
    id: "farm_kaduna_007",
    code: "KAD-F-007",
    name: "Chikun Ginger Field 7",
    state: "Kaduna",
    lga: "Chikun",
    community: "Kujama",
    ownerName: "Musa Bello",
    ownerPhone: "+234 809 222 7744",
    cropPrimary: "Ginger",
    cropSecondary: "Soya",
    areaHa: 3.9,
    agentsCount: 4,
    status: "flagged",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    duplicateGroupId: null,
    polygon: [
      { lat: 10.482, lng: 7.393 },
      { lat: 10.481, lng: 7.396 },
      { lat: 10.479, lng: 7.3952 },
      { lat: 10.4796, lng: 7.3924 },
    ],
  },
  {
    id: "farm_lagos_021",
    code: "LAG-F-021",
    name: "Ikeja Veg Plot 21",
    state: "Lagos",
    lga: "Ikeja",
    community: "Oregun",
    ownerName: "Tosin Okafor",
    ownerPhone: "+234 802 555 0181",
    cropPrimary: "Vegetables",
    cropSecondary: "Pepper",
    areaHa: 0.7,
    agentsCount: 1,
    status: "duplicate",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    duplicateGroupId: "dup_ikeja_oreg",
    polygon: [
      { lat: 6.6032, lng: 3.357 },
      { lat: 6.6024, lng: 3.3586 },
      { lat: 6.6017, lng: 3.3578 },
      { lat: 6.6025, lng: 3.3564 },
    ],
  },
  {
    id: "farm_lagos_022",
    code: "LAG-F-022",
    name: "Ikeja Veg Plot 21B",
    state: "Lagos",
    lga: "Ikeja",
    community: "Oregun",
    ownerName: "Tosin Okafor",
    ownerPhone: "+234 802 555 0181",
    cropPrimary: "Vegetables",
    cropSecondary: "Pepper",
    areaHa: 0.71,
    agentsCount: 1,
    status: "duplicate",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    duplicateGroupId: "dup_ikeja_oreg",
    polygon: [
      { lat: 6.60315, lng: 3.3571 },
      { lat: 6.60235, lng: 3.35865 },
      { lat: 6.60165, lng: 3.35785 },
      { lat: 6.60245, lng: 3.3565 },
    ],
  },
];

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function formatRelative(iso?: string | null) {
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

function centroid(poly: LatLng[]): LatLng | null {
  if (!poly?.length) return null;
  const sum = poly.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { lat: sum.lat / poly.length, lng: sum.lng / poly.length };
}

function farmStatusLabel(s: FarmStatus) {
  if (s === "verified") return "Verified";
  if (s === "pending") return "Pending";
  if (s === "flagged") return "Flagged";
  return "Duplicate";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function haversineMeters(a: LatLng, b: LatLng) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function polygonPerimeterMeters(poly: LatLng[]) {
  if (!poly?.length || poly.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    total += haversineMeters(a, b);
  }
  return total;
}

// Approx area using equirectangular projection (good enough for small farm polygons)
function polygonAreaHa(poly: LatLng[]) {
  if (!poly?.length || poly.length < 3) return 0;
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;

  const lat0 = poly.reduce((s, p) => s + p.lat, 0) / poly.length;
  const lat0r = toRad(lat0);

  const pts = poly.map((p) => {
    const x = R * toRad(p.lng) * Math.cos(lat0r);
    const y = R * toRad(p.lat);
    return { x, y };
  });

  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  const areaM2 = Math.abs(sum) / 2;
  return areaM2 / 10000;
}

function StatusBadge({ status }: { status: FarmStatus }) {
  const styles =
    status === "verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "flagged"
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-indigo-200 bg-indigo-50 text-indigo-800";

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", styles)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "verified"
            ? "bg-emerald-600"
            : status === "pending"
              ? "bg-amber-600"
              : status === "flagged"
                ? "bg-rose-600"
                : "bg-indigo-600"
        )}
      />
      {farmStatusLabel(status)}
    </span>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/70 p-3">
      <p className="text-[11px] font-semibold text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
      <p className="text-xs font-semibold text-zinc-600">{label}</p>
      <div className="text-right text-xs text-zinc-900">{value}</div>
    </div>
  );
}

function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-2xl border border-zinc-200 bg-white/80 p-1 shadow-sm">
      {items.map((it) => {
        const active = value === it.value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-zinc-900 text-white shadow-sm"
                : "text-zinc-700 hover:bg-white"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Safari fallback
    // eslint-disable-next-line deprecation/deprecation
    if (mql.addEventListener) mql.addEventListener("change", handler);
    // eslint-disable-next-line deprecation/deprecation
    else mql.addListener(handler);

    setMatches(mql.matches);

    return () => {
      // eslint-disable-next-line deprecation/deprecation
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      // eslint-disable-next-line deprecation/deprecation
      else mql.removeListener(handler);
    };
  }, [query]);

  return matches;
}

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 160);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className={cn(
          "absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-[min(560px,94vw)]">
        <div
          className={cn(
            "h-full rounded-l-3xl border-l border-zinc-200 bg-white shadow-2xl transition-transform duration-150",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">Farm details</p>
            </div>
            <Button
              variant="secondary"
              onClick={onClose}
              className={cn(
                "rounded-xl border border-zinc-200 bg-white/70 text-zinc-900",
                "hover:bg-white transition",
                "px-3 py-2 text-xs"
              )}
            >
              Close
            </Button>
          </div>
          <div className="h-[calc(100%-60px)] overflow-auto px-5 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PolygonPreview({ polygon }: { polygon: LatLng[] }) {
  const gidRaw = useId();
  const gid = `g_${gidRaw.replace(/:/g, "_")}`;

  // Normalize polygon points into a small SVG viewport.
  const w = 360;
  const h = 200;

  if (!polygon?.length) {
    return (
      <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-xs text-zinc-600">No polygon available.</p>
      </div>
    );
  }

  const xs = polygon.map((p) => p.lng);
  const ys = polygon.map((p) => p.lat);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const dx = Math.max(1e-9, maxX - minX);
  const dy = Math.max(1e-9, maxY - minY);

  // padding in SVG space
  const pad = 14;

  const points = polygon
    .map((p) => {
      const nx = (p.lng - minX) / dx;
      const ny = (p.lat - minY) / dy;
      // flip Y for screen coordinates
      const sx = pad + nx * (w - pad * 2);
      const sy = pad + (1 - ny) * (h - pad * 2);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={w} height={h} fill={`url(#${gid})`} />
        <polyline
          points={points}
          fill="rgba(16,185,129,0.12)"
          stroke="rgba(16,185,129,0.9)"
          strokeWidth="2.2"
        />
        {/* points */}
        {polygon.map((_, idx) => {
          const [sx, sy] = points.split(" ")[idx].split(",").map(Number);
          return (
            <circle
              key={idx}
              cx={sx}
              cy={sy}
              r="3"
              fill="rgba(15,23,42,0.55)"
            />
          );
        })}
      </svg>
      <div className="border-t border-zinc-100 px-3 py-2">
        <p className="text-[11px] font-semibold text-zinc-600">
          {polygon.length} boundary points
        </p>
      </div>
    </div>
  );
}

function OSMEmbed({ center }: { center: LatLng | null }) {
  if (!center) {
    return (
      <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-xs text-zinc-600">
          No coordinates available for map preview.
        </p>
      </div>
    );
  }

  const { lat, lng } = center;
  const pad = 0.03;
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
        title="Farm map"
        src={src}
        style={{ width: "100%", height: 240 }}
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

function exportFarmsCsv(rows: Farm[]) {
  const header = [
    "id",
    "code",
    "name",
    "state",
    "lga",
    "community",
    "ownerName",
    "ownerPhone",
    "cropPrimary",
    "cropSecondary",
    "areaHa",
    "agentsCount",
    "status",
    "createdAt",
    "updatedAt",
    "verifiedAt",
    "verifiedBy",
    "duplicateGroupId",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    // Wrap in quotes, escape quotes
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.id,
        r.code,
        r.name,
        r.state,
        r.lga ?? "",
        r.community ?? "",
        r.ownerName,
        r.ownerPhone ?? "",
        r.cropPrimary,
        r.cropSecondary ?? "",
        r.areaHa,
        r.agentsCount,
        r.status,
        r.createdAt,
        r.updatedAt,
        r.verifiedAt ?? "",
        r.verifiedBy ?? "",
        r.duplicateGroupId ?? "",
      ]
        .map(escape)
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `farms_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-4 align-top", className)}>{children}</td>;
}

type Tone = "zinc" | "emerald" | "amber" | "rose" | "indigo";

function toneStyles(tone: Tone) {
  if (tone === "emerald")
    return {
      ring: "ring-emerald-500/10",
      iconBg: "bg-emerald-50",
      iconFg: "text-emerald-700",
      bar: "bg-emerald-600",
    };
  if (tone === "amber")
    return {
      ring: "ring-amber-500/10",
      iconBg: "bg-amber-50",
      iconFg: "text-amber-700",
      bar: "bg-amber-600",
    };
  if (tone === "rose")
    return {
      ring: "ring-rose-500/10",
      iconBg: "bg-rose-50",
      iconFg: "text-rose-700",
      bar: "bg-rose-600",
    };
  if (tone === "indigo")
    return {
      ring: "ring-indigo-500/10",
      iconBg: "bg-indigo-50",
      iconFg: "text-indigo-700",
      bar: "bg-indigo-600",
    };
  return {
    ring: "ring-zinc-500/10",
    iconBg: "bg-zinc-50",
    iconFg: "text-zinc-800",
    bar: "bg-zinc-900",
  };
}

function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const gidRaw = useId();
  const gid = `sp_${gidRaw.replace(/:/g, "_")}`;
  const w = 110;
  const h = 34;
  const pad = 3;

  const max = Math.max(1, ...values);
  const min = Math.min(...values);

  const norm = (v: number) => {
    const t = max === min ? 0.5 : (v - min) / (max - min);
    return clamp(t, 0, 1);
  };

  const pts = values
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
      const y = pad + (1 - norm(v)) * (h - pad * 2);
      return { x, y };
    })
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-9 w-28", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="rgba(15,23,42,0.65)" strokeWidth="1.6" />
      {/* area */}
      <polyline
        points={`${pts} ${w - pad},${h - pad} ${pad},${h - pad}`}
        fill={`url(#${gid})`}
        stroke="none"
      />
    </svg>
  );
}

function InsightCard({
  tone,
  label,
  value,
  sublabel,
  metaLeft,
  metaRight,
  progress,
  spark,
  icon,
}: {
  tone: Tone;
  label: string;
  value: React.ReactNode;
  sublabel?: string;
  metaLeft?: React.ReactNode;
  metaRight?: React.ReactNode;
  progress?: number; // 0..1
  spark?: number[];
  icon: React.ReactNode;
}) {
  const t = toneStyles(tone);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/70 p-4",
        "ring-1",
        t.ring
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-zinc-500">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
            {value}
          </p>
          {sublabel ? (
            <p className="mt-1 text-xs text-zinc-600">{sublabel}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {spark?.length ? <Sparkline values={spark} /> : null}
          <div
            className={cn(
              "grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200",
              t.iconBg,
              t.iconFg
            )}
          >
            {icon}
          </div>
        </div>
      </div>

      {(typeof progress === "number" || metaLeft || metaRight) && (
        <div className="mt-3 space-y-2">
          {typeof progress === "number" ? (
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className={cn("h-full rounded-full", t.bar)}
                style={{ width: `${clamp(progress, 0, 1) * 100}%` }}
              />
            </div>
          ) : null}

          {(metaLeft || metaRight) && (
            <div className="flex items-center justify-between text-[11px] text-zinc-600">
              <span className="font-semibold">{metaLeft}</span>
              <span className="font-semibold">{metaRight}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pill({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm">
      {children}
      {onClear ? (
        <button
          onClick={onClear}
          className="grid h-5 w-5 place-items-center rounded-full hover:bg-zinc-100"
          aria-label="Clear filter"
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 7l10 10M17 7L7 17"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </span>
  );
}

function FarmDetails({
  farm,
  onVerify,
  onFlag,
  onClearFlag,
}: {
  farm: Farm | null;
  onVerify: (id: string) => void;
  onFlag: (id: string) => void;
  onClearFlag: (id: string) => void;
}) {
  const [panel, setPanel] = useState<"overview" | "geometry" | "audit">(
    "overview"
  );

  useEffect(() => {
    setPanel("overview");
  }, [farm?.id]);

  if (!farm) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/60 p-6">
        <p className="text-sm font-semibold text-zinc-900">Select a farm</p>
        <p className="mt-1 text-xs text-zinc-600">
          Click a row to view full farm details here.
        </p>
      </div>
    );
  }

  const c = centroid(farm.polygon);
  const geoArea = polygonAreaHa(farm.polygon);
  const perimeterM = polygonPerimeterMeters(farm.polygon);

  const showWarning =
    farm.status === "flagged" ||
    farm.status === "pending" ||
    farm.status === "duplicate";

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl border border-zinc-200 bg-white text-xs font-bold text-zinc-900">
              {initials(farm.ownerName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {farm.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">
                <span className="font-semibold text-zinc-900">{farm.code}</span>{" "}
                • {farm.state}
                {farm.lga ? ` • ${farm.lga}` : ""}
                {farm.community ? ` • ${farm.community}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={farm.status} />
        </div>
      </div>

      {showWarning ? (
        <div
          className={cn(
            "rounded-2xl border p-3 text-xs",
            farm.status === "flagged"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : farm.status === "duplicate"
                ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">
                {farm.status === "flagged"
                  ? "Flagged for review"
                  : farm.status === "duplicate"
                    ? "Possible duplicate record"
                    : "Pending verification"}
              </p>
              <p className="mt-1 text-zinc-700/90">
                {farm.status === "flagged"
                  ? "This farm needs attention. Confirm owner details, polygon, and crop classification."
                  : farm.status === "duplicate"
                    ? `This farm is part of a duplicate group${
                        farm.duplicateGroupId ? `: ${farm.duplicateGroupId}` : ""
                      }. Compare geometry and owner identity before action.`
                    : "Verify this farm after validating the boundary and field metadata."}
              </p>
            </div>
            <div className="shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.8A2 2 0 0 0 4.62 20h14.76a2 2 0 0 0 1.73-3.34l-7.4-12.8a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onVerify(farm.id)}
          className={cn(
            "rounded-2xl bg-emerald-600 text-white shadow-soft transition",
            "hover:bg-emerald-500 hover:shadow-md"
          )}
          disabled={farm.status === "verified"}
        >
          Verify
        </Button>

        {farm.status !== "flagged" ? (
          <Button
            variant="secondary"
            onClick={() => onFlag(farm.id)}
            className={cn(
              "rounded-2xl border border-rose-200 bg-rose-50 text-rose-800",
              "hover:bg-rose-100 transition",
              "px-3 py-2 text-xs"
            )}
          >
            Flag
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => onClearFlag(farm.id)}
            className={cn(
              "rounded-2xl border border-zinc-200 bg-white/70 text-zinc-900",
              "hover:bg-white transition",
              "px-3 py-2 text-xs"
            )}
          >
            Clear flag
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tabs
          value={panel}
          onChange={(v) => setPanel(v as typeof panel)}
          items={[
            { value: "overview", label: "Overview" },
            { value: "geometry", label: "Geometry" },
            { value: "audit", label: "Audit" },
          ]}
        />
        <p className="text-[11px] font-semibold text-zinc-500">
          Updated {formatRelative(farm.updatedAt)}
        </p>
      </div>

      {panel === "overview" ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Recorded area" value={`${farm.areaHa.toFixed(2)} ha`} />
            <StatCard label="Agents" value={farm.agentsCount} />
            <StatCard label="Primary crop" value={farm.cropPrimary} />
          </div>

          <div className="grid gap-2">
            <DetailRow label="Owner" value={farm.ownerName} />
            <DetailRow label="Owner phone" value={farm.ownerPhone ?? "—"} />
            <DetailRow label="Secondary crop" value={farm.cropSecondary ?? "—"} />
            <DetailRow label="Created" value={formatDateTime(farm.createdAt)} />
            <DetailRow
              label="Verified"
              value={
                farm.verifiedAt
                  ? `${formatDateTime(farm.verifiedAt)}${
                      farm.verifiedBy ? ` • by ${farm.verifiedBy}` : ""
                    }`
                  : "—"
              }
            />
            <DetailRow label="Duplicate group" value={farm.duplicateGroupId ?? "—"} />
          </div>
        </>
      ) : null}

      {panel === "geometry" ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Boundary points" value={farm.polygon.length} />
            <StatCard label="Perimeter" value={`${(perimeterM / 1000).toFixed(2)} km`} />
            <StatCard label="GIS area (approx)" value={`${geoArea.toFixed(2)} ha`} hint="Derived from polygon" />
          </div>

          <OSMEmbed center={c} />
          <PolygonPreview polygon={farm.polygon} />

          <div className="grid gap-2">
            <DetailRow
              label="Centroid"
              value={
                c ? (
                  <span className="font-semibold">
                    {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              label="Area delta"
              value={
                <span className={cn("font-semibold", Math.abs(geoArea - farm.areaHa) > 0.25 ? "text-rose-700" : "text-zinc-900")}>
                  {(geoArea - farm.areaHa).toFixed(2)} ha
                </span>
              }
            />
          </div>
        </>
      ) : null}

      {panel === "audit" ? (
        <div className="grid gap-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-900">Timeline</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-zinc-900" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900">Created</p>
                  <p className="text-xs text-zinc-600">{formatDateTime(farm.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-zinc-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900">Last updated</p>
                  <p className="text-xs text-zinc-600">
                    {formatDateTime(farm.updatedAt)} • {formatRelative(farm.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={cn("mt-1 h-2 w-2 rounded-full", farm.verifiedAt ? "bg-emerald-600" : "bg-zinc-200")} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900">Verification</p>
                  <p className="text-xs text-zinc-600">
                    {farm.verifiedAt
                      ? `${formatDateTime(farm.verifiedAt)}${farm.verifiedBy ? ` • ${farm.verifiedBy}` : ""}`
                      : "Not verified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Status" value={<StatusBadge status={farm.status} />} />
            <StatCard label="Owner phone" value={farm.ownerPhone ?? "—"} />
            <StatCard label="Record ID" value={<span className="font-mono text-xs">{farm.id}</span>} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

type SortKey = "updatedAt" | "areaHa" | "agentsCount" | "state" | "status" | "name";
type SortDir = "asc" | "desc";

function SortTh({
  label,
  active,
  dir,
  onClick,
  className,
  alignRight,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
  alignRight?: boolean;
}) {
  return (
    <th className={cn("px-4 py-3", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group inline-flex items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-wide",
          alignRight ? "w-full justify-end" : "",
          active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
        )}
      >
        {label}
        <span className={cn("transition", active ? "opacity-100" : "opacity-40 group-hover:opacity-80")}>
          {active ? (
            dir === "asc" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M8 14l4-4 4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            )
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 10l4 4 4-4M8 14l4-4 4 4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>
    </th>
  );
}

export default function ControlPanelFarmsPanel() {
  const isLg = useMediaQuery("(min-width: 1024px)");

  const [farms, setFarms] = useState<Farm[]>(MOCK_FARMS);

  // Views: all farms vs duplicates focus (still searchable)
  const [view, setView] = useState<"all" | "duplicates">("all");

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | FarmStatus>("All");
  const [minArea, setMinArea] = useState<string>("");

  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "updatedAt",
    dir: "desc",
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const states = useMemo(() => {
    const uniq = Array.from(new Set(farms.map((f) => f.state))).sort();
    return ["All", ...uniq];
  }, [farms]);

  const insights = useMemo(() => {
    const total = farms.length;
    const verified = farms.filter((f) => f.status === "verified").length;
    const pending = farms.filter((f) => f.status === "pending").length;
    const flagged = farms.filter((f) => f.status === "flagged").length;
    const duplicates = farms.filter((f) => f.status === "duplicate").length;

    const hectares = farms.reduce((s, f) => s + (f.areaHa || 0), 0);
    const avg = total ? hectares / total : 0;

    const agentsTotal = farms.reduce((s, f) => s + (f.agentsCount || 0), 0);

    const now = Date.now();
    const d7 = 1000 * 60 * 60 * 24 * 7;
    const d14 = d7 * 2;

    const createdLast7 = farms.filter((f) => now - new Date(f.createdAt).getTime() <= d7).length;
    const createdPrev7 = farms.filter((f) => {
      const t = new Date(f.createdAt).getTime();
      const age = now - t;
      return age > d7 && age <= d14;
    }).length;

    const updated24h = farms.filter((f) => now - new Date(f.updatedAt).getTime() <= 1000 * 60 * 60 * 24).length;

    const verifiedRate = total ? verified / total : 0;

    // sparkline counts for last 14 days (created)
    const days = 14;
    const bins = new Array(days).fill(0);
    for (const f of farms) {
      const ageDays = Math.floor((now - new Date(f.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const idx = days - 1 - ageDays;
      if (idx >= 0 && idx < days) bins[idx] += 1;
    }

    // sparkline counts for last 14 days (updates)
    const binsUpd = new Array(days).fill(0);
    for (const f of farms) {
      const ageDays = Math.floor((now - new Date(f.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      const idx = days - 1 - ageDays;
      if (idx >= 0 && idx < days) binsUpd[idx] += 1;
    }

    const dupGroups = new Set(farms.filter((f) => f.duplicateGroupId).map((f) => f.duplicateGroupId!)).size;

    return {
      total,
      verified,
      pending,
      flagged,
      duplicates,
      dupGroups,
      hectares,
      avg,
      agentsTotal,
      createdLast7,
      createdPrev7,
      updated24h,
      verifiedRate,
      sparkCreated: bins,
      sparkUpdated: binsUpd,
    };
  }, [farms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minArea.trim() ? Number(minArea) : null;

    const statusOrder: Record<FarmStatus, number> = {
      verified: 1,
      pending: 2,
      flagged: 3,
      duplicate: 4,
    };

    const arr = farms
      .filter((f) => (view === "duplicates" ? f.status === "duplicate" : true))
      .filter((f) => (stateFilter === "All" ? true : f.state === stateFilter))
      .filter((f) => (statusFilter === "All" ? true : f.status === statusFilter))
      .filter((f) => (min === null || Number.isNaN(min) ? true : f.areaHa >= min))
      .filter((f) => {
        if (!q) return true;
        const hay = `${f.name} ${f.code} ${f.state} ${f.lga ?? ""} ${f.community ?? ""} ${f.ownerName} ${
          f.ownerPhone ?? ""
        } ${f.cropPrimary} ${f.cropSecondary ?? ""}`.toLowerCase();
        return hay.includes(q);
      });

    const dir = sort.dir === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      let cmp = 0;
      if (sort.key === "updatedAt") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sort.key === "areaHa") cmp = a.areaHa - b.areaHa;
      if (sort.key === "agentsCount") cmp = a.agentsCount - b.agentsCount;
      if (sort.key === "state") cmp = a.state.localeCompare(b.state);
      if (sort.key === "name") cmp = a.name.localeCompare(b.name);
      if (sort.key === "status") cmp = statusOrder[a.status] - statusOrder[b.status];
      return cmp * dir;
    });
  }, [farms, view, search, stateFilter, statusFilter, minArea, sort]);

  const selected = useMemo(
    () => farms.find((f) => f.id === selectedId) ?? null,
    [farms, selectedId]
  );

  useEffect(() => {
    // keep selection sane
    if (selectedId && !filtered.some((f) => f.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
    if (!selectedId && filtered.length) {
      setSelectedId(filtered[0].id);
    }

    // keep bulk selection sane
    setSelectedIds((prev) => {
      if (!prev.size) return prev;
      const next = new Set<string>();
      for (const id of prev) if (filtered.some((f) => f.id === id)) next.add(id);
      return next;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  function openDetails(id: string) {
    setSelectedId(id);
    if (!isLg) setDrawerOpen(true);
  }

  function onVerify(id: string) {
    const now = new Date().toISOString();
    setFarms((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: "verified",
              verifiedAt: now,
              verifiedBy: "You",
              updatedAt: now,
            }
          : f
      )
    );
  }

  function onFlag(id: string) {
    const now = new Date().toISOString();
    setFarms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "flagged", updatedAt: now } : f))
    );
  }

  function onClearFlag(id: string) {
    const now = new Date().toISOString();
    setFarms((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: f.verifiedAt ? "verified" : "pending",
              updatedAt: now,
            }
          : f
      )
    );
  }

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  }

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((f) => selectedIds.has(f.id));
  const someVisibleSelected =
    filtered.some((f) => selectedIds.has(f.id)) && !allVisibleSelected;

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach((f) => next.delete(f.id));
      } else {
        filtered.forEach((f) => next.add(f.id));
      }
      return next;
    });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkVerify() {
    const ids = Array.from(selectedIds);
    ids.forEach((id) => onVerify(id));
    setSelectedIds(new Set());
  }

  function bulkFlag() {
    const ids = Array.from(selectedIds);
    ids.forEach((id) => onFlag(id));
    setSelectedIds(new Set());
  }

  function bulkClear() {
    setSelectedIds(new Set());
  }

  const appliedPills = useMemo(() => {
    const pills: React.ReactNode[] = [];
    if (view === "duplicates") {
      pills.push(<Pill key="p_view" onClear={() => setView("all")}>View: Duplicates</Pill>);
    }
    if (search.trim()) {
      pills.push(<Pill key="p_search" onClear={() => setSearch("")}>Search: “{search.trim()}”</Pill>);
    }
    if (stateFilter !== "All") {
      pills.push(<Pill key="p_state" onClear={() => setStateFilter("All")}>State: {stateFilter}</Pill>);
    }
    if (statusFilter !== "All") {
      pills.push(
        <Pill key="p_status" onClear={() => setStatusFilter("All")}>
          Status: {farmStatusLabel(statusFilter)}
        </Pill>
      );
    }
    if (minArea.trim()) {
      pills.push(<Pill key="p_min" onClear={() => setMinArea("")}>Min area: {minArea} ha</Pill>);
    }
    return pills;
  }, [view, search, stateFilter, statusFilter, minArea]);

  const headerGradientIdRaw = useId();
  const headerGradientId = `hdr_${headerGradientIdRaw.replace(/:/g, "_")}`;

  return (
    <div className="grid gap-6">
      {/* Header (world-class) */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/60">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <linearGradient id={headerGradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.06" />
              <stop offset="60%" stopColor="#0f172a" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${headerGradientId})`} />
        </svg>

        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-500">Control Panel</p>
              <p className="mt-1 text-base font-semibold text-zinc-900">
                Farms Directory
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                National farm archive with advanced search, quality signals, and geometry previews (polygon + map).
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Verification coverage: {(insights.verifiedRate * 100).toFixed(0)}%
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                  Updated (24h): {insights.updated24h}
                </span>

                {insights.duplicates ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-800 shadow-sm">
                    Possible duplicates: {insights.duplicates} • Groups: {insights.dupGroups}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => exportFarmsCsv(filtered)}
                className={cn(
                  "rounded-2xl bg-emerald-600 text-white shadow-soft transition",
                  "hover:bg-emerald-500 hover:shadow-md"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3v10m0 0l4-4m-4 4L8 9M5 14v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Export farms
                </span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  // simple "refresh" for mock demo
                  setFarms((p) => [...p]);
                }}
                className={cn(
                  "rounded-2xl border border-zinc-200 bg-white/80 text-zinc-900",
                  "hover:bg-white transition px-3 py-2 text-xs"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Refresh
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights (upgraded) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InsightCard
          tone="zinc"
          label="Total farms"
          value={insights.total}
          sublabel={`${insights.hectares.toFixed(1)} ha recorded • ${insights.agentsTotal} agents`}
          metaLeft={`Avg size ${insights.avg.toFixed(2)} ha`}
          metaRight={`New (7d) ${insights.createdLast7}`}
          spark={insights.sparkCreated}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 10l8-6 8 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M10 22V12h4v10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <InsightCard
          tone="emerald"
          label="Verified"
          value={insights.verified}
          sublabel={`Coverage ${(insights.verifiedRate * 100).toFixed(0)}% of all farms`}
          progress={insights.verifiedRate}
          metaLeft={`${insights.pending} pending`}
          metaRight={`${insights.flagged} flagged`}
          spark={insights.sparkUpdated}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 12l2 2 4-5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22s8-4 8-10V6l-8-3-8 3v6c0 6 8 10 8 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <InsightCard
          tone="indigo"
          label="Duplicates"
          value={insights.duplicates}
          sublabel={`${insights.dupGroups} duplicate groups detected`}
          metaLeft="Focus view available"
          metaRight={view === "duplicates" ? "Viewing duplicates" : "All farms view"}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8 8h10v10H8V8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        />
      </div>

      <SectionCard title="Farm directory">
        <div className="grid gap-4">
          {/* Controls */}
          <div className="grid gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Tabs
                  value={view}
                  onChange={(v) => setView(v as "all" | "duplicates")}
                  items={[
                    { value: "all", label: "All farms" },
                    { value: "duplicates", label: "Duplicates" },
                  ]}
                />

                {appliedPills.length ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {appliedPills}
                    <button
                      type="button"
                      onClick={() => {
                        setView("all");
                        setSearch("");
                        setStateFilter("All");
                        setStatusFilter("All");
                        setMinArea("");
                      }}
                      className="text-[11px] font-semibold text-zinc-700 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-80">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search farm name, code, owner, state, crop…"
                    className="w-full rounded-2xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

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

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "All" | FarmStatus)}
                  className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <input
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  placeholder="Min ha"
                  inputMode="decimal"
                  className="w-full sm:w-28 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>

            {/* Bulk actions */}
            {selectedIds.size ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3">
                <p className="text-xs font-semibold text-zinc-900">
                  {selectedIds.size} selected
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => exportFarmsCsv(filtered.filter((f) => selectedIds.has(f.id)))}
                    className="rounded-2xl border border-zinc-200 bg-white/80 px-3 py-2 text-xs text-zinc-900 hover:bg-white"
                  >
                    Export selected
                  </Button>

                  <Button
                    onClick={bulkVerify}
                    className={cn(
                      "rounded-2xl bg-emerald-600 text-white shadow-soft transition",
                      "hover:bg-emerald-500"
                    )}
                  >
                    Verify selected
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={bulkFlag}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 hover:bg-rose-100"
                  >
                    Flag selected
                  </Button>

                  <button
                    type="button"
                    onClick={bulkClear}
                    className="text-xs font-semibold text-zinc-700 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Table + Details */}
          <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
            {/* Table */}
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/60">
              <div className="overflow-x-auto">
                <table className="min-w-[1120px] w-full border-collapse">
                  <thead className="bg-white">
                    <tr className="border-b border-zinc-100">
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          ref={(el) => {
                            if (!el) return;
                            el.indeterminate = someVisibleSelected;
                          }}
                          onChange={() => toggleAllVisible()}
                          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
                        />
                      </th>
                      <SortTh
                        label="Farm"
                        active={sort.key === "name"}
                        dir={sort.dir}
                        onClick={() => toggleSort("name")}
                      />
                      <SortTh
                        label="State"
                        active={sort.key === "state"}
                        dir={sort.dir}
                        onClick={() => toggleSort("state")}
                      />
                      <Th>Owner</Th>
                      <Th>Crop</Th>
                      <SortTh
                        label="Area (ha)"
                        active={sort.key === "areaHa"}
                        dir={sort.dir}
                        onClick={() => toggleSort("areaHa")}
                        alignRight
                      />
                      <SortTh
                        label="Agents"
                        active={sort.key === "agentsCount"}
                        dir={sort.dir}
                        onClick={() => toggleSort("agentsCount")}
                        alignRight
                      />
                      <SortTh
                        label="Updated"
                        active={sort.key === "updatedAt"}
                        dir={sort.dir}
                        onClick={() => toggleSort("updatedAt")}
                      />
                      <SortTh
                        label="Status"
                        active={sort.key === "status"}
                        dir={sort.dir}
                        onClick={() => toggleSort("status")}
                      />
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6">
                          <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-center">
                            <p className="text-sm font-semibold text-zinc-900">
                              No farms found
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                              Try adjusting search or filters.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((f) => {
                        const active = f.id === selectedId;

                        return (
                          <tr
                            key={f.id}
                            className={cn(
                              "border-b border-zinc-100 transition",
                              active ? "bg-zinc-900/[0.03]" : "hover:bg-white"
                            )}
                          >
                            <Td className="w-[40px]">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(f.id)}
                                onChange={() => toggleOne(f.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
                              />
                            </Td>

                            <Td>
                              <button
                                onClick={() => openDetails(f.id)}
                                className="group flex w-full items-start gap-3 text-left"
                              >
                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-zinc-200 bg-white text-xs font-bold text-zinc-900">
                                  {initials(f.ownerName)}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-zinc-900 group-hover:underline">
                                      {f.name}
                                    </p>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                                      {f.code}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs text-zinc-600">
                                    {f.state}
                                    {f.lga ? ` • ${f.lga}` : ""}
                                    {f.community ? ` • ${f.community}` : ""}
                                  </p>

                                  {f.duplicateGroupId ? (
                                    <p className="mt-1 text-[11px] font-semibold text-indigo-700">
                                      Duplicate group: {f.duplicateGroupId}
                                    </p>
                                  ) : null}
                                </div>
                              </button>
                            </Td>

                            <Td>
                              <p className="text-sm font-semibold text-zinc-900">
                                {f.state}
                              </p>
                              <p className="mt-1 text-xs text-zinc-600">
                                {f.lga ?? "—"}
                              </p>
                            </Td>

                            <Td>
                              <p className="text-sm font-semibold text-zinc-900">
                                {f.ownerName}
                              </p>
                              {f.ownerPhone ? (
                                <a
                                  className="mt-1 inline-flex text-xs font-semibold text-zinc-600 hover:underline"
                                  href={`tel:${f.ownerPhone}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {f.ownerPhone}
                                </a>
                              ) : (
                                <p className="mt-1 text-xs text-zinc-600">—</p>
                              )}
                            </Td>

                            <Td>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-800">
                                  {f.cropPrimary}
                                </span>
                                {f.cropSecondary ? (
                                  <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                                    {f.cropSecondary}
                                  </span>
                                ) : null}
                              </div>
                            </Td>

                            <Td className="text-right">
                              <span className="text-sm font-semibold text-zinc-900">
                                {f.areaHa.toFixed(2)}
                              </span>
                              <p className="mt-1 text-xs text-zinc-600">ha</p>
                            </Td>

                            <Td className="text-right">
                              <span className="text-sm font-semibold text-zinc-900">
                                {f.agentsCount}
                              </span>
                              <p className="mt-1 text-xs text-zinc-600">agents</p>
                            </Td>

                            <Td>
                              <p className="text-sm font-semibold text-zinc-900">
                                {formatRelative(f.updatedAt)}
                              </p>
                              <p className="mt-1 text-xs text-zinc-600">
                                {formatDateTime(f.updatedAt)}
                              </p>
                            </Td>

                            <Td>
                              <StatusBadge status={f.status} />
                            </Td>

                            <Td className="text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetails(f.id);
                                  }}
                                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
                                >
                                  View
                                </button>

                                {f.status !== "verified" ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onVerify(f.id);
                                    }}
                                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                                  >
                                    Verify
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onFlag(f.id);
                                    }}
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100"
                                  >
                                    Flag
                                  </button>
                                )}
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
                  {view === "duplicates" ? "duplicate" : ""} farms
                  {search.trim() ? (
                    <>
                      {" "}
                      • Matched by <span className="font-semibold text-zinc-900">search</span>
                    </>
                  ) : null}
                </p>
                <p className="text-xs text-zinc-500">
                  Tip: click a row to open details {isLg ? "on the right" : "in the sidebar"}.
                </p>
              </div>
            </div>

            {/* Right details (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-4 rounded-3xl border border-zinc-200 bg-white/60 p-5">
                <FarmDetails
                  farm={selected}
                  onVerify={onVerify}
                  onFlag={onFlag}
                  onClearFlag={onClearFlag}
                />
              </div>
            </div>
          </div>

          {/* Mobile drawer */}
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title={selected?.name ?? "Farm details"}
          >
            <FarmDetails
              farm={selected}
              onVerify={onVerify}
              onFlag={onFlag}
              onClearFlag={onClearFlag}
            />
          </Drawer>
        </div>
      </SectionCard>
    </div>
  );
}