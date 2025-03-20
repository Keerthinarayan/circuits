import { Radio } from 'lucide-react';
import type { Level } from './index';

export const Level2: Level = {
  id: 2,
  title: "Signal Amplifier",
  description: "Design a circuit that amplifies input signals using XBUS communication between microcontrollers.",
  icon: Radio,
  hints: [
    "Connect input P1 to receive the signal",
    "Use MOV to read the input value",
    "Multiply the value by 2 using MUL",
    "Output the result to P0",
    "Remember to connect power and ground"
  ],
  maxAttempts: 4,
  validateCircuit: (components: any, wires: any) => {
    const mc = Object.values(components).find((c: any) => c.type === 'microcontroller');
    const power = Object.values(components).find((c: any) => c.type === 'powerSource');

    if (!mc) return 'Microcontroller is required';
    if (!power) return 'Power source is required';

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

    // Check input and output connections
    const hasInput = wires.some((w: any) => 
      w.to.componentId === mc.id && w.to.pinId === 'p1'
    );

    const hasOutput = wires.some((w: any) => 
      w.from.componentId === mc.id && w.from.pinId === 'p0'
    );

    if (!hasInput) return 'Input signal must be connected to P1';
    if (!hasOutput) return 'Output must be connected from P0';

    return null;
  },
  validateCode: (code: string) => {
    const lines = code.split('\n')
      .map(line => line.split(';')[0].trim())
      .filter(line => line.length > 0);

    // Required instructions for signal amplification
    const requiredInstructions = ['MOV', 'MUL', 'JMP'];
    const foundInstructions = new Set();

    for (const line of lines) {
      const instruction = line.split(' ')[0];
      foundInstructions.add(instruction);

      // Check for invalid instructions
      if (!['MOV', 'MUL', 'JMP', 'TGT'].includes(instruction)) {
        return false;
      }
    }

    // Ensure all required instructions are present
    return requiredInstructions.every(instr => foundInstructions.has(instr));
  }
};