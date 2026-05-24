import { useState, useEffect, useRef, useCallback } from 'react';
import { MotionValue } from 'framer-motion';

export type CompressionMode = 'none' | 'day' | 'month' | 'year';

export interface SimulatedTime {
  hours: number;
  days: number;
  months: number;
  years: number;
  totalHours: number;
}

export interface CompressionEventDot {
  name: string;
  hour: number;
  percent: number;
}

export interface AutopsyReport {
  mode: 'day' | 'month' | 'year';
  fastestDegraded: { id: string; name: string; value: number };
  mostResilient: { id: string; name: string; value: number };
  narrative: string;
  peaks: { load: number; coherence: number; agency: number; meaning: number };
  troughs: { load: number; coherence: number; agency: number; meaning: number };
  initials: { load: number; coherence: number; agency: number; meaning: number };
}

// Target experience durations at SPEED = FAST
export const COMPRESSION_MODES = {
  day: { label: "1 Day", totalHours: 24, realDurationMs: 20000, driftStepMultiplier: 1.0 },
  month: { label: "1 Month", totalHours: 720, realDurationMs: 90000, driftStepMultiplier: 5.5 },
  year: { label: "1 Year", totalHours: 8640, realDurationMs: 240000, driftStepMultiplier: 25.0 }
};

let globalStartCompression: ((mode: 'day' | 'month' | 'year') => void) | null = null;
let globalPauseCompression: (() => void) | null = null;
let globalResetCompression: (() => void) | null = null;

export function startCompression(mode: 'day' | 'month' | 'year') {
  if (globalStartCompression) {
    globalStartCompression(mode);
  } else {
    console.warn("TimeCompressionEngine is not mounted.");
  }
}

export function pauseCompression() {
  if (globalPauseCompression) {
    globalPauseCompression();
  } else {
    console.warn("TimeCompressionEngine is not mounted.");
  }
}

export function resetCompression() {
  if (globalResetCompression) {
    globalResetCompression();
  } else {
    console.warn("TimeCompressionEngine is not mounted.");
  }
}

if (typeof window !== 'undefined') {
  const win = window as unknown as {
    startCompression: typeof startCompression;
    pauseCompression: typeof pauseCompression;
    resetCompression: typeof resetCompression;
  };
  win.startCompression = startCompression;
  win.pauseCompression = pauseCompression;
  win.resetCompression = resetCompression;
}

interface SimulatorValues {
  nervousSystemLoad: MotionValue<number>;
  identityCoherence: MotionValue<number>;
  agencyScore: MotionValue<number>;
  meaningScore: MotionValue<number>;
}

export function useTimeCompression(
  sliderValues: SimulatorValues, 
  disabled = false,
  compressionSpeed: 'fast' | 'normal' | 'slow' = 'fast'
) {
  const [mode, setMode] = useState<CompressionMode>('none');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedHours, setElapsedHours] = useState<number>(0);
  const [eventDots, setEventDots] = useState<CompressionEventDot[]>([]);
  const [autopsy, setAutopsy] = useState<AutopsyReport | null>(null);

  // Telemetry logs to track peaks, troughs, and initial values
  const telemetry = useRef({
    initials: { load: 0, coherence: 0, agency: 0, meaning: 0 },
    peaks: { load: 0, coherence: 0, agency: 0, meaning: 0 },
    troughs: { load: 0, coherence: 0, agency: 0, meaning: 0 }
  });

  const isActive = mode !== 'none';
  const isRunning = isActive && !isPaused;

  const modeConfig = mode !== 'none' ? COMPRESSION_MODES[mode] : null;

  // Resolve speed multiplier factor
  const speedMultiplier = compressionSpeed === 'slow' ? 4.0 : (compressionSpeed === 'normal' ? 2.0 : 1.0);

  // Tick interval of simulation drift is 100ms when compression is active, else 500ms
  const tickInterval = isActive ? 100 : 500;
  // Drift step multiplier scales down as simulation speed scales down (longer duration)
  const driftStepMultiplier = modeConfig ? (modeConfig.driftStepMultiplier / speedMultiplier) : 1;

  // Clear compression if simulator reboots
  useEffect(() => {
    if (disabled) {
      const timeout = setTimeout(() => {
        setMode('none');
        setIsPaused(false);
        setElapsedHours(0);
        setEventDots([]);
        setAutopsy(null);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [disabled]);

  // Synchronous ref tracker to prevent stale state in callbacks
  const trackingRef = useRef({
    mode,
    elapsedHours,
    isPaused,
    isActive
  });
  
  useEffect(() => {
    trackingRef.current = { mode, elapsedHours, isPaused, isActive };
  }, [mode, elapsedHours, isPaused, isActive]);

  // Start/Pause/Reset controller callbacks
  const handleStart = useCallback((targetMode: 'day' | 'month' | 'year') => {
    if (disabled) return;
    
    // Capture starting parameters as telemetry baseline
    const load = sliderValues.nervousSystemLoad.get();
    const coherence = sliderValues.identityCoherence.get();
    const agency = sliderValues.agencyScore.get();
    const meaning = sliderValues.meaningScore.get();

    telemetry.current = {
      initials: { load, coherence, agency, meaning },
      peaks: { load, coherence, agency, meaning },
      troughs: { load, coherence, agency, meaning }
    };

    setMode(targetMode);
    setIsPaused(false);
    setElapsedHours(0);
    setEventDots([]);
    setAutopsy(null);
  }, [disabled, sliderValues]);

  const handlePause = useCallback(() => {
    if (mode === 'none') return;
    setIsPaused(prev => !prev);
  }, [mode]);

  const handleReset = useCallback(() => {
    setMode('none');
    setIsPaused(false);
    setElapsedHours(0);
    setEventDots([]);
    setAutopsy(null);
  }, []);

  // Expose callbacks globally
  useEffect(() => {
    globalStartCompression = handleStart;
    globalPauseCompression = handlePause;
    globalResetCompression = handleReset;
    return () => {
      globalStartCompression = null;
      globalPauseCompression = null;
      globalResetCompression = null;
    };
  }, [handleStart, handlePause, handleReset]);

  // Record a dot on the timeline scrubber
  const logCompressionEvent = useCallback((name: string) => {
    if (!trackingRef.current.isActive || !modeConfig) return;
    
    const hr = trackingRef.current.elapsedHours;
    const percent = Math.min(100, (hr / modeConfig.totalHours) * 100);

    setEventDots(prev => {
      // Avoid duplicate dots firing at exactly the same simulated moment
      if (prev.some(d => d.name === name && Math.abs(d.hour - hr) < 0.2)) return prev;
      return [...prev, { name, hour: hr, percent }];
    });
  }, [modeConfig]);

  // Procedural Autopsy summary generator
  const createAutopsyReport = useCallback((finalMode: 'day' | 'month' | 'year'): AutopsyReport => {
    const { initials, peaks, troughs } = telemetry.current;

    // Calculate net degradation (positive represents damage/decline)
    const systems = [
      { id: 'load', name: 'Nervous System Load', value: peaks.load - initials.load },
      { id: 'coherence', name: 'Identity Coherence', value: initials.coherence - troughs.coherence },
      { id: 'agency', name: 'Agency Score', value: initials.agency - troughs.agency },
      { id: 'meaning', name: 'Existential Stability', value: initials.meaning - troughs.meaning }
    ];

    // Sort to determine primary vectors
    const sorted = [...systems].sort((a, b) => b.value - a.value);
    const fastestDegraded = sorted[0];
    const mostResilient = sorted[sorted.length - 1];

    const systemVariances = {
      nervous: Math.abs(peaks.load - troughs.load),
      identity: Math.abs(peaks.coherence - troughs.coherence),
      agency: Math.abs(peaks.agency - troughs.agency),
      meaning: Math.abs(peaks.meaning - troughs.meaning)
    };

    const systemNames = {
      nervous: 'nervous system load',
      identity: 'identity coherence',
      agency: 'agency index',
      meaning: 'existential stability'
    };

    const mostVolatile = Object.entries(systemVariances)
      .sort(([, a], [, b]) => b - a)[0][0] as keyof typeof systemNames;
    const mostStable = Object.entries(systemVariances)
      .sort(([, a], [, b]) => a - b)[0][0] as keyof typeof systemNames;

    // Opening sentence — what actually happened
    const s1 = peaks.load > 70
      ? `The subject experienced severe neural hyper-arousal, with nervous system load climbing by +${Math.round(peaks.load - troughs.load)}% and peaking at ${Math.round(peaks.load)}%.`
      : peaks.load >= 30
      ? `The subject experienced moderate neural activation, with load reaching ${Math.round(peaks.load)}% before stabilizing.`
      : `The subject maintained low neural load throughout, peaking at ${Math.round(peaks.load)}%.`;

    // Middle sentence — most volatile system
    const s2 = `${systemNames[mostVolatile].charAt(0).toUpperCase() + systemNames[mostVolatile].slice(1)} showed the greatest volatility, ranging ±${Math.round(systemVariances[mostVolatile])}% across the timeline.`;

    // Resilience sentence — most stable system
    const s3stable = systemVariances[mostStable] < 5
      ? `${systemNames[mostStable].charAt(0).toUpperCase() + systemNames[mostStable].slice(1)} remained anchored throughout, showing minimal variance.`
      : `${systemNames[mostStable].charAt(0).toUpperCase() + systemNames[mostStable].slice(1)} demonstrated the strongest resilience, holding within ±${Math.round(systemVariances[mostStable])}%.`;

    // Closing sentence — end state
    const endLoad = troughs.load;  // load at end of run
    const s4 = endLoad > 60
      ? `The timeline concludes with the subject in a state of profound mental static and cognitive exhaustion, showing minimal capacity for recovery without total environment reconfiguration.`
      : endLoad > 30
      ? `The timeline concludes with systems partially recovered, operating at reduced but functional capacity.`
      : `The timeline concludes with the subject in a stable, recovered state. Environmental conditions supported system restoration.`;

    const narrative = `${s1} ${s2} ${s3stable} ${s4}`;

    return {
      mode: finalMode,
      fastestDegraded,
      mostResilient,
      narrative,
      peaks: { ...peaks },
      troughs: { ...troughs },
      initials: { ...initials }
    };
  }, []);

  // Decoupled simulation tick loop running at 100ms (10 ticks/second)
  useEffect(() => {
    if (!isRunning || !modeConfig) return;

    // Simulated hours per tick = totalHours / totalTicks
    // totalTicks = (realDurationMs * speedMultiplier) / 100
    const simHoursPerTick = (modeConfig.totalHours * 100) / (modeConfig.realDurationMs * speedMultiplier);

    const interval = setInterval(() => {
      // Track peaks and troughs at every tick
      const load = sliderValues.nervousSystemLoad.get();
      const coherence = sliderValues.identityCoherence.get();
      const agency = sliderValues.agencyScore.get();
      const meaning = sliderValues.meaningScore.get();

      telemetry.current.peaks.load = Math.max(telemetry.current.peaks.load, load);
      telemetry.current.peaks.coherence = Math.max(telemetry.current.peaks.coherence, coherence);
      telemetry.current.peaks.agency = Math.max(telemetry.current.peaks.agency, agency);
      telemetry.current.peaks.meaning = Math.max(telemetry.current.peaks.meaning, meaning);

      telemetry.current.troughs.load = Math.min(telemetry.current.troughs.load, load);
      telemetry.current.troughs.coherence = Math.min(telemetry.current.troughs.coherence, coherence);
      telemetry.current.troughs.agency = Math.min(telemetry.current.troughs.agency, agency);
      telemetry.current.troughs.meaning = Math.min(telemetry.current.troughs.meaning, meaning);

      setElapsedHours(prev => {
        const nextHours = prev + simHoursPerTick;

        if (nextHours >= modeConfig.totalHours) {
          setIsPaused(true);
          const report = createAutopsyReport(modeConfig.totalHours === 24 ? 'day' : (modeConfig.totalHours === 720 ? 'month' : 'year'));
          setAutopsy(report);
          return modeConfig.totalHours;
        }

        return nextHours;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, modeConfig, createAutopsyReport, sliderValues, speedMultiplier]);

  // Format elapsed simulated hours into Day/Month/Year calendar units
  const formattedTime: SimulatedTime = (() => {
    if (!modeConfig) return { hours: 0, days: 1, months: 1, years: 1, totalHours: 24 };

    const hours = Math.floor(elapsedHours % 24);
    const totalDays = Math.floor(elapsedHours / 24);
    const days = (totalDays % 30) + 1;
    const totalMonths = Math.floor(totalDays / 30);
    const months = (totalMonths % 12) + 1;
    const years = Math.floor(totalMonths / 12) + 1;

    return {
      hours,
      days,
      months,
      years,
      totalHours: modeConfig.totalHours
    };
  })();

  const progressPercent = modeConfig ? Math.min(100, (elapsedHours / modeConfig.totalHours) * 100) : 0;

  return {
    compressionMode: mode,
    isCompressionActive: isActive,
    isPaused,
    elapsedSimulatedTime: formattedTime,
    progressPercent,
    eventDots,
    autopsyReport: autopsy,
    tickInterval,
    driftStepMultiplier,
    startCompression: handleStart,
    pauseCompression: handlePause,
    resetCompression: handleReset,
    logCompressionEvent
  };
}
