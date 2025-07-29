import { useState, useCallback } from 'react';
import { GrafanaPanelConfig } from '../components/GrafanaDashboard';

export const useGrafanaDashboard = (initialPanels: GrafanaPanelConfig[] = []) => {
  const [panels, setPanels] = useState<GrafanaPanelConfig[]>(initialPanels);
  const [isEditing, setIsEditing] = useState(false);

  const addPanel = useCallback((panel: GrafanaPanelConfig) => {
    setPanels(prev => [...prev, panel]);
  }, []);

  const removePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.filter(panel => panel.id !== panelId));
  }, []);

  const updatePanel = useCallback((panelId: string, updates: Partial<GrafanaPanelConfig>) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId ? { ...panel, ...updates } : panel
    ));
  }, []);

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

  const toggleEditMode = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const saveDashboard = useCallback(() => {
    // Save to localStorage or send to API
    localStorage.setItem('grafana-dashboard', JSON.stringify(panels));
    setIsEditing(false);
  }, [panels]);

  const loadDashboard = useCallback(() => {
    // Load from localStorage or API
    const saved = localStorage.getItem('grafana-dashboard');
    if (saved) {
      try {
        const loadedPanels = JSON.parse(saved);
        setPanels(loadedPanels);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    }
  }, []);

  return {
    panels,
    isEditing,
    addPanel,
    removePanel,
    updatePanel,
    handleLayoutChange,
    toggleEditMode,
    saveDashboard,
    loadDashboard,
  };
};