import { createContext, useContext } from 'react';

export interface SystemScores {
  attention: number;
  nervous: number; // Raw load (high = bad)
  identity: number;
  agency: number;
  meaning: number;
}

export interface SliderSnapshot {
  sleepDebt: number;
  stimulation: number;
  socialPressure: number;
  economicStress: number;
  physicalMovement: number;
  syntheticInteraction: number;
}

export interface FiredEvent {
  name: string;
  category: 'destabilizer' | 'stabilizer';
}

export interface SimulatorState {
  systemScores: SystemScores;
  sliderValues: SliderSnapshot;
  sessionDuration: number;
  activeArchetype: string | null;
  flowProbability: number;
  firedEvents: FiredEvent[];
}

export const SimulatorContext = createContext<SimulatorState | null>(null);

export function useSimulatorState(): SimulatorState {
  const ctx = useContext(SimulatorContext);
  if (!ctx) {
    throw new Error('useSimulatorState must be used within SimulatorContext.Provider');
  }
  return ctx;
}
