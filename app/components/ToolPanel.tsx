// Import all icons from lucide-react as a namespace
import * as LucideIcons from 'lucide-react';
import { DrawingTool } from './Canvas';

interface ToolPanelProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onExport?: (format: 'png' | 'jpeg' | 'svg') => void;
  onKeyboardShortcutsToggle?: () => void;
}

export function ToolPanel({
  currentTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  zoom = 1,
  onZoomChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onKeyboardShortcutsToggle,
}: ToolPanelProps) {
  const tools = [
    { id: 'brush', icon: <LucideIcons.Paintbrush size={20} />, label: 'Brush' },
    { id: 'pencil', icon: <LucideIcons.Pencil size={20} />, label: 'Pencil' },
    { id: 'eraser', icon: <LucideIcons.Eraser size={20} />, label: 'Eraser' },
    { id: 'line', icon: <LucideIcons.LineIcon size={20} />, label: 'Line' },
    { id: 'square', icon: <LucideIcons.Square size={20} />, label: 'Square' },
    { id: 'circle', icon: <LucideIcons.Circle size={20} />, label: 'Circle' },
    { id: 'text', icon: <LucideIcons.Type size={20} />, label: 'Text' },
    { id: 'select', icon: <LucideIcons.MousePointer size={20} />, label: 'Select' },
    { id: 'move', icon: <LucideIcons.Move size={20} />, label: 'Pan' },
  ];

  const handleExport = (format: 'png' | 'jpeg' | 'svg') => {
    if (onExport) {
      onExport(format);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!onZoomChange) return;

    const zoomStep = 0.1;
    const minZoom = 0.1;
    const maxZoom = 5;

    let newZoom = zoom;
    if (direction === 'in') {
      newZoom = Math.min(maxZoom, zoom + zoomStep);
    } else {
      newZoom = Math.max(minZoom, zoom - zoomStep);
    }

    onZoomChange(newZoom);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4">Tools</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`p-2 rounded-md flex flex-col items-center justify-center ${
              currentTool === tool.id
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
            title={tool.label}
          >
            {tool.icon}
            <span className="text-xs mt-1">{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Brush Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm">{brushSize}px</span>
        </div>
      </div>

      {onZoomChange && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Zoom: {Math.round(zoom * 100)}%</label>
          <div className="flex justify-between">
            <button
              onClick={() => handleZoom('out')}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Zoom Out"
            >
              <LucideIcons.ZoomOut size={20} />
            </button>
            <button
              onClick={() => onZoomChange(1)}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Reset Zoom"
            >
              100%
            </button>
            <button
              onClick={() => handleZoom('in')}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Zoom In"
            >
              <LucideIcons.ZoomIn size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mb-4">
        <button
          onClick={onUndo}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Undo (Ctrl+Z)"
        >
          <LucideIcons.Undo size={20} />
        </button>
        <button
          onClick={onRedo}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Redo (Ctrl+Y)"
        >
          <LucideIcons.Redo size={20} />
        </button>
        <button
          onClick={onSave}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Save (Ctrl+S)"
        >
          <LucideIcons.Save size={20} />
        </button>
      </div>

      {onExport && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Export</label>
          <div className="flex justify-between">
            <button
              onClick={() => handleExport('png')}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs"
              title="Export as PNG"
            >
              PNG
            </button>
            <button
              onClick={() => handleExport('jpeg')}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs"
              title="Export as JPEG"
            >
              JPEG
            </button>
            <button
              onClick={() => handleExport('svg')}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-xs"
              title="Export as SVG"
            >
              SVG
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onKeyboardShortcutsToggle}
          className="w-full p-2 text-center text-sm bg-gray-100 rounded hover:bg-gray-200"
          title="Keyboard Shortcuts"
        >
          Keyboard Shortcuts
        </button>
      </div>
    </div>
  );
}
