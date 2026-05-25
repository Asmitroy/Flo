import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, MotionValue, animate } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sliders, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Fingerprint, 
  Terminal,
  Moon,
  TrendingDown,
  Users
} from 'lucide-react';
// import AttentionGraph from './AttentionGraph';
// import IdentityCore from './IdentityCore';
// import AgencyMeter from './AgencyMeter';
// import ExistentialDepth from './ExistentialDepth';
import { ArchetypeSelector } from './ArchetypeSelector';
import { ARCHETYPES } from './ArchetypeEngine';
import { useNarrativeEvents, DESTABILIZERS, triggerNarrativeEvent } from './NarrativeEventEngine';
import { useTimeCompression } from './TimeCompressionEngine';
import ReflectionModal, { type SystemScores, type SliderSnapshot } from './ReflectionModal';
import { OnboardingQuestionnaire } from './OnboardingQuestionnaire';
import { EnvironmentalPrescription } from './EnvironmentalPrescription';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SimulatorContext, type SimulatorState } from './SimulatorContext';

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

const scrambleLogMessage = (fullMessage: string, load: number) => {
  if (load <= 70) return fullMessage;
  
  // Match prefix like "[sys] ", "[warn] ", "[err] ", "[CRIT] "
  const prefixMatch = fullMessage.match(/^(\[[a-zA-Z]+\]\s+)(.*)$/);
  if (!prefixMatch) return fullMessage;
  
  const prefix = prefixMatch[1];
  const body = prefixMatch[2];
  
  // Use a pseudo-random tick for scrambler variation
  const dummyTick = Math.floor(performance.now() / 80);
  const scrambledBody = body.split(" ").map((word, wordIdx) => {
    return getScrambledWord(word, wordIdx, dummyTick, load);
  }).join(" ");
  
  return `${prefix}${scrambledBody}`;
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

// const getWeatherStateForTelemetry = (att: number, nrv: number, agc: number, mng: number, fp: number) => {
//   if (fp > 0.6) return 'flow';
//   if (mng < 20 && agc < 30) return 'void';
//   if (nrv > 70 || att < 40 || agc < 30) return 'storm';
//   if ((nrv >= 30 && nrv <= 70) || (att >= 40 && att <= 70) || (mng >= 30 && mng <= 60)) {
//     return 'overcast';
//   }
//   if (nrv < 30 && att > 70 && mng > 60) return 'clear';
//   return 'overcast';
// };

interface HudTelemetryProps {
  nervousSystemLoad: MotionValue<number>;
  identityCoherence: MotionValue<number>;
  agencyScore: MotionValue<number>;
  meaningScore: MotionValue<number>;
  flowProbability: MotionValue<number>;
  systemStartScores: SystemScores;
  isRebooting: boolean;
  isCompressionActive?: boolean;
  elapsedTime?: { hours: number, days: number, months: number, years: number };
  targetSystemScores?: SystemScores | null;
  sleepDebt: MotionValue<number>;
  stimulationLevel: MotionValue<number>;
  socialPressure: MotionValue<number>;
  economicStress: MotionValue<number>;
  physicalMovement: MotionValue<number>;
  syntheticInteraction: MotionValue<number>;
}

const HudTelemetry = React.memo(({ 
  nervousSystemLoad, 
  identityCoherence,
  agencyScore,
  meaningScore,
  flowProbability,
  systemStartScores,
  isRebooting,
  isCompressionActive = false,
  elapsedTime,
  sleepDebt,
  stimulationLevel,
  socialPressure,
  economicStress,
  physicalMovement,
  syntheticInteraction
}: HudTelemetryProps) => {
  const [nrvScore, setNrvScore] = useState(nervousSystemLoad.get());
  const [idnScore, setIdnScore] = useState(identityCoherence.get());
  const [agcScore, setAgcScore] = useState(agencyScore.get());
  const [mngScore, setMngScore] = useState(meaningScore.get());
  const [flowProbVal, setFlowProbVal] = useState(flowProbability.get());

  const [sleepDebtVal, setSleepDebtVal] = useState(sleepDebt.get());
  const [stimulationVal, setStimulationVal] = useState(stimulationLevel.get());
  const [socialVal, setSocialVal] = useState(socialPressure.get());
  const [economicVal, setEconomicVal] = useState(economicStress.get());
  const [movementVal, setMovementVal] = useState(physicalMovement.get());
  const [synthVal, setSynthVal] = useState(syntheticInteraction.get());

  useEffect(() => {
    const unsubNrv = nervousSystemLoad.on("change", (v) => setNrvScore(v));
    const unsubIdn = identityCoherence.on("change", (v) => setIdnScore(v));
    const unsubAgc = agencyScore.on("change", (v) => setAgcScore(v));
    const unsubMng = meaningScore.on("change", (v) => setMngScore(v));
    const unsubFlow = flowProbability.on("change", (v) => setFlowProbVal(v));

    const unsubSleep = sleepDebt.on("change", (v) => setSleepDebtVal(v));
    const unsubStim = stimulationLevel.on("change", (v) => setStimulationVal(v));
    const unsubSocial = socialPressure.on("change", (v) => setSocialVal(v));
    const unsubEconomic = economicStress.on("change", (v) => setEconomicVal(v));
    const unsubMovement = physicalMovement.on("change", (v) => setMovementVal(v));
    const unsubSynth = syntheticInteraction.on("change", (v) => setSynthVal(v));

    return () => {
      unsubNrv();
      unsubIdn();
      unsubAgc();
      unsubMng();
      unsubFlow();
      unsubSleep();
      unsubStim();
      unsubSocial();
      unsubEconomic();
      unsubMovement();
      unsubSynth();
    };
  }, [
    nervousSystemLoad, identityCoherence, agencyScore, meaningScore, flowProbability,
    sleepDebt, stimulationLevel, socialPressure, economicStress, physicalMovement, syntheticInteraction
  ]);

  const attScore = 100 - nrvScore;
  const nrvWellness = 100 - nrvScore;

  // Track scoring history queue to estimate recovery velocity
  const totalScore = attScore + nrvWellness + idnScore + agcScore + mngScore;
  const totalScoreHistory = useRef<number[]>([]);

  useEffect(() => {
    const q = totalScoreHistory.current;
    if (q.length === 0 || q[q.length - 1] !== totalScore) {
      q.push(totalScore);
      if (q.length > 11) {
        q.shift();
      }
    }
  }, [totalScore]);

  // METRIC 1 — SYSTEM RISK INDEX
  const riskIndex = (
    (100 - attScore) * 0.20 +
    nrvScore * 0.25 +
    (100 - idnScore) * 0.15 +
    (100 - agcScore) * 0.20 +
    (100 - mngScore) * 0.20
  );
  const riskIndexVal = Math.round(riskIndex);
  const riskIndexColor = riskIndexVal < 30 ? "text-emerald-500" : riskIndexVal > 60 ? "text-red-500 font-bold" : "text-amber-500 font-bold";
  const riskIndexStatus = riskIndex < 20 ? "OPTIMAL CONFIGURATION" : riskIndex <= 40 ? "MANAGEABLE LOAD" : riskIndex <= 65 ? "ELEVATED RISK" : "CRITICAL DEGRADATION";

  // METRIC 2 — COGNITIVE DEBT ACCUMULATION
  const attentionDebt = Math.max(0, systemStartScores.attention - attScore);
  const nervousDebt = Math.max(0, nrvScore - systemStartScores.nervous);
  const identityDebt = Math.max(0, systemStartScores.identity - idnScore);
  const agencyDebt = Math.max(0, systemStartScores.agency - agcScore);
  const meaningDebt = Math.max(0, systemStartScores.meaning - mngScore);

  const cognitiveDebt = attentionDebt + nervousDebt + identityDebt + agencyDebt + meaningDebt;
  const roundedDebt = Math.round(cognitiveDebt);
  const debtValue = `+${roundedDebt} units`;
  const debtStatus = "SESSION DEBT";
  const debtColor = roundedDebt > 60 ? "text-red-500 font-bold" : roundedDebt > 30 ? "text-amber-500 font-bold" : "text-zinc-300";

  // METRIC 3 — RECOVERY VELOCITY
  let recoveryVelocity = 0;
  if (totalScoreHistory.current.length >= 2) {
    const q = totalScoreHistory.current;
    recoveryVelocity = (q[q.length - 1] - q[0]) / (q.length - 1);
  }
  const velocityColor = recoveryVelocity >= 0 ? "text-emerald-500" : "text-red-500 font-bold";
  const velocityValue = recoveryVelocity >= 0 
    ? `▲ +${recoveryVelocity.toFixed(1)}/tick`
    : `▼ ${recoveryVelocity.toFixed(1)}/tick`;
  const velocityStatus = recoveryVelocity >= 0 ? "RECOVERING" : "DEGRADING";

  // METRIC 4 — DOMINANT STRESSOR
  const stressorImpacts = {
    'SLEEP DEBT': sleepDebtVal * 1.5,
    'STIMULATION': stimulationVal * 1.2,
    'ECONOMIC STRESS': economicVal * 1.0,
    'SOCIAL PRESSURE': socialVal * 0.8,
    'LOW MOVEMENT': (100 - movementVal) * 0.9
  };
  const sortedStressors = Object.entries(stressorImpacts).sort(([, a], [, b]) => b - a);
  const highestStressor = sortedStressors[0];
  const isStressorActive = highestStressor[1] > 40;
  const stressorValue = isStressorActive ? highestStressor[0] : 'NONE';
  const stressorStatus = isStressorActive ? 'DOMINANT STRESSOR ACTIVE' : 'NO DOMINANT STRESSOR';
  const stressorColor = isStressorActive ? 'text-amber-500' : 'text-emerald-500';

  // METRIC 5 — FLOW WINDOW STATUS
  const flowPercentage = Math.round(flowProbVal * 100);
  const flowValue = `${flowPercentage}%`;

  const blockers: string[] = [];
  if (attScore <= 75) {
    blockers.push(`ATTENTION ${Math.round(attScore)}% (need >75%)`);
  }
  if (agcScore <= 70) {
    blockers.push(`AGENCY ${Math.round(agcScore)}% (need >70%)`);
  }
  if (nrvScore < 20 || nrvScore > 65) {
    blockers.push(`LOAD ${Math.round(nrvScore)}% (need 20-65%)`);
  }
  if (mngScore <= 60) {
    blockers.push(`MEANING ${Math.round(mngScore)}% (need >60%)`);
  }
  if (socialVal >= 40) {
    blockers.push(`SOCIAL PRESSURE ${Math.round(socialVal)}% (need <40%)`);
  }

  const getBlockerPriority = (blockerStr: string) => {
    if (blockerStr.startsWith("SOCIAL PRESSURE")) return 1;
    if (blockerStr.startsWith("ATTENTION") || blockerStr.startsWith("AGENCY") || blockerStr.startsWith("MEANING")) return 2;
    if (blockerStr.startsWith("LOAD")) return 3;
    return 4;
  };

  blockers.sort((a, b) => getBlockerPriority(a) - getBlockerPriority(b));
  const topBlocker = blockers[0] ?? null;

  let flowStatus = '';
  let flowColor = '';
  if (flowPercentage === 0) {
    if (topBlocker) {
      flowStatus = `BLOCKED BY: ${topBlocker}`;
    } else {
      flowStatus = 'FLOW UNAVAILABLE — recovery required first';
    }
    flowColor = 'text-red-500 animate-pulse';
  } else if (flowPercentage > 60) {
    flowStatus = 'FLOW ACTIVE — sustain current configuration';
    flowColor = 'text-[#F5C842]';
  } else if (flowPercentage >= 30) {
    flowStatus = 'FLOW ADJACENT — 2-3 adjustments needed';
    flowColor = 'text-amber-500';
  } else if (flowPercentage >= 10) {
    flowStatus = 'FLOW DISTANT — environment incompatible';
    flowColor = 'text-red-500';
  } else {
    flowStatus = 'FLOW UNAVAILABLE — recovery required first';
    flowColor = 'text-red-500 animate-pulse';
  }

  // METRIC 6 — SUSTAINABILITY ESTIMATE
  const isAnyCritical = attScore < 30 || nrvScore > 70 || idnScore < 30 || agcScore < 30 || mngScore < 30;
  let runwayValue = '';
  let runwayStatus = '';
  let runwayColor = '';
  if (isAnyCritical) {
    runwayValue = 'PAST THRESHOLD';
    runwayStatus = 'reconfiguration required';
    runwayColor = 'text-red-500 font-bold animate-pulse';
  } else {
    const rates = {
      attention: (stimulationVal * 0.3 + sleepDebtVal * 0.2) / 20,
      nervous: (stimulationVal * 0.25 + sleepDebtVal * 0.3 + economicVal * 0.15) / 20,
      agency: (economicVal * 0.3 + sleepDebtVal * 0.25 + nrvScore * 0.15) / 20,
      meaning: (stimulationVal * 0.25 + (100 - movementVal) * 0.4) / 20,
      identity: synthVal / 20
    };

    const ratesList = [
      { id: 'attention', current: attScore, rate: rates.attention, isInverted: false },
      { id: 'nervous', current: nrvScore, rate: rates.nervous, isInverted: true },
      { id: 'identity', current: idnScore, rate: rates.identity, isInverted: false },
      { id: 'agency', current: agcScore, rate: rates.agency, isInverted: false },
      { id: 'meaning', current: mngScore, rate: rates.meaning, isInverted: false }
    ];

    const runways = ratesList
      .filter(item => item.rate > 0)
      .map(item => {
        if (item.isInverted) {
          return (70 - item.current) / item.rate;
        } else {
          return (item.current - 30) / item.rate;
        }
      });

    if (runways.length === 0) {
      runwayValue = 'SUSTAINABLE';
      runwayStatus = 'no critical threshold projected';
      runwayColor = 'text-emerald-500';
    } else {
      const shortestRunway = Math.min(...runways);
      runwayValue = `~${shortestRunway.toFixed(1)} days`;
      runwayStatus = 'ESTIMATED RUNWAY — at current load';
      runwayColor = shortestRunway < 3 ? 'text-red-500 font-bold' : shortestRunway < 7 ? 'text-amber-500' : 'text-zinc-300';
    }
  }

  return (
    <section className="lg:col-span-1 bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-5 backdrop-blur-lg flex flex-col justify-between select-none">
      <div>
        <div className="flex items-center space-x-2 mb-6 border-b border-zinc-900 pb-2">
          <h3 className="font-display text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            COGNITIVE DASHBOARD
          </h3>
        </div>

        {isCompressionActive && elapsedTime && (
          <div className="mb-6 bg-zinc-950 border border-zinc-900/60 p-2.5 text-center animate-pulse">
            <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">
              COMPRESSION STATUS
            </span>
            <div className="font-mono text-[11px] text-zinc-200 font-bold mt-1 uppercase tracking-wider">
              MONTH {elapsedTime.months} / DAY {elapsedTime.days}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* METRIC 1 — SYSTEM RISK INDEX */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 opacity-30 tracking-wider">SYSTEM RISK INDEX</span>
            <span className={`text-[18px] font-bold mt-0.5 ${riskIndexColor}`}>
              {isRebooting ? "..." : riskIndexVal}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
              {isRebooting ? "INITIALIZING..." : riskIndexStatus}
            </span>
          </div>

          {/* METRIC 2 — COGNITIVE DEBT ACCUMULATION */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 opacity-30 tracking-wider">COGNITIVE DEBT ACCUMULATION</span>
            <span className={`text-[18px] font-bold mt-0.5 ${debtColor}`}>
              {isRebooting ? "..." : debtValue}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
              {isRebooting ? "INITIALIZING..." : debtStatus}
            </span>
          </div>

          {/* METRIC 3 — RECOVERY VELOCITY */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 opacity-30 tracking-wider">RECOVERY VELOCITY</span>
            <span className={`text-[18px] font-bold mt-0.5 ${velocityColor}`}>
              {isRebooting ? "..." : velocityValue}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
              {isRebooting ? "INITIALIZING..." : velocityStatus}
            </span>
          </div>

          {/* METRIC 4 — DOMINANT STRESSOR */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 opacity-30 tracking-wider">DOMINANT STRESSOR</span>
            <span className={`text-[18px] font-bold mt-0.5 ${stressorColor}`}>
              {isRebooting ? "..." : stressorValue}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
              {isRebooting ? "INITIALIZING..." : stressorStatus}
            </span>
          </div>

          {/* METRIC 5 — FLOW WINDOW STATUS */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 opacity-30 tracking-wider">FLOW WINDOW STATUS</span>
            <span className={`text-[18px] font-bold mt-0.5 ${flowColor}`}>
              {isRebooting ? "..." : flowValue}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
              {isRebooting ? "INITIALIZING..." : flowStatus}
            </span>
          </div>

          {/* METRIC 6 — SUSTAINABILITY ESTIMATE */}
          <div className="flex flex-col">
            <span className="font-mono text-[9px] text-zinc-400 opacity-30 tracking-wider">SUSTAINABILITY ESTIMATE</span>
            <span className={`text-[18px] font-bold mt-0.5 ${runwayColor}`}>
              {isRebooting ? "..." : runwayValue}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 uppercase tracking-wide">
              {isRebooting ? "INITIALIZING..." : runwayStatus}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

HudTelemetry.displayName = 'HudTelemetry';

interface CognitiveWeatherProps {
  attention: MotionValue<number>;
  nervousLoad: MotionValue<number>;
  identity: MotionValue<number>;
  agency: MotionValue<number>;
  meaning: MotionValue<number>;
  flowProbability: MotionValue<number>;
}

const CognitiveWeather = React.memo(({
  attention,
  nervousLoad,
  identity,
  agency,
  meaning,
  flowProbability
}: CognitiveWeatherProps) => {
  const [weather, setWeather] = useState<'clear' | 'overcast' | 'storm' | 'void' | 'flow'>('clear');
  const [flowProbVal, setFlowProbVal] = useState(flowProbability.get());

  useEffect(() => {
    const evaluate = () => {
      const att = attention.get();
      const nrv = nervousLoad.get();
      const agc = agency.get();
      const mng = meaning.get();
      const fp = flowProbability.get();

      // FLOW: flowProbability > 0.6
      if (fp > 0.6) {
        return 'flow';
      }

      // VOID: meaning < 20 AND agency < 30
      if (mng < 20 && agc < 30) {
        return 'void';
      }

      // STORM: nervousLoad > 70 OR attention < 40 OR agency < 30
      if (nrv > 70 || att < 40 || agc < 30) {
        return 'storm';
      }

      // OVERCAST: nervousLoad 30-70 OR (attention 40-70) OR (meaning 30-60)
      if ((nrv >= 30 && nrv <= 70) || (att >= 40 && att <= 70) || (mng >= 30 && mng <= 60)) {
        return 'overcast';
      }

      // CLEAR: nervousLoad < 30 AND attention > 70 AND meaning > 60
      if (nrv < 30 && att > 70 && mng > 60) {
        return 'clear';
      }

      return 'overcast';
    };

    const updateWeather = () => {
      setFlowProbVal(flowProbability.get());
      const nextWeather = evaluate();
      setWeather(prev => {
        if (prev !== nextWeather) return nextWeather;
        return prev;
      });
    };

    const unsubAtt = attention.on('change', updateWeather);
    const unsubNrv = nervousLoad.on('change', updateWeather);
    const unsubIdn = identity.on('change', updateWeather);
    const unsubAgc = agency.on('change', updateWeather);
    const unsubMng = meaning.on('change', updateWeather);
    const unsubFlow = flowProbability.on('change', updateWeather);

    updateWeather();

    return () => {
      unsubAtt();
      unsubNrv();
      unsubIdn();
      unsubAgc();
      unsubMng();
      unsubFlow();
    };
  }, [attention, nervousLoad, identity, agency, meaning, flowProbability]);

  const config = {
    clear: {
      color: '#6B8FE8',
      opacity: [[0.35, 0.35], [0.48, 0.48], [0.60, 0.60]],
      radii: [35, 60, 85],
      duration: 3,
      ease: "easeInOut",
      scale: [0.95, 1.05, 0.95],
      jitter: false,
    },
    overcast: {
      color: '#EF9F27',
      opacity: [[0.55, 0.55], [0.68, 0.68], [0.80, 0.80]],
      radii: [22, 40, 58], // compressed radii
      duration: 1.5, // double pulse frequency
      ease: "easeInOut",
      scale: [0.95, 1.05, 0.95],
      jitter: false,
    },
    storm: {
      color: '#E24B4A',
      opacity: [[0.75, 0.75], [0.85, 0.85], [0.90, 0.90]],
      radii: [30, 55, 80],
      duration: 0.3, // oscillates rapidly
      ease: "linear",
      scale: [0.9, 1.1, 0.9],
      jitter: true,
    },
    void: {
      color: 'rgba(255,255,255,0)',
      opacity: [[0, 0], [0, 0], [0, 0]],
      radii: [35, 60, 85],
      duration: 2,
      ease: "easeInOut",
      scale: [1, 1, 1],
      jitter: false,
    },
    flow: {
      color: '#F5C842',
      opacity: [[0, 0.6, 0], [0, 0.4, 0], [0, 0.25, 0]],
      radii: [35, 60, 85],
      duration: 3.5,
      ease: "easeOut",
      scale: [0.6, 1.4],
      jitter: false,
    }
  }[weather];

  const ringIndices = [0, 1, 2];

  return (
    <div className="pointer-events-none select-none flex flex-col items-center justify-center w-full h-full relative p-4">
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-64 h-64 overflow-visible">
          {/* Outer glows and filters for premium aesthetics */}
          <defs>
            <filter id="weather-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Center dot */}
          <motion.circle
            cx="100"
            cy="100"
            animate={{
              r: weather === 'void' ? 4 : 1.5,
              fill: weather === 'void' ? '#ffffff' : (weather === 'storm' ? '#E24B4A' : (weather === 'flow' ? '#F5C842' : '#FFFFFF')),
              opacity: weather === 'void' ? 0.4 : 0.7
            }}
            transition={{ duration: 1.5 }}
          />
          
          {ringIndices.map((ringIdx) => {
            const baseRadius = config.radii[ringIdx];
            return (
              <React.Fragment key={ringIdx}>
                {/* Cyan Chromatic Aberration Underlayer for Storm */}
                {weather === 'storm' && (
                  <>
                    <motion.circle
                      cx="100"
                      cy="100"
                      r={baseRadius}
                      fill="none"
                      stroke="#00FFFF"
                      strokeWidth="1"
                      opacity="0.45"
                      animate={{
                        scale: [0.9, 1.1, 0.9],
                        x: [3, 1, 5, 2, 4, 1, 3],
                        y: [-1, 2, -2, 0, 1, -1, 0]
                      }}
                      transition={{
                        scale: { duration: 0.3, repeat: Infinity, ease: "linear", delay: ringIdx * 0.1 },
                        x: { duration: 0.2, repeat: Infinity, ease: "linear" },
                        y: { duration: 0.2, repeat: Infinity, ease: "linear" }
                      }}
                    />
                    <motion.circle
                      cx="100"
                      cy="100"
                      r={baseRadius}
                      fill="none"
                      stroke="#00FFFF"
                      strokeWidth="1"
                      opacity="0.45"
                      animate={{
                        scale: [0.9, 1.1, 0.9],
                        x: [-3, -5, -2, -4, -1, -3],
                        y: [1, -2, 2, 0, -1, 1, 0]
                      }}
                      transition={{
                        scale: { duration: 0.3, repeat: Infinity, ease: "linear", delay: ringIdx * 0.1 },
                        x: { duration: 0.2, repeat: Infinity, ease: "linear" },
                        y: { duration: 0.2, repeat: Infinity, ease: "linear" }
                      }}
                    />
                  </>
                )}

                {/* Primary Ring */}
                <motion.circle
                  cx="100"
                  cy="100"
                  fill="none"
                  strokeWidth={weather === 'storm' ? "1.5" : "1"}
                  filter="url(#weather-glow)"
                  style={{
                    transformOrigin: "100px 100px"
                  }}
                  animate={{
                    stroke: config.color,
                    r: config.radii[ringIdx],
                    opacity: config.opacity[ringIdx] as any,
                    scale: config.scale,
                    rotate: weather === 'flow' ? [0, 360] : [0, 0],
                    x: config.jitter ? [0, -2, 2, -1, 1, -2, 2, 0] : [0, 0],
                    y: config.jitter ? [0, 2, -2, 1, -2, 1, -2, 0] : [0, 0],
                  }}
                  transition={{
                    stroke: { duration: 0.5 },
                    r: { duration: 0.5, ease: "easeOut" },
                    opacity: weather === 'flow' ? {
                      duration: config.duration,
                      repeat: Infinity,
                      ease: config.ease as any,
                      delay: ringIdx * 1.2
                    } : { duration: 0.5 },
                    scale: {
                      duration: config.duration,
                      repeat: Infinity,
                      ease: config.ease as any,
                      delay: ringIdx * 1.2 // Stagger radiating expansion
                    },
                    rotate: weather === 'flow' ? {
                      duration: 20 + ringIdx * 10,
                      repeat: Infinity,
                      ease: "linear"
                    } : { duration: 0.5 },
                    x: config.jitter ? { duration: 0.2, repeat: Infinity, ease: "linear" } : { duration: 0.5 },
                    y: config.jitter ? { duration: 0.2, repeat: Infinity, ease: "linear" } : { duration: 0.5 }
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Thin progress arc around the outermost ring for Flow Depth */}
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#F5C842"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{
              transformOrigin: "100px 100px"
            }}
            animate={{
              strokeDasharray: 552.92,
              strokeDashoffset: 552.92 * (1 - flowProbVal),
              opacity: weather === 'flow' ? 0.8 : 0
            }}
            transition={{
              opacity: { duration: 0.5 },
              strokeDashoffset: { duration: 0.3, ease: "easeOut" }
            }}
          />
        </svg>
      </div>

      <span className={`text-[10px] font-mono font-bold tracking-widest mt-2 uppercase transition-colors duration-500 ${
        weather === 'clear' ? 'text-indigo-400' :
        weather === 'overcast' ? 'text-amber-500/80' :
        weather === 'storm' ? 'text-rose-500 animate-pulse' :
        weather === 'void' ? 'text-rose-950 font-bold animate-pulse' :
        weather === 'flow' ? 'text-[#F5C842] font-bold' :
        'text-zinc-600'
      }`}>
        {weather === 'clear' && "COGNITIVE CLARITY"}
        {weather === 'overcast' && "ELEVATED LOAD"}
        {weather === 'storm' && "COGNITIVE STORM"}
        {weather === 'void' && "DISSOCIATIVE STATE"}
        {weather === 'flow' && "FLOW STATE ACTIVE"}
      </span>
    </div>
  );
});

CognitiveWeather.displayName = 'CognitiveWeather';

interface DiagnosticReadoutProps {
  nervousSystemLoad: MotionValue<number>;
}

const DiagnosticReadout = React.memo(({ 
  nervousSystemLoad
}: DiagnosticReadoutProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateText = () => {
      if (!ref.current) return;
      ref.current.textContent = `TRUE LOAD: ${nervousSystemLoad.get().toFixed(1)}%`;
    };

    const unsub = nervousSystemLoad.on("change", updateText);

    updateText();
    return unsub;
  }, [nervousSystemLoad]);

  return (
    <div ref={ref} className="text-[8px] font-mono text-zinc-650/50 text-center tracking-widest pt-2 uppercase font-bold" />
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

const DepletionAlert = React.memo(({ show }: { show: boolean }) => {
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
            <span className="font-bold uppercase block text-rose-300">COGNITIVE RESERVES DEPLETING</span>
            Deep Flow sustainability window has collapsed. Forcing biological tax until sleep debt is recovered.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
DepletionAlert.displayName = 'DepletionAlert';

interface RealtimeLogsProps {
  logs: typeof INITIAL_LOGS;
  nervousSystemLoad: MotionValue<number>;
  meaningScore: MotionValue<number>;
  isRebooting: boolean;
}

const RealtimeLogs = React.memo(({ logs, nervousSystemLoad, meaningScore, isRebooting }: RealtimeLogsProps) => {
  const [currentLoad, setCurrentLoad] = useState(nervousSystemLoad.get());
  const [currentMeaning, setCurrentMeaning] = useState(meaningScore.get());
  const meaningStartRef = useRef(meaningScore.get());

  useEffect(() => {
    const unsub = nervousSystemLoad.on("change", (v) => setCurrentLoad(v));
    return () => unsub();
  }, [nervousSystemLoad]);

  useEffect(() => {
    const unsub = meaningScore.on("change", (v) => setCurrentMeaning(v));
    return () => unsub();
  }, [meaningScore]);

  const meaningStatus = currentMeaning > 60 ? 'GROUNDED' : currentMeaning > 30 ? 'DRIFTING' : 'VOID';
  const meaningColor = currentMeaning > 60 ? 'text-amber-500' : currentMeaning > 30 ? 'text-zinc-400' : 'text-red-500';
  const meaningDelta = Math.round(currentMeaning - meaningStartRef.current);
  const trendArrow = meaningDelta > 0 ? '↑' : meaningDelta < 0 ? '↓' : '→';

  return (
    <section className="lg:col-span-1 bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-4 backdrop-blur-lg flex flex-col justify-between select-none h-full min-h-[640px]">
      <div className="flex flex-col h-full space-y-4 overflow-hidden">
        {/* Top: Meaning Status (replaces ExistentialDepth SVG) */}
        <div className="border-b border-zinc-900/60 pb-3">
          <div className="font-mono text-[10px] space-y-1.5 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-zinc-600 uppercase tracking-widest font-bold">MEANING:</span>
              <span className={`font-bold ${meaningColor}`}>{Math.round(currentMeaning)}%</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-zinc-600 uppercase tracking-widest font-bold">STATUS:</span>
              <span className={`font-bold ${meaningColor}`}>{meaningStatus}</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-zinc-600 uppercase tracking-widest font-bold">TREND:</span>
              <span className={`font-bold ${meaningDelta < 0 ? 'text-red-500' : meaningDelta > 0 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {trendArrow} {meaningDelta > 0 ? '+' : ''}{meaningDelta} this session
              </span>
            </div>
          </div>
        </div>

        {/* Console Monitor — fixed height, scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2 border-b border-zinc-900 pb-2">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
              <h3 className="font-display text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                Console Monitor
              </h3>
            </div>
          </div>

          <div className="flex-1 font-mono text-[11px] space-y-2 overflow-y-auto overflow-x-hidden" style={{ maxHeight: '280px' }}>
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
                    className={`${textCol} console-monitor-entry leading-normal`}
                  >
                    &gt; {logText}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-900/60 pt-3 mt-4">
        <div className="text-[8px] font-mono text-zinc-700 leading-tight">
          HOST: LOCALHOST // FLO-D72
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
  identityCoherence: MotionValue<number>;
  agencyScore: MotionValue<number>;
  meaningScore: MotionValue<number>;
  isRebooting: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  handleReboot: () => void;
  sessionDuration: number;
  canRunAnalysis: boolean;
  onRunAnalysis: () => void;
  onRecalibrate: () => void;
  profileLoaded: boolean;
  sustainabilityLabel?: string | null;
  sustainabilityColor?: string;
  currentNearestArchetype: string;
  transitionProtocolActive: boolean;
  onDeepAnalysis: () => void;
}

const HeaderStatus = React.memo(({
  nervousSystemLoad,
  identityCoherence,
  agencyScore,
  meaningScore,
  isRebooting,
  isMuted,
  setIsMuted,
  handleReboot,
  sessionDuration,
  canRunAnalysis,
  onRunAnalysis,
  onRecalibrate,
  profileLoaded,
  sustainabilityLabel,
  sustainabilityColor,
  currentNearestArchetype,
  transitionProtocolActive,
  onDeepAnalysis,
}: HeaderStatusProps) => {
  const durationLabel = React.useMemo(() => {
    const m = Math.floor(sessionDuration / 60);
    const s = Math.floor(sessionDuration % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }, [sessionDuration]);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const statusIndicatorRef = useRef<HTMLDivElement>(null);
  
  const [nrvVal, setNrvVal] = useState(nervousSystemLoad.get());
  const [idnVal, setIdnVal] = useState(identityCoherence.get());
  const [agcVal, setAgcVal] = useState(agencyScore.get());
  const [mngVal, setMngVal] = useState(meaningScore.get());

  useEffect(() => {
    const unsubNrv = nervousSystemLoad.on("change", (v) => {
      setNrvVal(v);
      const textEl = statusTextRef.current;
      const indicatorEl = statusIndicatorRef.current;
      if (!textEl || !indicatorEl) return;

      if (v > 75) {
        textEl.textContent = 'CRITICAL DISSOCIATION';
        textEl.className = 'font-bold text-red-500 animate-pulse';
        indicatorEl.className = 'p-1.5 rounded-full border bg-rose-500/10 border-rose-500/40 text-rose-400';
      } else if (v > 45) {
        textEl.textContent = 'MEMETIC DEVIATION';
        textEl.className = 'font-bold text-amber-500';
        indicatorEl.className = 'p-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      } else {
        textEl.textContent = 'INTEGRITY SAFE';
        textEl.className = 'font-bold text-emerald-500';
        indicatorEl.className = 'p-1.5 rounded-full border bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      }
    });
    const unsubIdn = identityCoherence.on("change", (v) => setIdnVal(v));
    const unsubAgc = agencyScore.on("change", (v) => setAgcVal(v));
    const unsubMng = meaningScore.on("change", (v) => setMngVal(v));

    return () => {
      unsubNrv();
      unsubIdn();
      unsubAgc();
      unsubMng();
    };
  }, [nervousSystemLoad, identityCoherence, agencyScore, meaningScore]);

  const getScoreColorClass = (score: number) => {
    if (score < 30) return 'text-red-500 font-bold animate-pulse';
    if (score < 70) return 'text-amber-500 font-bold';
    return 'text-zinc-300 font-bold';
  };

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

        {/* Profile Loaded Banner */}
        {profileLoaded && (
          <div className="ml-4 px-3 py-1 border border-emerald-900/40 bg-emerald-950/20 animate-pulse">
            <span className="font-mono text-[9px] text-emerald-500 tracking-widest uppercase font-bold">
              SUBJECT PROFILE LOADED
            </span>
          </div>
        )}
      </div>

      {/* Compact Status Strip */}
      <div className="hidden lg:flex items-center space-x-5 border-l border-r border-zinc-900/60 px-6 py-1 font-mono text-[10px] text-zinc-500 select-none">
        <div className="flex items-center space-x-1.5">
          <span>ATN</span>
          <span className={getScoreColorClass(Math.round(100 - nrvVal))}>
            {isRebooting ? '...' : `${Math.round(100 - nrvVal)}%`}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>NRV</span>
          <span className={getScoreColorClass(Math.round(100 - nrvVal))}>
            {isRebooting ? '...' : `${Math.round(100 - nrvVal)}%`}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>IDN</span>
          <span className={getScoreColorClass(Math.round(idnVal))}>
            {isRebooting ? '...' : `${Math.round(idnVal)}%`}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>AGC</span>
          <span className={getScoreColorClass(Math.round(agcVal))}>
            {isRebooting ? '...' : `${Math.round(agcVal)}%`}
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>MNG</span>
          <span className={getScoreColorClass(Math.round(mngVal))}>
            {isRebooting ? '...' : `${Math.round(mngVal)}%`}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
          <span className="text-zinc-650 uppercase font-bold">CURRENT</span>
          <span className="font-bold text-zinc-300 uppercase">
            {currentNearestArchetype || "Manual"}
          </span>
        </div>

        {transitionProtocolActive && (
          <div className="hidden md:flex flex-col text-right font-mono text-[10px] border-l border-zinc-900/60 pl-6">
            <span className="text-amber-500 font-bold uppercase tracking-widest animate-pulse">
              TRANSITION PROTOCOL ACTIVE
            </span>
          </div>
        )}

        {sustainabilityLabel && (
          <div className="hidden md:flex flex-col text-right font-mono text-[10px] border-r border-zinc-900/60 pr-6 mr-1">
            <span className="text-zinc-650 uppercase">FLOW WINDOW</span>
            <span className={`font-bold animate-pulse uppercase ${sustainabilityColor || 'text-amber-500'}`}>
              {sustainabilityLabel.replace("FLOW WINDOW: ", "")}
            </span>
          </div>
        )}

        <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
          <span className="text-zinc-600 uppercase font-bold">SYS STATUS</span>
          <span ref={statusTextRef} className="font-bold text-emerald-500">
            {isRebooting ? 'REBOOTING...' : 'INTEGRITY SAFE'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Session Duration Ticker */}
          <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
            <span className="text-zinc-650 uppercase font-bold">SESSION</span>
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

          {/* Deep Analysis Button */}
          <button
            onClick={onDeepAnalysis}
            className="font-mono text-xs tracking-widest opacity-60 hover:opacity-100 text-zinc-300 transition-opacity flex items-center cursor-pointer ml-2 px-1"
          >
            DEEP ANALYSIS →
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

          {/* Recalibrate Link */}
          <button
            onClick={onRecalibrate}
            className="font-mono text-[8px] text-zinc-600 tracking-widest uppercase cursor-pointer opacity-30 hover:opacity-100 transition-opacity duration-300 bg-transparent border-none p-1"
            title="Clear profile and restart onboarding"
          >
            RECALIBRATE
          </button>
        </div>
      </div>
    </header>
  );
});

HeaderStatus.displayName = 'HeaderStatus';

const getSimulatedHours = (time: any) => {
  if (!time) return 0;
  const y = time.years - 1;
  const m = time.months - 1;
  const d = time.days - 1;
  const h = time.hours;
  return h + d * 24 + m * 30 * 24 + y * 12 * 30 * 24;
};

export default function CognitiveSimulator() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAnalysis = location.pathname === '/analysis';
  const [analysisSnapshot, setAnalysisSnapshot] = useState<SimulatorState | null>(null);

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

  // States and refs needed by transforms declared early to avoid Temporal Dead Zone (TDZ)
  const [activeArchetype, setActiveArchetype] = useState<string | null>(null);
  const [flowWindowElapsed, setFlowWindowElapsed] = useState(0);
  const [flowWindowActive, setFlowWindowActive] = useState(false);
  const [sustainabilityExhausted, setSustainabilityExhausted] = useState<boolean>(false);

  const activeArchetypeRef = useRef<string | null>(null);
  const flowWindowElapsedRef = useRef<number>(0);
  const flowWindowActiveRef = useRef<boolean>(false);
  const sustainabilityExhaustedRef = useRef<boolean>(false);
  const prevSimulatedHoursRef = useRef<number | null>(null);
  const isCompressionActiveRef = useRef<boolean>(false);
  const elapsedSimulatedTimeRef = useRef<any>(null);

  // Sync refs to state updates
  activeArchetypeRef.current = activeArchetype;
  flowWindowElapsedRef.current = flowWindowElapsed;
  flowWindowActiveRef.current = flowWindowActive;
  sustainabilityExhaustedRef.current = sustainabilityExhausted;

  const [transitionProtocolActive, setTransitionProtocolActive] = useState<boolean>(false);
  const [transitionTargetArchetypeId, setTransitionTargetArchetypeId] = useState<string | null>(null);

  const nearestArchetype = useTransform(
    [stimulationLevel, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction],
    (values) => {
      const [stim, sleep, social, econ, phys, synth] = values as number[];
      
      const sliders = {
        stimulation: stim,
        sleepDebt: sleep,
        social: social,
        economic: econ,
        movement: phys,
        synthetic: synth,
      };

      return ARCHETYPES.reduce((nearest, arch) => {
        const dist = Math.sqrt(
          Math.pow(sliders.stimulation - arch.targets.stimulation, 2) +
          Math.pow(sliders.sleepDebt - arch.targets.sleepDebt, 2) +
          Math.pow(sliders.social - arch.targets.socialPressure, 2) +
          Math.pow(sliders.economic - arch.targets.economicStress, 2) +
          Math.pow(sliders.movement - arch.targets.physicalMovement, 2) +
          Math.pow(sliders.synthetic - arch.targets.syntheticInteraction, 2)
        );
        return dist < nearest.dist ? { name: arch.name, dist } : nearest;
      }, { name: '', dist: Infinity }).name;
    }
  );

  const [currentNearestArchetype, setCurrentNearestArchetype] = useState<string>('');
  useEffect(() => {
    const unsub = nearestArchetype.on("change", (val) => {
      setCurrentNearestArchetype(val);
    });
    setCurrentNearestArchetype(nearestArchetype.get());
    return unsub;
  }, [nearestArchetype]);

  // Reset transition protocol when preset archetype is selected from selector
  useEffect(() => {
    if (activeArchetype !== null) {
      setTransitionProtocolActive(false);
      setTransitionTargetArchetypeId(null);
    }
  }, [activeArchetype]);

  const attentionScore = useTransform(nervousSystemLoad, (load) => 100 - load);

  const flowProbability = useTransform(
    [attentionScore, agencyScore, nervousSystemLoad, meaningScore, socialPressure],
    (values) => {
      const [att, agency, load, meaning, social] = values as number[];

      // Locked 0 if Deep Flow is active and exhausted
      if (activeArchetypeRef.current === "Deep Flow" && sustainabilityExhaustedRef.current) {
        return 0;
      }

      const inFlowChannel = (
        att > 75 &&
        agency > 70 &&
        load >= 15 &&
        load <= 65 &&
        meaning > 60 &&
        social < 40
      );

      if (!inFlowChannel) return 0;

      // How deep in the channel are we?
      const attentionContrib = (att - 35) / 65 * 0.3;
      const agencyContrib = (agency - 40) / 60 * 0.3;
      const loadContrib = 1 - Math.abs(load - 50) / 15 * 0.4;
      let baseProb = Math.min(1, Math.max(0, attentionContrib + agencyContrib + loadContrib));

      // Apply capping rules in Deep Flow based on seconds elapsed
      if (activeArchetypeRef.current === "Deep Flow") {
        const elapsed = flowWindowElapsedRef.current;
        const pct = (elapsed / 7200) * 100;
        
        if (pct >= 100) {
          return 0;
        }
        
        if (pct > 75) {
          const capPct = 60 - ((pct - 75) / 25 * 60);
          const capVal = capPct / 100;
          baseProb = Math.min(baseProb, capVal);
        }
      }

      return baseProb;
    }
  );

  const [showOnboarding, setShowOnboarding] = useState(true);

  const [showPrescription, setShowPrescription] = useState<boolean>(false);
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [logs, setLogs] = useState<typeof INITIAL_LOGS>(INITIAL_LOGS);

  // Reflection Modal state
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [showReflection, setShowReflection] = useState<boolean>(false);

  useEffect(() => {
    if (activeArchetype !== "Deep Flow") {
      setFlowWindowActive(false);
      flowWindowActiveRef.current = false;
      setFlowWindowElapsed(0);
      flowWindowElapsedRef.current = 0;
      setSustainabilityExhausted(false);
      sustainabilityExhaustedRef.current = false;
    }
    prevSimulatedHoursRef.current = null;
  }, [activeArchetype]);

  const sustainabilityLabel = useMemo(() => {
    if (activeArchetype === "Deep Flow") {
      if (sustainabilityExhausted) {
        return "FLOW WINDOW: COLLAPSED — recovery required";
      }
      if (flowWindowActive) {
        const remainingSeconds = Math.max(0, 7200 - flowWindowElapsed);
        const totalMinutes = Math.round(remainingSeconds / 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const countdownStr = `${h}h ${m}m remaining`;
        
        const pct = (flowWindowElapsed / 7200) * 100;
        if (pct > 75) {
          return `FLOW WINDOW: DEPLETING — ${countdownStr}`;
        }
        if (pct >= 50) {
          return `FLOW WINDOW: DIMINISHING — ${countdownStr}`;
        }
        return `FLOW WINDOW: ACTIVE — ${countdownStr}`;
      }
    }
    return null;
  }, [activeArchetype, flowWindowActive, flowWindowElapsed, sustainabilityExhausted]);

  const sustainabilityColor = useMemo(() => {
    if (activeArchetype !== "Deep Flow") return 'text-zinc-500';
    if (sustainabilityExhausted) return 'text-red-500 font-bold';
    
    const pct = (flowWindowElapsed / 7200) * 100;
    if (pct > 75) return 'text-red-500 font-bold';
    if (pct >= 50) return 'text-amber-500 font-bold';
    return 'text-emerald-500 font-bold';
  }, [activeArchetype, flowWindowElapsed, sustainabilityExhausted]);

  const targetSystemScores = useMemo(() => {
    if (!transitionProtocolActive || !transitionTargetArchetypeId) return null;
    const arch = ARCHETYPES.find(a => a.id === transitionTargetArchetypeId);
    if (!arch) return null;

    const t = arch.targets;
    const targetLoad = Math.min(100, t.stimulation * (1 + (t.sleepDebt / 100 * 0.8)));
    const targetCoherence = Math.max(0, 100 - t.syntheticInteraction);

    const previewMeaning = Math.max(0, Math.min(100,
      15
      + (t.physicalMovement * 0.40)
      - (t.stimulation * 0.25)
      + (100 - t.syntheticInteraction) * 0.15
      - (t.economicStress * 0.15)
      - (t.sleepDebt * 0.10)
    ));
    let targetAgency = Math.max(0, Math.min(100,
      25
      + (t.physicalMovement * 0.55)
      - (t.economicStress * 0.25)
      - (t.sleepDebt * 0.20)
      - (targetLoad * 0.08)
      + (previewMeaning * 0.12)
    ));

    let targetMeaning = Math.max(0, Math.min(100,
      15
      + (t.physicalMovement * 0.40)
      - (t.stimulation * 0.25)
      + (100 - t.syntheticInteraction) * 0.15
      - (t.economicStress * 0.15)
      - (t.sleepDebt * 0.10)
    ));

    if (arch.name === "Creative Solitude") {
      targetAgency = Math.max(targetAgency, 75);
      targetMeaning = Math.max(targetMeaning, 80);
    }

    return {
      attention: Math.max(0, Math.min(100, 100 - targetLoad)),
      nervous: targetLoad,
      identity: targetCoherence,
      agency: targetAgency,
      meaning: targetMeaning
    };
  }, [transitionProtocolActive, transitionTargetArchetypeId]);

  const [systemStartScores, setSystemStartScores] = useState<SystemScores>({
    attention: 65,
    nervous: 1,
    identity: 100,
    agency: 65,
    meaning: 75,
  });

  const [compressionSpeed, setCompressionSpeed] = useState<'fast' | 'normal' | 'slow'>('fast');
  const [sessionEventsHistory, setSessionEventsHistory] = useState<{ name: string; category: 'destabilizer' | 'stabilizer' }[]>([]);
  
  const sessionPeakLoad = useRef<number>(1);

  useEffect(() => {
    const saved = localStorage.getItem('snm_profile')
    if (saved) {
      try {
        const profile = JSON.parse(saved)
        // Set each slider MotionValue or state to the saved value.
        // Use the exact setter names from this file.
        // Only set values that exist in the profile object.
        if (profile.stimulationLevel !== undefined) stimulationLevel.set(profile.stimulationLevel);
        if (profile.sleepDebt !== undefined) sleepDebt.set(profile.sleepDebt);
        if (profile.socialPressure !== undefined) socialPressure.set(profile.socialPressure);
        if (profile.economicStress !== undefined) economicStress.set(profile.economicStress);
        if (profile.physicalMovement !== undefined) physicalMovement.set(profile.physicalMovement);
        if (profile.syntheticInteraction !== undefined) syntheticInteraction.set(profile.syntheticInteraction);
        setProfileLoaded(true)
        setTimeout(() => setProfileLoaded(false), 3000)
      } catch (e) {
        // malformed JSON — ignore
      }
    }
  }, [])

  // Track peak load during the session
  useEffect(() => {
    const unsub = nervousSystemLoad.on('change', (v) => {
      if (v > sessionPeakLoad.current) {
        sessionPeakLoad.current = v;
      }
    });
    return () => unsub();
  }, [nervousSystemLoad]);

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
  }, isRebooting, compressionSpeed);

  // Sync time compression states to refs for loop closure safety
  isCompressionActiveRef.current = isCompressionActive;
  elapsedSimulatedTimeRef.current = elapsedSimulatedTime;

  // Custom callback to record event logs into the session history
  const handleEventTriggered = useCallback((eventName: string) => {
    logCompressionEvent(eventName);

    const foundDestabilizer = DESTABILIZERS.find(e => e.name === eventName);
    const category = foundDestabilizer ? 'destabilizer' : 'stabilizer';

    setSessionEventsHistory(prev => [...prev, { name: eventName, category }]);
  }, [logCompressionEvent]);

  const activeEvents = useNarrativeEvents({
    stimulationLevel,
    sleepDebt,
    socialPressure,
    economicStress,
    physicalMovement,
    meaningScore,
    agencyScore,
    nervousSystemLoad
  }, isRebooting, tickInterval, handleEventTriggered);

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

      const targetLoad = Math.min(100, stim * (1 + (sleep / 100 * 0.8)));
      const targetCoherence = Math.max(0, 100 - synth);

      const currentLoad = nervousSystemLoad.get();

      const currentMeaning = meaningScore.get();
      let targetAgency = Math.max(0, Math.min(100,
        25
        + (phys * 0.55)
        - (econ * 0.25)
        - (sleep * 0.20)
        - (currentLoad * 0.08)
        + (currentMeaning * 0.12)
      ));

      let targetMeaning = Math.max(0, Math.min(100,
        15
        + (phys * 0.40)
        - (stim * 0.25)
        + (100 - synth) * 0.15
        - (econ * 0.15)
        - (sleep * 0.10)
      ));

      if (activeArchetypeRef.current === "Creative Solitude") {
        targetAgency = Math.max(targetAgency, 75);
        targetMeaning = Math.max(targetMeaning, 80);
      }

      const driftStep = 1 * driftStepMultiplier;
      if (currentLoad < targetLoad) {
        nervousSystemLoad.set(Math.min(targetLoad, currentLoad + driftStep));
      } else if (currentLoad > targetLoad) {
        nervousSystemLoad.set(Math.max(targetLoad, currentLoad - driftStep));
      }

      const currentCoherence = identityCoherence.get();
      let coherenceDrift = driftStep;
      if (activeArchetypeRef.current === "Chronic Caregiver" && currentCoherence > targetCoherence) {
        coherenceDrift = driftStep * 2.5;
      }
      if (currentCoherence < targetCoherence) {
        identityCoherence.set(Math.min(targetCoherence, currentCoherence + driftStep));
      } else if (currentCoherence > targetCoherence) {
        identityCoherence.set(Math.max(targetCoherence, currentCoherence - coherenceDrift));
      }

      const currentAgency = agencyScore.get();
      if (currentAgency < targetAgency) {
        agencyScore.set(Math.min(targetAgency, currentAgency + driftStep));
      } else if (currentAgency > targetAgency) {
        agencyScore.set(Math.max(targetAgency, currentAgency - driftStep));
      }

      let meaningDrift = driftStep;
      if (activeArchetypeRef.current === "Digital Detox" && currentMeaning < targetMeaning) {
        meaningDrift = driftStep * 0.3;
      }
      if (currentMeaning < targetMeaning) {
        meaningScore.set(Math.min(targetMeaning, currentMeaning + meaningDrift));
      } else if (currentMeaning > targetMeaning) {
        meaningScore.set(Math.max(targetMeaning, currentMeaning - driftStep));
      }

      // Decrement flow window sustainability
      if (activeArchetypeRef.current === "Deep Flow") {
        let tickDuration = 0;
        if (isCompressionActiveRef.current) {
          const currHours = getSimulatedHours(elapsedSimulatedTimeRef.current);
          const prevHours = prevSimulatedHoursRef.current;
          let hoursDec = 0;
          if (prevHours !== null) {
            hoursDec = Math.max(0, currHours - prevHours);
          }
          prevSimulatedHoursRef.current = currHours;
          tickDuration = hoursDec * 3600;
        } else {
          prevSimulatedHoursRef.current = null;
          tickDuration = (tickInterval / 1000) * 60;
        }

        const fp = flowProbability.get();
        const currentSleepDebt = sleepDebt.get();

        // Activation: selected AND flowProbability > 50
        if (fp > 0.5 && !flowWindowActiveRef.current && !sustainabilityExhaustedRef.current) {
          setFlowWindowActive(true);
          flowWindowActiveRef.current = true;
        }

        if (flowWindowActiveRef.current) {
          const nextElapsed = flowWindowElapsedRef.current + tickDuration;
          setFlowWindowElapsed(nextElapsed);
          flowWindowElapsedRef.current = nextElapsed;

          const pct = (nextElapsed / 7200) * 100;

          // Under Phase 3 (elapsed > 75%): sleepDebt target increases by +0.5 per tick
          if (pct > 75) {
            sleepDebt.set(Math.min(100, currentSleepDebt + 0.5));
          }

          if (pct >= 100) {
            // Fire narrative event
            triggerNarrativeEvent("Flow Window Exhausted");

            setLogs(prev => {
              const nextId = prev.length + 1;
              const updated = [...prev, { id: nextId, text: "[CRIT] Flow Window Exhausted", type: "crit" }];
              if (updated.length > 8) updated.shift();
              return updated;
            });
            setSessionEventsHistory(prev => [...prev, { name: "Flow Window Exhausted", category: "destabilizer" }]);

            setFlowWindowActive(false);
            flowWindowActiveRef.current = false;
            setSustainabilityExhausted(true);
            sustainabilityExhaustedRef.current = true;
          }
        } else if (sustainabilityExhaustedRef.current) {
          // Recovery check: sleep debt recovered below 25
          if (currentSleepDebt < 25) {
            setSustainabilityExhausted(false);
            sustainabilityExhaustedRef.current = false;
            setFlowWindowElapsed(0);
            flowWindowElapsedRef.current = 0;
          } else {
            // Force sleepDebt +2 and stimulationLevel +5 per tick
            sleepDebt.set(Math.min(100, currentSleepDebt + 2));
            stimulationLevel.set(Math.min(100, stim + 5));
          }
        }
      } else {
        prevSimulatedHoursRef.current = null;
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
    
    const calmMessages = [
      "[sys] scanning synaptosomes...",
      "[sys] dopamine receptors: calibrated",
      "[sys] cognitive buffer load: normal",
      "[sys] identity matrix: stable",
      "[sys] attention threads: coherent",
      "[sys] memory consolidation: active",
      "[sys] prefrontal bandwidth: optimal"
    ];

    const degradingMessages = [
      "[warn] cortisol elevation detected",
      "[warn] attention switching: elevated",
      "[warn] working memory: fragmenting",
      "[sys] recalibrating...",
      "[err] focus lock: failed"
    ];
    
    const runLogCycle = () => {
      const load = nervousSystemLoad.get();
      
      setLogs((prevLogs) => {
        const nextId = prevLogs.length + 1;
        let newLogText = "";
        let newLogType = "system";

        if (load < 30) {
          newLogText = calmMessages[Math.floor(Math.random() * calmMessages.length)];
          newLogType = "system";
        } else if (load <= 70) {
          const pool = [...calmMessages, ...degradingMessages];
          newLogText = pool[Math.floor(Math.random() * pool.length)];
          if (newLogText.startsWith("[warn]")) {
            newLogType = "warn";
          } else if (newLogText.startsWith("[err]")) {
            newLogType = "crit";
          } else {
            newLogType = "system";
          }
        } else {
          // Overdrive (load > 70)
          // 1. Lowercase warnings from WARNING_POOL and prefix with [err]
          const formattedWarnings = WARNING_POOL.map(w => `[err] ${w.toLowerCase()}`);
          // 2. Map calm and degrading messages to have [err] prefix
          const errCalm = calmMessages.map(m => m.replace(/^\[sys\]/, "[err]"));
          const errDegrading = degradingMessages.map(m => m.replace(/^\[(sys|warn)\]/, "[err]"));
          
          const pool = [...errCalm, ...errDegrading, ...formattedWarnings];
          newLogText = pool[Math.floor(Math.random() * pool.length)];
          newLogType = "crit";

          // Apply corruption
          newLogText = scrambleLogMessage(newLogText, load);
        }

        const newLog = { id: nextId, text: newLogText, type: newLogType };
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
    sessionPeakLoad.current = nervousSystemLoad.get();
    setSessionEventsHistory([]);
  };

  const handleOnboardingComplete = useCallback((values: {
    sleepDebt: number;
    stimulationLevel: number;
    socialPressure: number;
    economicStress: number;
    physicalMovement: number;
    syntheticInteraction: number;
  }) => {
    sleepDebt.set(values.sleepDebt);
    stimulationLevel.set(values.stimulationLevel);
    socialPressure.set(values.socialPressure);
    economicStress.set(values.economicStress);
    physicalMovement.set(values.physicalMovement);
    syntheticInteraction.set(values.syntheticInteraction);

    // Mapped load and starts
    const load = Math.min(100, values.stimulationLevel * (1 + (values.sleepDebt * 0.015)));
    const attention = 100 - load;
    const agency = Math.max(0, Math.min(100, 30 + (values.physicalMovement * 0.30) - (values.economicStress * 0.30) - (values.sleepDebt * 0.25) - (load * 0.15)));
    const meaning = Math.max(0, Math.min(100, 15 + (values.physicalMovement * 0.40) - (values.stimulationLevel * 0.25) + (100 - values.syntheticInteraction) * 0.15 - (values.economicStress * 0.15) - (values.sleepDebt * 0.10)));

    setSystemStartScores({
      attention,
      nervous: load,
      identity: Math.max(0, 100 - values.syntheticInteraction),
      agency,
      meaning
    });

    setShowOnboarding(false);
  }, [sleepDebt, stimulationLevel, socialPressure, economicStress, physicalMovement, syntheticInteraction]);

  const handleApplyPrescriptionTargets = useCallback((
    targets: {
      stimulation?: number;
      sleepDebt?: number;
      socialPressure?: number;
      economicStress?: number;
      physicalMovement?: number;
      syntheticInteraction?: number;
    },
    targetArchetypeId: string | null
  ) => {
    const duration = 3;
    const ease = "linear";

    if (targets.stimulation !== undefined) {
      animate(stimulationLevel, targets.stimulation, { duration, ease });
    }
    if (targets.sleepDebt !== undefined) {
      animate(sleepDebt, targets.sleepDebt, { duration, ease });
    }
    if (targets.socialPressure !== undefined) {
      animate(socialPressure, targets.socialPressure, { duration, ease });
    }
    if (targets.economicStress !== undefined) {
      animate(economicStress, targets.economicStress, { duration, ease });
    }
    if (targets.physicalMovement !== undefined) {
      animate(physicalMovement, targets.physicalMovement, { duration, ease });
    }
    if (targets.syntheticInteraction !== undefined) {
      animate(syntheticInteraction, targets.syntheticInteraction, { duration, ease });
    }

    setActiveArchetype(null);

    if (targetArchetypeId) {
      setTransitionTargetArchetypeId(targetArchetypeId);
      setTransitionProtocolActive(true);

      // Begin simulation automatically: if compression is not active, start it
      if (!isCompressionActive) {
        startCompression('day');
      }
    }
  }, [stimulationLevel, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction, isCompressionActive, startCompression]);

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
      setTransitionProtocolActive(false);
      setTransitionTargetArchetypeId(null);
      setSessionDuration(0);
      sessionPeakLoad.current = 1;
      setSessionEventsHistory([]);
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

  const getLiveSnapshot = useCallback((): SimulatorState => {
    return {
      systemScores: {
        attention: Math.round(100 - nervousSystemLoad.get()),
        nervous: Math.round(nervousSystemLoad.get()),
        identity: Math.round(identityCoherence.get()),
        agency: Math.round(agencyScore.get()),
        meaning: Math.round(meaningScore.get())
      },
      sliderValues: {
        sleepDebt: Math.round(sleepDebt.get()),
        stimulation: Math.round(stimulationLevel.get()),
        socialPressure: Math.round(socialPressure.get()),
        economicStress: Math.round(economicStress.get()),
        physicalMovement: Math.round(physicalMovement.get()),
        syntheticInteraction: Math.round(syntheticInteraction.get())
      },
      sessionDuration: sessionDuration,
      activeArchetype: activeArchetype,
      flowProbability: Math.round(flowProbability.get() * 100),
      firedEvents: sessionEventsHistory
    };
  }, [
    sessionDuration, activeArchetype, sessionEventsHistory,
    nervousSystemLoad, identityCoherence, agencyScore, meaningScore,
    sleepDebt, stimulationLevel, socialPressure, economicStress,
    physicalMovement, syntheticInteraction, flowProbability
  ]);

  const handleDeepAnalysis = useCallback(() => {
    const snapshot = getLiveSnapshot();
    setAnalysisSnapshot(snapshot);
    navigate('/analysis');
  }, [getLiveSnapshot, navigate]);

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

  if (isAnalysis) {
    return (
      <SimulatorContext.Provider value={analysisSnapshot || getLiveSnapshot()}>
        <Outlet />
      </SimulatorContext.Provider>
    );
  }

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
            <p className="text-zinc-650">&gt; CONNECTING INTERFACE BRIDGE...</p>
            <p className="text-indigo-400/80">&gt; REQUIRES USER CONFIRMATION & SYNAPSE INITIALIZATION</p>
            <p className="text-rose-400/70 animate-pulse">&gt; WARNING: HIGH LEVELS OF ALGORITHMIC STIMULATION CAN INDUCE SEVERE DISSOCIATION EFFECT</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-350 font-display text-sm tracking-widest uppercase border border-indigo-500/40 rounded transition-colors duration-200 cursor-pointer shadow-lg shadow-indigo-950/20"
          >
            Initialize Synapse
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingQuestionnaire onComplete={handleOnboardingComplete} />
    );
  }

  return (
    <SimulatorContext.Provider value={analysisSnapshot || getLiveSnapshot()}>
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
        identityCoherence={identityCoherence}
        agencyScore={agencyScore}
        meaningScore={meaningScore}
        isRebooting={isRebooting} 
        isMuted={isMuted} 
        setIsMuted={setIsMuted} 
        handleReboot={handleReboot}
        sessionDuration={sessionDuration}
        canRunAnalysis={sessionDuration >= 60}
        onRunAnalysis={() => setShowReflection(true)}
        onRecalibrate={() => {
          localStorage.removeItem('snm_onboarded');
          localStorage.removeItem('snm_profile');
          window.location.reload();
        }}
        profileLoaded={profileLoaded}
        sustainabilityLabel={sustainabilityLabel}
        sustainabilityColor={sustainabilityColor}
        currentNearestArchetype={currentNearestArchetype}
        transitionProtocolActive={transitionProtocolActive}
        onDeepAnalysis={handleDeepAnalysis}
      />

      {/* Main Spatial Grid Workspace */}
      <main className="relative flex-1 w-full max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-6 gap-6 p-6 z-10 items-stretch">
        
        {/* Left HUD Panel - Diagnostics */}
        <HudTelemetry 
          nervousSystemLoad={nervousSystemLoad} 
          identityCoherence={identityCoherence}
          agencyScore={agencyScore}
          meaningScore={meaningScore}
          flowProbability={flowProbability}
          systemStartScores={systemStartScores}
          isRebooting={isRebooting} 
          isCompressionActive={isCompressionActive}
          elapsedTime={elapsedSimulatedTime}
          targetSystemScores={targetSystemScores}
          sleepDebt={sleepDebt}
          stimulationLevel={stimulationLevel}
          socialPressure={socialPressure}
          economicStress={economicStress}
          physicalMovement={physicalMovement}
          syntheticInteraction={syntheticInteraction}
        />

        {/* Center Panel - The Core Experiment */}
        <section className="col-span-1 lg:col-span-4 flex flex-col justify-between items-center bg-zinc-950/20 border border-zinc-900/60 rounded-lg p-6 backdrop-blur-sm relative">
          
          {/* Cognitive State Label (Title and Subtitle) */}
          <div className="w-full text-center mb-4 select-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={quadrant.key}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="space-y-2 border-b border-zinc-900/40 pb-3"
              >
                <h1 className="font-display text-sm tracking-wider text-zinc-100 uppercase font-extrabold text-center">
                  {quadrant.title}
                </h1>
                <p className="font-mono text-[9px] text-zinc-500 leading-normal uppercase tracking-wide text-center">
                  {quadrant.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Cognitive Weather visualizer (centered, minimum height 280px) */}
          <div className="w-full flex-1 flex items-center justify-center relative min-h-[280px]">
            <CognitiveWeather 
              attention={attentionScore}
              nervousLoad={nervousSystemLoad}
              identity={identityCoherence}
              agency={agencyScore}
              meaning={meaningScore}
              flowProbability={flowProbability}
            />
          </div>

          {/* Identity Core banner & Identity Text Block below weather circles */}
          <div className="w-full max-w-xl flex flex-col space-y-4 relative py-4">
            <div className="relative w-full z-10">

              <div className="flex flex-col relative z-20 w-full text-center mt-3">
                {/* Direct DOM rendering of scrambled, wiggling text */}
                <motion.div 
                  ref={textContainerRef}
                  className="text-center transition-all duration-300 leading-relaxed overflow-y-auto max-h-[120px] text-zinc-200 text-xs tracking-wide max-w-xl mx-auto"
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
                syntheticInteraction={syntheticInteraction}
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
              <div className="w-full space-y-2">
                <CriticalAlert nervousSystemLoad={nervousSystemLoad} />
                <DepletionAlert show={sustainabilityExhausted && activeArchetype === "Deep Flow"} />
              </div>


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
                    <div className="flex items-center bg-black/45 border border-zinc-900 p-0.5 rounded-none">
                      <button
                        onClick={() => {
                          setCompressionSpeed(prev => {
                            if (prev === 'fast') return 'normal';
                            if (prev === 'normal') return 'slow';
                            return 'fast';
                          });
                        }}
                        disabled={isRebooting}
                        className="px-2.5 py-1 text-[8px] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors uppercase cursor-pointer rounded-none border border-transparent hover:border-zinc-800 font-bold"
                      >
                        SPEED: {compressionSpeed.toUpperCase()}
                      </button>
                    </div>

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
        <RealtimeLogs logs={logs} nervousSystemLoad={nervousSystemLoad} meaningScore={meaningScore} isRebooting={isRebooting} />

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
                    {(() => {
                      const systemKey = autopsyReport.mostResilient.id as 'load' | 'coherence' | 'agency' | 'meaning';
                      const peakVal = autopsyReport.peaks[systemKey];
                      const troughVal = autopsyReport.troughs[systemKey];
                      const absVariance = Math.abs(peakVal - troughVal);

                      if (systemKey === 'coherence' && peakVal === 100 && troughVal === 100) {
                        return <span className="text-emerald-400 font-bold">Held stable throughout.</span>;
                      }
                      if (absVariance <= 5) {
                        return <span className="text-zinc-400 font-bold">No significant variance recorded.</span>;
                      }
                      return (
                        <>
                          Variance: <span className="text-emerald-400 font-bold">±{Math.round(absVariance)}%</span>
                        </>
                      );
                    })()}
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
        onClose={(insightStr: string) => {
          setShowReflection(false);
          setCurrentInsight(insightStr);
          setShowPrescription(true);
        }}
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
        firedEvents={sessionEventsHistory}
        peakLoad={sessionPeakLoad.current}
      />

      {/* Environmental Prescription Modal */}
      <EnvironmentalPrescription
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
        systemScores={{
          attention: Math.max(0, Math.min(100, 100 - nervousSystemLoad.get())),
          nervous: nervousSystemLoad.get(),
          identity: identityCoherence.get(),
          agency: agencyScore.get(),
          meaning: meaningScore.get(),
        }}
        sliderValues={{
          sleepDebt: sleepDebt.get(),
          stimulation: stimulationLevel.get(),
          socialPressure: socialPressure.get(),
          economicStress: economicStress.get(),
          physicalMovement: physicalMovement.get(),
          syntheticInteraction: syntheticInteraction.get(),
        }}
        activeArchetype={activeArchetype}
        insight={currentInsight}
        onApplyTargets={handleApplyPrescriptionTargets}
        currentNearestArchetype={currentNearestArchetype}
      />
      </div>
    </SimulatorContext.Provider>
  );
}
