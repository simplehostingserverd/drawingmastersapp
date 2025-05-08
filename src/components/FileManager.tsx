'use client';

import { useState } from 'react';
import { Save, FolderOpen, Download, FileUp, X } from 'lucide-react';

interface FileManagerProps {
  onSave: () => void;
  onOpen: (file: File) => void;
  onExport: (format: 'png' | 'jpeg' | 'svg') => void;
  onNewProject: () => void;
}

export function FileManager({ onSave, onOpen, onExport, onNewProject }: FileManagerProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onOpen(files[0]);
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-4">File</h2>
      
      <div className="space-y-2">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
        >
          <span className="text-sm">New Project</span>
          <span className="text-xs text-gray-500">Ctrl+N</span>
        </button>
        
        <label className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer">
          <span className="text-sm">Open</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Ctrl+O</span>
            <FolderOpen size={16} />
          </div>
          <input
            type="file"
            accept=".json,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        
        <button
          onClick={onSave}
          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
        >
          <span className="text-sm">Save</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Ctrl+S</span>
            <Save size={16} />
          </div>
        </button>
        
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
          >
            <span className="text-sm">Export</span>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Ctrl+E</span>
              <Download size={16} />
            </div>
          </button>
          
          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <button
                onClick={() => {
                  onExport('png');
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left p-2 text-sm hover:bg-gray-100"
              >
                PNG
              </button>
              <button
                onClick={() => {
                  onExport('jpeg');
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left p-2 text-sm hover:bg-gray-100"
              >
                JPEG
              </button>
              <button
                onClick={() => {
                  onExport('svg');
                  setIsExportMenuOpen(false);
                }}
                className="w-full text-left p-2 text-sm hover:bg-gray-100"
              >
                SVG
              </button>
              <button
                onClick={() => setIsExportMenuOpen(false)}
                className="w-full flex items-center justify-between p-2 text-sm hover:bg-gray-100 text-gray-500"
              >
                <span>Cancel</span>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
