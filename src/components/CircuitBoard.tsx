import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store';
import { CircuitComponent } from './CircuitComponent';

export const CircuitBoard: React.FC = () => {
  const { 
    components, 
    wires, 
    activePin, 
    moveComponent, 
    clearActivePin
  } = useStore();
  
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Set up the drop target for dragging components
  const [, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item: { id: string; x: number; y: number }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const x = Math.round(item.x + delta.x);
        const y = Math.round(item.y + delta.y);
        moveComponent(item.id, x, y);
      }
      return undefined;
    },
  }), [moveComponent]);
  
  // Draw wires on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all existing wires
    wires.forEach(wire => {
      const fromComponent = components[wire.from.componentId];
      const toComponent = components[wire.to.componentId];
      
      if (!fromComponent || !toComponent) return;
      
      const fromPin = fromComponent.pins.find(p => p.id === wire.from.pinId);
      const toPin = toComponent.pins.find(p => p.id === wire.to.pinId);
      
      if (!fromPin || !toPin) return;
      
      const startX = fromComponent.x + fromPin.x;
      const startY = fromComponent.y + fromPin.y;
      const endX = toComponent.x + toPin.x;
      const endY = toComponent.y + toPin.y;
      
      // Draw wire
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.strokeStyle = getWireColor(fromPin.type);
      context.lineWidth = 2;
      context.stroke();
    });
    
    // Draw active wire if there's an active pin
    if (activePin) {
      const component = components[activePin.componentId];
      if (component) {
        const pin = component.pins.find(p => p.id === activePin.pinId);
        if (pin) {
          const startX = component.x + pin.x;
          const startY = component.y + pin.y;
          
          // Get mouse position from mousemove event
          const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Redraw the wires
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw existing wires
            wires.forEach(wire => {
              const fromComponent = components[wire.from.componentId];
              const toComponent = components[wire.to.componentId];
              
              if (!fromComponent || !toComponent) return;
              
              const fromPin = fromComponent.pins.find(p => p.id === wire.from.pinId);
              const toPin = toComponent.pins.find(p => p.id === wire.to.pinId);
              
              if (!fromPin || !toPin) return;
              
              const wireStartX = fromComponent.x + fromPin.x;
              const wireStartY = fromComponent.y + fromPin.y;
              const wireEndX = toComponent.x + toPin.x;
              const wireEndY = toComponent.y + toPin.y;
              
              context.beginPath();
              context.moveTo(wireStartX, wireStartY);
              context.lineTo(wireEndX, wireEndY);
              context.strokeStyle = getWireColor(fromPin.type);
              context.lineWidth = 2;
              context.stroke();
            });
            
            // Draw active wire
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(mouseX, mouseY);
            context.strokeStyle = getWireColor(pin.type);
            context.lineWidth = 2;
            context.stroke();
          };
          
          // Add and remove event listener
          canvas.addEventListener('mousemove', handleMouseMove);
          return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
          };
        }
      }
    }
  }, [components, wires, activePin]);
  
  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const board = boardRef.current;
    if (!canvas || !board) return;
    
    const resizeCanvas = () => {
      canvas.width = board.clientWidth;
      canvas.height = board.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);
  
  // Get wire color based on pin type
  const getWireColor = (pinType: string) => {
    switch (pinType) {
      case 'power': return '#ef4444'; // red
      case 'ground': return '#6b7280'; // gray
      case 'input': return '#22c55e'; // green
      case 'output': return '#3b82f6'; // blue
      default: return '#8b5cf6'; // purple
    }
  };
  
  // Clear active pin when clicking on empty board area
  const handleBoardClick = () => {
    clearActivePin();
  };
  
  return (
    <div 
      ref={drop}
      className="relative bg-slate-900 rounded-xl h-96"
    >
      <div 
        ref={boardRef}
        className="relative w-full h-full overflow-hidden"
        onClick={handleBoardClick}
      >
        {/* Canvas for drawing wires */}
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Components */}
        {Object.values(components).map((component) => (
          <CircuitComponent
            key={component.id}
            component={component}
            isActive={false}
          />
        ))}
      </div>
    </div>
  );
};