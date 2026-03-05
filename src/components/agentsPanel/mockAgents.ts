import type { Agent, AgentStatus } from "./types";
import { stateInsights, topAreaCaptures } from "../../pages/controlPanel/controlPanelData";

function pickLgaForState(state: string, idx: number) {
  const list = topAreaCaptures.filter((x) => x.state === state);
  if (!list.length) return "—";
  return list[idx % list.length].lga;
}

export function generateAgents(desiredCount: number): Agent[] {
  const first = [
    "Amina", "Chinedu", "Kemi", "Ibrahim", "Zainab", "Tolu", "Ada", "Sani", "Ngozi", "Femi",
    "Hauwa", "Segun", "Maryam", "Obinna", "Yusuf", "Bola", "Fatima", "Emeka", "Seyi", "Uche",
  ];
  const last = [
    "Okafor", "Adeyemi", "Balogun", "Ibrahim", "Mohammed", "Eze", "Adewale", "Nwachukwu",
    "Yakubu", "Ogunleye", "Onyeka", "Danladi", "Abubakar", "Okoro", "Ahmed", "Ojo",
  ];

  const sortedStates = [...stateInsights].sort((a, b) => b.agents - a.agents);
  const totalAgents = sortedStates.reduce((s, x) => s + x.agents, 0) || 1;

  const perState = sortedStates.map((s) => ({
    state: s.state,
    count: Math.max(1, Math.round((s.agents / totalAgents) * desiredCount)),
  }));

  let sum = perState.reduce((a, b) => a + b.count, 0);
  while (sum > desiredCount) {
    const i = perState.findIndex((x) => x.count > 1);
    if (i === -1) break;
    perState[i].count -= 1;
    sum -= 1;
  }
  while (sum < desiredCount) {
    perState[0].count += 1;
    sum += 1;
  }

  const statuses: AgentStatus[] = ["Active", "Active", "Active", "Pending", "Suspended", "Offline"];
  const relTimes = ["5m", "18m", "45m", "1h", "2h", "5h", "8h", "1d", "2d", "5d", "9d"];

  const out: Agent[] = [];
  let n = 1001;

  perState.forEach(({ state, count }, sIdx) => {
    for (let i = 0; i < count; i++) {
      const name = `${first[(n + i + sIdx) % first.length]} ${last[(n * 7 + i) % last.length]}`;
      const status = statuses[(n + i * 3) % statuses.length];
      const assignedJobs = (n + i * 11) % 19;
      const approvals = (n * 3 + i * 9) % 240;
      const rejections = (n + i * 5) % 36;
      const flagged = (n + i * 7) % 20;

      out.push({
        id: `AGT-${n}`,
        name,
        phone: `+234 80${(n % 10).toString()} ${(700 + (n % 300)).toString()} ${(1000 + (n % 9000)).toString()}`,
        state,
        lga: pickLgaForState(state, i),
        status,
        assignedJobs,
        approvals,
        rejections,
        flagged,
        lastActive: relTimes[(n + i) % relTimes.length],
      });

      n += 1;
    }
  });

  // stable-ish default ordering (Active first)
  const order: Record<AgentStatus, number> = { Active: 0, Pending: 1, Offline: 2, Suspended: 3 };
  return out.sort((a, b) => {
    const o = order[a.status] - order[b.status];
    if (o !== 0) return o;
    return b.approvals - a.approvals;
  });
}