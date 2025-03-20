import React from 'react';
import { useDrag } from 'react-dnd';
import { Pin } from './Pin';
import { Component } from '../store';
import { Cpu, Lightbulb, Battery, Radio, Target } from 'lucide-react';

interface CircuitComponentProps {
  component: Component;
  isActive: boolean;
}

const ComponentIcon: React.FC<{ type: string; isOn?: boolean }> = ({ type, isOn }) => {
  switch (type) {
    case 'microcontroller':
      return <Cpu className="w-8 h-8 text-blue-400" />;
    case 'led':
      return <Lightbulb className={`w-8 h-8 ${isOn ? 'text-yellow-400' : 'text-gray-400'}`} />;
    case 'powerSource':
      return <Battery className="w-8 h-8 text-green-400" />;
    case 'signalSource':
      return <Radio className="w-8 h-8 text-purple-400" />;
    case 'signalTarget':
      return <Target className="w-8 h-8 text-orange-400" />;
    default:
      return null;
  }
};

export const CircuitComponent: React.FC<CircuitComponentProps> = ({ 
  component,
  isActive,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { id: component.id, x: component.x, y: component.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [component.id, component.x, component.y]);

  const isBlinking = component.state?.blinking;
  const [blink, setBlink] = React.useState(false);

  React.useEffect(() => {
    if (isBlinking) {
      const interval = setInterval(() => {
        setBlink(b => !b);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setBlink(false);
    }
  }, [isBlinking]);

  // Display signal value for signal components
  const showSignalValue = component.type === 'signalSource' || component.type === 'signalTarget';
  const signalValue = component.state?.signal || component.state?.value || 0;

  return (
    <div
      ref={drag}
      className={`absolute cursor-move ${isActive ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: component.x,
        top: component.y,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="relative bg-slate-700 rounded-md p-4 flex flex-col items-center">
        <ComponentIcon type={component.type} isOn={blink} />
        <span className="text-xs text-slate-300 mt-2">{component.type}</span>
        {showSignalValue && (
          <span className="text-xs text-slate-300 mt-1">Signal: {signalValue}</span>
        )}
        {component.state?.error && (
          <span className="text-xs text-red-400 mt-1">{component.state.error}</span>
        )}
        
        {/* Pins */}
        {component.pins.map((pin) => (
          <Pin
            key={pin.id}
            componentId={component.id}
            pin={pin}
          />
        ))}
      </div>
    </div>
  );
};