import { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  width?: number;
  height?: number;
  brushColor?: string;
  brushSize?: number;
  tool?: 'brush' | 'eraser' | 'pencil';
}

export function Canvas({
  width = 800,
  height = 600,
  brushColor = '#000000',
  brushSize = 5,
  tool = 'brush',
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  
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
  }, [width, height]);
  
  // Update brush settings when they change
  useEffect(() => {
    if (!context) return;
    
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : brushColor;
    context.lineWidth = brushSize;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  }, [context, brushColor, brushSize, tool]);
  
  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };
  
  const stopDrawing = () => {
    if (!context) return;
    
    context.closePath();
    setIsDrawing(false);
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      className="border border-gray-300 rounded-md shadow-md bg-white"
    />
  );
}
