import { useState, useEffect, useRef, useCallback } from 'react';
import { MotionValue } from 'framer-motion';

export interface NarrativeEvent {
  name: string;
  category: 'destabilizer' | 'stabilizer';
  duration: number; // in seconds
  deltas: {
    stimulation?: number;
    sleepDebt?: number;
    socialPressure?: number;
    economicStress?: number;
    physicalMovement?: number;
    meaning?: number;
    agency?: number;
  };
}

export interface ActiveNarrativeEvent extends NarrativeEvent {
  id: string;
  remainingTime: number; // in seconds
}

export const DESTABILIZERS: NarrativeEvent[] = [
  {
    name: "Algorithm changed your feed",
    category: "destabilizer",
    duration: 45,
    deltas: { stimulation: 30, socialPressure: 20 }
  },
  {
    name: "Unexpected bill arrived",
    category: "destabilizer",
    duration: 60,
    deltas: { economicStress: 40, sleepDebt: 15 }
  },
  {
    name: "Social rejection (public)",
    category: "destabilizer",
    duration: 90,
    deltas: { socialPressure: 50, stimulation: 20 }
  },
  {
    name: "Sleep disruption (3am anxiety)",
    category: "destabilizer",
    duration: 30,
    deltas: { sleepDebt: 35, stimulation: 25 }
  },
  {
    name: "Doomscroll spiral",
    category: "destabilizer",
    duration: 120,
    deltas: { stimulation: 45, physicalMovement: -20 }
  },
  {
    name: "Flow Window Exhausted",
    category: "destabilizer",
    duration: 60,
    deltas: { sleepDebt: 20, stimulation: 10 }
  }
];

export const STABILIZERS: NarrativeEvent[] = [
  {
    name: "Deep work block (2hrs)",
    category: "stabilizer",
    duration: 60,
    deltas: { stimulation: -30, sleepDebt: -10 }
  },
  {
    name: "Meaningful conversation",
    category: "stabilizer",
    duration: 45,
    deltas: { socialPressure: -25, economicStress: -15 }
  },
  {
    name: "Walked outside",
    category: "stabilizer",
    duration: 30,
    deltas: { physicalMovement: 40, stimulation: -20 }
  },
  {
    name: "Full night of sleep",
    category: "stabilizer",
    duration: 30,
    deltas: {
      sleepDebt: -60,
      stimulation: -10,
      socialPressure: -10,
      economicStress: -10,
      physicalMovement: 10
    }
  },
  {
    name: "Creative breakthrough",
    category: "stabilizer",
    duration: 60,
    deltas: { meaning: 30, agency: 25 }
  }
];

let globalTriggerNarrativeEvent: ((name: string) => void) | null = null;

/**
 * Debug utility to trigger a specific narrative event by name.
 */
export function triggerNarrativeEvent(name: string) {
  if (globalTriggerNarrativeEvent) {
    globalTriggerNarrativeEvent(name);
  } else {
    console.warn("NarrativeEventEngine is not active or useNarrativeEvents is not mounted.");
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { triggerNarrativeEvent: typeof triggerNarrativeEvent }).triggerNarrativeEvent = triggerNarrativeEvent;
}

interface SliderValues {
  stimulationLevel: MotionValue<number>;
  sleepDebt: MotionValue<number>;
  socialPressure: MotionValue<number>;
  economicStress: MotionValue<number>;
  physicalMovement: MotionValue<number>;
  meaningScore: MotionValue<number>;
  agencyScore: MotionValue<number>;
  nervousSystemLoad: MotionValue<number>;
}

export function useNarrativeEvents(
  sliderValues: SliderValues,
  disabled = false,
  tickInterval = 500,
  onEventTriggered?: (name: string) => void
) {
  const [activeEvents, setActiveEvents] = useState<ActiveNarrativeEvent[]>([]);
  
  const isApplyingEventRef = useRef<boolean>(false);
  const activeEventsRef = useRef<ActiveNarrativeEvent[]>([]);

  // Update activeEvents ref in an effect to avoid mutating ref during render
  useEffect(() => {
    activeEventsRef.current = activeEvents;
  }, [activeEvents]);

  // Track the user manual baseline (what the sliders would be without active events)
  const manualBaseValues = useRef({
    stimulation: sliderValues.stimulationLevel.get(),
    sleepDebt: sliderValues.sleepDebt.get(),
    socialPressure: sliderValues.socialPressure.get(),
    economicStress: sliderValues.economicStress.get(),
    physicalMovement: sliderValues.physicalMovement.get(),
    meaning: sliderValues.meaningScore.get(),
    agency: sliderValues.agencyScore.get()
  });

  // Keep baseline sync if a reboot occurs
  useEffect(() => {
    if (disabled) {
      // Defer to prevent synchronous setState cascading renders in effect body
      const timeout = setTimeout(() => {
        setActiveEvents([]);
      }, 0);
      manualBaseValues.current = {
        stimulation: 1,
        sleepDebt: 0,
        socialPressure: 20,
        economicStress: 30,
        physicalMovement: 50,
        meaning: 75,
        agency: 65
      };
      return () => clearTimeout(timeout);
    }
  }, [disabled]);

  // Listen to manual user slider adjustments and update base value
  useEffect(() => {
    const updateManualBase = (
      key: 'stimulation' | 'sleepDebt' | 'socialPressure' | 'economicStress' | 'physicalMovement' | 'meaning' | 'agency',
      userVal: number
    ) => {
      if (isApplyingEventRef.current) return;
      
      // Calculate current cumulative event deltas for this parameter
      let deltaSum = 0;
      activeEventsRef.current.forEach(evt => {
        const d = evt.deltas[key];
        if (d !== undefined) deltaSum += d;
      });
      
      // manualBase = currentActualVal - currentActiveEventDeltas
      manualBaseValues.current[key] = userVal - deltaSum;
    };

    const unsubStim = sliderValues.stimulationLevel.on("change", val => updateManualBase("stimulation", val));
    const unsubSleep = sliderValues.sleepDebt.on("change", val => updateManualBase("sleepDebt", val));
    const unsubSoc = sliderValues.socialPressure.on("change", val => updateManualBase("socialPressure", val));
    const unsubEcon = sliderValues.economicStress.on("change", val => updateManualBase("economicStress", val));
    const unsubPhys = sliderValues.physicalMovement.on("change", val => updateManualBase("physicalMovement", val));
    const unsubMean = sliderValues.meaningScore.on("change", val => updateManualBase("meaning", val));
    const unsubAgen = sliderValues.agencyScore.on("change", val => updateManualBase("agency", val));

    return () => {
      unsubStim();
      unsubSleep();
      unsubSoc();
      unsubEcon();
      unsubPhys();
      unsubMean();
      unsubAgen();
    };
  }, [
    sliderValues.stimulationLevel,
    sliderValues.sleepDebt,
    sliderValues.socialPressure,
    sliderValues.economicStress,
    sliderValues.physicalMovement,
    sliderValues.meaningScore,
    sliderValues.agencyScore
  ]);

  // Recalculate target values and apply them to the motion values
  const applyActiveDeltas = useCallback(() => {
    const targets = {
      stimulation: manualBaseValues.current.stimulation,
      sleepDebt: manualBaseValues.current.sleepDebt,
      socialPressure: manualBaseValues.current.socialPressure,
      economicStress: manualBaseValues.current.economicStress,
      physicalMovement: manualBaseValues.current.physicalMovement,
      meaning: manualBaseValues.current.meaning,
      agency: manualBaseValues.current.agency
    };

    activeEventsRef.current.forEach(evt => {
      if (evt.deltas.stimulation !== undefined) targets.stimulation += evt.deltas.stimulation;
      if (evt.deltas.sleepDebt !== undefined) targets.sleepDebt += evt.deltas.sleepDebt;
      if (evt.deltas.socialPressure !== undefined) targets.socialPressure += evt.deltas.socialPressure;
      if (evt.deltas.economicStress !== undefined) targets.economicStress += evt.deltas.economicStress;
      if (evt.deltas.physicalMovement !== undefined) targets.physicalMovement += evt.deltas.physicalMovement;
      if (evt.deltas.meaning !== undefined) targets.meaning += evt.deltas.meaning;
      if (evt.deltas.agency !== undefined) targets.agency += evt.deltas.agency;
    });

    isApplyingEventRef.current = true;
    
    // Clamp environmental sliders to 0-100 (or 1-100 for stimulation)
    sliderValues.stimulationLevel.set(Math.max(1, Math.min(100, targets.stimulation)));
    sliderValues.sleepDebt.set(Math.max(0, Math.min(100, targets.sleepDebt)));
    sliderValues.socialPressure.set(Math.max(0, Math.min(100, targets.socialPressure)));
    sliderValues.economicStress.set(Math.max(0, Math.min(100, targets.economicStress)));
    sliderValues.physicalMovement.set(Math.max(0, Math.min(100, targets.physicalMovement)));
    
    // Clamp score values to 0-100
    sliderValues.meaningScore.set(Math.max(0, Math.min(100, targets.meaning)));
    sliderValues.agencyScore.set(Math.max(0, Math.min(100, targets.agency)));

    isApplyingEventRef.current = false;
  }, [sliderValues]);

  // Apply deltas whenever the list of active events updates
  useEffect(() => {
    applyActiveDeltas();
  }, [activeEvents, applyActiveDeltas]);

  // 1-second countdown ticker for active events (scaled by tickInterval speedup)
  useEffect(() => {
    if (disabled) return;
    
    const scale = tickInterval / 500;
    const tickerInterval = Math.max(10, 1000 * scale);

    const interval = setInterval(() => {
      setActiveEvents(prev => {
        const next = prev.map(e => ({ ...e, remainingTime: e.remainingTime - 1 }));
        const filtered = next.filter(e => e.remainingTime > 0);
        return filtered;
      });
    }, tickerInterval);

    return () => clearInterval(interval);
  }, [disabled, tickInterval]);

  // Probabilistic check loop (every 30 seconds, scaled by tickInterval speedup)
  useEffect(() => {
    if (disabled) return;

    const scaledInterval = Math.max(100, 30000 * (tickInterval / 500));

    const interval = setInterval(() => {
      // 35% chance to trigger an event every 30 seconds
      if (Math.random() > 0.35) return;

      const systemLoad = sliderValues.nervousSystemLoad.get();
      const isDegraded = systemLoad > 60;
      
      // Determine event category: destabilizers are 3x more likely when system load is >60
      let category: 'destabilizer' | 'stabilizer';
      if (isDegraded) {
        category = Math.random() < 0.75 ? 'destabilizer' : 'stabilizer';
      } else {
        category = Math.random() < 0.5 ? 'destabilizer' : 'stabilizer';
      }

      const pool = category === 'destabilizer' ? DESTABILIZERS : STABILIZERS;
      const picked = pool[Math.floor(Math.random() * pool.length)];

      setActiveEvents(prev => {
        const newEvent = { ...picked, id: Math.random().toString(), remainingTime: picked.duration };
        
        // Log to scrubber timeline if callback provided
        if (onEventTriggered) {
          onEventTriggered(picked.name);
        }

        // Enforce maximum of 2 active events simultaneously
        if (prev.length >= 2) {
          return [...prev.slice(1), newEvent];
        }
        return [...prev, newEvent];
      });
    }, scaledInterval);

    return () => clearInterval(interval);
  }, [disabled, sliderValues.nervousSystemLoad, tickInterval, onEventTriggered]);

  // Support manual event trigger (e.g. from developer console)
  const triggerEventByName = useCallback((name: string) => {
    if (disabled) return;
    
    const query = name.toLowerCase().trim();
    const found = [...DESTABILIZERS, ...STABILIZERS].find(
      e => e.name.toLowerCase() === query
    );

    if (found) {
      setActiveEvents(prev => {
        if (prev.length >= 2) {
          return [...prev.slice(1), { ...found, id: Math.random().toString(), remainingTime: found.duration }];
        }
        return [...prev, { ...found, id: Math.random().toString(), remainingTime: found.duration }];
      });
    } else {
      console.warn(`Narrative event "${name}" not found.`);
    }
  }, [disabled]);

  useEffect(() => {
    globalTriggerNarrativeEvent = triggerEventByName;
    return () => {
      globalTriggerNarrativeEvent = null;
    };
  }, [triggerEventByName]);

  return activeEvents;
}
