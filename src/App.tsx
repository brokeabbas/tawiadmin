// tawiadmin/src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

// Layout
import ControlPanelPage from "./pages/controlPanelPage";

// Panels
import ControlPanelOverviewPanel from "./pages/controlPanel/OverviewPanel";
import ControlPanelAgentsPanel from "./pages/controlPanel/AgentsPage";
import ControlPanelFarmsPanel from "./pages/controlPanel/FarmsPanel";
import ControlPanelQueuePanel from "./pages/controlPanel/QueuePanel";
import ControlPanelActionsPanel from "./pages/controlPanel/ActionsPanel";
import ControlPanelLocationsPanel from "./pages/controlPanel/LocationsPanel";
import ControlPanelActivityPanel from "./pages/controlPanel/ActivityPanel";
import ControlPanelManageAgentsPage from "./pages/controlPanel/ManageAgentsPage";

// ✅ NEW
import ControlPanelCooperativesPage from "./pages/controlPanel/CooperativesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Control Panel: Layout + nested panels */}
      <Route path="/control-panel" element={<ControlPanelPage />}>
        {/* Match sidebar default: Insights */}
        <Route index element={<Navigate to="insights" replace />} />

        {/* Sidebar routes */}
        <Route path="insights" element={<ControlPanelOverviewPanel />} />
        <Route path="agents" element={<ControlPanelAgentsPanel />} />
        <Route path="locations" element={<ControlPanelLocationsPanel />} />
        <Route path="farms" element={<ControlPanelFarmsPanel />} />

        {/* ✅ NEW: Cooperatives */}
        <Route path="cooperatives" element={<ControlPanelCooperativesPage />} />

        {/* Existing routes (not in sidebar yet, but valid via buttons) */}
        <Route path="queue" element={<ControlPanelQueuePanel />} />
        <Route path="actions" element={<ControlPanelActionsPanel />} />
        <Route path="activity" element={<ControlPanelActivityPanel />} />
        <Route path="manage-agents" element={<ControlPanelManageAgentsPage />} />

        {/* Legacy alias */}
        <Route path="overview" element={<Navigate to="../control-panel/insights" replace />} />
      </Route>

      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}