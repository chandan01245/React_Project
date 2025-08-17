import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { GrafanaPanelConfig } from "../components/GrafanaDashboard";

interface DashboardContextType {
  pinnedPanels: GrafanaPanelConfig[];
  setPinnedPanels: (panels: GrafanaPanelConfig[]) => void;
  addPinnedPanel: (panel: GrafanaPanelConfig) => void;
  removePinnedPanel: (panelId: string) => void;
  isPanelPinned: (panelId: string) => boolean;
  refreshPinnedPanels: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
}) => {
  const [pinnedPanels, setPinnedPanels] = useState<GrafanaPanelConfig[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshPinnedPanels = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      console.log("DashboardContext: Refreshing pinned panels...");
      const response = await fetch("/app/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pinnedPanelsData = data.pinned_panels || [];
        console.log("DashboardContext: API response:", data);
        console.log(
          "DashboardContext: Setting pinned panels to:",
          pinnedPanelsData
        );
        setPinnedPanels(pinnedPanelsData);
      } else {
        console.error(
          "DashboardContext: API response not ok:",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "DashboardContext: Failed to refresh pinned panels:",
        error
      );
    }
  }, []);

  // Debug: Log when pinnedPanels changes
  useEffect(() => {
    console.log(
      "DashboardContext: pinnedPanels state changed to:",
      pinnedPanels
    );
  }, [pinnedPanels]);

  // Load pinned panels when the context is first created
  useEffect(() => {
    if (!isInitialized) {
      refreshPinnedPanels();
      setIsInitialized(true);
    }
  }, [refreshPinnedPanels, isInitialized]);

  const addPinnedPanel = useCallback((panel: GrafanaPanelConfig) => {
    setPinnedPanels((prev) => {
      // Check if panel is already pinned
      if (prev.some((p) => p.id === panel.id)) {
        return prev;
      }
      return [...prev, panel];
    });
  }, []);

  const removePinnedPanel = useCallback((panelId: string) => {
    setPinnedPanels((prev) => prev.filter((p) => p.id !== panelId));
  }, []);

  const isPanelPinned = useCallback(
    (panelId: string) => {
      return pinnedPanels.some((panel) => panel.id === panelId);
    },
    [pinnedPanels]
  );

  const value: DashboardContextType = {
    pinnedPanels,
    setPinnedPanels,
    addPinnedPanel,
    removePinnedPanel,
    isPanelPinned,
    refreshPinnedPanels,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
