import { Outlet } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import GrafanaDashboard, {
  GrafanaPanelConfig,
} from "../components/GrafanaDashboard";
import { useDashboardContext } from "../contexts/DashboardContext";

interface DashboardLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

function Dashboard() {
  const { pinnedPanels, refreshPinnedPanels } = useDashboardContext();
  const [dashboardLayouts, setDashboardLayouts] = useState<Record<string, DashboardLayout>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Load dashboard layouts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_layouts_v1');
    if (saved) {
      try {
        setDashboardLayouts(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse dashboard layouts:', error);
      }
    }
  }, []);

  // Save dashboard layouts to localStorage
  const saveDashboardLayouts = useCallback((layouts: Record<string, DashboardLayout>) => {
    setDashboardLayouts(layouts);
    localStorage.setItem('dashboard_layouts_v1', JSON.stringify(layouts));
  }, []);

  // Clean up layouts for panels that are no longer pinned
  useEffect(() => {
    const pinnedIds = new Set(pinnedPanels.map(p => p.id));
    const cleanedLayouts = Object.fromEntries(
      Object.entries(dashboardLayouts).filter(([id]) => pinnedIds.has(id))
    );
    
    if (Object.keys(cleanedLayouts).length !== Object.keys(dashboardLayouts).length) {
      saveDashboardLayouts(cleanedLayouts);
    }
  }, [pinnedPanels, dashboardLayouts, saveDashboardLayouts]);

  // Generate default layout for a panel at given index
  const getDefaultLayout = useCallback((index: number): DashboardLayout => ({
    x: (index % 2) * 6, // 2 columns of width 6
    y: Math.floor(index / 2) * 3, // 3 rows height each
    w: 6,
    h: 3,
  }), []);

  // Derive display panels with dashboard-specific layouts
  const displayPanels = useMemo(() => {
    return pinnedPanels.map((panel, index) => ({
      ...panel,
      ...dashboardLayouts[panel.id] || getDefaultLayout(index),
    }));
  }, [pinnedPanels, dashboardLayouts, getDefaultLayout]);

  // Handle layout changes from drag/resize
  const handleLayoutChange = useCallback((layout: any[]) => {
    const newLayouts: Record<string, DashboardLayout> = {};
    
    layout.forEach((layoutItem) => {
      if (layoutItem.i) {
        newLayouts[layoutItem.i] = {
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
    });
    
    saveDashboardLayouts(newLayouts);
  }, [saveDashboardLayouts]);

  useEffect(() => {
    console.log("Dashboard: Component mounted, refreshing pinned panels...");
    refreshPinnedPanels();
  }, [refreshPinnedPanels]);

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
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {displayPanels.length} pinned panel
                  {displayPanels.length !== 1 ? "s" : ""}
                </div>
                {displayPanels.length > 0 && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      isEditing
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {isEditing ? "Done Editing" : "Edit Layout"}
                  </button>
                )}
              </div>
            </div>

            {displayPanels.length === 0 ? (
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
                  panels={displayPanels}
                  pinnedPanels={pinnedPanels}
                  onLayoutChange={handleLayoutChange}
                  isEditable={isEditing}
                  showPinIcons={false}
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
