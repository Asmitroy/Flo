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

export const COMPRESSION_MODES = {
  day: { label: "1 Day", totalHours: 24, realDurationMs: 30000, tickInterval: 125, driftStepMultiplier: 1 },
  month: { label: "1 Month", totalHours: 720, realDurationMs: 180000, tickInterval: 25, driftStepMultiplier: 1 },
  year: { label: "1 Year", totalHours: 8640, realDurationMs: 600000, tickInterval: 16, driftStepMultiplier: 2.5 }
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

export function useTimeCompression(sliderValues: SimulatorValues, disabled = false) {
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
  const tickInterval = modeConfig ? modeConfig.tickInterval : 500;
  const driftStepMultiplier = modeConfig ? modeConfig.driftStepMultiplier : 1;

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

  // Synchronous ref tracker to prevent stale state in frame callbacks
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

  // Track telemetry changes (peaks & troughs) continuously during execution
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
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
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, sliderValues]);

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

    // Generate descriptive 3-sentence narrative
    let s1: string;
    if (fastestDegraded.id === 'load') {
      s1 = `The subject experienced severe neural hyper-arousal, with nervous system load climbing rapidly by +${fastestDegraded.value.toFixed(0)}% and peaking at ${peaks.load.toFixed(0)}% under the weight of external stimulation.`;
    } else if (fastestDegraded.id === 'coherence') {
      s1 = `The system suffered critical boundary failure, with identity coherence collapsing by -${fastestDegraded.value.toFixed(0)}% to a trough of ${troughs.coherence.toFixed(0)}% as internal anchors dissolved.`;
    } else if (fastestDegraded.id === 'agency') {
      s1 = `Learned helplessness set in rapidly, causing agency to drop by -${fastestDegraded.value.toFixed(0)}% and bottoming out at ${troughs.agency.toFixed(0)}% as control mechanisms broke down.`;
    } else {
      s1 = `Existential stability collapsed first, with meaning dropping by -${fastestDegraded.value.toFixed(0)}% and troughing at ${troughs.meaning.toFixed(0)}% under the inflation of screen exposure and low physical connection.`;
    }

    let s2: string;
    if (mostResilient.id === 'load') {
      s2 = `In contrast, the subject's nervous system load displayed remarkable stability, resisting the worst spikes and keeping systemic stress bound to manageable thresholds.`;
    } else if (mostResilient.id === 'coherence') {
      s2 = `Throughout the timeline, identity coherence demonstrated excellent structural resilience, buffering core mental states and shielding the sense of self.`;
    } else if (mostResilient.id === 'agency') {
      s2 = `Despite the collapse of other indicators, agency remained highly resilient, preserving the subject's active capacity for control and willpower.`;
    } else {
      s2 = `Existential stability served as the primary anchor, with the meaning score showing extreme resilience and refusing to collapse even as other metrics deteriorated.`;
    }

    let s3: string;
    const avgStress = (peaks.load + (100 - troughs.coherence) + (100 - troughs.agency) + (100 - troughs.meaning)) / 4;
    if (avgStress > 70) {
      s3 = "The timeline concludes with the subject in a state of profound mental static and cognitive exhaustion, showing minimal capacity for recovery without total environment reconfiguration.";
    } else if (avgStress > 45) {
      s3 = "The subject survives the exposure in a state of functional burnout—maintaining system boundaries but showing high latent strain and reduced cognitive energy.";
    } else {
      s3 = "The subject successfully integrated environmental changes, completing the timeline in a state of balanced synaptic harmony and structural stability.";
    }

    const narrative = `${s1} ${s2} ${s3}`;

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

  // Frame tick loop to increment simulated clock
  useEffect(() => {
    if (!isRunning || !modeConfig) return;

    let lastTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const deltaMs = now - lastTime;
      lastTime = now;

      setElapsedHours(prev => {
        const simHoursPerMs = modeConfig.totalHours / modeConfig.realDurationMs;
        const nextHours = prev + deltaMs * simHoursPerMs;

        if (nextHours >= modeConfig.totalHours) {
          // Simulation complete! Compile autopsy report
          setIsPaused(true);
          const report = createAutopsyReport(modeConfig.totalHours === 24 ? 'day' : (modeConfig.totalHours === 720 ? 'month' : 'year'));
          setAutopsy(report);
          return modeConfig.totalHours;
        }

        return nextHours;
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, modeConfig, createAutopsyReport]);

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
