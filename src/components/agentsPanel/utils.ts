import type { AgentStatus } from "./types";

export function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function compactNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return formatNumber(n);
  }
}

export function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function bucketIndex(value: number, min: number, max: number, steps: number) {
  const span = Math.max(1e-9, max - min);
  const t = clamp01((value - min) / span);
  return Math.min(steps - 1, Math.floor(t * steps));
}

export function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "G";
  return `${a}${b}`.toUpperCase();
}

export function statusPill(status: AgentStatus) {
  switch (status) {
    case "Active":
      return { dot: "bg-emerald-500", chip: "border-emerald-200/70 bg-emerald-50/60 text-emerald-800" };
    case "Pending":
      return { dot: "bg-sky-500", chip: "border-sky-200/70 bg-sky-50/60 text-sky-800" };
    case "Suspended":
      return { dot: "bg-rose-500", chip: "border-rose-200/70 bg-rose-50/60 text-rose-800" };
    case "Offline":
    default:
      return { dot: "bg-zinc-400", chip: "border-zinc-200 bg-white/60 text-zinc-700" };
  }
}

/**
 * Parses "5m", "1h", "2d" into minutes for sorting.
 * Unknown formats fall back to a large number (least recent).
 */
export function lastActiveToMinutes(value: string) {
  const s = value.trim().toLowerCase();
  const m = s.match(/^(\d+)\s*([mhd])$/);
  if (!m) return Number.POSITIVE_INFINITY;
  const num = Number(m[1]);
  const unit = m[2];
  if (!Number.isFinite(num)) return Number.POSITIVE_INFINITY;

  if (unit === "m") return num;
  if (unit === "h") return num * 60;
  if (unit === "d") return num * 60 * 24;
  return Number.POSITIVE_INFINITY;
}