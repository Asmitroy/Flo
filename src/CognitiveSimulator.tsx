import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Fingerprint, 
  Info,
  Terminal,
  Moon,
  TrendingDown,
  Users
} from 'lucide-react';
import AttentionGraph from './AttentionGraph';
import IdentityCore from './IdentityCore';
import AgencyMeter from './AgencyMeter';
import ExistentialDepth from './ExistentialDepth';
import { ArchetypeSelector } from './ArchetypeSelector';
import { useNarrativeEvents } from './NarrativeEventEngine';
import { useTimeCompression } from './TimeCompressionEngine';
import ReflectionModal, { type SystemScores, type SliderSnapshot } from './ReflectionModal';

// Eerie glitch glyphs for character substitution
const GLYPHS = ['█', '░', '▓', '▒', 'Ø', '§', 'Δ', '¥', '0', '1', 'æ', '?', '!', '#', '*', 'α', 'β', 'λ', '†', '‡', 'µ', '¶', '▰', '▱', '◊', '◈'];

// Punctuation characters to preserve unscrambled
const PUNCTUATION = new Set([
  '.', ',', "'", '"', '!', '?', ';', ':', '-', '_', '(', ')', '[', ']', '{', '}', '/', '\\', '@', '#', '$', '%', '^', '&', '*', '+', '=', '<', '>', '|', '`', '~'
]);

// List of mock logs that scroll by
const INITIAL_LOGS = [
  { id: 1, text: "neural sync connection established...", type: "system" },
  { id: 2, text: "memetic integrity index: 1.00 (STABLE)", type: "success" },
  { id: 3, text: "identity node verification check: OK", type: "success" },
  { id: 4, text: "monitoring cognitive bandwidth (100 Gb/s)...", type: "system" },
];

const WARNING_POOL = [
  "HEURISTIC SYNAPSE MISFIRE IN SECTOR 4",
  "IDENTITY BOUNDARY DILATION DETECTED",
  "RETROGRADE MEMORY DRIFT: 0x0F4A",
  "COGNITIVE AGENT COLLAPSE IMMINENT",
  "DOPAMINERGIC FEEDBACK LOOP SATURATED",
  "EGO-DISSOLUTION THRESHOLD EXCEEDED",
  "ALGORITHMIC OVER-INJECTION DETECTED",
  "SENSORY BUFFER INUNDATED BY STATIC",
  "MEMETIC RESIDUAL DRIFT INCREASED",
  "SUB-NEURAL RE-ENTRANT LOOP ACTIVE"
];

// Audio Synthesizer Class
class NeuralSynth {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainOsc1: GainNode | null = null;
  private gainOsc2: GainNode | null = null;
  private gainNoise: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  public isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Low frequency hum oscillator
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.setValueAtTime(60, this.ctx.currentTime); // 60Hz hum
      this.gainOsc1 = this.ctx.createGain();
      this.gainOsc1.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.osc1.connect(this.gainOsc1);
      this.gainOsc1.connect(this.masterGain);

      // Detuned oscillator for beating frequency dissonance
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(63, this.ctx.currentTime); // Detuned hum
      this.gainOsc2 = this.ctx.createGain();
      this.gainOsc2.gain.setValueAtTime(0.0, this.ctx.currentTime); // Starts silent
      this.osc2.connect(this.gainOsc2);
      this.gainOsc2.connect(this.masterGain);

      // Bandpass filter for static noise
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'bandpass';
      this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Generate White Noise Buffer
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      // Noise gain
      this.gainNoise = this.ctx.createGain();
      this.gainNoise.gain.setValueAtTime(0.0, this.ctx.currentTime); // Starts silent
      this.noiseSource.connect(this.gainNoise);
      this.gainNoise.connect(this.filter);

      // Start sound sources
      this.osc1.start(0);
      this.osc2.start(0);
      this.noiseSource.start(0);

      this.isInitialized = true;
    } catch (e) {
      console.error("Web Audio API was blocked or is unsupported:", e);
    }
  }

  update(load: number, isMuted: boolean) {
    if (!this.isInitialized || !this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const time = this.ctx.currentTime;

    if (isMuted) {
      this.masterGain?.gain.setTargetAtTime(0.0, time, 0.1);
      return;
    }

    // Master volume scales with load
    const masterVolume = 0.2 + (load / 100) * 0.35;
    this.masterGain?.gain.setTargetAtTime(masterVolume, time, 0.15);

    // Hum pitch slides upwards as load grows
    const baseFreq = 55 + (load / 100) * 115; // 55Hz -> 170Hz
    this.osc1?.frequency.setTargetAtTime(baseFreq, time, 0.25);

    // Detuning spreads apart creating a nauseating beating oscillation
    const detuneSpread = 2 + (load / 100) * 16;
    this.osc2?.frequency.setTargetAtTime(baseFreq + detuneSpread, time, 0.25);

    // Triangle wave volume scales up
    const osc2Volume = (load / 100) * 0.15;
    this.gainOsc2?.gain.setTargetAtTime(osc2Volume, time, 0.2);

    // Static Noise scales up, becoming overwhelming at high settings
    const noiseVol = (load / 100) * 0.28;
    this.gainNoise?.gain.setTargetAtTime(noiseVol, time, 0.2);

    // Filter frequency moves down and cracks erratically
    let filterFreq = 900 - (load / 100) * 550;
    if (load > 70) {
      filterFreq += (Math.random() - 0.5) * 350;
    }
    this.filter?.frequency.setTargetAtTime(Math.max(80, filterFreq), time, 0.1);
  }

  triggerReboot() {
    if (!this.isInitialized || !this.ctx) return;
    const time = this.ctx.currentTime;
    
    // Play a short power-down/up static swell
    this.masterGain?.gain.setValueAtTime(0.8, time);
    this.masterGain?.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    // Re-initialize values after a delay
    setTimeout(() => {
      if (this.ctx && this.masterGain) {
        const resetTime = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(0.0, resetTime);
        this.masterGain.gain.linearRampToValueAtTime(0.2, resetTime + 0.5);
      }
    }, 200);
  }

  stop() {
    if (this.ctx) {
      try {
        this.osc1?.stop();
        this.osc2?.stop();
        this.noiseSource?.stop();
      } catch {
        // Already stopped
      }
      this.ctx.close();
      this.isInitialized = false;
    }
  }
}

// Text animation helpers
const getScrambledWord = (word: string, wordIdx: number, frameTick: number, load: number) => {
  if (load <= 10) return word;
  
  const scrambleChance = Math.max(0, (load - 10) / 90) * 0.70;

  return word.split("").map((char, charIdx) => {
    if (PUNCTUATION.has(char)) return char;

    const randomSeed = Math.sin(wordIdx * 12.3 + charIdx * 87.4 + frameTick) * 0.5 + 0.5;
    
    if (randomSeed < scrambleChance) {
      const glyphIdx = Math.floor(
        Math.abs(Math.sin(wordIdx * 7.1 + charIdx * 3.4 + frameTick) * GLYPHS.length)
      ) % GLYPHS.length;
      return GLYPHS[glyphIdx];
    }
    return char;
  }).join("");
};

const getWordOpacity = (wordIdx: number, frameTick: number, load: number) => {
  if (load < 60) return 1;
  const flickerChance = (load - 60) / 40 * 0.4;
  const pseudoRandom = Math.sin(wordIdx * 45.3 + frameTick * 0.4) * 0.5 + 0.5;
  if (pseudoRandom < flickerChance) {
    return 0.15 + 0.3 * Math.sin(frameTick * 0.8 + wordIdx);
  }
  return 1;
};

const getWordJitter = (wordIdx: number, frameTick: number, load: number) => {
  const jitterVal = load <= 15 ? 0 : ((load - 15) / 85) * 12;
  if (jitterVal <= 0) return { x: 0, y: 0 };
  
  const speed = 0.05 + (Math.sin(wordIdx) * 0.02 + 0.02);
  const t = frameTick * speed;
  const x = Math.sin(t + wordIdx) * jitterVal;
  const y = Math.cos(t * 1.2 + wordIdx * 1.5) * jitterVal;
  return { x, y };
};

// Isolated components
interface SimulationSliderProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  min: number;
  max: number;
  motionValue: MotionValue<number>;
  valueSuffix?: string;
  activeColorVal?: MotionValue<number>;
  colorThresholds?: boolean;
  disabled?: boolean;
}

const SimulationSlider = React.memo(({
  label,
  icon: Icon,
  min,
  max,
  motionValue,
  valueSuffix = "",
  activeColorVal,
  colorThresholds = false,
  disabled = false
}: SimulationSliderProps) => {
  const [val, setVal] = useState(motionValue.get());
  const [loadVal, setLoadVal] = useState(activeColorVal ? activeColorVal.get() : 0);

  useEffect(() => {
    const unsub = motionValue.on("change", (latest) => {
      setVal(latest);
    });
    return () => unsub();
  }, [motionValue]);

  useEffect(() => {
    if (!activeColorVal) return;
    const unsub = activeColorVal.on("change", (latest) => {
      setLoadVal(latest);
    });
    return () => unsub();
  }, [activeColorVal]);

  const trackBackground = (() => {
    if (colorThresholds && activeColorVal) {
      const color = loadVal > 75 ? '#f43f5e' : (loadVal > 45 ? '#f59e0b' : '#6366f1');
      return `linear-gradient(to right, ${color} ${val}%, #18181b ${val}%)`;
    }
    const defaultColor = label.toLowerCase().includes("sleep") ? '#71717a' : '#a1a1aa';
    return `linear-gradient(to right, ${defaultColor} ${val}%, #18181b ${val}%)`;
  })();

  let valueColorClass = "text-zinc-400";
  if (colorThresholds) {
    valueColorClass = loadVal > 75 ? 'text-red-500' : (loadVal > 45 ? 'text-amber-500' : 'text-indigo-400');
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2 text-zinc-400">
          <Icon className="w-3.5 h-3.5 text-zinc-500" />
          <span className="tracking-widest uppercase font-bold text-[10px]">{label}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[9px] text-zinc-600 px-1 border border-zinc-900 bg-black/40 rounded">
            {label.toLowerCase().includes("stimulation") ? "LVL" : (label.toLowerCase().includes("sleep") ? "HRS" : "COH")}
          </span>
          <span className={`font-bold w-7 text-right text-[11px] ${valueColorClass}`}>
            {val}{valueSuffix}
          </span>
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={val}
          disabled={disabled}
          onChange={(e) => {
            const parsed = parseInt(e.target.value);
            setVal(parsed);
            motionValue.set(parsed);
          }}
          className="w-full h-1 bg-zinc-900 border-none rounded-lg appearance-none cursor-pointer outline-none focus:outline-none transition-colors duration-150 disabled:opacity-50"
          style={{ background: trackBackground }}
        />
      </div>

      <div className="flex justify-between px-1 select-none pointer-events-none">
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tickVal) => {
          const isActive = val >= tickVal && tickVal > 0;
          let tickColorClass = 'bg-zinc-800';
          if (isActive) {
            if (colorThresholds) {
              tickColorClass = loadVal > 75 ? 'bg-rose-500' : (loadVal > 45 ? 'bg-amber-500' : 'bg-indigo-500');
            } else {
              tickColorClass = 'bg-zinc-500';
            }
          }
          return (
            <div key={tickVal} className="flex flex-col items-center">
              <div className={`w-[1px] h-1.5 ${tickColorClass}`} />
              <span className={`text-[7px] font-mono mt-1 ${val >= tickVal ? 'text-zinc-400' : 'text-zinc-700'}`}>
                {tickVal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

SimulationSlider.displayName = 'SimulationSlider';

interface HudTelemetryProps {
  nervousSystemLoad: MotionValue<number>;
  isRebooting: boolean;
  isCompressionActive?: boolean;
  elapsedTime?: { hours: number, days: number, months: number, years: number };
}

const HudTelemetry = React.memo(({ 
  nervousSystemLoad, 
  isRebooting,
  isCompressionActive = false,
  elapsedTime
}: HudTelemetryProps) => {
  const [phase, setPhase] = useState<'normal' | 'warn' | 'crit'>('normal');

  useEffect(() => {
    const unsub = nervousSystemLoad.on("change", (latest) => {
      const newPhase = latest > 75 ? 'crit' : (latest > 40 ? 'warn' : 'normal');
      if (newPhase !== phase) {
        setPhase(newPhase);
      }
    });
    return () => unsub();
  }, [nervousSystemLoad, phase]);

  const integrityWidth = useTransform(nervousSystemLoad, (load) => `${Math.max(10, 100 - load * 0.89)}%`);
  const integrityColor = useTransform(nervousSystemLoad, (load) => load > 75 ? '#f43f5e' : '#6366f1');
  const integrityText = useTransform(nervousSystemLoad, (load) => `${Math.max(10.2, (100 - load * 0.89)).toFixed(1)}%`);

  const driftWidth = useTransform(nervousSystemLoad, (load) => `${Math.min(100, load * 1.4)}%`);
  const driftColor = useTransform(nervousSystemLoad, (load) => load > 60 ? '#f43f5e' : (load > 30 ? '#f59e0b' : '#10b981'));
  const driftText = useTransform(nervousSystemLoad, (load) => `${(load * 1.4).toFixed(1)}%`);

  const fluxWidth = useTransform(nervousSystemLoad, (load) => `${Math.min(100, 10 + load * 0.9)}%`);
  const fluxText = useTransform(nervousSystemLoad, (load) => `${(1.0 + (load * 0.15)).toFixed(1)}x`);

  return (
    <section className="lg:col-span-1 bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-5 backdrop-blur-lg flex flex-col justify-between select-none">
      <div>
        <div className="flex items-center space-x-2 mb-6 border-b border-zinc-900 pb-2">
          <Cpu className="w-4 h-4 text-zinc-500" />
          <h3 className="font-display text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            Neural Telemetry
          </h3>
        </div>

        {isCompressionActive && elapsedTime && (
          <div className="mb-4 bg-zinc-950 border border-zinc-900/60 p-2.5 text-center select-none animate-pulse">
            <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
              COMPRESSION STATUS
            </span>
            <div className="font-mono text-[11px] text-zinc-200 font-bold mt-1 uppercase tracking-wider">
              MONTH {elapsedTime.months} / DAY {elapsedTime.days}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span>NEURAL INTEGRITY</span>
              <span className={phase === 'crit' ? 'text-red-500 font-bold' : 'text-zinc-300'}>
                {isRebooting ? "REBOOTING..." : <motion.span>{integrityText}</motion.span>}
              </span>
            </div>
            <div className="w-full bg-zinc-900/60 h-1 rounded overflow-hidden">
              <motion.div 
                className="h-full"
                style={{ width: integrityWidth, backgroundColor: integrityColor }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span>MEMETIC DRIFT</span>
              <span className={phase !== 'normal' ? 'text-amber-500 font-bold' : 'text-zinc-300'}>
                {isRebooting ? "0.0%" : <motion.span>{driftText}</motion.span>}
              </span>
            </div>
            <div className="w-full bg-zinc-900/60 h-1 rounded overflow-hidden">
              <motion.div 
                className="h-full"
                style={{ width: driftWidth, backgroundColor: driftColor }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
              <span>DOPAMINERGIC FLUX</span>
              <span className={phase === 'crit' ? 'text-red-500 font-bold' : 'text-zinc-300'}>
                {isRebooting ? "1.0x" : <motion.span>{fluxText}</motion.span>}
              </span>
            </div>
            <div className="w-full bg-zinc-900/60 h-1 rounded overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-500"
                style={{ width: fluxWidth }}
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="bg-black/40 border border-zinc-900 rounded p-3 text-[10px] font-mono space-y-1.5 leading-relaxed text-zinc-500">
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <Info className="w-3 h-3 text-indigo-400" />
                <span className="font-bold">HEURISTIC READOUT</span>
              </div>
              {phase === 'crit' ? (
                <p className="text-red-400/80 animate-pulse">
                  CRITICAL: Neural coherence boundary collapsed. Words escaping syntax frame. Scramble sequence active.
                </p>
              ) : phase === 'warn' ? (
                <p className="text-amber-400/80">
                  WARNING: Mild cognitive drift active. Target text displaying structural dilation.
                </p>
              ) : (
                <p className="text-zinc-500">
                  COGNITION NORMAL. Syntactic links at peak density. Letter spacing baseline calibrated.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-900/60 pt-4 mt-6">
        <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-600">
          <Fingerprint className="w-3.5 h-3.5" />
          <span className="uppercase">Identity anchor v8.2</span>
        </div>
      </div>
    </section>
  );
});

HudTelemetry.displayName = 'HudTelemetry';

interface NeuralOrbProps {
  nervousSystemLoad: MotionValue<number>;
}

const NeuralOrb = React.memo(({ nervousSystemLoad }: NeuralOrbProps) => {
  const [isCritical, setIsCritical] = useState(false);
  const [isHighLoad, setIsHighLoad] = useState(false);
  const [isCoreCritical, setIsCoreCritical] = useState(false);

  useEffect(() => {
    const unsub = nervousSystemLoad.on("change", (latest) => {
      setIsCritical(latest > 75);
      setIsHighLoad(latest > 60);
      setIsCoreCritical(latest > 70);
    });
    return () => unsub();
  }, [nervousSystemLoad]);

  const orbWidthHeight = useTransform(nervousSystemLoad, (load) => load > 60 ? '160px' : '100px');
  const orbBackground = useTransform(nervousSystemLoad, (load) => {
    if (load > 75) return 'radial-gradient(circle, #f43f5e 20%, #e11d48 70%)';
    if (load > 45) return 'radial-gradient(circle, #f59e0b 20%, #d97706 70%)';
    return 'radial-gradient(circle, #818cf8 20%, #4f46e5 70%)';
  });

  const coreBorderColor = useTransform(nervousSystemLoad, (load) => {
    if (load > 75) return 'rgba(244, 63, 94, 0.4)';
    if (load > 40) return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(129, 140, 248, 0.2)';
  });

  const coreBorderStyle = useTransform<number, React.CSSProperties['borderStyle']>(
    nervousSystemLoad, 
    (load) => (load > 60 ? 'dashed' : 'solid')
  );

  return (
    <div className="absolute top-8 pointer-events-none select-none flex items-center justify-center w-full h-36">
      <motion.div 
        className="rounded-full filter blur-xl opacity-30 absolute will-change-[transform,opacity]"
        style={{
          width: orbWidthHeight,
          height: orbWidthHeight,
          background: orbBackground,
        }}
        animate={isCritical ? {
          scale: [1, 1.25, 0.9, 1.3, 1],
          x: [0, 8, -8, 6, 0],
          y: [0, -6, 8, -4, 0],
        } : {
          scale: [1, 1.15, 1],
          x: 0,
          y: 0
        }}
        transition={isCritical ? {
          duration: 0.18,
          repeat: Infinity,
          ease: "linear"
        } : {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="border rounded-full will-change-transform"
        style={{
          width: '60px',
          height: '60px',
          borderColor: coreBorderColor,
          borderStyle: coreBorderStyle,
        }}
        animate={{
          rotate: 360,
          scale: isCoreCritical ? [1, 1.3, 0.8, 1] : 1
        }}
        transition={{
          rotate: { duration: isHighLoad ? 2 : 12, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.4, repeat: Infinity }
        }}
      />
    </div>
  );
});

NeuralOrb.displayName = 'NeuralOrb';

interface DiagnosticReadoutProps {
  stimulationLevel: MotionValue<number>;
  sleepDebt: MotionValue<number>;
  nervousSystemLoad: MotionValue<number>;
  syntheticInteraction: MotionValue<number>;
  identityCoherence: MotionValue<number>;
  economicStress: MotionValue<number>;
  physicalMovement: MotionValue<number>;
  socialPressure: MotionValue<number>;
  agencyScore: MotionValue<number>;
  meaningScore: MotionValue<number>;
}

const DiagnosticReadout = React.memo(({ 
  stimulationLevel, 
  sleepDebt, 
  nervousSystemLoad, 
  syntheticInteraction, 
  identityCoherence,
  economicStress,
  physicalMovement,
  socialPressure,
  agencyScore,
  meaningScore
}: DiagnosticReadoutProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateText = () => {
      if (!ref.current) return;
      ref.current.textContent = `STIM: ${stimulationLevel.get()} | SLEEP: ${sleepDebt.get()}% | LOAD: ${nervousSystemLoad.get().toFixed(1)} | SYNTH: ${syntheticInteraction.get()}% | COH: ${identityCoherence.get().toFixed(1)}% | ECON: ${economicStress.get()}% | PHYS: ${physicalMovement.get()}% | SOC: ${socialPressure.get()}% | AGENCY: ${agencyScore.get().toFixed(1)}% | MEANING: ${meaningScore.get().toFixed(1)}%`;
    };

    const unsubs = [
      stimulationLevel.on("change", updateText),
      sleepDebt.on("change", updateText),
      nervousSystemLoad.on("change", updateText),
      syntheticInteraction.on("change", updateText),
      identityCoherence.on("change", updateText),
      economicStress.on("change", updateText),
      physicalMovement.on("change", updateText),
      socialPressure.on("change", updateText),
      agencyScore.on("change", updateText),
      meaningScore.on("change", updateText)
    ];

    updateText();
    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [
    stimulationLevel, 
    sleepDebt, 
    nervousSystemLoad, 
    syntheticInteraction, 
    identityCoherence,
    economicStress,
    physicalMovement,
    socialPressure,
    agencyScore,
    meaningScore
  ]);

  return (
    <div ref={ref} className="text-[8px] font-mono text-zinc-600/40 text-center tracking-wider pt-2" />
  );
});

DiagnosticReadout.displayName = 'DiagnosticReadout';

interface CriticalAlertProps {
  nervousSystemLoad: MotionValue<number>;
}

const CriticalAlert = React.memo(({ nervousSystemLoad }: CriticalAlertProps) => {
  const [show, setShow] = useState(nervousSystemLoad.get() > 75);

  useEffect(() => {
    return nervousSystemLoad.on("change", (latest) => {
      const target = latest > 75;
      if (target !== show) {
        setShow(target);
      }
    });
  }, [nervousSystemLoad, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="bg-rose-950/20 border border-rose-500/30 rounded p-2.5 flex items-center space-x-2.5"
        >
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
          <div className="font-mono text-[9px] text-rose-400/90 leading-tight">
            <span className="font-bold uppercase block text-rose-300">DISSOCIATIVE SATURATION EXCEEDED</span>
            Neural integrity compromised. Initiate core reset immediately to prevent semantic decoupling.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CriticalAlert.displayName = 'CriticalAlert';

interface RealtimeLogsProps {
  logs: typeof INITIAL_LOGS;
  nervousSystemLoad: MotionValue<number>;
  isRebooting: boolean;
}

const RealtimeLogs = React.memo(({ logs, nervousSystemLoad, isRebooting }: RealtimeLogsProps) => {
  const currentLoad = nervousSystemLoad.get();
  return (
    <section className="lg:col-span-1 bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-5 backdrop-blur-lg flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col h-full">
        <div className="flex items-center space-x-2 mb-4 border-b border-zinc-900 pb-2">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <h3 className="font-display text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            Console Monitor
          </h3>
        </div>

        <div className="flex-1 font-mono text-[10px] space-y-3.5 overflow-hidden">
          <AnimatePresence initial={false}>
            {logs.map((log) => {
              let textCol = "text-zinc-500";
              if (log.type === "success") textCol = "text-emerald-500/80";
              else if (log.type === "warn") textCol = "text-amber-500/80";
              else if (log.type === "crit") textCol = "text-rose-500/95 font-bold animate-pulse";
              else if (log.type === "system") textCol = "text-indigo-400/80";

              let logText = log.text;
              if (currentLoad > 50 && log.type !== "crit" && !isRebooting) {
                logText = log.text.split("").map((c) => {
                  if (Math.random() < (currentLoad - 50) / 100 * 0.4) {
                    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                  }
                  return c;
                }).join("");
              }

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${textCol} break-all leading-relaxed`}
                >
                  &gt; {logText}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-zinc-900/60 pt-4 mt-6">
        <div className="text-[8px] font-mono text-zinc-700 leading-tight">
          HOST: LOCALHOST // NODE-ID: FLO-D72
          <br />
          SECTOR CHECK: CALIBRATED (100%)
        </div>
      </div>
    </section>
  );
});

RealtimeLogs.displayName = 'RealtimeLogs';

interface HeaderStatusProps {
  nervousSystemLoad: MotionValue<number>;
  isRebooting: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  handleReboot: () => void;
  sessionDuration: number;
  canRunAnalysis: boolean;
  onRunAnalysis: () => void;
}

const HeaderStatus = React.memo(({
  nervousSystemLoad,
  isRebooting,
  isMuted,
  setIsMuted,
  handleReboot,
  sessionDuration,
  canRunAnalysis,
  onRunAnalysis,
}: HeaderStatusProps) => {
  const durationLabel = React.useMemo(() => {
    const m = Math.floor(sessionDuration / 60);
    const s = Math.floor(sessionDuration % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }, [sessionDuration]);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const statusIndicatorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const unsub = nervousSystemLoad.on("change", (latest) => {
      const textEl = statusTextRef.current;
      const indicatorEl = statusIndicatorRef.current;
      if (!textEl || !indicatorEl) return;

      if (latest > 75) {
        textEl.textContent = 'CRITICAL DISSOCIATION';
        textEl.className = 'font-bold text-red-500 animate-pulse';
        indicatorEl.className = 'p-1.5 rounded-full border bg-rose-500/10 border-rose-500/40 text-rose-400';
      } else if (latest > 45) {
        textEl.textContent = 'MEMETIC DEVIATION';
        textEl.className = 'font-bold text-amber-500';
        indicatorEl.className = 'p-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      } else {
        textEl.textContent = 'INTEGRITY SAFE';
        textEl.className = 'font-bold text-emerald-500';
        indicatorEl.className = 'p-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      }
    });

    return () => unsub();
  }, [nervousSystemLoad]);

  return (
    <header className="relative w-full z-20 border-b border-zinc-900 bg-[#030303]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div ref={statusIndicatorRef} className="p-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-display tracking-widest text-zinc-100 uppercase font-bold">
            Cognitive Node Sync
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 tracking-wider">
            PORT 08 // ADAPTIVE HEURISTICS
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
          <span className="text-zinc-600 uppercase">SYS STATUS</span>
          <span ref={statusTextRef} className="font-bold text-emerald-500">
            {isRebooting ? 'REBOOTING...' : 'INTEGRITY SAFE'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Session Duration Ticker */}
          <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
            <span className="text-zinc-600 uppercase">SESSION</span>
            <span className="font-bold text-zinc-500">{durationLabel}</span>
          </div>

          {/* Run Analysis Button */}
          <button
            onClick={onRunAnalysis}
            disabled={!canRunAnalysis}
            className={`px-3 py-2 rounded-none border font-mono text-[9px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer ${
              canRunAnalysis
                ? 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 bg-transparent'
                : 'border-zinc-900 text-zinc-700 cursor-not-allowed opacity-50'
            }`}
            title={canRunAnalysis ? 'Open Reflection Report' : 'Run simulation for 60s to enable'}
          >
            {canRunAnalysis ? 'Run Analysis' : `Analysis (${Math.max(0, 60 - sessionDuration)}s)`}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded border border-zinc-900 hover:bg-zinc-950 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
          </button>

          <button
            onClick={handleReboot}
            disabled={isRebooting}
            className="p-2 rounded border border-zinc-900 hover:bg-zinc-950 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Reset Cognitive Buffer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-mono font-bold hidden sm:inline uppercase tracking-wider">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
});

HeaderStatus.displayName = 'HeaderStatus';

export default function CognitiveSimulator() {
  // useMotionValue core engine states bypass React render cycle completely
  const stimulationLevel = useMotionValue<number>(1);
  const sleepDebt = useMotionValue<number>(0);
  const syntheticInteraction = useMotionValue<number>(0);
  const nervousSystemLoad = useMotionValue<number>(1);
  const identityCoherence = useMotionValue<number>(100);

  const economicStress = useMotionValue<number>(30);
  const physicalMovement = useMotionValue<number>(50);
  const socialPressure = useMotionValue<number>(20);
  const agencyScore = useMotionValue<number>(65);
  const meaningScore = useMotionValue<number>(75);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [logs, setLogs] = useState<typeof INITIAL_LOGS>(INITIAL_LOGS);

  // Reflection Modal state
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [activeArchetype, setActiveArchetype] = useState<string | null>(null);
  const [systemStartScores, setSystemStartScores] = useState<SystemScores>({
    attention: 65,
    nervous: 1,
    identity: 100,
    agency: 65,
    meaning: 75,
  });

  // Helper: snapshot current system scores
  const captureStartScores = React.useCallback((): SystemScores => ({
    attention: Math.max(0, Math.min(100, 100 - nervousSystemLoad.get())),
    nervous: nervousSystemLoad.get(),
    identity: identityCoherence.get(),
    agency: agencyScore.get(),
    meaning: meaningScore.get(),
  }), [nervousSystemLoad, identityCoherence, agencyScore, meaningScore]);

  // Helper: build current slider snapshot
  const getSliderSnapshot = React.useCallback((): SliderSnapshot => ({
    sleepDebt: sleepDebt.get(),
    stimulation: stimulationLevel.get(),
    socialPressure: socialPressure.get(),
    economicStress: economicStress.get(),
    physicalMovement: physicalMovement.get(),
  }), [sleepDebt, stimulationLevel, socialPressure, economicStress, physicalMovement]);

  const {
    isCompressionActive,
    isPaused: isCompressionPaused,
    elapsedSimulatedTime,
    progressPercent,
    eventDots,
    autopsyReport,
    tickInterval,
    driftStepMultiplier,
    startCompression,
    pauseCompression,
    resetCompression,
    logCompressionEvent
  } = useTimeCompression({
    nervousSystemLoad,
    identityCoherence,
    agencyScore,
    meaningScore
  }, isRebooting);

  const activeEvents = useNarrativeEvents({
    stimulationLevel,
    sleepDebt,
    socialPressure,
    economicStress,
    physicalMovement,
    meaningScore,
    agencyScore,
    nervousSystemLoad
  }, isRebooting, tickInterval, logCompressionEvent);

  // Quadrant matrix state that only re-renders the headers when boundaries are crossed
  const [quadrant, setQuadrant] = useState({
    key: "calm",
    title: "Synaptic Harmony",
    subtitle: "The mind rests in calibrated precision. Neuronal pathways fire in perfect, quiet consensus."
  });

  useEffect(() => {
    const updateQuadrant = () => {
      const load = nervousSystemLoad.get();
      const coherence = identityCoherence.get();
      let key = "calm";
      let title = "";
      let subtitle = "";

      if (load < 50) {
        if (coherence > 50) {
          key = "calm";
          title = "Synaptic Harmony";
          subtitle = "The mind rests in calibrated precision. Neuronal pathways fire in perfect, quiet consensus.";
        } else {
          key = "drifting";
          title = "Dissociative Void";
          subtitle = "The signals are silent, yet we are no longer here. The anchor has slipped, and we drift through grey space.";
        }
      } else {
        if (coherence > 50) {
          key = "frantic";
          title = "Hyper-Stimulated Coexistence";
          subtitle = "The synapses are flooded, yet the boundaries hold. We are racing to keep the shape from splintering.";
        } else {
          key = "collapse";
          title = "Complete Dissolution";
          subtitle = "Total collapse achieved. The syntax of existence fractures into white noise. There is nothing left to retrieve.";
        }
      }

      setQuadrant((prev) => {
        if (prev.key === key) return prev;
        return { key, title, subtitle };
      });
    };

    const unsub1 = nervousSystemLoad.on("change", updateQuadrant);
    const unsub2 = identityCoherence.on("change", updateQuadrant);
    
    updateQuadrant();

    return () => {
      unsub1();
      unsub2();
    };
  }, [nervousSystemLoad, identityCoherence]);

  // Refs for element selections and pointer tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const frameTickRef = useRef<number>(0);
  const synthRef = useRef<NeuralSynth | null>(null);

  // Identity statement
  const identityText = "I am a human being. I remember the smell of pine trees after a summer rain. I remember the sound of my mother's voice, calling me from the porch. I remember the cold water of the lake in October. My thoughts are my own. I have memories, dreams, and values. I hold onto my name. I hold onto my history. I am still here. I am still myself.";
  const words = useMemo(() => identityText.split(" "), [identityText]);

  // Game Loop/Simulation Engine (accel tick rate under time compression)
  useEffect(() => {
    if (isRebooting) return;
    const interval = setInterval(() => {
      const stim = stimulationLevel.get();
      const sleep = sleepDebt.get();
      const synth = syntheticInteraction.get();
      const econ = economicStress.get();
      const phys = physicalMovement.get();
      const soc = socialPressure.get();

      const targetLoad = Math.min(100, stim * (1 + (sleep * 0.015)));
      const targetCoherence = Math.max(0, 100 - synth);

      // Social pressure non-linear calculation: moderate pressure boosts, high pressure crashes
      let socialEffect: number;
      if (soc <= 50) {
        socialEffect = 0.4 * soc;
      } else {
        socialEffect = 20 - 1.4 * (soc - 50);
      }

      const targetAgency = Math.max(0, Math.min(100, 50 - 0.35 * sleep - 0.35 * econ + 0.30 * phys + socialEffect));

      // Meaning/Existential Stability calculations
      const socialConnection = 100 - synth; // social connection (positive) -> inverse synthetic interaction
      const sleepVal = 100 - sleep; // sleep (positive) -> inverse sleep debt
      const targetMeaning = Math.max(0, Math.min(100, 30 - 0.25 * stim - 0.25 * sleepVal + 0.3 * socialConnection + 0.3 * phys - 0.25 * econ));

      const driftStep = 1 * driftStepMultiplier;

      const currentLoad = nervousSystemLoad.get();
      if (currentLoad < targetLoad) {
        nervousSystemLoad.set(Math.min(targetLoad, currentLoad + driftStep));
      } else if (currentLoad > targetLoad) {
        nervousSystemLoad.set(Math.max(targetLoad, currentLoad - driftStep));
      }

      const currentCoherence = identityCoherence.get();
      if (currentCoherence < targetCoherence) {
        identityCoherence.set(Math.min(targetCoherence, currentCoherence + driftStep));
      } else if (currentCoherence > targetCoherence) {
        identityCoherence.set(Math.max(targetCoherence, currentCoherence - driftStep));
      }

      const currentAgency = agencyScore.get();
      if (currentAgency < targetAgency) {
        agencyScore.set(Math.min(targetAgency, currentAgency + driftStep));
      } else if (currentAgency > targetAgency) {
        agencyScore.set(Math.max(targetAgency, currentAgency - driftStep));
      }

      const currentMeaning = meaningScore.get();
      if (currentMeaning < targetMeaning) {
        meaningScore.set(Math.min(targetMeaning, currentMeaning + driftStep));
      } else if (currentMeaning > targetMeaning) {
        meaningScore.set(Math.max(targetMeaning, currentMeaning - driftStep));
      }
    }, tickInterval);

    return () => clearInterval(interval);
  }, [
    isRebooting,
    stimulationLevel,
    sleepDebt,
    syntheticInteraction,
    nervousSystemLoad,
    identityCoherence,
    economicStress,
    physicalMovement,
    socialPressure,
    agencyScore,
    meaningScore,
    tickInterval,
    driftStepMultiplier
  ]);

  // Pointer position writes CSS variables directly into DOM to bypass React render
  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    container.style.setProperty('--x', `${x}%`);
    container.style.setProperty('--y', `${y}%`);
  };

  // Setup synth class
  useEffect(() => {
    synthRef.current = new NeuralSynth();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Throttle synth updates to 16ms to prevent flooding audio thread
  useEffect(() => {
    if (!isReady || isRebooting || !synthRef.current) return;
    
    let lastUpdate = 0;
    const unsub = nervousSystemLoad.on("change", (latest) => {
      const now = performance.now();
      if (now - lastUpdate >= 16) {
        synthRef.current?.update(latest, isMuted);
        lastUpdate = now;
      }
    });

    synthRef.current.update(nervousSystemLoad.get(), isMuted);

    return () => unsub();
  }, [nervousSystemLoad, isMuted, isReady, isRebooting]);

  // warning logs generator (driven by true nervousSystemLoad)
  useEffect(() => {
    if (!isReady || isRebooting) return;
    
    let timerId: ReturnType<typeof setTimeout>;
    
    const runLogCycle = () => {
      const load = nervousSystemLoad.get();
      
      setLogs((prevLogs) => {
        const nextId = prevLogs.length + 1;
        let newLog;

        if (load < 20) {
          const normalSystemLogs = [
            "scanning synaptosomes...",
            "cognitive buffer load: normal",
            "hegemony check: verified",
            "dopamine receptors: calibrated"
          ];
          const text = normalSystemLogs[Math.floor(Math.random() * normalSystemLogs.length)];
          newLog = { id: nextId, text: `[sys] ${text}`, type: "system" };
        } else {
          const text = WARNING_POOL[Math.floor(Math.random() * WARNING_POOL.length)];
          const severity = load > 75 ? "crit" : (load > 45 ? "warn" : "info");
          
          let prefix = "[info] ";
          if (severity === "crit") prefix = "[CRIT] ";
          else if (severity === "warn") prefix = "[WARN] ";

          newLog = { id: nextId, text: `${prefix}${text}`, type: severity };
        }

        const updated = [...prevLogs, newLog];
        if (updated.length > 8) updated.shift();
        return updated;
      });

      // Frequency scales dynamically with load
      const intervalDuration = Math.max(1000, 7000 - (load / 100) * 6000);
      timerId = setTimeout(runLogCycle, intervalDuration);
    };

    timerId = setTimeout(runLogCycle, 2000);
    return () => clearTimeout(timerId);
  }, [nervousSystemLoad, isReady, isRebooting]);

  // RequestAnimationFrame high-speed updates for text nodes and screen overlays
  useEffect(() => {
    if (!isReady || isRebooting) return;
    
    let animationFrameId: number;
    let lastTime = 0;
    let frameCount = 0;

    const updateLoop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      frameTickRef.current += delta / 80; // increment ticks (80ms logic ticks)
      lastTime = timestamp;
      frameCount++;

      const container = textContainerRef.current;
      if (!container) {
        animationFrameId = requestAnimationFrame(updateLoop);
        return;
      }

      const load = nervousSystemLoad.get();
      const tick = frameTickRef.current;

      // A. Update textContainer className (color and text shadow)
      let shadowClass = '';
      if (load >= 30 && load < 60) shadowClass = 'chromatic-glow-1';
      else if (load >= 60 && load < 85) shadowClass = 'chromatic-glow-2';
      else if (load >= 85) shadowClass = 'chromatic-glow-3';
      
      let colorClass = 'text-zinc-200';
      if (load >= 40 && load < 70) colorClass = 'text-zinc-400';
      else if (load >= 70) colorClass = 'text-red-400/90 font-mono tracking-widest';
      
      const targetClassName = `text-left transition-all duration-300 leading-relaxed overflow-visible ${colorClass} ${shadowClass}`;
      if (container.className !== targetClassName) {
        container.className = targetClassName;
      }

      // B. Update child words directly
      const childSpans = container.children;
      for (let i = 0; i < childSpans.length; i++) {
        const span = childSpans[i] as HTMLSpanElement;
        if (!span) continue;
        const wordIdx = i;

        // Scramble logic (Throttled: run every 5 frames = ~80ms)
        if (frameCount % 5 === 0) {
          const originalWord = words[wordIdx];
          const scrambled = getScrambledWord(originalWord, wordIdx, tick, load);
          if (span.textContent !== scrambled) {
            span.textContent = scrambled;
          }
        }

        // Opacity logic
        const opacity = getWordOpacity(wordIdx, tick, load);
        span.style.opacity = opacity.toString();

        // Jitter (transform using translate3d for GPU compositor acceleration)
        const jitter = getWordJitter(wordIdx, tick, load);
        span.style.transform = `translate3d(${jitter.x}px, ${jitter.y}px, 0)`;

        // Custom fonts and colors for load > 70
        if (load > 70) {
          const fontSeed = Math.sin(wordIdx * 8.4 + tick * 0.1) * 0.5 + 0.5;
          let targetSpanClass: string;
          if (fontSeed > 0.8) {
            targetSpanClass = "inline-block mr-2 font-mono italic font-light text-rose-500/80";
          } else if (fontSeed < 0.15) {
            targetSpanClass = "inline-block mr-2 font-extrabold text-cyan-400";
          } else {
            targetSpanClass = "inline-block mr-2 text-red-400/90 font-mono tracking-widest";
          }
          if (span.className !== targetSpanClass) {
            span.className = targetSpanClass;
          }
        } else {
          const baseSpanClass = `inline-block mr-2`;
          if (span.className !== baseSpanClass) {
            span.className = baseSpanClass;
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isReady, isRebooting, words, nervousSystemLoad]);

  // Toggle ambient glow and noise overlay classes directly on DOM references
  useEffect(() => {
    if (!isReady || isRebooting) return;
    return nervousSystemLoad.on("change", (latest) => {
      const container = containerRef.current;
      if (container) {
        if (latest > 80) container.classList.add('crt-overlay');
        else container.classList.remove('crt-overlay');
      }

      const glow = ambientGlowRef.current;
      if (glow) {
        glow.className = latest > 60 
          ? "absolute inset-0 ambient-glow-degraded transition-opacity duration-500"
          : "absolute inset-0 ambient-glow transition-opacity duration-500";
      }

      const noise = noiseRef.current;
      if (noise) {
        if (latest > 30) noise.classList.add('noise-overlay-animate');
        else noise.classList.remove('noise-overlay-animate');
      }
    });
  }, [nervousSystemLoad, isReady, isRebooting]);

  // Session duration counter — increments every second while simulation is live
  useEffect(() => {
    if (!isReady || isRebooting) return;
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isReady, isRebooting]);

  const handleStart = () => {
    if (synthRef.current) {
      synthRef.current.init();
      setIsMuted(false);
      synthRef.current.update(1, false);
    }
    setIsReady(true);
    setSystemStartScores(captureStartScores());
    setSessionDuration(0);
  };

  const handleReboot = () => {
    if (isRebooting) return;
    setIsRebooting(true);
    if (synthRef.current) {
      synthRef.current.triggerReboot();
    }

    setLogs([
      { id: 1, text: "CRITICAL REBOOT TRIGGERED...", type: "crit" },
      { id: 2, text: "PURGING NEURAL STORAGE CORE...", type: "warn" },
      { id: 3, text: "RE-ESTABLISHING COGNITIVE BOUNDARIES...", type: "system" }
    ]);

    setTimeout(() => {
      stimulationLevel.set(1);
      sleepDebt.set(0);
      syntheticInteraction.set(0);
      economicStress.set(30);
      physicalMovement.set(50);
      socialPressure.set(20);
      nervousSystemLoad.set(1);
      identityCoherence.set(100);
      agencyScore.set(65);
      meaningScore.set(75);
      setIsRebooting(false);
      setActiveArchetype(null);
      setSessionDuration(0);
      setSystemStartScores({
        attention: 65, nervous: 1, identity: 100, agency: 65, meaning: 75,
      });
      setLogs([
        { id: 1, text: "neural sync connection established...", type: "system" },
        { id: 2, text: "memetic integrity index: 1.00 (STABLE)", type: "success" },
        { id: 3, text: "identity node verification check: OK", type: "success" },
      ]);
    }, 1200);
  };

  // Derived motion values for grid transform
  const gridTransform = useTransform(nervousSystemLoad, (load) => {
    if (load > 50) {
      const scale = 1 + (load - 50) * 0.002;
      const rotate = (load - 50) * 0.04;
      return `scale(${scale}) rotate(${rotate}deg) translate3d(0,0,0)`;
    }
    return 'scale(1) rotate(0deg) translate3d(0,0,0)';
  });

  const gridOpacity = useTransform(nervousSystemLoad, (load) => {
    return 0.15 + (load / 100) * 0.15;
  });

  const noiseOpacity = useTransform(nervousSystemLoad, (load) => {
    return 0.04 + (load / 100) * 0.15;
  });

  const letterSpacing = useTransform(nervousSystemLoad, (load) => {
    return `${((load - 1) / 99) * 14}px`;
  });

  const blurAmount = useTransform(nervousSystemLoad, (load) => {
    if (load <= 15) return '0px';
    return `${((load - 15) / 85) * 3.2}px`;
  });
  
  const textFilter = useTransform(blurAmount, (blur) => `blur(${blur})`);

  if (!isReady) {
    return (
      <div className="relative min-height-inherit w-full min-h-screen bg-[#030303] text-zinc-300 flex items-center justify-center p-6 select-none overflow-hidden">
        <div className="absolute inset-0 spatial-grid opacity-20"></div>
        <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-transparent to-transparent"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-md w-full bg-zinc-950/70 border border-zinc-900 rounded-lg p-8 backdrop-blur-xl shadow-2xl z-10 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-full animate-pulse">
              <Cpu className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <h1 className="font-display text-lg tracking-wider text-zinc-100 uppercase mb-2">
            System Neural Monitor
          </h1>
          <p className="font-mono text-xs text-zinc-500 mb-6 uppercase">
            v1.0.4 // MEMETIC DEGRADATION INDEXER
          </p>

          <div className="text-left font-mono text-[11px] text-zinc-400 leading-relaxed border border-zinc-900 bg-black/60 p-4 rounded mb-6 h-32 overflow-hidden select-none">
            <p className="text-zinc-600">&gt; BOOTING STACK...</p>
            <p className="text-zinc-600">&gt; CONNECTING INTERFACE BRIDGE...</p>
            <p className="text-indigo-400/80">&gt; REQUIRES USER CONFIRMATION & SYNAPSE INITIALIZATION</p>
            <p className="text-rose-400/70 animate-pulse">&gt; WARNING: HIGH LEVELS OF ALGORITHMIC STIMULATION CAN INDUCE SEVERE DISSOCIATION EFFECT</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-display text-sm tracking-widest uppercase border border-indigo-500/40 rounded transition-colors duration-200 cursor-pointer shadow-lg shadow-indigo-950/20"
          >
            Initialize Synapse
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="relative min-h-screen w-full bg-[#030303] text-zinc-300 flex flex-col font-sans select-none overflow-hidden transition-all duration-700"
    >
      {/* Background Spatial Layer */}
      <div 
        ref={ambientGlowRef}
        className="absolute inset-0 ambient-glow transition-opacity duration-500"
      />
      
      {/* Grid backdrop */}
      <motion.div 
        className="absolute inset-0 spatial-grid"
        style={{
          transform: gridTransform,
          opacity: gridOpacity
        }}
      />

      {/* Screen noise distortion */}
      <motion.div 
        ref={noiseRef}
        className="noise-overlay" 
        style={{ 
          opacity: noiseOpacity 
        }} 
      />

      {/* Header HUD */}
      <HeaderStatus 
        nervousSystemLoad={nervousSystemLoad} 
        isRebooting={isRebooting} 
        isMuted={isMuted} 
        setIsMuted={setIsMuted} 
        handleReboot={handleReboot}
        sessionDuration={sessionDuration}
        canRunAnalysis={sessionDuration >= 60}
        onRunAnalysis={() => setShowReflection(true)}
      />

      {/* Main Spatial Grid Workspace */}
      <main className="relative flex-1 w-full max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6 p-6 z-10 items-stretch">
        
        {/* Left HUD Panel - Diagnostics */}
        <HudTelemetry 
          nervousSystemLoad={nervousSystemLoad} 
          isRebooting={isRebooting} 
          isCompressionActive={isCompressionActive}
          elapsedTime={elapsedSimulatedTime}
        />

        {/* Center Panel - The Core Experiment */}
        <section className="col-span-1 lg:col-span-4 flex flex-col justify-between items-center bg-zinc-950/20 border border-zinc-900/60 rounded-lg p-6 backdrop-blur-sm relative">
          
          {/* Neural Orb/Core graphic */}
          <NeuralOrb nervousSystemLoad={nervousSystemLoad} />

          {/* Symmetrical 4-Column Layout: Text Block, Agency Meter, Existential Depth, & Attention Graph */}
          <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center my-12 max-w-[80rem] min-h-[460px]">
            {/* Column 1: Text Block */}
            <div className="flex items-center justify-start h-full px-4 select-text md:col-span-4 relative">
              <IdentityCore coherence={identityCoherence} />

              <div className="flex flex-col space-y-6 max-w-md relative z-10 w-full">
                {/* Dynamic Title and Subtitle with Crossfade transition */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quadrant.key}
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="space-y-2 border-b border-zinc-900/40 pb-4 select-none"
                  >
                    <h1 className="font-display text-lg tracking-wider text-zinc-100 uppercase font-extrabold">
                      {quadrant.title}
                    </h1>
                    <p className="font-mono text-[9px] text-zinc-500 leading-normal uppercase tracking-wide">
                      {quadrant.subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Direct DOM rendering of scrambled, wiggling text */}
                <motion.div 
                  ref={textContainerRef}
                  className="text-left transition-all duration-300 leading-relaxed overflow-visible text-zinc-200"
                  style={{
                    letterSpacing,
                    filter: textFilter
                  }}
                >
                  {words.map((_, idx) => (
                    <span key={idx} className="inline-block mr-2">
                      {words[idx]}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Column 2: Agency Meter */}
            <div className="flex items-center justify-center h-full md:col-span-2 relative">
              <AgencyMeter agencyScore={agencyScore} />
            </div>

            {/* Column 3: Existential Depth */}
            <div className="flex items-center justify-center h-full md:col-span-2 relative">
              <ExistentialDepth meaningScore={meaningScore} />
            </div>

            {/* Column 4: Attention Graph */}
            <div className="flex items-center justify-center w-full h-full relative pl-0 md:pl-6 select-none md:col-span-4">
              <AttentionGraph load={nervousSystemLoad} />
            </div>
          </div>

          {/* Core Controls: Sliders & Parameter Display */}
          <div className="w-full border-t border-zinc-900/60 pt-6 mt-auto">
            <div className="w-full max-w-3xl mx-auto space-y-6">
              
              <ArchetypeSelector 
                stimulationLevel={stimulationLevel}
                sleepDebt={sleepDebt}
                socialPressure={socialPressure}
                economicStress={economicStress}
                physicalMovement={physicalMovement}
                disabled={isRebooting}
                onArchetypeSelect={setActiveArchetype}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {/* Left Column Sliders */}
                <div className="space-y-6">
                  {/* Slider 1: Algorithmic Stimulation */}
                  <SimulationSlider 
                    label="Algorithmic Stimulation"
                    icon={Sliders}
                    min={1}
                    max={100}
                    motionValue={stimulationLevel}
                    activeColorVal={nervousSystemLoad}
                    colorThresholds={true}
                    disabled={isRebooting}
                  />

                  {/* Slider 2: Sleep Debt */}
                  <SimulationSlider 
                    label="Sleep Debt"
                    icon={Moon}
                    min={0}
                    max={100}
                    motionValue={sleepDebt}
                    valueSuffix="%"
                    disabled={isRebooting}
                  />

                  {/* Slider 3: Synthetic Interaction */}
                  <SimulationSlider 
                    label="Synthetic Interaction"
                    icon={Fingerprint}
                    min={0}
                    max={100}
                    motionValue={syntheticInteraction}
                    valueSuffix="%"
                    disabled={isRebooting}
                  />
                </div>

                {/* Right Column Sliders */}
                <div className="space-y-6">
                  {/* Slider 4: Economic Stress */}
                  <SimulationSlider 
                    label="Economic Stress"
                    icon={TrendingDown}
                    min={0}
                    max={100}
                    motionValue={economicStress}
                    valueSuffix="%"
                    disabled={isRebooting}
                  />

                  {/* Slider 5: Physical Movement */}
                  <SimulationSlider 
                    label="Physical Movement"
                    icon={Activity}
                    min={0}
                    max={100}
                    motionValue={physicalMovement}
                    valueSuffix="%"
                    disabled={isRebooting}
                  />

                  {/* Slider 6: Social Pressure */}
                  <SimulationSlider 
                    label="Social Pressure"
                    icon={Users}
                    min={0}
                    max={100}
                    motionValue={socialPressure}
                    valueSuffix="%"
                    disabled={isRebooting}
                  />
                </div>
              </div>

              {/* Spatial Alert/Notice Bar */}
              <CriticalAlert nervousSystemLoad={nervousSystemLoad} />

              {/* Diagnostic Monospace Readout (Vibe Friendly) */}
              <DiagnosticReadout 
                stimulationLevel={stimulationLevel}
                sleepDebt={sleepDebt}
                nervousSystemLoad={nervousSystemLoad}
                syntheticInteraction={syntheticInteraction}
                identityCoherence={identityCoherence}
                economicStress={economicStress}
                physicalMovement={physicalMovement}
                socialPressure={socialPressure}
                agencyScore={agencyScore}
                meaningScore={meaningScore}
              />

              {/* Timeline Scrubber & Compression Panel */}
              <div className="w-full border-t border-zinc-900/60 pt-4 font-mono text-[10px] select-none text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">TIME MATRIX:</span>
                    {isCompressionActive ? (
                      <span className="text-zinc-200 font-bold tracking-widest text-[10px] animate-pulse">
                        MONTH {elapsedSimulatedTime.months} / DAY {elapsedSimulatedTime.days} / HOUR {elapsedSimulatedTime.hours}
                      </span>
                    ) : (
                      <span className="text-zinc-655 font-bold tracking-wider text-[8.5px]">MANUAL RUN TIME</span>
                    )}
                  </div>
                  
                  {/* Mode Selector and Controls */}
                  <div className="flex items-center space-x-2">
                    {!isCompressionActive ? (
                      <div className="flex items-center space-x-1 bg-black/45 border border-zinc-900 p-0.5 rounded-none">
                        <button
                          onClick={() => startCompression('day')}
                          disabled={isRebooting}
                          className="px-2 py-1 text-[8px] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors uppercase cursor-pointer rounded-none border border-transparent hover:border-zinc-800"
                        >
                          + 1 Day
                        </button>
                        <button
                          onClick={() => startCompression('month')}
                          disabled={isRebooting}
                          className="px-2 py-1 text-[8px] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors uppercase cursor-pointer rounded-none border border-transparent hover:border-zinc-800"
                        >
                          + 1 Month
                        </button>
                        <button
                          onClick={() => startCompression('year')}
                          disabled={isRebooting}
                          className="px-2 py-1 text-[8px] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors uppercase cursor-pointer rounded-none border border-transparent hover:border-zinc-800"
                        >
                          + 1 Year
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 bg-black/45 border border-zinc-900 p-0.5 rounded-none">
                        <button
                          onClick={pauseCompression}
                          className="px-2.5 py-1 text-[8px] hover:bg-zinc-900 text-zinc-300 font-bold uppercase cursor-pointer rounded-none border border-transparent hover:border-zinc-800"
                        >
                          {isCompressionPaused ? "RESUME" : "PAUSE"}
                        </button>
                        <button
                          onClick={resetCompression}
                          className="px-2.5 py-1 text-[8px] bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-bold border-l border-zinc-900 uppercase cursor-pointer rounded-none border-t border-b border-r border-transparent hover:border-zinc-800"
                        >
                          ABORT
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrubber Timeline Bar */}
                <div className="relative w-full h-2.5 bg-zinc-950 border border-zinc-900 rounded-none overflow-visible flex items-center mb-1 select-none">
                  {/* Progress bar */}
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="h-full bg-zinc-800 transition-all duration-100 ease-out"
                  />

                  {/* Tick Marks / Event Dots */}
                  {eventDots.map((dot, idx) => (
                    <div
                      key={idx}
                      style={{ left: `${dot.percent}%` }}
                      className="absolute group/dot top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-200 border border-black cursor-crosshair z-25"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 scale-0 group-hover/dot:scale-100 transition-all font-mono text-[8px] bg-zinc-950 border border-zinc-850 text-zinc-300 px-1.5 py-0.5 rounded-none pointer-events-none whitespace-nowrap z-30 shadow-md">
                        {dot.name} (Hour {Math.round(dot.hour)})
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-[7px] text-zinc-650">
                  <span>0% START</span>
                  <span>{progressPercent.toFixed(1)}% ELAPSED</span>
                  <span>100% TIMELINE COMPLETED</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Right HUD Panel - Realtime Log Terminal */}
        <RealtimeLogs logs={logs} nervousSystemLoad={nervousSystemLoad} isRebooting={isRebooting} />

      </main>

      {/* Reboot / Flash Static Canvas */}
      <AnimatePresence>
        {isRebooting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-zinc-100 mix-blend-difference z-50 flex flex-col items-center justify-center"
          >
            {/* Degauss CRT line distortion */}
            <motion.div 
              initial={{ scaleY: 0.05, opacity: 0.5 }}
              animate={{ scaleY: [0.05, 1, 0.01], opacity: [0.5, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="w-full h-2 bg-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.8)]"
            />
            <div className="text-black font-mono font-bold tracking-[1rem] uppercase text-sm mt-4 select-none">
              REBOOTING NODE...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narrative Events Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5 max-w-[280px] pointer-events-none select-none">
        <AnimatePresence>
          {activeEvents.map(evt => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-black border border-zinc-900 p-3 font-mono text-[9px] text-zinc-350 rounded-none pointer-events-auto shadow-none"
            >
              <div className="font-bold border-b border-zinc-900 pb-1 mb-1.5 uppercase text-zinc-100 flex justify-between items-center">
                <span>[SYSTEM ALERT: {evt.name}]</span>
              </div>
              <div className="space-y-1">
                {Object.entries(evt.deltas).map(([key, val]) => {
                  if (val === undefined) return null;
                  const arrow = val > 0 ? "↑" : "↓";
                  const sign = val > 0 ? "+" : "";
                  const formattedKey = key
                    .replace(/Level$/, '')
                    .replace(/Score$/, '')
                    .replace(/([A-Z])/g, ' $1')
                    .toUpperCase();
                  return (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-zinc-500">{formattedKey}</span>
                      <span className="text-zinc-200 font-bold">
                        {arrow} {sign}{val}
                      </span>
                    </div>
                  );
                })}
                <div className="text-[8px] text-zinc-650 flex justify-between items-center pt-1.5 border-t border-zinc-900 mt-1.5">
                  <span>EXPIRATION COUNTDOWN:</span>
                  <span>{evt.remainingTime}s</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Psychological Autopsy Report Modal Overlay */}
      <AnimatePresence>
        {autopsyReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="max-w-xl w-full bg-black border border-zinc-800 p-6 font-mono text-zinc-300 rounded-none flex flex-col gap-4 relative shadow-2xl"
            >
              <div className="border-b border-zinc-800 pb-3">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-left">
                  // COGNITIVE COMPRESSION METRICS //
                </div>
                <h2 className="text-[14px] text-zinc-100 font-bold mt-1 uppercase tracking-wider text-left">
                  Psychological Autopsy Report
                </h2>
                <div className="text-[8px] text-zinc-600 mt-0.5 text-left">
                  TIMELINE MODE: {autopsyReport.mode.toUpperCase()} RUN COMPLETE
                </div>
              </div>

              {/* Narrative Summary */}
              <div className="bg-zinc-950 border border-zinc-900 p-4 text-[10px] leading-relaxed text-zinc-400 text-left">
                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2 border-b border-zinc-900 pb-1">
                  &gt; Executive Subject Profile:
                </div>
                <p className="font-mono">{autopsyReport.narrative}</p>
              </div>

              {/* Key Diagnostic Vectors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-zinc-900 p-3 text-left">
                  <div className="text-[8px] text-red-500 font-bold uppercase tracking-wider">
                    [!] Primary Failure Vector
                  </div>
                  <div className="text-[11px] text-zinc-200 font-bold mt-1 uppercase">
                    {autopsyReport.fastestDegraded.name}
                  </div>
                  <div className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                    Net decline: <span className="text-red-400">+{autopsyReport.fastestDegraded.value.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="border border-zinc-900 p-3 text-left">
                  <div className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider">
                    [*] Highest Core Resilience
                  </div>
                  <div className="text-[11px] text-zinc-200 font-bold mt-1 uppercase">
                    {autopsyReport.mostResilient.name}
                  </div>
                  <div className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                    Net variance: <span className="text-emerald-400">-{autopsyReport.mostResilient.value.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Peak and Trough Matrix Table */}
              <div className="border border-zinc-900 p-3">
                <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-2 text-left">
                  &gt; Symmetrical Telemetry Matrix:
                </div>
                <table className="w-full text-[9px] font-mono text-zinc-400">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-left">
                      <th className="pb-1.5">SYSTEM</th>
                      <th className="pb-1.5 text-right">START</th>
                      <th className="pb-1.5 text-right">PEAK</th>
                      <th className="pb-1.5 text-right">TROUGH</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-zinc-900/50">
                      <td className="py-2 text-left uppercase">Nervous Load</td>
                      <td className="py-2 text-right">{autopsyReport.initials.load.toFixed(0)}%</td>
                      <td className="py-2 text-right text-red-400">{autopsyReport.peaks.load.toFixed(0)}%</td>
                      <td className="py-2 text-right">{autopsyReport.troughs.load.toFixed(0)}%</td>
                    </tr>
                    <tr className="border-b border-zinc-900/50">
                      <td className="py-2 text-left uppercase">Identity Coherence</td>
                      <td className="py-2 text-right">{autopsyReport.initials.coherence.toFixed(0)}%</td>
                      <td className="py-2 text-right">{autopsyReport.peaks.coherence.toFixed(0)}%</td>
                      <td className="py-2 text-right text-red-400">{autopsyReport.troughs.coherence.toFixed(0)}%</td>
                    </tr>
                    <tr className="border-b border-zinc-900/50">
                      <td className="py-2 text-left uppercase">Agency Index</td>
                      <td className="py-2 text-right">{autopsyReport.initials.agency.toFixed(0)}%</td>
                      <td className="py-2 text-right">{autopsyReport.peaks.agency.toFixed(0)}%</td>
                      <td className="py-2 text-right text-red-400">{autopsyReport.troughs.agency.toFixed(0)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-left uppercase text-zinc-400">Existential stability</td>
                      <td className="py-2 text-right">{autopsyReport.initials.meaning.toFixed(0)}%</td>
                      <td className="py-2 text-right">{autopsyReport.peaks.meaning.toFixed(0)}%</td>
                      <td className="py-2 text-right text-red-400">{autopsyReport.troughs.meaning.toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Close Action Button */}
              <button
                onClick={resetCompression}
                className="w-full mt-2 py-2 bg-zinc-900 border border-zinc-800 text-zinc-350 hover:bg-zinc-850 hover:text-zinc-200 transition-colors uppercase text-[10px] font-bold tracking-widest cursor-pointer rounded-none"
              >
                [ RESET MATRIX & TELEMETRY ]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        systemScores={{
          attention: Math.max(0, Math.min(100, 100 - nervousSystemLoad.get())),
          nervous: nervousSystemLoad.get(),
          identity: identityCoherence.get(),
          agency: agencyScore.get(),
          meaning: meaningScore.get(),
        }}
        systemStartScores={systemStartScores}
        sliderValues={getSliderSnapshot()}
        activeArchetype={activeArchetype}
        sessionDuration={sessionDuration}
      />
    </div>
  );
}
