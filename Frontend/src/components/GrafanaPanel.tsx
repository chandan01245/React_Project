// GrafanaPanel.tsx

import { useRef, useState, MouseEvent } from "react";

interface GrafanaPanelProps {
  src: string;
}

const GrafanaPanel = ({ src }: GrafanaPanelProps) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 450,
  });
  const resizerRef = useRef<HTMLDivElement | null>(null);

  const startResize = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (e: MouseEvent | globalThis.MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      setDimensions({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className="relative border border-gray-300 rounded overflow-hidden resize"
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <iframe
        src={src}
        width="100%"
        height="100%"
        frameBorder="0"
        title="Grafana Panel"
      />
      <div
        ref={resizerRef}
        onMouseDown={startResize}
        className="absolute right-0 bottom-0 w-4 h-4 bg-gray-500 cursor-se-resize z-10"
      />
    </div>
  );
};

export default GrafanaPanel;
