import { create } from 'zustand';

export type PinType = 'power' | 'ground' | 'input' | 'output';
export type ComponentType = 'microcontroller' | 'led' | 'powerSource' | 'signalSource' | 'signalTarget';

export interface Pin {
  id: string;
  type: PinType;
  x: number;
  y: number;
  value?: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  pins: Pin[];
  state?: {
    powered?: boolean;
    value?: number;
    blinking?: boolean;
    signal?: number;
    error?: string;
  };
}

interface Wire {
  id: string;
  from: { componentId: string; pinId: string };
  to: { componentId: string; pinId: string };
}

interface CircuitStore {
  components: Record<string, Component>;
  wires: Wire[];
  activePin: { componentId: string; pinId: string } | null;
  code: string;
  isRunning: boolean;
  error: string | null;
  
  // Actions
  addComponent: (type: ComponentType) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  setActivePin: (componentId: string, pinId: string) => void;
  clearActivePin: () => void;
  addWire: (from: { componentId: string; pinId: string }, to: { componentId: string; pinId: string }) => void;
  setCode: (code: string) => void;
  runSimulation: () => void;
  stopSimulation: () => void;
  reset: () => void;
  validateCircuit: () => string | null;
}

const createComponent = (type: ComponentType, id: string): Component => {
  switch (type) {
    case 'microcontroller':
      return {
        id,
        type,
        x: 100,
        y: 100,
        pins: [
          { id: 'vcc', type: 'power', x: 0, y: 10 },
          { id: 'gnd', type: 'ground', x: 0, y: 70 },
          { id: 'p0', type: 'output', x: 80, y: 30 },
          { id: 'p1', type: 'input', x: 80, y: 50 }
        ],
        state: { powered: false, value: 0 }
      };
    case 'led':
      return {
        id,
        type,
        x: 250,
        y: 100,
        pins: [
          { id: 'in', type: 'input', x: 0, y: 20 }
        ],
        state: { powered: false, value: 0, blinking: false }
      };
    case 'powerSource':
      return {
        id,
        type,
        x: 50,
        y: 50,
        pins: [
          { id: 'vcc', type: 'power', x: 80, y: 20 },
          { id: 'gnd', type: 'ground', x: 80, y: 60 }
        ],
        state: { value: 1 }
      };
    case 'signalSource':
      return {
        id,
        type,
        x: 50,
        y: 150,
        pins: [
          { id: 'out', type: 'output', x: 80, y: 30 }
        ],
        state: { signal: 5 }
      };
    case 'signalTarget':
      return {
        id,
        type,
        x: 300,
        y: 150,
        pins: [
          { id: 'in', type: 'input', x: 0, y: 30 }
        ],
        state: { value: 0 }
      };
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
};

const canConnectPins = (sourcePin: Pin, targetPin: Pin): boolean => {
  // Same type connections for power and ground
  if (sourcePin.type === 'power' && targetPin.type === 'power') return true;
  if (sourcePin.type === 'ground' && targetPin.type === 'ground') return true;
  
  // Output to input connections
  if (sourcePin.type === 'output' && targetPin.type === 'input') return true;
  if (sourcePin.type === 'input' && targetPin.type === 'output') return true;
  
  return false;
};

const parseAndExecuteCode = (code: string, components: Record<string, Component>): { error: string | null; components: Record<string, Component> } => {
  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith(';'));
  const newComponents = { ...components };
  
  try {
    let accumulator = 0;
    let lineIndex = 0;
    
    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      const [instruction, ...args] = line.split(' ').map(part => part.split(';')[0].trim());
      
      switch (instruction.toUpperCase()) {
        case 'MOV':
          const [dest, source] = args;
          if (dest === 'P0') {
            // Update signal target when writing to P0
            Object.values(newComponents).forEach(comp => {
              if (comp.type === 'signalTarget') {
                comp.state = { ...comp.state, value: accumulator * 2 }; // Double the value for Level 2
              }
            });
          } else if (source === 'P1') {
            // Read from signal source when reading from P1
            const signalSource = Object.values(newComponents).find(comp => comp.type === 'signalSource');
            accumulator = signalSource?.state?.signal || 0;
          } else {
            accumulator = parseInt(source, 10);
          }
          break;
          
        case 'MUL':
          const [_, value] = args;
          accumulator *= parseInt(value, 10);
          break;
          
        case 'JMP':
          lineIndex = parseInt(args[0], 10) - 1;
          continue;
      }
      
      lineIndex++;
    }
    
    return { error: null, components: newComponents };
  } catch (err) {
    return { error: 'Code execution error', components };
  }
};

export const useStore = create<CircuitStore>((set, get) => ({
  components: {},
  wires: [],
  activePin: null,
  code: '',
  isRunning: false,
  error: null,

  addComponent: (type) => set((state) => {
    const id = `${type}-${Object.keys(state.components).length}`;
    return {
      components: {
        ...state.components,
        [id]: createComponent(type, id)
      }
    };
  }),

  moveComponent: (id, x, y) => set((state) => ({
    components: {
      ...state.components,
      [id]: {
        ...state.components[id],
        x,
        y
      }
    }
  })),

  setActivePin: (componentId, pinId) => set((state) => {
    if (state.activePin) {
      const sourceComponent = state.components[state.activePin.componentId];
      const targetComponent = state.components[componentId];
      
      if (!sourceComponent || !targetComponent) {
        return { activePin: null };
      }
      
      const sourcePin = sourceComponent.pins.find(p => p.id === state.activePin.pinId);
      const targetPin = targetComponent.pins.find(p => p.id === pinId);
      
      if (!sourcePin || !targetPin) {
        return { activePin: null };
      }
      
      if (!canConnectPins(sourcePin, targetPin)) {
        return { 
          activePin: null,
          error: 'Invalid connection type'
        };
      }
      
      return {
        wires: [...state.wires, {
          id: `wire-${state.wires.length}`,
          from: state.activePin,
          to: { componentId, pinId }
        }],
        activePin: null,
        error: null
      };
    }
    return { activePin: { componentId, pinId } };
  }),

  clearActivePin: () => set({ activePin: null }),

  addWire: (from, to) => set((state) => ({
    wires: [...state.wires, {
      id: `wire-${state.wires.length}`,
      from,
      to
    }]
  })),

  setCode: (code) => set({ code }),

  validateCircuit: () => {
    const state = get();
    const mc = Object.values(state.components).find(c => c.type === 'microcontroller');
    const signalSource = Object.values(state.components).find(c => c.type === 'signalSource');
    const signalTarget = Object.values(state.components).find(c => c.type === 'signalTarget');
    const power = Object.values(state.components).find(c => c.type === 'powerSource');

    if (!mc) return 'Microcontroller is required';
    if (!signalSource) return 'Signal source is required';
    if (!signalTarget) return 'Signal target is required';
    if (!power) return 'Power source is required';

    // Check power connections
    const hasPower = state.wires.some(w => 
      (w.from.componentId === power.id && w.to.componentId === mc.id && 
       w.from.pinId === 'vcc' && w.to.pinId === 'vcc') ||
      (w.to.componentId === power.id && w.from.componentId === mc.id && 
       w.to.pinId === 'vcc' && w.from.pinId === 'vcc')
    );

    const hasGround = state.wires.some(w => 
      (w.from.componentId === power.id && w.to.componentId === mc.id && 
       w.from.pinId === 'gnd' && w.to.pinId === 'gnd') ||
      (w.to.componentId === power.id && w.from.componentId === mc.id && 
       w.to.pinId === 'gnd' && w.from.pinId === 'gnd')
    );

    if (!hasPower) return 'Microcontroller needs power connection';
    if (!hasGround) return 'Microcontroller needs ground connection';

    // Check signal connections
    const hasInput = state.wires.some(w => 
      (w.from.componentId === signalSource.id && w.to.componentId === mc.id && 
       w.from.pinId === 'out' && w.to.pinId === 'p1') ||
      (w.to.componentId === signalSource.id && w.from.componentId === mc.id && 
       w.to.pinId === 'out' && w.from.pinId === 'p1')
    );

    const hasOutput = state.wires.some(w => 
      (w.from.componentId === mc.id && w.to.componentId === signalTarget.id && 
       w.from.pinId === 'p0' && w.to.pinId === 'in') ||
      (w.to.componentId === mc.id && w.from.componentId === signalTarget.id && 
       w.to.pinId === 'p0' && w.from.pinId === 'in')
    );

    if (!hasInput) return 'Signal source must be connected to P1';
    if (!hasOutput) return 'P0 must be connected to signal target';

    return null;
  },

  runSimulation: () => {
    const state = get();
    
    // Validate circuit first
    const circuitError = get().validateCircuit();
    if (circuitError) {
      set({ error: circuitError, isRunning: false });
      return;
    }

    // Execute code
    const { error, components } = parseAndExecuteCode(state.code, state.components);
    if (error) {
      set({ error, isRunning: false });
      return;
    }

    set({
      components,
      isRunning: true,
      error: null
    });
  },

  stopSimulation: () => set((state) => {
    const newComponents = { ...state.components };
    Object.values(newComponents).forEach(component => {
      if (component.type === 'led') {
        component.state = { ...component.state, blinking: false };
      }
    });

    return {
      components: newComponents,
      isRunning: false
    };
  }),

  reset: () => set((state) => {
    const newComponents = { ...state.components };
    Object.values(newComponents).forEach(component => {
      component.state = { powered: false, value: 0, blinking: false, signal: 5 };
    });

    return {
      components: newComponents,
      isRunning: false,
      error: null,
      code: '',
      wires: []
    };
  })
}));