import React, { useState, useCallback, useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import DraggableGrafanaPanel from "./DraggableGrafanaPanel";
import { useDashboardContext } from "../contexts/DashboardContext";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GrafanaPanelConfig {
  id: string;
  src: string;
  title: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

interface GrafanaDashboardProps {
  panels: GrafanaPanelConfig[];
  pinnedPanels?: GrafanaPanelConfig[];
  onLayoutChange?: (layout: any[], layouts: any) => void;
  isEditable?: boolean;
  onPinPanel?: (panel: GrafanaPanelConfig) => void;
  onUnpinPanel?: (panel: GrafanaPanelConfig) => void;
  showPinIcons?: boolean;
}

const GrafanaDashboard: React.FC<GrafanaDashboardProps> = ({
  panels,
  pinnedPanels = [],
  onLayoutChange,
  isEditable = true,
  onPinPanel,
  onUnpinPanel,
  showPinIcons = false,
}) => {
  const [layouts, setLayouts] = useState<any>({});
  const { isPanelPinned: contextIsPanelPinned } = useDashboardContext();

  const handleLayoutChange = useCallback(
    (layout: any[], allLayouts: any) => {
      setLayouts(allLayouts);
      onLayoutChange?.(layout, allLayouts);
    },
    [onLayoutChange]
  );

  const isPanelPinned = (panelId: string) => {
    return contextIsPanelPinned(panelId);
  };

  const handlePinClick = (panel: GrafanaPanelConfig) => {
    if (isPanelPinned(panel.id)) {
      onUnpinPanel?.(panel);
    } else {
      onPinPanel?.(panel);
    }
  };

  // Breakpoints for responsive design
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  // Generate layouts from panel data with proper sizing (400x200 -> ~6x3 grid units)
  const generatedLayouts = useMemo(() => {
    const lgLayout = panels.map((panel) => ({
      i: panel.id,
      x: panel.layout.x,
      y: panel.layout.y,
      w: panel.layout.w,
      h: panel.layout.h,
      minW: panel.layout.minW || 3,
      minH: panel.layout.minH || 3,
      maxW: panel.layout.maxW,
      maxH: panel.layout.maxH,
    }));

    return {
      lg: lgLayout,
      md: lgLayout.map((item) => ({ ...item, w: Math.max(item.w - 1, 1) })),
      sm: lgLayout.map((item) => ({ ...item, w: Math.max(item.w - 2, 1) })),
      xs: lgLayout.map((item) => ({ ...item, w: Math.max(item.w - 3, 1) })),
      xxs: lgLayout.map((item) => ({ ...item, w: 2, h: Math.max(item.h, 3) })),
    };
  }, [panels]);

  return (
    <div className="w-full h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={Object.keys(layouts).length > 0 ? layouts : generatedLayouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={65}
        isDraggable={isEditable}
        isResizable={isEditable}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
        autoSize={true}
        draggableHandle=".drag-handle"
        resizeHandles={["se", "e", "s", "sw", "ne", "nw"]}
      >
        {panels.map((panel) => (
          <div
            key={panel.id}
            className="relative bg-card border border-border rounded-lg shadow-sm overflow-hidden"
          >
            {isEditable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-8 bg-primary/10 border-b border-border cursor-move z-20 flex items-center justify-center opacity-75 hover:opacity-100 transition-opacity">
                <div className="text-xs text-primary font-medium flex items-center gap-2">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                  Drag to move
                </div>
              </div>
            )}

            {/* Pin Icon */}
            {showPinIcons && (
              <button
                onClick={() => handlePinClick(panel)}
                className={`absolute top-2 right-2 z-30 p-1 rounded-full transition-all duration-200 hover:scale-110 ${
                  isPanelPinned(panel.id)
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title={
                  isPanelPinned(panel.id)
                    ? "Unpin from Dashboard"
                    : "Pin to Dashboard"
                }
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            )}

            <div className={`h-full w-full ${isEditable ? "pt-8" : ""}`}>
              <DraggableGrafanaPanel
                id={panel.id}
                src={panel.src}
                title={panel.title}
                showTitle={!isEditable}
              />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default GrafanaDashboard;
