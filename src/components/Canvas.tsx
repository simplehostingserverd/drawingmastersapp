'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';

// Define all possible tools
export type DrawingTool =
  | 'brush'
  | 'eraser'
  | 'pencil'
  | 'square'
  | 'circle'
  | 'line'
  | 'text'
  | 'select';

// Define history entry for undo/redo
interface HistoryEntry {
  imageData: ImageData;
}

interface CanvasProps {
  width?: number;
  height?: number;
  brushColor?: string;
  brushSize?: number;
  tool?: DrawingTool;
  zoom?: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  width = 800,
  height = 600,
  brushColor = '#000000',
  brushSize = 5,
  tool = 'brush',
  zoom = 1,
  onHistoryChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas background to white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    setContext(ctx);

    // Save initial state to history
    const initialImageData = ctx.getImageData(0, 0, width, height);
    setHistory([{ imageData: initialImageData }]);
    setHistoryIndex(0);

    if (onHistoryChange) {
      onHistoryChange(false, false);
    }
  }, [width, height, onHistoryChange]);

  // Update brush settings when they change
  useEffect(() => {
    if (!context) return;

    context.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
    context.fillStyle = brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, [context, brushColor, brushSize, tool]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (!context || !canvasRef.current) return;

    const imageData = context.getImageData(0, 0, width, height);

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ imageData });

    // Limit history size to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    if (onHistoryChange) {
      onHistoryChange(newHistory.length > 1, false);
    }
  }, [context, history, historyIndex, width, height, onHistoryChange]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex <= 0 || !context) return;

    const newIndex = historyIndex - 1;
    const entry = history[newIndex];

    context.putImageData(entry.imageData, 0, 0);
    setHistoryIndex(newIndex);

    if (onHistoryChange) {
      onHistoryChange(newIndex > 0, true);
    }
  }, [history, historyIndex, context, onHistoryChange]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !context) return;

    const newIndex = historyIndex + 1;
    const entry = history[newIndex];

    context.putImageData(entry.imageData, 0, 0);
    setHistoryIndex(newIndex);

    if (onHistoryChange) {
      onHistoryChange(true, newIndex < history.length - 1);
    }
  }, [history, historyIndex, context, onHistoryChange]);

  // Expose undo/redo methods
  useEffect(() => {
    if (!canvasRef.current) return;

    // Attach methods to the canvas element for external access
    const canvasElement = canvasRef.current;
    (canvasElement as any).undo = undo;
    (canvasElement as any).redo = redo;
    (canvasElement as any).saveToHistory = saveToHistory;

    return () => {
      // Clean up
      (canvasElement as any).undo = undefined;
      (canvasElement as any).redo = undefined;
      (canvasElement as any).saveToHistory = undefined;
    };
  }, [undo, redo, saveToHistory]);

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const x = offsetX / zoom;
    const y = offsetY / zoom;

    // Handle text tool
    if (tool === 'text') {
      setIsTextMode(true);
      setTextPosition({ x, y });

      // Create text input at click position
      const input = document.createElement('input');
      input.type = 'text';
      input.style.position = 'absolute';
      input.style.left = `${offsetX}px`;
      input.style.top = `${offsetY}px`;
      input.style.color = brushColor;
      input.style.background = 'transparent';
      input.style.border = '1px dashed #999';
      input.style.font = `${brushSize * 2}px sans-serif`;
      input.style.zIndex = '1000';

      input.onkeydown = (ke) => {
        if (ke.key === 'Enter') {
          if (input.value && context) {
            context.font = `${brushSize * 2}px sans-serif`;
            context.fillStyle = brushColor;
            context.fillText(input.value, x, y + brushSize);
            saveToHistory();
          }
          document.body.removeChild(input);
          setIsTextMode(false);
        }
      };

      input.onblur = () => {
        if (input.value && context) {
          context.font = `${brushSize * 2}px sans-serif`;
          context.fillStyle = brushColor;
          context.fillText(input.value, x, y + brushSize);
          saveToHistory();
        }
        document.body.removeChild(input);
        setIsTextMode(false);
      };

      document.body.appendChild(input);
      input.focus();
      textInputRef.current = input;
      return;
    }

    // Handle selection tool
    if (tool === 'select') {
      setStartPos({ x, y });
      setIsDrawing(true);
      return;
    }

    // For shape tools, just record the starting position
    if (['square', 'circle', 'line'].includes(tool)) {
      setStartPos({ x, y });
      setIsDrawing(true);
      return;
    }

    // For brush tools
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || isTextMode) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const x = offsetX / zoom;
    const y = offsetY / zoom;

    // Handle selection tool
    if (tool === 'select' && startPos) {
      // Draw selection rectangle (with XOR compositing to make it visible on any background)
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Redraw from history to clear previous selection rectangle
      if (historyIndex >= 0) {
        context.putImageData(history[historyIndex].imageData, 0, 0);
      }

      // Draw new selection rectangle
      context.save();
      context.strokeStyle = '#0078d7';
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.strokeRect(
        startPos.x,
        startPos.y,
        x - startPos.x,
        y - startPos.y
      );
      context.restore();

      return;
    }

    // For shape tools, redraw from history to show preview
    if (['square', 'circle', 'line'].includes(tool) && startPos) {
      // Redraw from history to clear previous shape preview
      if (historyIndex >= 0) {
        context.putImageData(history[historyIndex].imageData, 0, 0);
      }

      context.save();

      if (tool === 'square') {
        context.beginPath();
        context.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        context.stroke();
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
        );
        context.beginPath();
        context.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        context.stroke();
      } else if (tool === 'line') {
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(x, y);
        context.stroke();
      }

      context.restore();
      return;
    }

    // For brush tools
    if (['brush', 'eraser', 'pencil'].includes(tool)) {
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (!context || !isDrawing) return;

    // Handle selection tool
    if (tool === 'select' && startPos) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Calculate selection bounds (ensure positive width/height)
      const x = Math.min(startPos.x, startPos.x);
      const y = Math.min(startPos.y, startPos.y);
      const width = Math.abs(startPos.x - startPos.x);
      const height = Math.abs(startPos.y - startPos.y);

      // Set selection state
      setSelection({ x, y, width, height });

      // Restore the canvas without selection rectangle
      if (historyIndex >= 0) {
        context.putImageData(history[historyIndex].imageData, 0, 0);
      }

      // Draw final selection rectangle
      context.save();
      context.strokeStyle = '#0078d7';
      context.lineWidth = 1;
      context.setLineDash([5, 5]);
      context.strokeRect(x, y, width, height);
      context.restore();

      setIsDrawing(false);
      setStartPos(null);
      return;
    }

    // For shape tools, draw the final shape
    if (['square', 'circle', 'line'].includes(tool) && startPos) {
      // Redraw from history to clear preview
      if (historyIndex >= 0) {
        context.putImageData(history[historyIndex].imageData, 0, 0);
      }

      // Get current mouse position
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (startPos.x + canvas.width / 2 - rect.width / 2) / zoom;
      const y = (startPos.y + canvas.height / 2 - rect.height / 2) / zoom;

      // Draw the final shape
      if (tool === 'square') {
        context.beginPath();
        context.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        context.stroke();
      } else if (tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
        );
        context.beginPath();
        context.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        context.stroke();
      } else if (tool === 'line') {
        context.beginPath();
        context.moveTo(startPos.x, startPos.y);
        context.lineTo(x, y);
        context.stroke();
      }

      // Save to history
      saveToHistory();
    } else if (['brush', 'eraser', 'pencil'].includes(tool)) {
      context.closePath();
      saveToHistory();
    }

    setIsDrawing(false);
    setStartPos(null);
  };

  // Clean up text input on unmount
  useEffect(() => {
    return () => {
      if (textInputRef.current && document.body.contains(textInputRef.current)) {
        document.body.removeChild(textInputRef.current);
      }
    };
  }, []);

  // Export canvas as image
  const exportImage = useCallback((format: 'png' | 'jpeg' | 'svg' = 'png') => {
    if (!canvasRef.current) return null;

    if (format === 'svg') {
      // SVG export would require additional implementation
      console.warn('SVG export not implemented yet');
      return null;
    }

    return canvasRef.current.toDataURL(`image/${format}`);
  }, []);

  // Attach export method to canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    (canvasRef.current as any).exportImage = exportImage;

    return () => {
      if (canvasRef.current) {
        (canvasRef.current as any).exportImage = undefined;
      }
    };
  }, [exportImage]);

  // Use the forwarded ref if provided, otherwise use the internal ref
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(canvasRef.current);
      } else {
        ref.current = canvasRef.current;
      }
    }
  }, [ref]);

  return (
    <div
      className="relative"
      style={{
        width: width * zoom,
        height: height * zoom,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-gray-300 rounded-md shadow-md bg-white"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left'
        }}
      />
    </div>
  );
});
