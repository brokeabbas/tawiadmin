export type AgentStatus = "Active" | "Pending" | "Suspended" | "Offline";

export type Agent = {
  id: string;
  name: string;
  phone: string;
  state: string;
  lga: string;
  status: AgentStatus;
  assignedJobs: number;
  approvals: number;
  rejections: number;
  flagged: number;
  lastActive: string; // e.g. "5m", "1h", "2d"
  photoUrl?: string;
lat?: number;
lng?: number;
};