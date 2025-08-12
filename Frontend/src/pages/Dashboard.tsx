import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import GrafanaDashboard, {
  GrafanaPanelConfig,
} from "../components/GrafanaDashboard";
import { useDashboardContext } from "../contexts/DashboardContext";

function Dashboard() {
  const { pinnedPanels, refreshPinnedPanels } = useDashboardContext();

  useEffect(() => {
    console.log("Dashboard: Component mounted, refreshing pinned panels...");
    refreshPinnedPanels();
  }, [refreshPinnedPanels]);

  useEffect(() => {
    console.log("Dashboard: pinnedPanels changed:", pinnedPanels);
  }, [pinnedPanels]);

  // Debug logging on every render
  console.log(
    "Dashboard: Render - pinnedPanels:",
    pinnedPanels,
    "refreshPinnedPanels function:",
    typeof refreshPinnedPanels
  );

  return (
    <div className="flex h-screen w-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                Pinned Dashboard
              </h1>
              <div className="text-sm text-muted-foreground">
                {pinnedPanels.length} pinned panel
                {pinnedPanels.length !== 1 ? "s" : ""}
              </div>
            </div>

            {pinnedPanels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Pinned Panels
                </h3>
                <p className="text-muted-foreground mb-4">
                  Pin panels from the Metrics page to see them here on your
                  dashboard.
                </p>
                <a
                  href="/metrics"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Go to Metrics
                </a>
              </div>
            ) : (
              <div className="h-[calc(100vh-200px)]">
                <GrafanaDashboard
                  panels={pinnedPanels}
                  pinnedPanels={pinnedPanels}
                  onLayoutChange={() => {}} // No layout changes on dashboard page
                  isEditable={false} // Dashboard page is read-only
                  showPinIcons={false} // Don't show pin icons on dashboard page
                />
              </div>
            )}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
