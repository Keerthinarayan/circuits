import { Brain, Radio, Monitor, Lock, Cpu } from 'lucide-react';
import { Level1 } from './level1';
import { Level2 } from './level2';

export interface Level {
  id: number;
  title: string;
  description: string;
  icon: any;
  hints: string[];
  maxAttempts: number;
  locked?: boolean;
  validateCircuit: (components: any, wires: any) => string | null;
  validateCode: (code: string) => boolean;
}

export const levels: Level[] = [
  Level1,
  {
    ...Level2,
    locked: true
  },
  {
    id: 3,
    title: "Seven-Segment Display",
    description: "Control a seven-segment LED display by mapping numeric inputs to LED patterns.",
    icon: Monitor,
    hints: [],
    maxAttempts: 4,
    locked: true
  },
  {
    id: 4,
    title: "Cellular Booster",
    description: "Process and clean up cellular signals by filtering noise and amplifying the clean signal.",
    icon: Radio,
    hints: [],
    maxAttempts: 3,
    locked: true
  },
  {
    id: 5,
    title: "Safe Unlocking",
    description: "Create a secure mechanism that verifies passcodes and manages unlock attempts.",
    icon: Lock,
    hints: [],
    maxAttempts: 3,
    locked: true
  }
];