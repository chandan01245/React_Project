import { useState, useCallback } from 'react';
import axios from 'axios';
import { GrafanaPanelConfig } from '../components/GrafanaDashboard';

export const useGrafanaDashboard = (initialPanels: GrafanaPanelConfig[] = []) => {
  const [panels, setPanels] = useState<GrafanaPanelConfig[]>(initialPanels);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const saveDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('/app/dashboard', {
        panels: panels
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
      // Don't fallback to localStorage - keep editing mode on for user to retry
      setIsEditing(true);
      // Re-throw the error so the calling component can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [panels]);

  const loadDashboard = useCallback(async () => {
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

      if (response.data.panels && response.data.panels.length > 0) {
        setPanels(response.data.panels);
      }
    } catch (error) {
      console.error('Failed to load dashboard from API:', error);
      // Don't fallback to localStorage - just log the error
      // The user will see the initial panels defined in the component
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    panels,
    isEditing,
    isLoading,
    addPanel,
    removePanel,
    updatePanel,
    handleLayoutChange,
    toggleEditMode,
    saveDashboard,
    loadDashboard,
  };
};