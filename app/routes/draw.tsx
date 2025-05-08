import { useState, useCallback } from 'react';
import { Canvas } from '../components/Canvas';
import { ToolPanel } from '../components/ToolPanel';
import { ColorPicker } from '../components/ColorPicker';
import { LayerPanel, Layer } from '../components/LayerPanel';

export function meta() {
  return [
    { title: "Drawing Masters App" },
    { name: "description", content: "Professional Art Drawing Application" },
  ];
}

export default function Draw() {
  // Tool state
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [currentColor, setCurrentColor] = useState('#000000');
  
  // Layer state
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'Layer 1', visible: true },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  
  // Layer management functions
  const handleLayerAdd = useCallback(() => {
    const newLayerId = `layer-${layers.length + 1}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
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
  
  // Save function (placeholder)
  const handleSave = useCallback(() => {
    alert('Save functionality will be implemented soon!');
  }, []);
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Drawing Masters App</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className="w-64 flex flex-col gap-4">
          <ToolPanel
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            onSave={handleSave}
          />
          
          <ColorPicker
            currentColor={currentColor}
            onColorChange={setCurrentColor}
          />
          
          <LayerPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerSelect={setActiveLayerId}
            onLayerAdd={handleLayerAdd}
            onLayerRemove={handleLayerRemove}
            onLayerVisibilityToggle={handleLayerVisibilityToggle}
            onLayerMoveUp={handleLayerMoveUp}
            onLayerMoveDown={handleLayerMoveDown}
          />
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-md overflow-auto">
          <Canvas
            width={800}
            height={600}
            brushColor={currentColor}
            brushSize={brushSize}
            tool={currentTool as 'brush' | 'eraser' | 'pencil'}
          />
        </div>
      </main>
    </div>
  );
}
