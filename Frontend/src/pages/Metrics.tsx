import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import GrafanaDashboard, {
  GrafanaPanelConfig,
} from "../components/GrafanaDashboard";
import { useGrafanaDashboard } from "../hooks/useGrafanaDashboard";
import { useDashboardContext } from "../contexts/DashboardContext";
import { Button } from "../components/ui/button";

function Metrics() {
  const initialPanels: GrafanaPanelConfig[] = [
    {
      id: "panel-1",
      title: "Memory Usage",
      src: "http://192.168.0.192:3000/d-solo/3f6b9486-3d2a-48a1-94eb-36c1dc48bd0d/testing-dashboard?orgId=1&from=1753823300008&to=1753824200008&timezone=browser&tab=queries&panelId=1&__feature.dashboardSceneSolo",
      layout: { x: 0, y: 0, w: 6, h: 3, minW: 3, minH: 3 },
    },
    {
      id: "panel-2",
      title: "Network Traffic",
      src: "http://192.168.0.192:3000/d-solo/3f6b9486-3d2a-48a1-94eb-36c1dc48bd0d/testing-dashboard?orgId=1&from=1753823300008&to=1753824200008&timezone=browser&tab=queries&panelId=2&__feature.dashboardSceneSolo",
      layout: { x: 6, y: 0, w: 6, h: 3, minW: 3, minH: 3 },
    },
    {
      id: "panel-3",
      title: "CPU Usage",
      src: "http://192.168.0.192:3000/d-solo/3f6b9486-3d2a-48a1-94eb-36c1dc48bd0d/testing-dashboard?orgId=1&from=1753823300008&to=1753824200008&timezone=browser&tab=queries&panelId=3&__feature.dashboardSceneSolo",
      layout: { x: 0, y: 3, w: 6, h: 3, minW: 3, minH: 3 },
    },
    {
      id: "panel-4",
      title: "File System Availability",
      src: "http://192.168.0.192:3000/d-solo/3f6b9486-3d2a-48a1-94eb-36c1dc48bd0d/testing-dashboard?orgId=1&from=1753823300008&to=1753824200008&timezone=browser&tab=queries&panelId=4&__feature.dashboardSceneSolo",
      layout: { x: 6, y: 3, w: 6, h: 3, minW: 3, minH: 3 },
    },
  ];

  const {
    panels,
    pinnedPanels,
    isEditing,
    isLoading,
    handleLayoutChange,
    toggleEditMode,
    pinPanel,
    unpinPanel,
    saveDashboard,
    loadDashboard,
  } = useGrafanaDashboard(initialPanels);

  // Get the shared dashboard context
  const { refreshPinnedPanels } = useDashboardContext();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleSaveSuccess = () => {
    // Show success message or notification
    console.log("Dashboard layout saved successfully!");
  };

  const handleSaveError = (error: any) => {
    // Show error message or notification
    console.error("Failed to save dashboard layout:", error);
  };

  const isPanelPinned = (panelId: string) => {
    return pinnedPanels.some((panel) => panel.id === panelId);
  };

  // Enhanced pin/unpin handlers that update the shared context
  const handlePinPanel = async (panel: GrafanaPanelConfig) => {
    await pinPanel(panel);
    // Refresh the shared context to update other components
    await refreshPinnedPanels();
  };

  const handleUnpinPanel = async (panel: GrafanaPanelConfig) => {
    await unpinPanel(panel);
    // Refresh the shared context to update other components
    await refreshPinnedPanels();
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">
                Server Metrics Dashboard
              </h1>
              <div className="flex gap-3">
                <Button
                  variant={isEditing ? "destructive" : "secondary"}
                  onClick={toggleEditMode}
                  className="px-4"
                >
                  {isEditing ? "Cancel Edit" : "Edit Layout"}
                </Button>
                {isEditing && (
                  <Button
                    variant="default"
                    onClick={async () => {
                      try {
                        await saveDashboard();
                        handleSaveSuccess();
                      } catch (error) {
                        handleSaveError(error);
                      }
                    }}
                    disabled={isLoading}
                    className="px-4"
                  >
                    {isLoading ? "Saving..." : "Save Layout"}
                  </Button>
                )}
              </div>
            </div>

            <div className="h-[calc(100vh-200px)]">
              <GrafanaDashboard
                panels={panels}
                pinnedPanels={pinnedPanels}
                onLayoutChange={handleLayoutChange}
                isEditable={isEditing}
                onPinPanel={handlePinPanel}
                onUnpinPanel={handleUnpinPanel}
                showPinIcons={true}
              />
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Metrics;
