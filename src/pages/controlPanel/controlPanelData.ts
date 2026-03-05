// tawiadmin/src/pages/controlPanel/controlPanelData.ts
import type { Range } from "../../components/controlPanel/ControlPanelTopBar";

export type Stats = {
  // QC
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;

  // Ops
  agents: number;
  ongoingJobs: number;
  activeLocations: number;
};

export type VerificationQueueItem = {
  id: string;
  location: string;
  type: string;
  age: string;
  status: "Pending" | "Approved" | "Flagged" | "Rejected";
};

export type ActivityItem = {
  t: string;
  d: string;
  when: string;
};

export type InsightTrendPoint = {
  label: string;
  approved: number;
  rejected: number;
  flagged: number;
  captures: number;
  jobs: number;
};

export type StateInsight = {
  state: string;
  locations: number;
  agents: number;
  captures: number;
  farms: number;
  hectaresTotal: number;
  largestFarmHa: number;
};

export type AreaCapture = {
  state: string;
  lga: string;
  ward: string;
  captures: number;
  locations: number;
};

export type LargestFarm = {
  id: string;
  name: string;
  state: string;
  lga: string;
  hectares: number;
  lastCaptured: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * ✅ Core stats per range (demo values).
 * Replace these with API totals later — UI already supports richer metrics.
 */
export function getStats(range: Range): Stats {
  if (range === "Today")
    return {
      pending: 14,
      approved: 63,
      rejected: 7,
      flagged: 4,
      agents: 128,
      ongoingJobs: 42,
      activeLocations: 12,
    };

  if (range === "30d")
    return {
      pending: 88,
      approved: 1482,
      rejected: 121,
      flagged: 39,
      agents: 614,
      ongoingJobs: 190,
      activeLocations: 28,
    };

  // default (e.g. "7d")
  return {
    pending: 41,
    approved: 402,
    rejected: 33,
    flagged: 11,
    agents: 312,
    ongoingJobs: 96,
    activeLocations: 19,
  };
}

/**
 * ✅ Trend series per range (demo values).
 * For charts: approved / rejected / flagged / captures / jobs.
 */
export function getInsightTrends(range: Range): InsightTrendPoint[] {
  if (range === "Today") {
    const labels = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
    return labels.map((label, i) => {
      const wave = Math.sin(i / 2.4) * 6;
      const approved = clamp(Math.round(8 + i * 2.2 + wave), 0, 60);
      const rejected = clamp(Math.round(1 + (i % 5 === 0 ? 2 : 0) + Math.max(0, wave / 6)), 0, 10);
      const flagged = clamp(Math.round(1 + (i % 4 === 0 ? 1 : 0)), 0, 8);
      const captures = clamp(Math.round(12 + i * 3 + wave * 2), 0, 120);
      const jobs = clamp(Math.round(6 + i * 1.2 + wave / 2), 0, 50);
      return { label, approved, rejected, flagged, captures, jobs };
    });
  }

  // 7d-ish (default)
  if (range !== "30d") {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, i) => {
      const wave = Math.sin(i / 1.8) * 18;
      const approved = clamp(Math.round(45 + i * 9 + wave), 0, 220);
      const rejected = clamp(Math.round(4 + (i % 3) + Math.max(0, wave / 12)), 0, 35);
      const flagged = clamp(Math.round(3 + (i % 2) + Math.max(0, wave / 16)), 0, 28);
      const captures = clamp(Math.round(120 + i * 18 + wave * 2), 0, 520);
      const jobs = clamp(Math.round(28 + i * 4 + wave / 6), 0, 120);
      return { label, approved, rejected, flagged, captures, jobs };
    });
  }

  // 30d
  const labels = Array.from({ length: 14 }).map((_, i) => `W${i + 1}`);
  return labels.map((label, i) => {
    const wave = Math.sin(i / 1.6) * 40;
    const approved = clamp(Math.round(80 + i * 18 + wave), 0, 520);
    const rejected = clamp(Math.round(10 + (i % 4) * 3 + Math.max(0, wave / 10)), 0, 120);
    const flagged = clamp(Math.round(6 + (i % 3) * 2 + Math.max(0, wave / 16)), 0, 80);
    const captures = clamp(Math.round(220 + i * 38 + wave * 3), 0, 1400);
    const jobs = clamp(Math.round(60 + i * 9 + wave / 7), 0, 380);
    return { label, approved, rejected, flagged, captures, jobs };
  });
}

/**
 * ✅ State-level insights
 */
export const stateInsights: StateInsight[] = [
  { state: "Oyo", locations: 12, agents: 74, captures: 642, farms: 312, hectaresTotal: 18420, largestFarmHa: 212 },
  { state: "Kwara", locations: 7, agents: 38, captures: 418, farms: 186, hectaresTotal: 9320, largestFarmHa: 144 },
  { state: "Kaduna", locations: 9, agents: 66, captures: 590, farms: 274, hectaresTotal: 16110, largestFarmHa: 260 },
  { state: "Nasarawa", locations: 6, agents: 29, captures: 301, farms: 141, hectaresTotal: 7010, largestFarmHa: 118 },
  { state: "Kano", locations: 10, agents: 58, captures: 524, farms: 240, hectaresTotal: 14860, largestFarmHa: 308 },
  { state: "Lagos", locations: 5, agents: 44, captures: 210, farms: 66, hectaresTotal: 2100, largestFarmHa: 34 },
  { state: "Rivers", locations: 4, agents: 21, captures: 188, farms: 58, hectaresTotal: 1820, largestFarmHa: 29 },
];

/**
 * ✅ LGA/Ward capture hotspots
 */
export const topAreaCaptures: AreaCapture[] = [
  { state: "Kaduna", lga: "Chikun", ward: "Sabon Tasha", captures: 122, locations: 3 },
  { state: "Oyo", lga: "Akinyele", ward: "Moniya", captures: 108, locations: 2 },
  { state: "Kano", lga: "Dala", ward: "Kofar Mazugal", captures: 99, locations: 2 },
  { state: "Kwara", lga: "Ilorin East", ward: "Oke-Oyi", captures: 84, locations: 2 },
  { state: "Nasarawa", lga: "Keffi", ward: "Angwan Tiv", captures: 71, locations: 1 },
];

/**
 * ✅ Largest farms (by hectares)
 */
export const largestFarms: LargestFarm[] = [
  { id: "FRM-90012", name: "Greenbelt Cluster A", state: "Kano", lga: "Dawakin Kudu", hectares: 308, lastCaptured: "2d ago" },
  { id: "FRM-90044", name: "Riverbend Estate", state: "Kaduna", lga: "Chikun", hectares: 260, lastCaptured: "5d ago" },
  { id: "FRM-90007", name: "Moniya Plains", state: "Oyo", lga: "Akinyele", hectares: 212, lastCaptured: "Yesterday" },
  { id: "FRM-90031", name: "Ilorin Corridor", state: "Kwara", lga: "Ilorin East", hectares: 144, lastCaptured: "3d ago" },
  { id: "FRM-90019", name: "Keffi Ridge", state: "Nasarawa", lga: "Keffi", hectares: 118, lastCaptured: "1w ago" },
];

export const verificationQueue: VerificationQueueItem[] = [
  { id: "VFY-10291", location: "Oyo • Site 3", type: "GPS + Photo", age: "12m ago", status: "Pending" },
  { id: "VFY-10284", location: "Kwara • Site 1", type: "Photo", age: "34m ago", status: "Pending" },
  { id: "VFY-10277", location: "Kaduna • Site 2", type: "GPS", age: "1h ago", status: "Pending" },
  { id: "VFY-10263", location: "Nasarawa • Site 6", type: "GPS + Photo", age: "2h ago", status: "Pending" },
];

export const activity: ActivityItem[] = [
  { t: "Approved verification", d: "VFY-10270 • Oyo • Site 3", when: "15m ago" },
  { t: "Flagged anomaly", d: "Location drift detected • Kwara • Site 1", when: "1h ago" },
  { t: "Export generated", d: "Weekly ops report • PDF", when: "3h ago" },
  { t: "New location added", d: "Nasarawa • Site 6", when: "Yesterday" },
];