import { Paintbrush, Eraser, Pencil, Square, Circle, Undo, Redo, Save } from 'lucide-react';

interface ToolPanelProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
}

export function ToolPanel({
  currentTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onSave,
}: ToolPanelProps) {
  const tools = [
    { id: 'brush', icon: <Paintbrush size={20} />, label: 'Brush' },
    { id: 'pencil', icon: <Pencil size={20} />, label: 'Pencil' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
    { id: 'square', icon: <Square size={20} />, label: 'Square' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
  ];

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
      
      <div className="flex justify-between">
        <button
          onClick={onUndo}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Undo"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={onRedo}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Redo"
        >
          <Redo size={20} />
        </button>
        <button
          onClick={onSave}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Save"
        >
          <Save size={20} />
        </button>
      </div>
    </div>
  );
}
