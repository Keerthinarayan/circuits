import React from 'react';
import { useStore } from '../store';

interface PinProps {
  componentId: string;
  pin: {
    id: string;
    type: string;
    x: number;
    y: number;
  };
}

export const Pin: React.FC<PinProps> = ({ componentId, pin }) => {
  const { setActivePin, activePin } = useStore();
  
  // Check if this pin is the currently active one
  const isActive = activePin && 
    activePin.componentId === componentId && 
    activePin.pinId === pin.id;
  
  // Determine pin color based on type
  const getPinColor = (type: string) => {
    switch (type) {
      case 'power': return 'bg-red-500';
      case 'ground': return 'bg-gray-500';
      case 'input': return 'bg-green-500';
      case 'output': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };
  
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering component selection
    setActivePin(componentId, pin.id);
  };

  return (
    <div 
      className={`absolute w-4 h-4 rounded-full ${getPinColor(pin.type)} cursor-pointer
        ${isActive ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-white/50'}`}
      style={{
        left: pin.x,
        top: pin.y,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={handlePinClick}
    />
  );
};