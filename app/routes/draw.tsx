import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, DrawingTool } from '../components/Canvas';
import { ToolPanel } from '../components/ToolPanel';
import { ColorPicker } from '../components/ColorPicker';
import { LayerPanel, Layer, BlendMode } from '../components/LayerPanel';
import { KeyboardShortcuts } from '../components/KeyboardShortcuts';
import { FileManager } from '../components/FileManager';
import { FiltersPanel, FilterSettings } from '../components/FiltersPanel';
import { BrushSettings, BrushPreset } from '../components/BrushSettings';

export function meta() {
  return [
    { title: "Drawing Masters App" },
    { name: "description", content: "Professional Art Drawing Application" },
  ];
}

// Project data structure
interface Project {
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
}

export default function Draw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tool state
  const [currentTool, setCurrentTool] = useState<DrawingTool>('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // UI state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'tools' | 'layers' | 'file' | 'filters' | 'brush'>('tools');

  // Layer state
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'layer-1',
      name: 'Layer 1',
      visible: true,
      opacity: 1,
      blendMode: 'normal'
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');

  // Brush settings
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushHardness, setBrushHardness] = useState(100);
  const [brushFlow, setBrushFlow] = useState(100);
  const [brushSpacing, setBrushSpacing] = useState(0);
  const [brushPresets, setBrushPresets] = useState<BrushPreset[]>([
    {
      id: 'preset-1',
      name: 'Default',
      size: 5,
      opacity: 100,
      hardness: 100,
      flow: 100,
      spacing: 0,
      isEraser: false
    },
    {
      id: 'preset-2',
      name: 'Soft Brush',
      size: 20,
      opacity: 50,
      hardness: 50,
      flow: 80,
      spacing: 10,
      isEraser: false
    },
    {
      id: 'preset-3',
      name: 'Eraser',
      size: 10,
      opacity: 100,
      hardness: 100,
      flow: 100,
      spacing: 0,
      isEraser: true
    }
  ]);

  // Filter settings
  const [filters, setFilters] = useState<FilterSettings>({
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    hueRotate: 0,
    invert: 0,
    saturate: 100,
    sepia: 0
  });

  // Project state
  const [projectName, setProjectName] = useState('Untitled');
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tool shortcuts
      if (e.key === 'b' || e.key === 'B') setCurrentTool('brush');
      if (e.key === 'e' || e.key === 'E') setCurrentTool('eraser');
      if (e.key === 'p' || e.key === 'P') setCurrentTool('pencil');
      if (e.key === 't' || e.key === 'T') setCurrentTool('text');
      if (e.key === 's' || e.key === 'S') setCurrentTool('select');
      if (e.key === 'r' || e.key === 'R') setCurrentTool('square');
      if (e.key === 'c' || e.key === 'C') setCurrentTool('circle');
      if (e.key === 'l' || e.key === 'L') setCurrentTool('line');

      // Undo/Redo
      if (e.ctrlKey && e.key === 'z') handleUndo();
      if (e.ctrlKey && e.key === 'y') handleRedo();

      // Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Zoom
      if (e.ctrlKey && e.key === '+') {
        e.preventDefault();
        setZoom(prev => Math.min(5, prev + 0.1));
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setZoom(prev => Math.max(0.1, prev - 0.1));
      }
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }

      // Show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSave]);

  // Layer management functions
  const handleLayerAdd = useCallback(() => {
    const newLayerId = `layer-${layers.length + 1}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      blendMode: 'normal'
    };

    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayerId);
  }, [layers]);

  const handleLayerRemove = useCallback((layerId: string) => {
    if (layers.length <= 1) return;

    const newLayers = layers.filter((layer) => layer.id !== layerId);
    setLayers(newLayers);

    if (activeLayerId === layerId) {
      setActiveLayerId(newLayers[0].id);
    }
  }, [layers, activeLayerId]);

  const handleLayerVisibilityToggle = useCallback((layerId: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  }, [layers]);

  const handleLayerMoveUp = useCallback((layerId: string) => {
    const index = layers.findIndex((layer) => layer.id === layerId);
    if (index <= 0) return;

    const newLayers = [...layers];
    [newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]];
    setLayers(newLayers);
  }, [layers]);

  const handleLayerMoveDown = useCallback((layerId: string) => {
    const index = layers.findIndex((layer) => layer.id === layerId);
    if (index >= layers.length - 1) return;

    const newLayers = [...layers];
    [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    setLayers(newLayers);
  }, [layers]);

  const handleLayerOpacityChange = useCallback((layerId: string, opacity: number) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, opacity }
          : layer
      )
    );
  }, [layers]);

  const handleLayerBlendModeChange = useCallback((layerId: string, blendMode: BlendMode) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId
          ? { ...layer, blendMode }
          : layer
      )
    );
  }, [layers]);

  const handleLayerGroupCreate = useCallback(() => {
    const newGroupId = `group-${layers.length + 1}`;
    const newGroup: Layer = {
      id: newGroupId,
      name: `Group ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      isGroup: true,
      children: []
    };

    setLayers([...layers, newGroup]);
  }, [layers]);

  // File management functions
  const handleSave = useCallback(() => {
    const project: Project = {
      name: projectName,
      width: canvasWidth,
      height: canvasHeight,
      layers,
      activeLayerId
    };

    const projectJson = JSON.stringify(project);
    const blob = new Blob([projectJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }, [projectName, canvasWidth, canvasHeight, layers, activeLayerId]);

  const handleOpen = useCallback((file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string) as Project;

        setProjectName(project.name);
        setCanvasWidth(project.width);
        setCanvasHeight(project.height);
        setLayers(project.layers);
        setActiveLayerId(project.activeLayerId);
      } catch (error) {
        console.error('Error parsing project file:', error);
        alert('Invalid project file');
      }
    };

    reader.readAsText(file);
  }, []);

  const handleExport = useCallback((format: 'png' | 'jpeg' | 'svg') => {
    if (!canvasRef.current) return;

    // Access the exportImage method we attached to the canvas
    const exportImage = (canvasRef.current as any).exportImage;
    if (!exportImage) return;

    const dataUrl = exportImage(format);
    if (!dataUrl) return;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${projectName}.${format}`;
    a.click();
  }, [projectName]);

  const handleNewProject = useCallback(() => {
    if (window.confirm('Create a new project? Any unsaved changes will be lost.')) {
      setProjectName('Untitled');
      setLayers([{
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        opacity: 1,
        blendMode: 'normal'
      }]);
      setActiveLayerId('layer-1');

      // Reset canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
      }
    }
  }, [canvasWidth, canvasHeight]);

  // Filter functions
  const handleFilterChange = useCallback((type: keyof FilterSettings, value: number) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }, []);

  const handleApplyFilter = useCallback(() => {
    // This would apply the filters to the actual canvas
    // For now, we'll just show an alert
    alert('Filters applied!');
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      blur: 0,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      hueRotate: 0,
      invert: 0,
      saturate: 100,
      sepia: 0
    });
  }, []);

  // Brush functions
  const handleBrushPresetSelect = useCallback((preset: BrushPreset) => {
    setBrushSize(preset.size);
    setBrushOpacity(preset.opacity);
    setBrushHardness(preset.hardness);
    setBrushFlow(preset.flow);
    setBrushSpacing(preset.spacing);

    if (preset.isEraser) {
      setCurrentTool('eraser');
    } else {
      setCurrentTool('brush');
    }
  }, []);

  const handleBrushPresetSave = useCallback((preset: Omit<BrushPreset, 'id'>) => {
    const newPreset: BrushPreset = {
      ...preset,
      id: `preset-${Date.now()}`
    };

    setBrushPresets([...brushPresets, newPreset]);
  }, [brushPresets]);

  // History functions
  const handleUndo = useCallback(() => {
    if (!canvasRef.current) return;

    // Access the undo method we attached to the canvas
    const undo = (canvasRef.current as any).undo;
    if (undo) undo();
  }, []);

  const handleRedo = useCallback(() => {
    if (!canvasRef.current) return;

    // Access the redo method we attached to the canvas
    const redo = (canvasRef.current as any).redo;
    if (redo) redo();
  }, []);

  const handleHistoryChange = useCallback((canUndo: boolean, canRedo: boolean) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Drawing Masters App</h1>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Sidebar tabs */}
        <div className="w-64 flex flex-col gap-4">
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeSidebarTab === 'tools' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSidebarTab('tools')}
              >
                Tools
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeSidebarTab === 'layers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSidebarTab('layers')}
              >
                Layers
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeSidebarTab === 'file' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSidebarTab('file')}
              >
                File
              </button>
            </div>

            <div className="p-4">
              {activeSidebarTab === 'tools' && (
                <div className="space-y-4">
                  <ToolPanel
                    currentTool={currentTool}
                    onToolChange={setCurrentTool}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onSave={handleSave}
                    onExport={handleExport}
                    onKeyboardShortcutsToggle={() => setShowKeyboardShortcuts(true)}
                  />

                  <ColorPicker
                    currentColor={currentColor}
                    onColorChange={setCurrentColor}
                  />

                  <button
                    className="w-full p-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setActiveSidebarTab('brush')}
                  >
                    Advanced Brush Settings
                  </button>

                  <button
                    className="w-full p-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setActiveSidebarTab('filters')}
                  >
                    Filters & Effects
                  </button>
                </div>
              )}

              {activeSidebarTab === 'layers' && (
                <LayerPanel
                  layers={layers}
                  activeLayerId={activeLayerId}
                  onLayerSelect={setActiveLayerId}
                  onLayerAdd={handleLayerAdd}
                  onLayerRemove={handleLayerRemove}
                  onLayerVisibilityToggle={handleLayerVisibilityToggle}
                  onLayerMoveUp={handleLayerMoveUp}
                  onLayerMoveDown={handleLayerMoveDown}
                  onLayerOpacityChange={handleLayerOpacityChange}
                  onLayerBlendModeChange={handleLayerBlendModeChange}
                  onLayerGroupCreate={handleLayerGroupCreate}
                />
              )}

              {activeSidebarTab === 'file' && (
                <FileManager
                  onSave={handleSave}
                  onOpen={handleOpen}
                  onExport={handleExport}
                  onNewProject={handleNewProject}
                />
              )}

              {activeSidebarTab === 'filters' && (
                <FiltersPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onApplyFilter={handleApplyFilter}
                  onResetFilters={handleResetFilters}
                />
              )}

              {activeSidebarTab === 'brush' && (
                <BrushSettings
                  brushSize={brushSize}
                  onBrushSizeChange={setBrushSize}
                  brushOpacity={brushOpacity}
                  onBrushOpacityChange={setBrushOpacity}
                  brushHardness={brushHardness}
                  onBrushHardnessChange={setBrushHardness}
                  brushFlow={brushFlow}
                  onBrushFlowChange={setBrushFlow}
                  brushSpacing={brushSpacing}
                  onBrushSpacingChange={setBrushSpacing}
                  presets={brushPresets}
                  onPresetSelect={handleBrushPresetSelect}
                  onPresetSave={handleBrushPresetSave}
                />
              )}
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-md overflow-auto">
          <Canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            brushColor={currentColor}
            brushSize={brushSize}
            tool={currentTool}
            zoom={zoom}
            onHistoryChange={handleHistoryChange}
          />
        </div>
      </main>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
}
