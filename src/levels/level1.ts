import { Cpu } from 'lucide-react';
import type { Level } from './index';

export const Level1: Level = {
  id: 1,
  title: "Microcontroller Tutorial",
  description: "Learn the basics of circuit design and assembly programming. Place your first microcontroller and LED, then write code to make it blink.",
  icon: Cpu,
  hints: [
    "Start by placing a microcontroller on the grid",
    "Connect an LED to any output port",
    "Use MOV to set values",
    "Try MOV WAIT JMP "
  ],
  maxAttempts: 5,
  validateCircuit: (components: any, wires: any) => {
    const mc = Object.values(components).find((c: any) => c.type === 'microcontroller');
    const power = Object.values(components).find((c: any) => c.type === 'powerSource');
    const led = Object.values(components).find((c: any) => c.type === 'led');

    if (!mc) return 'Microcontroller is required';
    if (!power) return 'Power source is required';
    if (!led) return 'LED is required';

    // Check power connections
    const hasPower = wires.some((w: any) => 
      (w.from.componentId === power.id && w.to.componentId === mc.id && 
       w.from.pinId === 'vcc' && w.to.pinId === 'vcc') ||
      (w.to.componentId === power.id && w.from.componentId === mc.id && 
       w.to.pinId === 'vcc' && w.from.pinId === 'vcc')
    );

    const hasGround = wires.some((w: any) => 
      (w.from.componentId === power.id && w.to.componentId === mc.id && 
       w.from.pinId === 'gnd' && w.to.pinId === 'gnd') ||
      (w.to.componentId === power.id && w.from.componentId === mc.id && 
       w.to.pinId === 'gnd' && w.from.pinId === 'gnd')
    );

    if (!hasPower) return 'Microcontroller needs power connection';
    if (!hasGround) return 'Microcontroller needs ground connection';

    // Check LED connection
    const hasLedConnection = wires.some((w: any) => 
      (w.from.componentId === mc.id && w.to.componentId === led.id && 
       w.from.pinId === 'p0' && w.to.pinId === 'in') ||
      (w.to.componentId === mc.id && w.from.componentId === led.id && 
       w.to.pinId === 'p0' && w.from.pinId === 'in')
    );

    if (!hasLedConnection) return 'LED needs to be connected to microcontroller output';

    return null;
  },
  validateCode: (code: string) => {
    const lines = code.split('\n')
      .map(line => line.split(';')[0].trim())
      .filter(line => line.length > 0);

    // Simple validation
    const validInstructions = ['MOV', 'WAIT', 'JMP'];
    for (const line of lines) {
      const instruction = line.split(' ')[0];
      if (!validInstructions.includes(instruction)) {
        return false;
      }
    }
    return true;
  }
};