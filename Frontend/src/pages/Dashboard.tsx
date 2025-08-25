import { Outlet } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import GrafanaDashboard, {
  GrafanaPanelConfig,
} from "../components/GrafanaDashboard";
import { useDashboardContext } from "../contexts/DashboardContext";
import axios from "axios";

interface DashboardLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

function Dashboard() {
  const { pinnedPanels, refreshPinnedPanels } = useDashboardContext();
  const [panels, setPanels] = useState<GrafanaPanelConfig[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load dashboard from backend
  const loadDashboard = useCallback(async () => {
    // Don't load if pinnedPanels is not yet loaded
    if (pinnedPanels.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await axios.get('/app/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Dashboard load response:', response.data);

      // Create panels with layouts from the database
      const panelsWithLayouts = pinnedPanels.map(panel => {
        // Find layout for this panel in the dashboard_layouts
        const layout = response.data.dashboard_layouts?.[panel.id];
        if (layout) {
          return {
            ...panel,
            layout: {
              x: layout.x,
              y: layout.y,
              w: layout.w,
              h: layout.h,
              minW: 3,
              minH: 3
            }
          };
        }
        return panel;
      });

      setPanels(panelsWithLayouts);
    } catch (error) {
      console.error('Failed to load dashboard from API:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pinnedPanels]);

  // Save dashboard to backend
  const saveDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Extract layouts from panels
      const dashboardLayouts: Record<string, DashboardLayout> = {};
      panels.forEach(panel => {
        if (panel.layout) {
          dashboardLayouts[panel.id] = {
            x: panel.layout.x,
            y: panel.layout.y,
            w: panel.layout.w,
            h: panel.layout.h
          };
        }
      });

      // Get current dashboard data first
      const response = await axios.get('/app/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const currentPanels = response.data.panels || [];
      const currentPinnedPanels = response.data.pinned_panels || [];

      // Save the complete dashboard with layouts
      await axios.post('/app/dashboard', {
        panels: currentPanels,
        pinned_panels: currentPinnedPanels,
        dashboard_layouts: dashboardLayouts
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setIsEditing(false);
      console.log('Dashboard saved successfully');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  }, [panels]);

  // Handle layout changes from drag/resize
  const handleLayoutChange = useCallback((layout: any[]) => {
    // Update panel layouts based on grid layout changes
    setPanels(prev => prev.map(panel => {
      const layoutItem = layout.find(item => item.i === panel.id);
      if (layoutItem) {
        return {
          ...panel,
          layout: {
            ...panel.layout,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          }
        };
      }
      return panel;
    }));
  }, []);

  useEffect(() => {
    console.log("Dashboard: Component mounted, refreshing pinned panels...");
    refreshPinnedPanels();
  }, [refreshPinnedPanels]);

  useEffect(() => {
    // Only load dashboard when pinnedPanels is loaded and not empty
    if (pinnedPanels.length > 0) {
      loadDashboard();
    }
  }, [pinnedPanels, loadDashboard]);

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
                  {panels.length} pinned panel
                  {panels.length !== 1 ? "s" : ""}
                </div>
                {panels.length > 0 && (
                  <>
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveDashboard}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm font-medium rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isLoading ? "Saving..." : "Save Layout"}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1 text-sm font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-sm font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      >
                        Edit Layout
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {panels.length === 0 ? (
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
                  panels={panels}
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
