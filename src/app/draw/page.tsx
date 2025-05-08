'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, DrawingTool } from '@/components/Canvas';
import { ToolPanel } from '@/components/ToolPanel';
import { ColorPicker } from '@/components/ColorPicker';
import { LayerPanel, Layer, BlendMode } from '@/components/LayerPanel';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { FileManager } from '@/components/FileManager';
import { FiltersPanel, FilterSettings } from '@/components/FiltersPanel';
import { BrushSettings, BrushPreset } from '@/components/BrushSettings';

// Project data structure
interface Project {
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  activeLayerId: string;
}

export default function Draw() {
  console.log("Draw component is being rendered!");

  // Add a useEffect to log when the component mounts
  useEffect(() => {
    console.log("Draw component mounted!");

    // Only run alert in browser environment
    if (typeof window !== 'undefined') {
      // Alert to make it very obvious
      alert("Drawing component loaded successfully!");
    }

    return () => {
      console.log("Draw component unmounted!");
    };
  }, []);

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
  const [brushPresets, setBrushPresets] = useState<BrushPreset[]>([]);

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

  // History state
  const handleHistoryChange = useCallback((canUndo: boolean, canRedo: boolean) => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  }, []);

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
    if (layers.length <= 1) {
      alert('Cannot remove the last layer');
      return;
    }

    const newLayers = layers.filter((layer) => layer.id !== layerId);
    setLayers(newLayers);

    if (layerId === activeLayerId) {
      setActiveLayerId(newLayers[newLayers.length - 1].id);
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
    if (index === layers.length - 1) return; // Already at the top

    const newLayers = [...layers];
    [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    setLayers(newLayers);
  }, [layers]);

  const handleLayerMoveDown = useCallback((layerId: string) => {
    const index = layers.findIndex((layer) => layer.id === layerId);
    if (index === 0) return; // Already at the bottom

    const newLayers = [...layers];
    [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
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

  // Undo/Redo functions
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Drawing Masters App</h1>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-white p-4 border-r border-gray-200 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeSidebarTab === 'tools' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                } rounded-md`}
                onClick={() => setActiveSidebarTab('tools')}
              >
                Tools
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeSidebarTab === 'layers' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                } rounded-md`}
                onClick={() => setActiveSidebarTab('layers')}
              >
                Layers
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeSidebarTab === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                } rounded-md`}
                onClick={() => setActiveSidebarTab('file')}
              >
                File
              </button>
            </div>

            {activeSidebarTab === 'tools' && (
              <div className="space-y-4">
                <ToolPanel
                  currentTool={currentTool}
                  onToolChange={(tool) => setCurrentTool(tool as DrawingTool)}
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

                <div className="mt-4 space-y-2">
                  <button
                    className="w-full p-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setActiveSidebarTab('brush')}
                  >
                    Brush Settings
                  </button>
                  <button
                    className="w-full p-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setActiveSidebarTab('filters')}
                  >
                    Filters & Effects
                  </button>
                </div>
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
