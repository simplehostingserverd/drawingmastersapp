'use client';

import { useState } from 'react';

interface ColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Predefined color palette
  const colorPalette = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#00ffff', '#ff00ff', '#c0c0c0', '#808080',
    '#800000', '#808000', '#008000', '#800080', '#008080',
    '#000080', '#ff6347', '#4682b4', '#ffa500', '#32cd32',
  ];

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4">Colors</h2>
      
      <div className="mb-4">
        <div 
          className="w-full h-12 rounded-md border border-gray-300 mb-2 cursor-pointer"
          style={{ backgroundColor: currentColor }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
        
        {showColorPicker && (
          <div className="mb-2">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-8"
            />
          </div>
        )}
        
        <div className="text-sm text-center">{currentColor}</div>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {colorPalette.map((color) => (
          <button
            key={color}
            className={`w-full aspect-square rounded-md border ${
              color === currentColor ? 'border-black border-2' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
