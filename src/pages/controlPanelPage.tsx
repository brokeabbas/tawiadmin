// tawiadmin/src/pages/controlPanelPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { ControlPanelSidebar, ControlPanelTopBar } from "../components/controlPanel";
import type { Range } from "../components/controlPanel/ControlPanelTopBar";
import {
  activity,
  getStats,
  verificationQueue,
  type ActivityItem,
  type Stats,
  type VerificationQueueItem,
} from "./controlPanel/controlPanelData";

const AUTH_KEY = "tawi_admin_authed";

export type ControlPanelOutletContext = {
  range: Range;
  setRange: (v: Range) => void;
  stats: Stats;
  verificationQueue: VerificationQueueItem[];
  activity: ActivityItem[];
};

export function useControlPanelContext() {
  return useOutletContext<ControlPanelOutletContext>();
}

export default function ControlPanelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [range, setRange] = useState<Range>("7d");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // guard
  useEffect(() => {
    const authed = localStorage.getItem(AUTH_KEY) === "1";
    if (!authed) navigate("/login", { replace: true });
  }, [navigate]);

  const stats = useMemo(() => getStats(range), [range]);

  const activeId = useMemo(() => {
    const segs = location.pathname.split("/").filter(Boolean);
    const last = segs[segs.length - 1];
    if (!last || last === "control-panel") return "insights";
    if (last === "overview") return "insights"; // legacy alias
    return last;
  }, [location.pathname]);

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    navigate("/login", { replace: true });
  }

  const ctx: ControlPanelOutletContext = {
    range,
    setRange,
    stats,
    verificationQueue,
    activity,
  };

  return (
    <div className="relative h-screen overflow-hidden bg-zinc-50 text-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(244,244,245,0.85)_70%,rgba(244,244,245,1)_100%)]" />
      </div>

      <div className="relative z-10 flex h-screen">
        <ControlPanelSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeId={activeId}
          onSelect={(id) => {
            navigate(`/control-panel/${id}`);
          }}
        />

        <div className="min-w-0 flex flex-1 flex-col">
          {/* TopBar is outside the scroll container => never scrolls */}
          <ControlPanelTopBar
            range={range}
            onRangeChange={setRange}
            onExport={() => alert("Hook: create export")}
            onLogout={logout}
            onGoHome={() => navigate("/", { replace: true })}
            onOpenSidebar={() => setSidebarOpen(true)}
            online
            activeId={activeId}
          />

          {/* Only this area scrolls */}
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <Outlet context={ctx} />

            <p className="mt-8 text-center text-xs text-zinc-500">
              © {new Date().getFullYear()} • Tawi • Admin dashboard (placeholder UI)
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}