import { Layers, Plus, Trash2, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
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
}: LayerPanelProps) {
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Layers className="mr-2" size={20} />
          Layers
        </h2>
        <button
          onClick={onLayerAdd}
          className="p-1 rounded-md hover:bg-gray-100"
          title="Add Layer"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-2">
            No layers. Click + to add one.
          </div>
        ) : (
          layers.map((layer) => (
            <div
              key={layer.id}
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
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <span className="text-sm truncate max-w-[100px]">{layer.name}</span>
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
                  <MoveUp size={16} />
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
                  <MoveDown size={16} />
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
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
