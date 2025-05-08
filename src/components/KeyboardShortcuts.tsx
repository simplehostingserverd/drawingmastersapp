'use client';

import { X } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  if (!isOpen) return null;
  
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['Ctrl', 'S'], description: 'Save' },
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Y'], description: 'Redo' },
        { keys: ['Ctrl', 'O'], description: 'Open' },
        { keys: ['Ctrl', 'N'], description: 'New' },
        { keys: ['Ctrl', 'E'], description: 'Export' },
        { keys: ['?'], description: 'Show keyboard shortcuts' },
      ],
    },
    {
      title: 'Tools',
      shortcuts: [
        { keys: ['B'], description: 'Brush tool' },
        { keys: ['E'], description: 'Eraser tool' },
        { keys: ['P'], description: 'Pencil tool' },
        { keys: ['T'], description: 'Text tool' },
        { keys: ['S'], description: 'Selection tool' },
        { keys: ['R'], description: 'Rectangle tool' },
        { keys: ['C'], description: 'Circle tool' },
        { keys: ['L'], description: 'Line tool' },
      ],
    },
    {
      title: 'View',
      shortcuts: [
        { keys: ['Ctrl', '+'], description: 'Zoom in' },
        { keys: ['Ctrl', '-'], description: 'Zoom out' },
        { keys: ['Ctrl', '0'], description: 'Reset zoom' },
        { keys: ['Space'], description: 'Pan (hold and drag)' },
        { keys: ['F'], description: 'Fit to screen' },
      ],
    },
    {
      title: 'Layers',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'N'], description: 'New layer' },
        { keys: ['Ctrl', 'G'], description: 'Group layers' },
        { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup layers' },
        { keys: ['Ctrl', ']'], description: 'Move layer up' },
        { keys: ['Ctrl', '['], description: 'Move layer down' },
        { keys: ['Ctrl', 'J'], description: 'Duplicate layer' },
        { keys: ['Delete'], description: 'Delete layer' },
      ],
    },
  ];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <h3 className="text-lg font-medium mb-2">{group.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1 border-b border-gray-100"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span
                          key={keyIndex}
                          className="px-2 py-1 bg-gray-100 rounded text-xs font-mono"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
