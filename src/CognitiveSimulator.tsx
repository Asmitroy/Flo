import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Terminal
} from 'lucide-react';

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

  update(stimulation: number, isMuted: boolean) {
    if (!this.isInitialized || !this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const time = this.ctx.currentTime;

    if (isMuted) {
      this.masterGain?.gain.setTargetAtTime(0.0, time, 0.1);
      return;
    }

    // Master volume scales with stimulation
    const masterVolume = 0.2 + (stimulation / 100) * 0.35;
    this.masterGain?.gain.setTargetAtTime(masterVolume, time, 0.15);

    // Hum pitch slides upwards as stimulation grows
    const baseFreq = 55 + (stimulation / 100) * 115; // 55Hz -> 170Hz
    this.osc1?.frequency.setTargetAtTime(baseFreq, time, 0.25);

    // Detuning spreads apart creating a nauseating beating oscillation
    const detuneSpread = 2 + (stimulation / 100) * 16;
    this.osc2?.frequency.setTargetAtTime(baseFreq + detuneSpread, time, 0.25);

    // Triangle wave volume scales up
    const osc2Volume = (stimulation / 100) * 0.15;
    this.gainOsc2?.gain.setTargetAtTime(osc2Volume, time, 0.2);

    // Static Noise scales up, becoming overwhelming at high settings
    const noiseVol = (stimulation / 100) * 0.28;
    this.gainNoise?.gain.setTargetAtTime(noiseVol, time, 0.2);

    // Filter frequency moves down and cracks erratically
    let filterFreq = 900 - (stimulation / 100) * 550;
    if (stimulation > 70) {
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

export default function CognitiveSimulator() {
  const [stimulation, setStimulation] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [logs, setLogs] = useState<typeof INITIAL_LOGS>(INITIAL_LOGS);
  
  // Tick to drive dynamic character cycling
  const [tick, setTick] = useState<number>(0);
  
  // Ambient radial glow cursor position
  const [cursorPos, setCursorPos] = useState({ x: '50%', y: '50%' });

  // Synthesizer instance
  const synthRef = useRef<NeuralSynth | null>(null);

  // Identity statement
  const identityText = "I am a human being. I remember the smell of pine trees after a summer rain. I remember the sound of my mother's voice, calling me from the porch. I remember the cold water of the lake in October. My thoughts are my own. I have memories, dreams, and values. I hold onto my name. I hold onto my history. I am still here. I am still myself.";

  // Words list
  const words = useMemo(() => identityText.split(" "), [identityText]);

  // Handle ambient pointer effect
  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPos({ x: `${x}%`, y: `${y}%` });
  };

  // Setup synth reference
  useEffect(() => {
    synthRef.current = new NeuralSynth();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Update synth on state changes
  useEffect(() => {
    if (isReady && !isRebooting && synthRef.current) {
      synthRef.current.update(stimulation, isMuted);
    }
  }, [stimulation, isMuted, isReady, isRebooting]);

  // Run fast tick interval for scrambler and logs
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Handle mock warning logs injection
  useEffect(() => {
    if (!isReady || isRebooting) return;
    
    // Warning frequency scales with stimulation
    const intervalDuration = Math.max(1000, 7000 - (stimulation / 100) * 6000);
    
    const interval = setInterval(() => {
      setLogs((prevLogs) => {
        const nextId = prevLogs.length + 1;
        let newLog;

        if (stimulation < 20) {
          const normalSystemLogs = [
            "scanning synaptosomes...",
            "cognitive buffer load: normal",
            "hegemony check: verified",
            "dopamine receptors: calibrated"
          ];
          const text = normalSystemLogs[Math.floor(Math.random() * normalSystemLogs.length)];
          newLog = { id: nextId, text: `[sys] ${text}`, type: "system" };
        } else {
          // Select from eerie warnings
          const text = WARNING_POOL[Math.floor(Math.random() * WARNING_POOL.length)];
          const severity = stimulation > 75 ? "crit" : (stimulation > 45 ? "warn" : "info");
          
          let prefix = "[info] ";
          if (severity === "crit") prefix = "[CRIT] ";
          else if (severity === "warn") prefix = "[WARN] ";

          newLog = { id: nextId, text: `${prefix}${text}`, type: severity };
        }

        // Keep last 8 logs
        const updated = [...prevLogs, newLog];
        if (updated.length > 8) updated.shift();
        return updated;
      });
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [stimulation, isReady, isRebooting]);

  // Scramble word function
  const getRenderedWord = (word: string, wordIdx: number) => {
    if (stimulation <= 10) return word;

    // Scramble chance increases with stimulation
    const scrambleChance = Math.max(0, (stimulation - 10) / 90) * 0.70; // Max 70% chance of scramble

    return word.split("").map((char, charIdx) => {
      // Don't scramble punctuation marks
      if (PUNCTUATION.has(char)) return char;

      // Unique seed for this letter to prevent visual pop synchrony
      const randomSeed = Math.sin(wordIdx * 12.3 + charIdx * 87.4 + tick) * 0.5 + 0.5;
      
      if (randomSeed < scrambleChance) {
        // Pick a glitched glyph
        const glyphIdx = Math.floor(
          Math.abs(Math.sin(wordIdx * 7.1 + charIdx * 3.4 + tick) * GLYPHS.length)
        ) % GLYPHS.length;
        return GLYPHS[glyphIdx];
      }
      return char;
    }).join("");
  };

  // Initialize Interface
  const handleStart = () => {
    if (synthRef.current) {
      synthRef.current.init();
      // Start with muted false
      setIsMuted(false);
      synthRef.current.update(1, false);
    }
    setIsReady(true);
  };

  // Reset core logic (reboot)
  const handleReboot = () => {
    if (isRebooting) return;
    setIsRebooting(true);
    if (synthRef.current) {
      synthRef.current.triggerReboot();
    }

    // Set logs to reboot cycle
    setLogs([
      { id: 1, text: "CRITICAL REBOOT TRIGGERED...", type: "crit" },
      { id: 2, text: "PURGING NEURAL STORAGE CORE...", type: "warn" },
      { id: 3, text: "RE-ESTABLISHING COGNITIVE BOUNDARIES...", type: "system" }
    ]);

    setTimeout(() => {
      setStimulation(1);
      setIsRebooting(false);
      setLogs([
        { id: 1, text: "neural sync connection established...", type: "system" },
        { id: 2, text: "memetic integrity index: 1.00 (STABLE)", type: "success" },
        { id: 3, text: "identity node verification check: OK", type: "success" },
      ]);
    }, 1200);
  };

  // Compute letter spacing based on stimulation
  const letterSpacing = useMemo(() => {
    // 0px at 1 stimulation -> 14px at 100 stimulation
    return `${((stimulation - 1) / 99) * 14}px`;
  }, [stimulation]);

  // Compute blur amount
  const blurAmount = useMemo(() => {
    // 0px at 1 stimulation -> 3.2px at 100 stimulation (eerie and uncomfortable, yet still shapes visible)
    if (stimulation <= 15) return '0px';
    return `${((stimulation - 15) / 85) * 3.2}px`;
  }, [stimulation]);

  // Dynamic text color and shadow style based on stimulation
  const textShadowClass = useMemo(() => {
    if (stimulation < 30) return '';
    if (stimulation < 60) return 'chromatic-glow-1';
    if (stimulation < 85) return 'chromatic-glow-2';
    return 'chromatic-glow-3';
  }, [stimulation]);

  // Text color gradient
  const textColorClass = useMemo(() => {
    if (stimulation < 40) return 'text-zinc-200';
    if (stimulation < 70) return 'text-zinc-400';
    return 'text-red-400/90 font-mono tracking-widest';
  }, [stimulation]);

  // Word opacity computation
  const getWordOpacity = (wordIdx: number) => {
    if (stimulation < 60) return 1;
    // High levels cause words to randomly flicker/dissolve
    const flickerChance = (stimulation - 60) / 40 * 0.4; // Max 40% flicker chance
    const pseudoRandom = Math.sin(wordIdx * 45.3 + tick * 0.4) * 0.5 + 0.5;
    if (pseudoRandom < flickerChance) {
      return 0.15 + 0.3 * Math.sin(tick * 0.8 + wordIdx);
    }
    return 1;
  };

  // Initial welcome screen before synapse activation
  if (!isReady) {
    return (
      <div className="relative min-height-inherit w-full min-h-screen bg-[#030303] text-zinc-300 flex items-center justify-center p-6 select-none overflow-hidden">
        {/* Ambient background layout */}
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
      onPointerMove={handlePointerMove}
      className={`relative min-h-screen w-full bg-[#030303] text-zinc-300 flex flex-col font-sans select-none overflow-hidden transition-all duration-700 ${
        stimulation > 80 ? 'crt-overlay' : ''
      }`}
      style={{
        '--x': cursorPos.x,
        '--y': cursorPos.y,
      } as React.CSSProperties}
    >
      {/* Background Spatial Layer */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          stimulation > 60 ? 'ambient-glow-degraded' : 'ambient-glow'
        }`}
      />
      
      {/* Grid backdrop */}
      <div 
        className="absolute inset-0 spatial-grid"
        style={{
          transform: stimulation > 50 
            ? `scale(${1 + (stimulation - 50) * 0.002}) rotate(${(stimulation - 50) * 0.04}deg)`
            : 'scale(1) rotate(0deg)',
          transition: 'transform 0.2s cubic-bezier(0.1, 0.8, 0.3, 1)',
          opacity: 0.15 + (stimulation / 100) * 0.15
        }}
      />

      {/* Screen noise distortion */}
      <div className={`noise-overlay ${stimulation > 30 ? 'noise-overlay-animate' : ''}`} 
        style={{ 
          opacity: 0.04 + (stimulation / 100) * 0.15 
        }} 
      />

      {/* Header HUD */}
      <header className="relative w-full z-20 border-b border-zinc-900 bg-[#030303]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-1.5 rounded-full border ${
            stimulation > 75 
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          }`}>
            <Activity className={`w-4 h-4 ${stimulation > 50 ? 'animate-bounce' : ''}`} />
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

        {/* Status Indicator */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col text-right font-mono text-[10px]">
            <span className="text-zinc-600 uppercase">SYS STATUS</span>
            <span className={`font-bold ${
              stimulation > 75 
                ? 'text-red-500 animate-pulse' 
                : (stimulation > 45 ? 'text-amber-500' : 'text-emerald-500')
            }`}>
              {stimulation > 75 
                ? 'CRITICAL DISSOCIATION' 
                : (stimulation > 45 ? 'MEMETIC DEVIATION' : 'INTEGRITY SAFE')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded border border-zinc-900 hover:bg-zinc-950 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer`}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {/* Reset button */}
            <button
              onClick={handleReboot}
              disabled={isRebooting}
              className={`p-2 rounded border border-zinc-900 hover:bg-zinc-950 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50`}
              title="Reset Cognitive Buffer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRebooting ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-mono font-bold hidden sm:inline uppercase tracking-wider">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Spatial Grid Workspace */}
      <main className="relative flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 z-10 items-stretch">
        
        {/* Left HUD Panel - Diagnostics */}
        <section className="bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-5 backdrop-blur-lg flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center space-x-2 mb-6 border-b border-zinc-900 pb-2">
              <Cpu className="w-4 h-4 text-zinc-500" />
              <h3 className="font-display text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                Neural Telemetry
              </h3>
            </div>

            {/* Diagnostic stats */}
            <div className="space-y-4">
              {/* Stat 1 */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                  <span>NEURAL INTEGRITY</span>
                  <span className={stimulation > 75 ? 'text-red-500 font-bold' : 'text-zinc-300'}>
                    {isRebooting ? "REBOOTING..." : `${Math.max(10.2, (100 - stimulation * 0.89)).toFixed(1)}%`}
                  </span>
                </div>
                <div className="w-full bg-zinc-900/60 h-1 rounded overflow-hidden">
                  <motion.div 
                    className={`h-full ${stimulation > 75 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    animate={{ width: `${Math.max(10, 100 - stimulation * 0.89)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Stat 2 */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                  <span>MEMETIC DRIFT</span>
                  <span className={stimulation > 45 ? 'text-amber-500 font-bold' : 'text-zinc-300'}>
                    {isRebooting ? "0.0%" : `${(stimulation * 1.4).toFixed(1)}%`}
                  </span>
                </div>
                <div className="w-full bg-zinc-900/60 h-1 rounded overflow-hidden">
                  <motion.div 
                    className={`h-full ${stimulation > 60 ? 'bg-rose-500' : (stimulation > 30 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                    animate={{ width: `${Math.min(100, stimulation * 1.4)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Stat 3 */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                  <span>DOPAMINERGIC FLUX</span>
                  <span className={stimulation > 80 ? 'text-red-500 font-bold' : 'text-zinc-300'}>
                    {isRebooting ? "1.0x" : `${(1.0 + (stimulation * 0.15)).toFixed(1)}x`}
                  </span>
                </div>
                <div className="w-full bg-zinc-900/60 h-1 rounded overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500"
                    animate={{ width: `${Math.min(100, 10 + stimulation * 0.9)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="pt-2">
                <div className="bg-black/40 border border-zinc-900 rounded p-3 text-[10px] font-mono space-y-1.5 leading-relaxed text-zinc-500">
                  <div className="flex items-center space-x-1.5 text-zinc-400">
                    <Info className="w-3 h-3 text-indigo-400" />
                    <span className="font-bold">HEURISTIC READOUT</span>
                  </div>
                  {stimulation > 75 ? (
                    <p className="text-red-400/80 animate-pulse">
                      CRITICAL: Neural coherence boundary collapsed. Words escaping syntax frame. Scramble sequence active.
                    </p>
                  ) : stimulation > 40 ? (
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

        {/* Center Panel - The Core Experiment */}
        <section className="col-span-1 lg:col-span-2 flex flex-col justify-between items-center bg-zinc-950/20 border border-zinc-900/60 rounded-lg p-6 backdrop-blur-sm relative">
          
          {/* Neural Orb/Core graphic */}
          <div className="absolute top-8 pointer-events-none select-none flex items-center justify-center w-full h-36">
            {/* Calm breathing orb */}
            <motion.div 
              className={`rounded-full filter blur-xl opacity-30 absolute`}
              style={{
                width: stimulation > 60 ? '160px' : '100px',
                height: stimulation > 60 ? '160px' : '100px',
                background: stimulation > 75 
                  ? 'radial-gradient(circle, #f43f5e 20%, #e11d48 70%)' 
                  : (stimulation > 45 ? 'radial-gradient(circle, #f59e0b 20%, #d97706 70%)' : 'radial-gradient(circle, #818cf8 20%, #4f46e5 70%)'),
              }}
              animate={stimulation > 75 ? {
                scale: [1, 1.25, 0.9, 1.3, 1],
                x: [0, 8, -8, 6, 0],
                y: [0, -6, 8, -4, 0],
              } : {
                scale: [1, 1.15, 1],
              }}
              transition={stimulation > 75 ? {
                duration: 0.18,
                repeat: Infinity,
                ease: "linear"
              } : {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Jagged internal core */}
            <motion.div 
              className="border border-white/10 rounded-full"
              style={{
                width: '60px',
                height: '60px',
                borderStyle: stimulation > 60 ? 'dashed' : 'solid',
                borderColor: stimulation > 75 
                  ? 'rgba(244, 63, 94, 0.4)' 
                  : (stimulation > 40 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(129, 140, 248, 0.2)'),
              }}
              animate={{
                rotate: 360,
                scale: stimulation > 70 ? [1, 1.3, 0.8, 1] : 1
              }}
              transition={{
                rotate: { duration: stimulation > 60 ? 2 : 12, repeat: Infinity, ease: "linear" },
                scale: { duration: 0.4, repeat: Infinity }
              }}
            />
          </div>

          {/* Identity Text (Center piece) */}
          <div className="w-full flex-1 flex items-center justify-center my-32 max-w-xl mx-auto px-4 select-text">
            <div 
              className={`text-center transition-all duration-300 leading-relaxed max-w-lg overflow-visible ${textColorClass} ${textShadowClass}`}
              style={{
                letterSpacing,
                filter: `blur(${blurAmount})`,
              }}
            >
              {words.map((word, wordIdx) => {
                // Determine word layout jitter limits based on stimulation level
                // 0 jitter up to 15, then scales up to 12px at 100 stimulation
                const jitterVal = stimulation <= 15 
                  ? 0 
                  : ((stimulation - 15) / 85) * 12;

                const opacity = getWordOpacity(wordIdx);

                // Generate static deterministic keyframes based on word index and current jitterVal
                const xJitter = jitterVal > 0 
                  ? [0, (Math.sin(wordIdx + 1) * jitterVal), (Math.cos(wordIdx + 3) * -jitterVal), 0]
                  : 0;
                const yJitter = jitterVal > 0 
                  ? [0, (Math.cos(wordIdx + 2) * -jitterVal), (Math.sin(wordIdx + 4) * jitterVal), 0]
                  : 0;

                // Word variant font modifications
                let fontClass = "";
                if (stimulation > 70) {
                  // Eerily shift fonts of certain words randomly
                  const fontSeed = Math.sin(wordIdx * 8.4 + tick * 0.1) * 0.5 + 0.5;
                  if (fontSeed > 0.8) fontClass = "font-mono italic font-light text-rose-500/80";
                  else if (fontSeed < 0.15) fontClass = "font-extrabold text-cyan-400";
                }

                return (
                  <motion.span
                    key={wordIdx}
                    className={`inline-block mr-2 select-text ${fontClass}`}
                    style={{ opacity }}
                    animate={jitterVal > 0 ? { x: xJitter, y: yJitter } : { x: 0, y: 0 }}
                    transition={{
                      duration: 0.2 + (Math.sin(wordIdx) * 0.15 + 0.15), // Random mirror durations per word
                      repeat: Infinity,
                      repeatType: "mirror",
                      ease: "easeInOut"
                    }}
                  >
                    {getRenderedWord(word, wordIdx)}
                  </motion.span>
                );
              })}
            </div>
          </div>

          {/* Core Controls: Slider & Parameter Display */}
          <div className="w-full border-t border-zinc-900/60 pt-6 mt-auto">
            <div className="w-full max-w-md mx-auto space-y-4">
              
              {/* Slider Label / Value */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="tracking-widest uppercase font-bold">Algorithmic Stimulation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] text-zinc-600 px-1 border border-zinc-900 bg-black/40 rounded`}>
                    LVL
                  </span>
                  <span className={`font-bold w-7 text-right ${
                    stimulation > 75 ? 'text-red-500' : (stimulation > 45 ? 'text-amber-500' : 'text-indigo-400')
                  }`}>
                    {stimulation}
                  </span>
                </div>
              </div>

              {/* Sleek Custom Slider */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={stimulation}
                  disabled={isRebooting}
                  onChange={(e) => setStimulation(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-900 border-none rounded-lg appearance-none cursor-pointer outline-none focus:outline-none transition-colors duration-150 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(to right, ${
                      stimulation > 75 
                        ? '#f43f5e' 
                        : (stimulation > 45 ? '#f59e0b' : '#6366f1')
                    } ${stimulation}%, #18181b ${stimulation}%)`
                  }}
                />
              </div>

              {/* Fine Tick Marks */}
              <div className="flex justify-between px-1 select-none pointer-events-none">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tickVal) => (
                  <div key={tickVal} className="flex flex-col items-center">
                    <div className={`w-[1px] h-1.5 ${
                      stimulation >= tickVal && tickVal > 0
                        ? (stimulation > 75 ? 'bg-rose-500' : (stimulation > 45 ? 'bg-amber-500' : 'bg-indigo-500'))
                        : 'bg-zinc-800'
                    }`} />
                    <span className={`text-[7px] font-mono mt-1 ${
                      stimulation >= tickVal
                        ? 'text-zinc-400'
                        : 'text-zinc-700'
                    }`}>
                      {tickVal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Spatial Alert/Notice Bar */}
              <AnimatePresence>
                {stimulation > 75 && (
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

            </div>
          </div>
        </section>

        {/* Right HUD Panel - Realtime Log Terminal */}
        <section className="bg-zinc-950/40 border border-zinc-900/60 rounded-lg p-5 backdrop-blur-lg flex flex-col justify-between select-none">
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-4 border-b border-zinc-900 pb-2">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <h3 className="font-display text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                Console Monitor
              </h3>
            </div>

            {/* Scrollable logs list */}
            <div className="flex-1 font-mono text-[10px] space-y-3.5 overflow-hidden">
              <AnimatePresence initial={false}>
                {logs.map((log) => {
                  let textCol = "text-zinc-500";
                  if (log.type === "success") textCol = "text-emerald-500/80";
                  else if (log.type === "warn") textCol = "text-amber-500/80";
                  else if (log.type === "crit") textCol = "text-rose-500/95 font-bold animate-pulse";
                  else if (log.type === "system") textCol = "text-indigo-400/80";

                  // Random character scrambling for logs at high stimulation
                  let logText = log.text;
                  if (stimulation > 50 && log.type !== "crit" && !isRebooting) {
                    logText = log.text.split("").map((c) => {
                      if (Math.random() < (stimulation - 50) / 100 * 0.4) {
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
    </div>
  );
}
