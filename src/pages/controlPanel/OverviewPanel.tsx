import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, cn } from "../../components/reusable/atoms";
import { useControlPanelContext } from "../controlPanelPage";
import { SectionCard } from "./controlPanelCards";
import { getInsightTrends, largestFarms, stateInsights, topAreaCaptures } from "./controlPanelData";

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function formatHa(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k ha`;
  return `${n.toFixed(0)} ha`;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return mounted;
}

/** ---------- Tiny chart components (no deps) ---------- */

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const mounted = useMounted();

  const { pathD, areaD } = useMemo(() => {
    const w = 120;
    const h = 34;
    const pad = 3;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = Math.max(1, max - min);

    const pts = data.map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
      const y = pad + (h - pad * 2) * (1 - (v - min) / span);
      return { x, y };
    });

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;

    return { pathD: line, areaD: area };
  }, [data]);

  return (
    <svg viewBox="0 0 120 34" className={cn("h-9 w-28", className)} aria-hidden="true">
      <path d={areaD} fill="currentColor" opacity={0.12} />
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={mounted ? 0 : 1}
        className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700 motion-safe:ease-out"
      />
    </svg>
  );
}

type LineSeries = {
  name: string;
  values: number[];
  className: string; // e.g. "text-emerald-600"
};

function MultiLineChart({ labels, series }: { labels: string[]; series: LineSeries[] }) {
  const mounted = useMounted();

  const { paths, maxY } = useMemo(() => {
    const w = 560;
    const h = 220;
    const padX = 18;
    const padY = 18;

    const all = series.flatMap((s) => s.values);
    const max = Math.max(1, ...all);
    const maxY = max;

    const mkPath = (values: number[]) => {
      const pts = values.map((v, i) => {
        const x = padX + (i * (w - padX * 2)) / Math.max(1, values.length - 1);
        const y = padY + (h - padY * 2) * (1 - v / maxY);
        return { x, y };
      });
      return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    };

    return { paths: series.map((s) => mkPath(s.values)), maxY };
  }, [series]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className={cn("h-2.5 w-2.5 rounded-full", s.className, "bg-current")} />
              <span className="font-semibold text-zinc-700">{s.name}</span>
            </div>
          ))}
        </div>

        <div className="text-[11px] font-semibold text-zinc-500">
          Range: <span className="text-zinc-700">{labels[0]}</span> →{" "}
          <span className="text-zinc-700">{labels[labels.length - 1]}</span>
          {"  "}•{" "}
          <span className="text-zinc-600">max {formatNumber(Math.round(maxY))}</span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-zinc-200/80 bg-white/60 p-3">
        <svg viewBox="0 0 560 220" className="h-56 w-full" aria-hidden="true">
          {/* grid lines */}
          <g opacity={0.7}>
            {[0.25, 0.5, 0.75].map((t) => {
              const y = 18 + (220 - 36) * t;
              return (
                <line
                  key={t}
                  x1={18}
                  x2={542}
                  y1={y}
                  y2={y}
                  stroke="rgb(228 228 231)"
                  strokeWidth={1}
                />
              );
            })}
          </g>

          {/* series */}
          {paths.map((d, idx) => (
            <path
              key={series[idx].name}
              d={d}
              fill="none"
              stroke="currentColor"
              className={series[idx].className}
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={mounted ? 0 : 1}
              style={{ transition: "stroke-dashoffset 900ms ease-out" }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function DonutBreakdown({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number; className: string }[];
}) {
  const mounted = useMounted();
  const total = items.reduce((a, b) => a + b.value, 0) || 1;

  const r = 16;
  const c = 2 * Math.PI * r;

  let acc = 0;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          <p className="mt-1 text-xs text-zinc-600">Quality control distribution</p>
        </div>
        <div className="text-xs font-semibold text-zinc-700">{formatNumber(total)}</div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <svg viewBox="0 0 48 48" className="h-16 w-16 shrink-0" aria-hidden="true">
          <circle cx="24" cy="24" r={r} stroke="rgb(228 228 231)" strokeWidth="10" fill="none" />
          {items.map((it) => {
            const frac = it.value / total;
            const dash = c * frac;
            const off = c * (1 - acc);
            acc += frac;

            return (
              <circle
                key={it.label}
                cx="24"
                cy="24"
                r={r}
                stroke="currentColor"
                className={it.className}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={mounted ? off : c}
                style={{ transition: "stroke-dashoffset 900ms ease-out" }}
              />
            );
          })}
        </svg>

        <div className="grid flex-1 gap-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full bg-current", it.className)} />
                <span className="text-xs font-semibold text-zinc-700">{it.label}</span>
              </div>
              <span className="text-xs font-semibold text-zinc-900">{formatNumber(it.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ---------- Heatmap components (FAANG-ish) ---------- */

function compactNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return formatNumber(n);
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function bucketIndex(value: number, min: number, max: number, steps: number) {
  const span = Math.max(1e-9, max - min);
  const t = clamp01((value - min) / span);
  return Math.min(steps - 1, Math.floor(t * steps));
}

type HeatPalette = "emerald" | "violet" | "sky" | "amber" | "rose";

function heatClasses(palette: HeatPalette, b: number) {
  // 0..6 (7 steps) from very light to very strong
  const map: Record<HeatPalette, string[]> = {
    emerald: [
      "bg-emerald-50 text-emerald-900 ring-emerald-200",
      "bg-emerald-100 text-emerald-900 ring-emerald-200",
      "bg-emerald-200 text-emerald-950 ring-emerald-300",
      "bg-emerald-300 text-emerald-950 ring-emerald-300",
      "bg-emerald-400 text-white ring-emerald-400",
      "bg-emerald-500 text-white ring-emerald-500",
      "bg-emerald-600 text-white ring-emerald-600",
    ],
    violet: [
      "bg-violet-50 text-violet-900 ring-violet-200",
      "bg-violet-100 text-violet-900 ring-violet-200",
      "bg-violet-200 text-violet-950 ring-violet-300",
      "bg-violet-300 text-violet-950 ring-violet-300",
      "bg-violet-400 text-white ring-violet-400",
      "bg-violet-500 text-white ring-violet-500",
      "bg-violet-600 text-white ring-violet-600",
    ],
    sky: [
      "bg-sky-50 text-sky-900 ring-sky-200",
      "bg-sky-100 text-sky-900 ring-sky-200",
      "bg-sky-200 text-sky-950 ring-sky-300",
      "bg-sky-300 text-sky-950 ring-sky-300",
      "bg-sky-400 text-white ring-sky-400",
      "bg-sky-500 text-white ring-sky-500",
      "bg-sky-600 text-white ring-sky-600",
    ],
    amber: [
      "bg-amber-50 text-amber-900 ring-amber-200",
      "bg-amber-100 text-amber-900 ring-amber-200",
      "bg-amber-200 text-amber-950 ring-amber-300",
      "bg-amber-300 text-amber-950 ring-amber-300",
      "bg-amber-400 text-white ring-amber-400",
      "bg-amber-500 text-white ring-amber-500",
      "bg-amber-600 text-white ring-amber-600",
    ],
    rose: [
      "bg-rose-50 text-rose-900 ring-rose-200",
      "bg-rose-100 text-rose-900 ring-rose-200",
      "bg-rose-200 text-rose-950 ring-rose-300",
      "bg-rose-300 text-rose-950 ring-rose-300",
      "bg-rose-400 text-white ring-rose-400",
      "bg-rose-500 text-white ring-rose-500",
      "bg-rose-600 text-white ring-rose-600",
    ],
  };

  const idx = Math.max(0, Math.min(map[palette].length - 1, b));
  return map[palette][idx];
}

function HeatLegend({
  palette,
  labelLow = "Low",
  labelHigh = "High",
}: {
  palette: HeatPalette;
  labelLow?: string;
  labelHigh?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-500">
      <span>{labelLow}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 7 }).map((_, i) => {
          const cls = heatClasses(palette, i).split(" ");
          const bg = cls.find((x) => x.startsWith("bg-")) ?? "bg-zinc-200";
          const ring = cls.find((x) => x.startsWith("ring-")) ?? "ring-zinc-200";
          return <span key={i} className={cn("h-2.5 w-2.5 rounded-sm ring-1 ring-inset", bg, ring)} />;
        })}
      </div>
      <span>{labelHigh}</span>
    </div>
  );
}

function HeatCell({
  palette,
  value,
  min,
  max,
  label,
  meta,
}: {
  palette: HeatPalette;
  value: number;
  min: number;
  max: number;
  label: string;
  meta?: string;
}) {
  const b = bucketIndex(value, min, max, 7);
  const cls = heatClasses(palette, b);

  return (
    <div className="group relative">
      <div
        className={cn(
          "h-11 w-11 rounded-xl ring-1 ring-inset",
          "grid place-items-center",
          "motion-safe:transition motion-safe:duration-200",
          "hover:-translate-y-0.5 hover:shadow-sm",
          cls
        )}
        title={`${label}: ${formatNumber(value)}${meta ? ` • ${meta}` : ""}`}
        aria-label={`${label}: ${formatNumber(value)}`}
      >
        <span className="text-[11px] font-extrabold tracking-tight">{compactNumber(value)}</span>
      </div>

      {/* tooltip */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl",
          "border border-zinc-200 bg-white/95 px-3 py-2 shadow-lg",
          "opacity-0 translate-y-1",
          "group-hover:opacity-100 group-hover:translate-y-0",
          "motion-safe:transition motion-safe:duration-200"
        )}
      >
        <p className="text-xs font-semibold text-zinc-900">{label}</p>
        <p className="mt-0.5 text-[11px] text-zinc-600">
          <span className="font-semibold text-zinc-900">{formatNumber(value)}</span>
          {meta ? <span className="text-zinc-500"> • {meta}</span> : null}
        </p>
      </div>
    </div>
  );
}

function CoverageHeatmap({
  rows,
}: {
  rows: {
    state: string;
    locations: number;
    captures: number;
    hectaresTotal: number;
    agents: number;
    farms: number;
  }[];
}) {
  const mounted = useMounted();

  const ranges = useMemo(() => {
    const locs = rows.map((r) => r.locations);
    const caps = rows.map((r) => r.captures);
    const hect = rows.map((r) => r.hectaresTotal);

    return {
      loc: { min: Math.min(...locs), max: Math.max(...locs) },
      cap: { min: Math.min(...caps), max: Math.max(...caps) },
      hect: { min: Math.min(...hect), max: Math.max(...hect) },
    };
  }, [rows]);

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">State coverage heatmap</p>
          <p className="mt-1 text-xs text-zinc-600">
            Rows are states. Cell intensity shows relative strength per metric (hover for details).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
            <span>Locations</span>
          </div>
          <HeatLegend palette="emerald" />

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-sm bg-violet-600" />
            <span>Captures</span>
          </div>
          <div className="hidden sm:block">
            <HeatLegend palette="violet" />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" />
            <span>Hectares</span>
          </div>
          <div className="hidden lg:block">
            <HeatLegend palette="sky" />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white/70",
          mounted ? "opacity-100" : "opacity-0 motion-safe:transition motion-safe:duration-300"
        )}
      >
        {/* header */}
        <div className="grid grid-cols-[1fr,auto,auto,auto] gap-3 border-b border-zinc-200/80 bg-zinc-50/70 px-4 py-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">State</div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">Locations</div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">Captures</div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">Hectares</div>
        </div>

        {/* body */}
        <div className="max-h-[420px] overflow-auto">
          {rows.map((r) => (
            <div
              key={r.state}
              className={cn(
                "grid grid-cols-[1fr,auto,auto,auto] items-center gap-3 px-4 py-3",
                "border-b border-zinc-200/60 last:border-b-0",
                "hover:bg-white"
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-900">{r.state}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {formatNumber(r.agents)} agents • {formatNumber(r.farms)} farms
                </p>
              </div>

              <HeatCell
                palette="emerald"
                value={r.locations}
                min={ranges.loc.min}
                max={ranges.loc.max}
                label={`${r.state} • Locations`}
                meta={`${formatNumber(r.agents)} agents`}
              />

              <HeatCell
                palette="violet"
                value={r.captures}
                min={ranges.cap.min}
                max={ranges.cap.max}
                label={`${r.state} • Captures`}
                meta={`${formatNumber(r.farms)} farms`}
              />

              <HeatCell
                palette="sky"
                value={r.hectaresTotal}
                min={ranges.hect.min}
                max={ranges.hect.max}
                label={`${r.state} • Hectares`}
                meta={formatHa(r.hectaresTotal)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TileHeatmap({
  title,
  subtitle,
  palette,
  items,
  onItemClick,
}: {
  title: string;
  subtitle?: string;
  palette: HeatPalette;
  items: { key: string; label: string; value: number; meta?: string; submeta?: string }[];
  onItemClick?: (key: string) => void;
}) {
  const { min, max } = useMemo(() => {
    const vals = items.map((i) => i.value);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [items]);

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-zinc-600">{subtitle}</p> : null}
        </div>
        <HeatLegend palette={palette} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((it) => {
          const b = bucketIndex(it.value, min, max, 7);
          const cls = heatClasses(palette, b);

          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onItemClick?.(it.key)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-4 text-left",
                "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20",
                "motion-safe:transition"
              )}
              title={`${it.label}: ${formatNumber(it.value)}${it.meta ? ` • ${it.meta}` : ""}`}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 motion-safe:transition">
                <div className="absolute -left-10 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.06),transparent_60%)]" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-900">{it.label}</p>
                  {it.meta ? <p className="mt-1 text-[11px] text-zinc-600">{it.meta}</p> : null}
                  {it.submeta ? <p className="mt-1 text-[11px] text-zinc-500">{it.submeta}</p> : null}
                </div>

                <div className={cn("shrink-0 rounded-2xl px-3 py-2 ring-1 ring-inset", cls)}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Heat</p>
                  <p className="text-sm font-extrabold leading-none">{compactNumber(it.value)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FarmTreemapHeat({
  items,
}: {
  items: { key: string; label: string; hectares: number; meta?: string }[];
}) {
  const { min, max } = useMemo(() => {
    const vals = items.map((i) => i.hectares);
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [items]);

  const spanFor = (v: number) => {
    // treemap-ish: bigger farms take more columns
    const t = clamp01((v - min) / Math.max(1e-9, max - min));
    if (t > 0.8) return "sm:col-span-4 col-span-6";
    if (t > 0.55) return "sm:col-span-3 col-span-6";
    if (t > 0.3) return "sm:col-span-2 col-span-6";
    return "sm:col-span-2 col-span-6";
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Farm scale heat grid</p>
          <p className="mt-1 text-xs text-zinc-600">Tile size + intensity follow hectares captured (treemap-style).</p>
        </div>
        <HeatLegend palette="emerald" />
      </div>

      <div className="mt-4 grid grid-cols-6 gap-3">
        {items.map((it) => {
          const b = bucketIndex(it.hectares, min, max, 7);
          const cls = heatClasses("emerald", b);

          return (
            <div
              key={it.key}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-4",
                "motion-safe:transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm",
                spanFor(it.hectares)
              )}
              title={`${it.label}: ${formatNumber(it.hectares)} ha`}
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_60%)]" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-900">{it.label}</p>
                  {it.meta ? <p className="mt-1 truncate text-[11px] text-zinc-600">{it.meta}</p> : null}
                  <p className="mt-2 text-[11px] font-semibold text-zinc-500">Hectares</p>
                </div>

                <div className={cn("shrink-0 rounded-2xl px-3 py-2 ring-1 ring-inset", cls)}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">Scale</p>
                  <p className="text-sm font-extrabold leading-none">{formatHa(it.hectares)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ---------- KPI card ---------- */

function KpiCard({
  title,
  value,
  hint,
  trend,
  accentClass = "text-emerald-600",
  right,
}: {
  title: string;
  value: string;
  hint?: string;
  trend?: number[];
  accentClass?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/60 p-4",
        "ring-1 ring-inset ring-zinc-900/5 shadow-soft"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.10),transparent_45%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      {trend?.length ? (
        <div className="relative mt-3 flex items-end justify-between gap-3">
          <div className={cn("inline-flex items-center gap-2 text-xs font-semibold", accentClass)}>
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>Trend</span>
          </div>
          <Sparkline data={trend} className={cn(accentClass)} />
        </div>
      ) : null}
    </div>
  );
}

/** ---------- Page ---------- */

export default function ControlPanelOverviewPanel() {
  const navigate = useNavigate();
  const { range, stats, verificationQueue, activity } = useControlPanelContext();

  const trends = useMemo(() => getInsightTrends(range), [range]);

  const approvalsSeries = trends.map((x) => x.approved);
  const rejectedSeries = trends.map((x) => x.rejected);
  const flaggedSeries = trends.map((x) => x.flagged);
  const capturesSeries = trends.map((x) => x.captures);
  const jobsSeries = trends.map((x) => x.jobs);
  const labels = trends.map((x) => x.label);

  const coverageRows = useMemo(
    () =>
      [...stateInsights]
        .sort((a, b) => b.captures - a.captures)
        .map((x) => ({
          state: x.state,
          locations: x.locations,
          captures: x.captures,
          hectaresTotal: x.hectaresTotal,
          agents: x.agents,
          farms: x.farms,
        })),
    []
  );

  const hotspotTiles = useMemo(
    () =>
      [...topAreaCaptures]
        .sort((a, b) => b.captures - a.captures)
        .slice(0, 10)
        .map((x) => ({
          key: `${x.state}-${x.lga}-${x.ward}`,
          label: `${x.state} • ${x.lga}`,
          value: x.captures,
          meta: `${x.ward} • ${formatNumber(x.locations)} locations`,
          submeta: "Heat driven by captures",
        })),
    []
  );

  const farmTiles = useMemo(
    () =>
      [...largestFarms]
        .sort((a, b) => b.hectares - a.hectares)
        .slice(0, 10)
        .map((x) => ({
          key: x.name,
          label: x.name,
          hectares: x.hectares,
          meta: `${x.state} • ${x.lga} • last: ${x.lastCaptured}`,
        })),
    []
  );

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Insights</p>
          <p className="mt-1 text-xs text-zinc-600">
            Animated trends, coverage distribution, hotspots, and farm scale signals for{" "}
            <span className="font-semibold">{range}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate("/control-panel/queue")}
            className={cn(
              "rounded-2xl border border-zinc-200 bg-white/70 text-zinc-900",
              "hover:bg-white transition",
              "px-3 py-2 text-xs"
            )}
          >
            Open queue
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/control-panel/activity")}
            className={cn(
              "rounded-2xl border border-zinc-200 bg-white/70 text-zinc-900",
              "hover:bg-white transition",
              "px-3 py-2 text-xs"
            )}
          >
            View activity
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard
          title="Agents"
          value={formatNumber(stats.agents)}
          hint="Registered + active"
          trend={approvalsSeries.slice(-12)}
          accentClass="text-emerald-600"
        />
        <KpiCard
          title="Ongoing jobs"
          value={formatNumber(stats.ongoingJobs)}
          hint="In-progress tasks"
          trend={jobsSeries.slice(-12)}
          accentClass="text-sky-600"
        />
        <KpiCard
          title="Approved"
          value={formatNumber(stats.approved)}
          hint="QC completed"
          trend={approvalsSeries.slice(-12)}
          accentClass="text-emerald-600"
        />
        <KpiCard
          title="Rejected"
          value={formatNumber(stats.rejected)}
          hint="Failed validation"
          trend={rejectedSeries.slice(-12)}
          accentClass="text-rose-600"
        />
        <KpiCard
          title="Flagged"
          value={formatNumber(stats.flagged)}
          hint="Needs follow-up"
          trend={flaggedSeries.slice(-12)}
          accentClass="text-amber-600"
        />
        <KpiCard
          title="Active locations"
          value={formatNumber(stats.activeLocations)}
          hint="Reporting in range"
          trend={capturesSeries.slice(-12)}
          accentClass="text-violet-600"
        />
      </div>

      {/* Trends + QC breakdown */}
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <SectionCard title="Operational trends">
            <MultiLineChart
              labels={labels}
              series={[
                { name: "Approved", values: approvalsSeries, className: "text-emerald-600" },
                { name: "Captures", values: capturesSeries, className: "text-violet-600" },
                { name: "Jobs", values: jobsSeries, className: "text-sky-600" },
              ]}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Today vs drift</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">Anomaly watch</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Trending flags + rejections indicate GPS overlap / identity mismatches.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Throughput</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {formatNumber(approvalsSeries.reduce((a, b) => a + b, 0))}
                </p>
                <p className="mt-1 text-xs text-zinc-600">Total approvals in selected range</p>
              </div>

              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Capture volume</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  {formatNumber(capturesSeries.reduce((a, b) => a + b, 0))}
                </p>
                <p className="mt-1 text-xs text-zinc-600">Total captures in selected range</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="xl:col-span-4">
          <SectionCard title="Quality control insights">
            <div className="grid gap-4">
              <DonutBreakdown
                title="QC status"
                items={[
                  { label: "Approved", value: stats.approved, className: "text-emerald-600" },
                  { label: "Pending", value: stats.pending, className: "text-sky-600" },
                  { label: "Flagged", value: stats.flagged, className: "text-amber-600" },
                  { label: "Rejected", value: stats.rejected, className: "text-rose-600" },
                ]}
              />

              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
                <p className="text-sm font-semibold text-zinc-900">Queue snapshot</p>
                <p className="mt-1 text-xs text-zinc-600">Next 3 items needing action</p>

                <div className="mt-3 grid gap-2">
                  {verificationQueue.slice(0, 3).map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => navigate("/control-panel/queue")}
                      className={cn(
                        "w-full rounded-2xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-left transition",
                        "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-zinc-900">{x.id}</p>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                          {x.type}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-600">
                        {x.location} • {x.age}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Coverage + Hotspots + Farms (Heatmap UI) */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Coverage */}
        <div className="xl:col-span-4">
          <SectionCard title="Coverage by state">
            <CoverageHeatmap rows={coverageRows} />
          </SectionCard>
        </div>

        {/* Hotspots */}
        <div className="xl:col-span-4">
          <SectionCard title="Hotspots">
            <div className="grid gap-4">
              <TileHeatmap
                title="Capture intensity"
                subtitle="Top LGAs/Wards (heat = captures)"
                palette="violet"
                items={hotspotTiles}
                // onItemClick={(key) => navigate(`/control-panel/hotspots?key=${encodeURIComponent(key)}`)}
              />

              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
                <p className="text-sm font-semibold text-zinc-900">Activity pulse</p>
                <p className="mt-1 text-xs text-zinc-600">Last 4 updates</p>

                <div className="mt-3 grid gap-2">
                  {activity.slice(0, 4).map((x, idx) => (
                    <div key={`${x.t}-${idx}`} className="rounded-2xl border border-zinc-200/80 bg-white/70 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900">{x.t}</p>
                          <p className="mt-1 truncate text-[11px] text-zinc-600">{x.d}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-zinc-500">{x.when}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Farms */}
        <div className="xl:col-span-4">
          <SectionCard title="Farm scale signals">
            <div className="grid gap-4">
              <FarmTreemapHeat items={farmTiles} />

              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-4">
                <p className="text-sm font-semibold text-zinc-900">Next actions</p>
                <p className="mt-1 text-xs text-zinc-600">Fast navigation for ops workflows</p>

                <div className="mt-3 grid gap-2">
                  {[
                    { title: "Review QC queue", desc: "Approve / flag / reject submissions", onClick: () => navigate("/control-panel/queue") },
                    { title: "Open exports", desc: "Generate Excel/CSV/PDF reports", onClick: () => alert("Hook: exports center") },
                    { title: "Investigate duplicates", desc: "GPS overlap + identity checks", onClick: () => alert("Hook: duplicate detection") },
                  ].map((it) => (
                    <button
                      key={it.title}
                      type="button"
                      onClick={it.onClick}
                      className={cn(
                        "w-full rounded-2xl border border-zinc-200/80 bg-white/70 px-4 py-3 text-left transition",
                        "hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                      )}
                    >
                      <p className="text-xs font-semibold text-zinc-900">{it.title}</p>
                      <p className="mt-1 text-[11px] text-zinc-600">{it.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}