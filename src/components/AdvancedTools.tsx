'use client';

import React, { useState } from 'react';
import { AnimatedButton } from './ui/AnimatedComponents';

// Define tool types
export type AdvancedDrawingTool =
  | 'gradient'
  | 'pattern'
  | 'symmetry'
  | 'perspective'
  | 'clone'
  | 'smudge'
  | 'blur'
  | 'sharpen'
  | 'liquify'
  | 'warp';

// Define tool settings
interface ToolSettings {
  [key: string]: any;
}

// Define props
interface AdvancedToolsProps {
  currentTool: AdvancedDrawingTool | null;
  onToolChange: (tool: AdvancedDrawingTool | null) => void;
  onSettingsChange: (settings: ToolSettings) => void;
}

export const AdvancedTools: React.FC<AdvancedToolsProps> = ({
  currentTool,
  onToolChange,
  onSettingsChange,
}) => {
  // Tool settings state
  const [gradientSettings, setGradientSettings] = useState({
    type: 'linear',
    startColor: '#000000',
    endColor: '#ffffff',
    angle: 0,
  });

  const [patternSettings, setPatternSettings] = useState({
    type: 'dots',
    size: 10,
    spacing: 20,
    color: '#000000',
  });

  const [symmetrySettings, setSymmetrySettings] = useState({
    type: 'mirror',
    axes: 1,
    angle: 0,
  });

  const [perspectiveSettings, setPerspectiveSettings] = useState({
    vanishingPoints: 1,
    gridSize: 20,
  });

  const [cloneSettings, setCloneSettings] = useState({
    sourceSet: false,
    sourceX: 0,
    sourceY: 0,
    aligned: true,
  });

  const [smudgeSettings, setSmudgeSettings] = useState({
    strength: 50,
    size: 20,
  });

  const [blurSettings, setBlurSettings] = useState({
    radius: 5,
    strength: 50,
  });

  const [sharpenSettings, setSharpenSettings] = useState({
    radius: 5,
    strength: 50,
  });

  const [liquifySettings, setLiquifySettings] = useState({
    size: 20,
    strength: 50,
    mode: 'push',
  });

  const [warpSettings, setWarpSettings] = useState({
    size: 20,
    strength: 50,
    mode: 'forward',
  });

  // Handle tool selection
  const handleToolSelect = (tool: AdvancedDrawingTool) => {
    const newTool = currentTool === tool ? null : tool;
    onToolChange(newTool);

    // Update settings based on selected tool
    if (newTool) {
      switch (newTool) {
        case 'gradient':
          onSettingsChange(gradientSettings);
          break;
        case 'pattern':
          onSettingsChange(patternSettings);
          break;
        case 'symmetry':
          onSettingsChange(symmetrySettings);
          break;
        case 'perspective':
          onSettingsChange(perspectiveSettings);
          break;
        case 'clone':
          onSettingsChange(cloneSettings);
          break;
        case 'smudge':
          onSettingsChange(smudgeSettings);
          break;
        case 'blur':
          onSettingsChange(blurSettings);
          break;
        case 'sharpen':
          onSettingsChange(sharpenSettings);
          break;
        case 'liquify':
          onSettingsChange(liquifySettings);
          break;
        case 'warp':
          onSettingsChange(warpSettings);
          break;
      }
    }
  };

  // Update gradient settings
  const updateGradientSettings = (newSettings: Partial<typeof gradientSettings>) => {
    const updated = { ...gradientSettings, ...newSettings };
    setGradientSettings(updated);
    if (currentTool === 'gradient') {
      onSettingsChange(updated);
    }
  };

  // Update pattern settings
  const updatePatternSettings = (newSettings: Partial<typeof patternSettings>) => {
    const updated = { ...patternSettings, ...newSettings };
    setPatternSettings(updated);
    if (currentTool === 'pattern') {
      onSettingsChange(updated);
    }
  };

  // Update symmetry settings
  const updateSymmetrySettings = (newSettings: Partial<typeof symmetrySettings>) => {
    const updated = { ...symmetrySettings, ...newSettings };
    setSymmetrySettings(updated);
    if (currentTool === 'symmetry') {
      onSettingsChange(updated);
    }
  };

  // Render tool settings based on current tool
  const renderToolSettings = () => {
    if (!currentTool) return null;

    switch (currentTool) {
      case 'gradient':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={gradientSettings.type}
                onChange={(e) => updateGradientSettings({ type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
                <option value="conic">Conic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Color</label>
              <input
                type="color"
                value={gradientSettings.startColor}
                onChange={(e) => updateGradientSettings({ startColor: e.target.value })}
                className="w-full p-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Color</label>
              <input
                type="color"
                value={gradientSettings.endColor}
                onChange={(e) => updateGradientSettings({ endColor: e.target.value })}
                className="w-full p-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angle: {gradientSettings.angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradientSettings.angle}
                onChange={(e) => updateGradientSettings({ angle: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'pattern':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={patternSettings.type}
                onChange={(e) => updatePatternSettings({ type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="dots">Dots</option>
                <option value="lines">Lines</option>
                <option value="grid">Grid</option>
                <option value="crosshatch">Crosshatch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size: {patternSettings.size}px
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={patternSettings.size}
                onChange={(e) => updatePatternSettings({ size: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spacing: {patternSettings.spacing}px
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={patternSettings.spacing}
                onChange={(e) => updatePatternSettings({ spacing: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={patternSettings.color}
                onChange={(e) => updatePatternSettings({ color: e.target.value })}
                className="w-full p-1 border border-gray-300 rounded"
              />
            </div>
          </div>
        );

      case 'symmetry':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={symmetrySettings.type}
                onChange={(e) => updateSymmetrySettings({ type: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="mirror">Mirror</option>
                <option value="radial">Radial</option>
                <option value="mandala">Mandala</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Axes: {symmetrySettings.axes}
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={symmetrySettings.axes}
                onChange={(e) => updateSymmetrySettings({ axes: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angle: {symmetrySettings.angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={symmetrySettings.angle}
                onChange={(e) => updateSymmetrySettings({ angle: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        );

      // Add more tool settings as needed

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            Settings for {currentTool} tool will appear here.
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Advanced Tools</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <AnimatedButton
          onClick={() => handleToolSelect('gradient')}
          variant={currentTool === 'gradient' ? 'primary' : 'outline'}
          size="sm"
        >
          Gradient
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('pattern')}
          variant={currentTool === 'pattern' ? 'primary' : 'outline'}
          size="sm"
        >
          Pattern
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('symmetry')}
          variant={currentTool === 'symmetry' ? 'primary' : 'outline'}
          size="sm"
        >
          Symmetry
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('perspective')}
          variant={currentTool === 'perspective' ? 'primary' : 'outline'}
          size="sm"
        >
          Perspective
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('clone')}
          variant={currentTool === 'clone' ? 'primary' : 'outline'}
          size="sm"
        >
          Clone
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('smudge')}
          variant={currentTool === 'smudge' ? 'primary' : 'outline'}
          size="sm"
        >
          Smudge
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('blur')}
          variant={currentTool === 'blur' ? 'primary' : 'outline'}
          size="sm"
        >
          Blur
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('sharpen')}
          variant={currentTool === 'sharpen' ? 'primary' : 'outline'}
          size="sm"
        >
          Sharpen
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('liquify')}
          variant={currentTool === 'liquify' ? 'primary' : 'outline'}
          size="sm"
        >
          Liquify
        </AnimatedButton>
        <AnimatedButton
          onClick={() => handleToolSelect('warp')}
          variant={currentTool === 'warp' ? 'primary' : 'outline'}
          size="sm"
        >
          Warp
        </AnimatedButton>
      </div>

      {currentTool && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-md font-medium mb-2 capitalize">{currentTool} Settings</h4>
          {renderToolSettings()}
        </div>
      )}
    </div>
  );
};

export default AdvancedTools;