import { useState } from 'react';
import { Filter, Sliders, Wand2 } from 'lucide-react';

export type FilterType = 
  | 'blur' 
  | 'brightness' 
  | 'contrast' 
  | 'grayscale' 
  | 'hue-rotate' 
  | 'invert' 
  | 'saturate' 
  | 'sepia';

export interface FilterSettings {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  hueRotate: number;
  invert: number;
  saturate: number;
  sepia: number;
}

interface FiltersPanelProps {
  filters: FilterSettings;
  onFilterChange: (type: keyof FilterSettings, value: number) => void;
  onApplyFilter: () => void;
  onResetFilters: () => void;
}

export function FiltersPanel({
  filters,
  onFilterChange,
  onApplyFilter,
  onResetFilters,
}: FiltersPanelProps) {
  const [activeTab, setActiveTab] = useState<'adjust' | 'effects'>('adjust');
  
  const filterControls = [
    {
      type: 'brightness' as keyof FilterSettings,
      label: 'Brightness',
      min: 0,
      max: 200,
      step: 1,
      unit: '%',
      defaultValue: 100,
    },
    {
      type: 'contrast' as keyof FilterSettings,
      label: 'Contrast',
      min: 0,
      max: 200,
      step: 1,
      unit: '%',
      defaultValue: 100,
    },
    {
      type: 'saturate' as keyof FilterSettings,
      label: 'Saturation',
      min: 0,
      max: 200,
      step: 1,
      unit: '%',
      defaultValue: 100,
    },
    {
      type: 'hueRotate' as keyof FilterSettings,
      label: 'Hue',
      min: 0,
      max: 360,
      step: 1,
      unit: '°',
      defaultValue: 0,
    },
  ];
  
  const effectControls = [
    {
      type: 'blur' as keyof FilterSettings,
      label: 'Blur',
      min: 0,
      max: 20,
      step: 0.1,
      unit: 'px',
      defaultValue: 0,
    },
    {
      type: 'grayscale' as keyof FilterSettings,
      label: 'Grayscale',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      defaultValue: 0,
    },
    {
      type: 'sepia' as keyof FilterSettings,
      label: 'Sepia',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      defaultValue: 0,
    },
    {
      type: 'invert' as keyof FilterSettings,
      label: 'Invert',
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      defaultValue: 0,
    },
  ];
  
  const presetEffects = [
    { name: 'None', settings: { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
    { name: 'Vintage', settings: { brightness: 120, contrast: 90, saturate: 85, hueRotate: 20, blur: 0, grayscale: 10, sepia: 30, invert: 0 } },
    { name: 'B&W', settings: { brightness: 100, contrast: 120, saturate: 0, hueRotate: 0, blur: 0, grayscale: 100, sepia: 0, invert: 0 } },
    { name: 'Dramatic', settings: { brightness: 110, contrast: 130, saturate: 130, hueRotate: 0, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
    { name: 'Cool', settings: { brightness: 100, contrast: 100, saturate: 90, hueRotate: 180, blur: 0, grayscale: 0, sepia: 0, invert: 0 } },
    { name: 'Warm', settings: { brightness: 105, contrast: 100, saturate: 110, hueRotate: 30, blur: 0, grayscale: 0, sepia: 20, invert: 0 } },
    { name: 'Negative', settings: { brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, blur: 0, grayscale: 0, sepia: 0, invert: 100 } },
  ];
  
  const applyPreset = (preset: typeof presetEffects[0]) => {
    Object.entries(preset.settings).forEach(([key, value]) => {
      onFilterChange(key as keyof FilterSettings, value);
    });
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Filter className="mr-2" size={20} />
        Filters & Effects
      </h2>
      
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'adjust' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('adjust')}
        >
          <Sliders size={16} className="inline mr-1" />
          Adjust
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'effects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('effects')}
        >
          <Wand2 size={16} className="inline mr-1" />
          Effects
        </button>
      </div>
      
      {activeTab === 'adjust' ? (
        <div className="space-y-3">
          {filterControls.map((control) => (
            <div key={control.type} className="space-y-1">
              <div className="flex justify-between text-xs">
                <label>{control.label}</label>
                <span>
                  {filters[control.type]}
                  {control.unit}
                </span>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={filters[control.type]}
                onChange={(e) => onFilterChange(control.type, Number(e.target.value))}
                className="w-full h-1.5"
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="space-y-3 mb-4">
            {effectControls.map((control) => (
              <div key={control.type} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label>{control.label}</label>
                  <span>
                    {filters[control.type]}
                    {control.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={filters[control.type]}
                  onChange={(e) => onFilterChange(control.type, Number(e.target.value))}
                  className="w-full h-1.5"
                />
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Presets</h3>
            <div className="grid grid-cols-3 gap-1">
              {presetEffects.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        <button
          onClick={onResetFilters}
          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Reset
        </button>
        <button
          onClick={onApplyFilter}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
