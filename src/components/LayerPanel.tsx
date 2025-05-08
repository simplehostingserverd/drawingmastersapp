'use client';

import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

// Define blending modes
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  isGroup?: boolean;
  parentId?: string;
  children?: string[];
}

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerAdd: () => void;
  onLayerRemove: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerMoveUp: (layerId: string) => void;
  onLayerMoveDown: (layerId: string) => void;
  onLayerOpacityChange?: (layerId: string, opacity: number) => void;
  onLayerBlendModeChange?: (layerId: string, blendMode: BlendMode) => void;
  onLayerGroupCreate?: () => void;
}

export function LayerPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerAdd,
  onLayerRemove,
  onLayerVisibilityToggle,
  onLayerMoveUp,
  onLayerMoveDown,
  onLayerOpacityChange,
  onLayerBlendModeChange,
  onLayerGroupCreate,
}: LayerPanelProps) {
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null);

  const blendModes: BlendMode[] = [
    'normal',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion'
  ];

  const toggleLayerSettings = (layerId: string) => {
    if (expandedLayerId === layerId) {
      setExpandedLayerId(null);
    } else {
      setExpandedLayerId(layerId);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <LucideIcons.Layers className="mr-2" size={20} />
          Layers
        </h2>
        <div className="flex space-x-1">
          {onLayerGroupCreate && (
            <button
              onClick={onLayerGroupCreate}
              className="p-1 rounded-md hover:bg-gray-100"
              title="Add Layer Group"
            >
              <LucideIcons.FolderPlus size={20} />
            </button>
          )}
          <button
            onClick={onLayerAdd}
            className="p-1 rounded-md hover:bg-gray-100"
            title="Add Layer"
          >
            <LucideIcons.Plus size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-2">
            No layers. Click + to add one.
          </div>
        ) : (
          layers.map((layer) => (
            <div key={layer.id} className="mb-1">
              <div
                className={`p-2 rounded-md flex items-center justify-between ${
                  layer.id === activeLayerId
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onLayerSelect(layer.id)}
              >
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerVisibilityToggle(layer.id);
                    }}
                    className="mr-2 text-gray-600 hover:text-gray-900"
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? <LucideIcons.Eye size={16} /> : <LucideIcons.EyeOff size={16} />}
                  </button>
                  <span className="text-sm truncate max-w-[100px]">
                    {layer.name}
                    {layer.opacity < 1 && ` (${Math.round(layer.opacity * 100)}%)`}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerMoveUp(layer.id);
                    }}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    title="Move Up"
                    disabled={layers.indexOf(layer) === 0}
                  >
                    <LucideIcons.MoveUp size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerMoveDown(layer.id);
                    }}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    title="Move Down"
                    disabled={layers.indexOf(layer) === layers.length - 1}
                  >
                    <LucideIcons.MoveDown size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerSettings(layer.id);
                    }}
                    className={`p-1 ${
                      expandedLayerId === layer.id
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="Layer Settings"
                  >
                    <LucideIcons.Settings size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerRemove(layer.id);
                    }}
                    className="p-1 text-gray-600 hover:text-red-600"
                    title="Delete Layer"
                    disabled={layers.length <= 1}
                  >
                    <LucideIcons.Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedLayerId === layer.id && (
                <div className="mt-1 p-2 bg-gray-50 rounded-md border border-gray-200">
                  {onLayerOpacityChange && (
                    <div className="mb-2">
                      <label className="block text-xs font-medium mb-1">
                        Opacity: {Math.round(layer.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.opacity * 100}
                        onChange={(e) =>
                          onLayerOpacityChange(layer.id, Number(e.target.value) / 100)
                        }
                        className="w-full h-1.5"
                      />
                    </div>
                  )}

                  {onLayerBlendModeChange && (
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Blend Mode
                      </label>
                      <select
                        value={layer.blendMode}
                        onChange={(e) =>
                          onLayerBlendModeChange(layer.id, e.target.value as BlendMode)
                        }
                        className="w-full text-xs p-1 border border-gray-300 rounded"
                      >
                        {blendModes.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Render child layers if this is a group */}
              {layer.isGroup && layer.children && layer.children.length > 0 && (
                <div className="pl-4 mt-1 border-l-2 border-gray-200">
                  {layer.children.map(childId => {
                    const childLayer = layers.find(l => l.id === childId);
                    if (!childLayer) return null;

                    return (
                      <div
                        key={childLayer.id}
                        className={`p-2 rounded-md flex items-center justify-between ${
                          childLayer.id === activeLayerId
                            ? 'bg-blue-100'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => onLayerSelect(childLayer.id)}
                      >
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLayerVisibilityToggle(childLayer.id);
                            }}
                            className="mr-2 text-gray-600 hover:text-gray-900"
                            title={childLayer.visible ? 'Hide Layer' : 'Show Layer'}
                          >
                            {childLayer.visible ? <LucideIcons.Eye size={14} /> : <LucideIcons.EyeOff size={14} />}
                          </button>
                          <span className="text-xs truncate max-w-[80px]">{childLayer.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
