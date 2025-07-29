import { memo } from 'react';

interface DraggableGrafanaPanelProps {
  src: string;
  title?: string;
  id: string;
  showTitle?: boolean;
}

const DraggableGrafanaPanel = memo(({ src, title, id, showTitle = true }: DraggableGrafanaPanelProps) => {
  return (
    <div className="h-full w-full overflow-hidden">
      {title && showTitle && (
        <div className="bg-card-foreground/5 border-b border-border px-4 py-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-card-foreground truncate">{title}</h3>
          <div className="text-xs text-muted-foreground">ID: {id}</div>
        </div>
      )}
      <div className={`w-full ${title && showTitle ? 'h-[calc(100%-40px)]' : 'h-full'}`}>
        <iframe
          src={src}
          className="w-full h-full border-0"
          title={title || `Grafana Panel ${id}`}
          loading="lazy"
          style={{ minHeight: '200px' }}
        />
      </div>
    </div>
  );
});

DraggableGrafanaPanel.displayName = 'DraggableGrafanaPanel';

export default DraggableGrafanaPanel;