import React from 'react';
import { useStore } from '../store';
import { Cpu, Lightbulb, Battery, Radio, Target } from 'lucide-react';

const components = [
  { type: 'microcontroller' as const, label: 'Microcontroller', icon: Cpu },
  { type: 'led' as const, label: 'LED', icon: Lightbulb },
  { type: 'powerSource' as const, label: 'Power Source', icon: Battery },
  { type: 'signalSource' as const, label: 'Signal Source', icon: Radio },
  { type: 'signalTarget' as const, label: 'Signal Target', icon: Target },
];

export const ComponentPalette: React.FC = () => {
  const addComponent = useStore(state => state.addComponent);

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Components</h3>
      <div className="space-y-2">
        {components.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-md text-left flex items-center gap-3 transition-colors"
            onClick={() => addComponent(type)}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};