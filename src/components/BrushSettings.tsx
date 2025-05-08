'use client';

import { useState } from 'react';
import { Paintbrush, Save } from 'lucide-react';

export interface BrushPreset {
  id: string;
  name: string;
  size: number;
  opacity: number;
  hardness: number;
  flow: number;
  spacing: number;
  isEraser: boolean;
}

interface BrushSettingsProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushOpacity?: number;
  onBrushOpacityChange?: (opacity: number) => void;
  brushHardness?: number;
  onBrushHardnessChange?: (hardness: number) => void;
  brushFlow?: number;
  onBrushFlowChange?: (flow: number) => void;
  brushSpacing?: number;
  onBrushSpacingChange?: (spacing: number) => void;
  presets?: BrushPreset[];
  onPresetSelect?: (preset: BrushPreset) => void;
  onPresetSave?: (preset: Omit<BrushPreset, 'id'>) => void;
}

export function BrushSettings({
  brushSize,
  onBrushSizeChange,
  brushOpacity = 100,
  onBrushOpacityChange,
  brushHardness = 100,
  onBrushHardnessChange,
  brushFlow = 100,
  onBrushFlowChange,
  brushSpacing = 0,
  onBrushSpacingChange,
  presets = [],
  onPresetSelect,
  onPresetSave,
}: BrushSettingsProps) {
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  
  const handleSavePreset = () => {
    if (!onPresetSave || !newPresetName.trim()) return;
    
    onPresetSave({
      name: newPresetName,
      size: brushSize,
      opacity: brushOpacity,
      hardness: brushHardness,
      flow: brushFlow,
      spacing: brushSpacing,
      isEraser: false,
    });
    
    setNewPresetName('');
    setShowSavePreset(false);
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Paintbrush className="mr-2" size={20} />
        Brush Settings
      </h2>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <label>Size</label>
            <span>{brushSize}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full h-1.5"
          />
        </div>
        
        {onBrushOpacityChange && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label>Opacity</label>
              <span>{brushOpacity}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={brushOpacity}
              onChange={(e) => onBrushOpacityChange(Number(e.target.value))}
              className="w-full h-1.5"
            />
          </div>
        )}
        
        {onBrushHardnessChange && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label>Hardness</label>
              <span>{brushHardness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={brushHardness}
              onChange={(e) => onBrushHardnessChange(Number(e.target.value))}
              className="w-full h-1.5"
            />
          </div>
        )}
        
        {onBrushFlowChange && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label>Flow</label>
              <span>{brushFlow}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={brushFlow}
              onChange={(e) => onBrushFlowChange(Number(e.target.value))}
              className="w-full h-1.5"
            />
          </div>
        )}
        
        {onBrushSpacingChange && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <label>Spacing</label>
              <span>{brushSpacing}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={brushSpacing}
              onChange={(e) => onBrushSpacingChange(Number(e.target.value))}
              className="w-full h-1.5"
            />
          </div>
        )}
      </div>
      
      {presets.length > 0 && onPresetSelect && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Presets</h3>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onPresetSelect(preset)}
                className="p-1 text-xs bg-gray-100 rounded hover:bg-gray-200 truncate"
                title={preset.name}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {onPresetSave && (
        <div className="mt-4">
          {showSavePreset ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Preset name"
                className="w-full p-1 text-sm border border-gray-300 rounded"
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowSavePreset(false)}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  disabled={!newPresetName.trim()}
                >
                  <Save size={12} className="mr-1" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSavePreset(true)}
              className="w-full p-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Save as Preset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
