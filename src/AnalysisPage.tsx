import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulatorState, type SimulatorState } from './SimulatorContext';
import { ARCHETYPES } from './ArchetypeEngine';
import { Activity, ShieldAlert, ArrowLeft } from 'lucide-react';

// Get Flow State probability dynamically mapped for archetypes
const getArchetypeFlowProbability = (name: string): number => {
  if (name === "Deep Flow") return 65;
  if (name === "Athletic Recovery") return 40;
  if (name === "Sustainable High Performance") return 25;
  if (name === "Meaningful Work") return 20;
  if (name === "Creative Solitude") return 15;
  if (name === "Recovery Cabin" || name === "Digital Detox") return 5;
  return 0;
};

// Map archetype to sustainability category
const getArchetypeSustainability = (name: string): string => {
  if (name === "Deep Flow") return "FINITE (2 Hrs)";
  if ([
    "Recovery Cabin", 
    "Meaningful Work", 
    "Sustainable High Performance", 
    "Digital Detox", 
    "Athletic Recovery", 
    "Creative Solitude"
  ].includes(name)) {
    return "INDEFINITE";
  }
  return "UNSUSTAINABLE (<24h)";
};

// Map archetype to risk level
const getArchetypeRisk = (name: string): { label: string; level: number; color: string } => {
  if (name === "Cyberpunk Megacity") return { label: "CRITICAL", level: 5, color: "text-red-500 font-bold animate-pulse" };
  if (["Hyperonline", "Corporate Burnout", "Modern Student", "Chronic Caregiver"].includes(name)) {
    return { label: "HIGH", level: 4, color: "text-red-450 font-bold" };
  }
  if (name === "Deep Flow") return { label: "MODERATE", level: 3, color: "text-amber-500" };
  if (["Sustainable High Performance", "Meaningful Work", "Creative Solitude", "Digital Detox"].includes(name)) {
    return { label: "LOW", level: 2, color: "text-indigo-400" };
  }
  return { label: "VERY LOW", level: 1, color: "text-emerald-500" }; // Recovery Cabin, Athletic Recovery
};

const formatSustainability = (days: number): string => {
  if (days > 365) return 'INDEFINITE'
  if (days > 90) return `~${Math.round(days / 30)} MONTHS`
  if (days > 14) return `~${Math.round(days)} DAYS`
  return `~${days.toFixed(1)} DAYS`
};

export default function AnalysisPage() {
  const navigate = useNavigate();
  let state: SimulatorState;

  try {
    state = useSimulatorState();
  } catch (e) {
    return (
      <div className="min-h-screen bg-[#030303] text-zinc-400 p-8 flex flex-col justify-center items-center font-mono">
        <div className="border border-red-900 bg-red-950/20 px-6 py-4 text-center max-w-sm">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-3 animate-pulse" />
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest">SYNAPSE DISCONNECT</h2>
          <p className="text-[10px] text-zinc-500 mt-2 uppercase">No active simulator session detected in context tree.</p>
          <button 
            onClick={() => navigate('/')} 
            className="mt-4 px-4 py-2 border border-zinc-800 hover:border-zinc-500 transition-colors text-[10px] text-zinc-300 font-bold tracking-wider uppercase cursor-pointer"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    );
  }

  const { systemScores, sliderValues, sessionDuration, activeArchetype, flowProbability } = state;
  const { stimulation, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction } = sliderValues;

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 2 MATH: SURVIVAL CALCULATIONS
  // ───────────────────────────────────────────────────────────────────────────
  const rates = useMemo(() => {
    return {
      attention: (stimulation * 0.3 + sleepDebt * 0.2) / 20,
      nervous: (stimulation * 0.25 + sleepDebt * 0.3 + economicStress * 0.15) / 20,
      agency: (economicStress * 0.3 + sleepDebt * 0.25 + systemScores.nervous * 0.15) / 20,
      meaning: (stimulation * 0.25 + (100 - physicalMovement) * 0.4) / 20,
      identity: syntheticInteraction / 20
    };
  }, [stimulation, sleepDebt, economicStress, syntheticInteraction, physicalMovement, systemScores.nervous]);

  const survivalMetrics = useMemo(() => {
    const list = [
      { id: 'attention', name: 'ATTENTION CAPACITY', current: systemScores.attention, rate: rates.attention, isInverted: false },
      { id: 'nervous', name: 'NERVOUS SYSTEM LOAD', current: systemScores.nervous, rate: rates.nervous, isInverted: true },
      { id: 'identity', name: 'EGO-IDENTITY COHERENCE', current: systemScores.identity, rate: rates.identity, isInverted: false },
      { id: 'agency', name: 'AGENCY INDEX', current: systemScores.agency, rate: rates.agency, isInverted: false },
      { id: 'meaning', name: 'EXISTENTIAL STABILITY', current: systemScores.meaning, rate: rates.meaning, isInverted: false }
    ];

    return list.map(item => {
      let status = '';
      let colorClass = 'text-zinc-350';

      if (item.isInverted) {
        // Nervous System (Inverted): high load is bad. Critical is > 70.
        if (item.current > 70) {
          status = 'ALREADY IN CRITICAL ZONE';
          colorClass = 'text-red-500 font-bold';
        } else if (item.rate < 0.05) {
          status = 'NO RISK — CURRENTLY PROTECTED';
          colorClass = 'text-zinc-500 font-mono';
        } else {
          const days = (70 - item.current) / item.rate;
          status = formatSustainability(days);
          colorClass = status === 'INDEFINITE' ? 'text-zinc-500 font-mono' : 'text-amber-500';
        }
      } else {
        // Normal systems: low score is bad. Critical is < 30.
        if (item.current < 30) {
          status = 'ALREADY IN CRITICAL ZONE';
          colorClass = 'text-red-500 font-bold';
        } else if (item.rate < 0.05) {
          status = 'NO RISK — CURRENTLY PROTECTED';
          colorClass = 'text-zinc-500 font-mono';
        } else {
          const days = (item.current - 30) / item.rate;
          status = formatSustainability(days);
          colorClass = status === 'INDEFINITE' ? 'text-zinc-500 font-mono' : 'text-amber-500';
        }
      }

      return { ...item, status, colorClass };
    });
  }, [systemScores, rates]);

  // Overall rating logic
  const overallSustainability = useMemo(() => {
    const isAnyCritical = systemScores.attention < 30 || 
                          systemScores.nervous > 70 || 
                          systemScores.identity < 30 || 
                          systemScores.agency < 30 || 
                          systemScores.meaning < 30;

    const stressedCount = [
      systemScores.attention,
      100 - systemScores.nervous,
      systemScores.identity,
      systemScores.agency,
      systemScores.meaning
    ].filter(s => s >= 30 && s <= 70).length;

    if (isAnyCritical) {
      return {
        label: "CRITICAL: CORE COGNITIVE COLLAPSE IMMINENT",
        color: "border-red-950/60 bg-red-950/15 text-red-500 font-bold animate-pulse-slow"
      };
    }
    if (stressedCount >= 3) {
      return {
        label: "HIGH RISK: MULTIPLE DEGRADATION THREATS",
        color: "border-amber-950/60 bg-amber-950/10 text-amber-500 font-bold"
      };
    }
    if (stressedCount >= 1) {
      return {
        label: "MODERATE RISK: MONITOR STRESSED SYSTEMS",
        color: "border-zinc-800/80 bg-zinc-900/40 text-amber-400"
      };
    }
    return {
      label: "SUSTAINABLE INDEFINITELY AT CURRENT ENVIRONMENT",
      color: "border-emerald-950/60 bg-emerald-950/10 text-emerald-450 font-bold font-mono tracking-wider"
    };
  }, [systemScores]);

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 3: SYSTEM INTERDEPENDENCE TREE
  // ───────────────────────────────────────────────────────────────────────────
  const couplingTree = useMemo(() => {
    const attStim = (stimulation * 0.3).toFixed(1);
    const attSleep = (sleepDebt * 0.2).toFixed(1);
    const nervousStim = (stimulation * 0.25).toFixed(1);
    const nervousSleep = (sleepDebt * 0.3).toFixed(1);
    const nervousEcon = (economicStress * 0.15).toFixed(1);
    const agencyEcon = (economicStress * 0.30).toFixed(1);
    const agencySleep = (sleepDebt * 0.25).toFixed(1);
    const meaningStim = (stimulation * 0.25).toFixed(1);
    const identitySynth = (syntheticInteraction * 1.0).toFixed(1);
    const meaningSynth = (syntheticInteraction * 0.15).toFixed(1);

    return `SYSTEM INTERDEPENDENCE VECTOR ANALYSIS
===========================================================
ENVIRONMENTAL DRIVERS & ACTIVE COUPLING TRAJECTORIES:

┌── STIMULATION LEVEL (${stimulation}%)
│    ├── Fragmenting Attention (contrib: -${attStim} pts/day)
│    ├── Elevating Nervous Load (contrib: +${nervousStim} pts/day)
│    └── Eroding Existential Meaning (contrib: -${meaningStim} pts/day)
│
├── SLEEP DEBT (${sleepDebt}%)
│    ├── Fragmenting Attention (contrib: -${attSleep} pts/day)
│    ├── Elevating Nervous Load (contrib: +${nervousSleep} pts/day)
│    └── Impairing Agency (contrib: -${agencySleep} pts/day)
│
├── ECONOMIC STRESS (${economicStress}%)
│    ├── Elevating Nervous Load (contrib: +${nervousEcon} pts/day)
│    └── Impairing Agency (contrib: -${agencyEcon} pts/day)
│
├── SYNTHETIC INTERACTION (${syntheticInteraction}%)
│    ├── Collapsing Identity Coherence (contrib: -${identitySynth} pts/day)
│    └── Eroding Existential Meaning (contrib: -${meaningSynth} pts/day)
│
└── PHYSICAL MOVEMENT (${physicalMovement}%) [STABILIZING BUFFER]
     ├── Supporting Agency (buffer: +${(physicalMovement * 0.3).toFixed(1)} pts/day)
     └── Anchoring Meaning (buffer: +${(physicalMovement * 0.4).toFixed(1)} pts/day)`;
  }, [stimulation, sleepDebt, economicStress, syntheticInteraction, physicalMovement, systemScores.nervous]);

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 4: SORTABLE ARCHETYPE TABLE
  // ───────────────────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<'name' | 'similarity' | 'flow' | 'sustainability' | 'risk'>('similarity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const processedArchetypes = useMemo(() => {
    return ARCHETYPES.map(arch => {
      // Calculate Similarity% based on Manhattan/Euclidean-ish distance sum
      const totalDelta = 
        Math.abs(arch.targets.stimulation - stimulation) +
        Math.abs(arch.targets.sleepDebt - sleepDebt) +
        Math.abs(arch.targets.socialPressure - socialPressure) +
        Math.abs(arch.targets.economicStress - economicStress) +
        Math.abs(arch.targets.physicalMovement - physicalMovement) +
        Math.abs(arch.targets.syntheticInteraction - syntheticInteraction);
      
      const similarity = Math.max(0, Math.round(100 - (totalDelta / 6)));
      const flow = getArchetypeFlowProbability(arch.name);
      const sustainability = getArchetypeSustainability(arch.name);
      const risk = getArchetypeRisk(arch.name);

      return {
        ...arch,
        similarity,
        flow,
        sustainability,
        risk
      };
    });
  }, [stimulation, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction]);

  const sortedArchetypes = useMemo(() => {
    const items = [...processedArchetypes];
    return items.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortKey === 'similarity') {
        comparison = a.similarity - b.similarity;
      } else if (sortKey === 'flow') {
        comparison = a.flow - b.flow;
      } else if (sortKey === 'sustainability') {
        const orderMap: Record<string, number> = { "INDEFINITE": 3, "FINITE (2 Hrs)": 2, "UNSUSTAINABLE (<24h)": 1 };
        comparison = orderMap[a.sustainability] - orderMap[b.sustainability];
      } else if (sortKey === 'risk') {
        comparison = a.risk.level - b.risk.level;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [processedArchetypes, sortKey, sortOrder]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // Safest Archetype is Recovery Cabin
  const safestArchetypeId = "recovery-cabin";

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 5: INTERACTIVE ROADMAP
  // ───────────────────────────────────────────────────────────────────────────
  const recoveryArchetypes = useMemo(() => {
    return ARCHETYPES.filter(a => [
      "recovery-cabin",
      "meaningful-work",
      "sustainable-high-performance",
      "digital-detox",
      "athletic-recovery",
      "creative-solitude",
      "deep-flow"
    ].includes(a.id));
  }, []);

  const [roadmapTargetId, setRoadmapTargetId] = useState<string>("athletic-recovery");

  const targetArchetype = useMemo(() => {
    return ARCHETYPES.find(a => a.id === roadmapTargetId) || ARCHETYPES[6]; // default to Cabin
  }, [roadmapTargetId]);

  const roadmapDeltas = useMemo(() => {
    const cur = { stimulation, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction };
    const tar = targetArchetype.targets;

    const allDeltas = [
      { key: 'stimulation', label: 'STIMULATION', cur: cur.stimulation, tar: tar.stimulation, diff: tar.stimulation - cur.stimulation },
      { key: 'sleepDebt', label: 'SLEEP DEBT', cur: cur.sleepDebt, tar: tar.sleepDebt, diff: tar.sleepDebt - cur.sleepDebt },
      { key: 'socialPressure', label: 'SOCIAL PRESSURE', cur: cur.socialPressure, tar: tar.socialPressure, diff: tar.socialPressure - cur.socialPressure },
      { key: 'economicStress', label: 'ECONOMIC STRESS', cur: cur.economicStress, tar: tar.economicStress, diff: tar.economicStress - cur.economicStress },
      { key: 'physicalMovement', label: 'PHYSICAL MOVEMENT', cur: cur.physicalMovement, tar: tar.physicalMovement, diff: tar.physicalMovement - cur.physicalMovement },
      { key: 'syntheticInteraction', label: 'SYNTHETIC INTERACTION', cur: cur.syntheticInteraction, tar: tar.syntheticInteraction, diff: tar.syntheticInteraction - cur.syntheticInteraction }
    ];

    // Sort by absolute delta to identify highest-impact changes
    return allDeltas.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [targetArchetype, stimulation, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction]);

  // Project deterministic scores week by week
  const projections = useMemo(() => {
    const t = targetArchetype.targets;
    const cur = { stimulation, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction };

    // Group deltas into weeks
    // Week 1: Priority changes (highest 2 deltas adjusted to target)
    const week1Sliders = { ...cur };
    week1Sliders[roadmapDeltas[0].key as keyof typeof cur] = roadmapDeltas[0].tar;
    week1Sliders[roadmapDeltas[1].key as keyof typeof cur] = roadmapDeltas[1].tar;

    // Week 2: Secondary changes (next 2 deltas adjusted)
    const week2Sliders = { ...week1Sliders };
    week2Sliders[roadmapDeltas[2].key as keyof typeof cur] = roadmapDeltas[2].tar;
    week2Sliders[roadmapDeltas[3].key as keyof typeof cur] = roadmapDeltas[3].tar;

    // Week 3: Fine-tuning (all adjusted)
    const week3Sliders = { ...t };

    // Function to calculate scores
    const calcScores = (s: typeof cur) => {
      const nervous = Math.min(100, Math.max(0, s.stimulation * (1 + (s.sleepDebt / 100 * 0.8))));
      const attention = Math.max(0, Math.min(100, 100 - nervous));
      const identity = Math.max(0, Math.min(100, 100 - s.syntheticInteraction));
      
      const agency = Math.max(0, Math.min(100, 
        30 + (s.physicalMovement * 0.3) - (s.economicStress * 0.3) - (s.sleepDebt * 0.25) - (nervous * 0.15)
      ));
      const meaning = Math.max(0, Math.min(100, 
        15 + (s.physicalMovement * 0.4) - (s.stimulation * 0.25) + (100 - s.syntheticInteraction) * 0.15 - (s.economicStress * 0.15) - (s.sleepDebt * 0.10)
      ));

      return { attention, nervous, identity, agency, meaning };
    };

    return {
      current: calcScores(cur),
      week1: { sliders: week1Sliders, scores: calcScores(week1Sliders) },
      week2: { sliders: week2Sliders, scores: calcScores(week2Sliders) },
      week3: { sliders: week3Sliders, scores: calcScores(week3Sliders) }
    };
  }, [targetArchetype, roadmapDeltas, stimulation, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction]);

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 6: STATIC THRESHOLD REFERENCE DATA
  // ───────────────────────────────────────────────────────────────────────────
  const referenceData = [
    {
      systemName: "ATTENTION CAPACITY",
      rows: [
        { range: "80-100", state: "SUSTAINED", feel: "Singular focus comes naturally.", enable: "Enables complex synthesis, deep learning, uninterrupted reading." },
        { range: "60-79", state: "FUNCTIONAL", feel: "Focus requires moderate effort.", enable: "Enables routine mental tasks; highly susceptible to context switching." },
        { range: "30-59", state: "DEGRADED", feel: "Frequent distraction, mind wandering.", enable: "Prevents deep work; limits capacity to brief information chunks." },
        { range: "0-29", state: "FRAGMENTED", feel: "Unable to hold a single train of thought.", enable: "Restricts cognition to reactive scrolling and immediate impulses." }
      ]
    },
    {
      systemName: "NERVOUS SYSTEM LOAD (INVERTED)",
      rows: [
        { range: "0-29", state: "REGULATED", feel: "Calm, rested, body feels quiet.", enable: "Enables long-term physiological repair and high stress tolerance." },
        { range: "30-59", state: "MANAGEABLE", feel: "Mild background tension.", enable: "Enables normal stress response; requires recovery windows." },
        { range: "60-70", state: "STRESSED", feel: "Restlessness, tight chest, shallow breathing.", enable: "Prevents physical relaxation; limits emotional regulation capacity." },
        { range: "71-100", state: "OVERLOADED", feel: "Panic, brain fog, protective shutdown.", enable: "Triggers fight-or-flight; compromises immune and cognitive systems." }
      ]
    },
    {
      systemName: "EGO-IDENTITY COHERENCE",
      rows: [
        { range: "80-100", state: "GROUNDED", feel: "Clear sense of self and boundaries.", enable: "Enables authentic choice and high social resistance." },
        { range: "60-79", state: "COHERENT", feel: "Stable self but influenced by opinion.", enable: "Enables standard social interaction; mild validation seeking." },
        { range: "30-59", state: "UNSTABLE", feel: "Ego-boundary dilation; identity drift.", enable: "Prevents firm boundary setting; leads to opinion mirroring." },
        { range: "0-29", state: "COLLAPSED", feel: "Total loss of core self-reference.", enable: "Results in severe depersonalization, mimicking, and suggestibility." }
      ]
    },
    {
      systemName: "AGENCY INDEX",
      rows: [
        { range: "80-100", state: "INITIATING", feel: "Starting tasks feels natural.", enable: "Enables deep creative output and long-term goal pursuit." },
        { range: "60-79", state: "FUNCTIONAL", feel: "Starting requires mild effort.", enable: "Enables normal productivity and routine maintenance." },
        { range: "30-59", state: "IMPAIRED", feel: "Starting requires significant will.", enable: "Restricts action to reactive tasks; triggers avoidance patterns." },
        { range: "0-29", state: "PARALYSIS", feel: "Starting tasks feels impossible.", enable: "Leads to passivity, infinite scrolling, and executive shutdown." }
      ]
    },
    {
      systemName: "EXISTENTIAL STABILITY",
      rows: [
        { range: "80-100", state: "DEEP", feel: "Life feels intrinsically valuable.", enable: "Enables resilience during hardship; strong sense of purpose." },
        { range: "60-79", state: "PRESENT", feel: "Occasional purpose, daily engagement.", enable: "Enables standard motivation; vulnerable to routine boredom." },
        { range: "30-59", state: "ERODED", feel: "Skepticism, background futility.", enable: "Prevents long-term commitment; feels like running on empty." },
        { range: "0-29", state: "ABSENT", feel: "Total void; nothing feels significant.", enable: "Leads to severe apathy, nihilism, and complete loss of drive." }
      ]
    }
  ];

  // Helper formatting for durations
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${sec}s`;
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/35 relative overflow-y-auto">
      {/* Background spatial design overlay */}
      <div className="absolute inset-0 spatial-grid opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-950/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[900px] mx-auto px-6 py-12 relative z-10 space-y-16">
        
        {/* Header HUD */}
        <header className="border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 font-mono select-none">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h1 className="text-sm font-bold tracking-widest text-zinc-100 uppercase">
                SYSTEM NEURAL MONITOR // ANALYSIS REPORT
              </h1>
            </div>
            <p className="text-[9px] text-zinc-650 tracking-wider">
              PORT 08 // DEEP DATA DEGRADATION OVERVIEW
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-zinc-800 hover:border-zinc-500 hover:text-zinc-100 text-[10px] uppercase font-bold tracking-widest transition-colors duration-200 cursor-pointer self-start md:self-auto bg-black/40"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Live Telemetry</span>
          </button>
        </header>

        {/* ── SECTION 1: CURRENT STATE SNAPSHOT ── */}
        <section className="space-y-6">
          <h2 className="font-mono text-xs text-zinc-550 uppercase tracking-widest border-b border-zinc-900/60 pb-2">
            01 // CURRENT STATE SNAPSHOT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            
            {/* System Status Grid */}
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { name: 'ATTENTION', score: systemScores.attention, phrase: systemScores.attention > 70 ? 'SUSTAINED FOCUS CAPACITY' : systemScores.attention > 40 ? 'DEGRADED COGNITIVE SPAN' : 'SEVERELY FRAGMENTED FOCUS', isInverted: false },
                { name: 'NERVOUS LOAD', score: systemScores.nervous, phrase: systemScores.nervous < 40 ? 'REGULATED LOAD STATE' : systemScores.nervous <= 70 ? 'CHRONIC SYSTEM STRESS' : 'CRITICAL NEURAL OVERLOAD', isInverted: true },
                { name: 'IDENTITY', score: systemScores.identity, phrase: systemScores.identity > 70 ? 'COHERENT SELF STRUCTURE' : systemScores.identity > 40 ? 'UNSTABLE IDENTITY DRIFT' : 'STRUCTURAL INTEGRITY LOSS', isInverted: false },
                { name: 'AGENCY', score: systemScores.agency, phrase: systemScores.agency > 70 ? 'ACTIVE INITIATION MODE' : systemScores.agency > 40 ? 'IMPAIRED WILL CAPACITY' : 'EXECUTIVE SHUTDOWN STATE', isInverted: false },
                { name: 'MEANING', score: systemScores.meaning, phrase: systemScores.meaning > 70 ? 'PURPOSE SIGNAL STRONG' : systemScores.meaning > 40 ? 'ERODED EXISTENTIAL DUST' : 'PROFOUND VOID STATE', isInverted: false }
              ].map(sys => {
                // color-coding
                let textCol = 'text-zinc-100';
                if (sys.isInverted) {
                  if (sys.score > 70) textCol = 'text-red-500 font-bold';
                  else if (sys.score > 40) textCol = 'text-amber-500';
                } else {
                  if (sys.score < 40) textCol = 'text-red-500 font-bold';
                  else if (sys.score < 70) textCol = 'text-amber-500';
                }

                return (
                  <div key={sys.name} className="border border-zinc-900 bg-zinc-950/40 p-4 flex flex-col justify-between space-y-4">
                    <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">{sys.name}</span>
                    <div className="space-y-1">
                      <div className={`font-mono text-3xl font-bold tracking-tight ${textCol}`}>
                        {Math.round(sys.score)}%
                      </div>
                      <p className="text-[8px] font-mono leading-tight tracking-wider text-zinc-450 uppercase">{sys.phrase}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Session Metadata Panel */}
            <div className="md:col-span-1 border border-zinc-900 bg-zinc-950/60 p-4 font-mono text-[10px] flex flex-col justify-between space-y-4 md:space-y-0">
              <span className="text-zinc-650 tracking-wider">SESSION PROFILE</span>
              <div className="space-y-3">
                <div className="space-y-0.5">
                  <span className="text-zinc-550 block text-[9px]">ACTIVE ARCHETYPE</span>
                  <span className="font-bold text-zinc-200 uppercase text-xs">{activeArchetype || "Manual Override"}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-550 block text-[9px]">FLOW PROBABILITY</span>
                  <span className="font-bold text-amber-500 text-xs">{flowProbability}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-zinc-550 block text-[9px]">EXPOSURE DURATION</span>
                  <span className="font-bold text-zinc-300 text-xs">{formatDuration(sessionDuration)}</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: SURVIVAL MODELING ── */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900/60 pb-2">
            <h2 className="font-mono text-xs text-zinc-555 uppercase tracking-widest">
              02 // SURVIVAL MODELING
            </h2>
            <p className="font-sans text-[10px] text-zinc-500 italic mt-1 leading-normal">
              Estimated duration threshold remaining under current stressors before system collapse (critical value &le; 30% wellness).
            </p>
          </div>

          <div className="space-y-4">
            {/* Sustainability Badge */}
            <div className={`border p-4 font-mono text-xs flex items-center justify-between transition-colors duration-300 ${overallSustainability.color}`}>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider">SUSTAINABILITY INDEX:</span>
              </div>
              <span className="tracking-wider">{overallSustainability.label}</span>
            </div>

            {/* System Breakdown Table */}
            <div className="border border-zinc-900 bg-zinc-950/20 overflow-hidden">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/80 text-[10px] text-zinc-550">
                    <th className="p-3 font-bold tracking-widest uppercase">COGNITIVE COMPONENT</th>
                    <th className="p-3 font-bold tracking-widest uppercase">DRIFT SPEED</th>
                    <th className="p-3 font-bold tracking-widest uppercase">ESTIMATED LIFE EXPECTANCY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {survivalMetrics.map(sys => (
                    <tr key={sys.name} className="hover:bg-zinc-950/40 transition-colors">
                      <td className="p-3 font-bold text-zinc-300 tracking-wide">{sys.name}</td>
                      <td className="p-3 text-zinc-450">{sys.rate.toFixed(2)} pts/day</td>
                      <td className={`p-3 font-bold uppercase ${sys.colorClass}`}>{sys.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SYSTEM INTERDEPENDENCE MAP ── */}
        <section className="space-y-6">
          <h2 className="font-mono text-xs text-zinc-550 uppercase tracking-widest border-b border-zinc-900/60 pb-2">
            03 // SYSTEM INTERDEPENDENCE MAP
          </h2>
          <div className="relative border border-zinc-900 bg-zinc-950/30 p-6 rounded overflow-x-auto">
            <pre className="font-mono text-[11px] leading-relaxed text-indigo-300/80 select-text whitespace-pre">
              {couplingTree}
            </pre>
          </div>
        </section>

        {/* ── SECTION 4: COMPARATIVE ARCHETYPE ANALYSIS ── */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900/60 pb-2 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
            <div>
              <h2 className="font-mono text-xs text-zinc-550 uppercase tracking-widest">
                04 // COMPARATIVE ARCHETYPE ANALYSIS
              </h2>
              <p className="font-sans text-[10px] text-zinc-550 italic mt-0.5">
                Sortable configuration mapping. Current state is compared across all 12 defined cognitive profiles.
              </p>
            </div>
            <div className="font-mono text-[9px] text-zinc-600 flex space-x-3 self-start sm:self-auto">
              <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-none inline-block"></span> <span>CURRENT ACTIVE</span></span>
              <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-none inline-block"></span> <span>SAFEST TARGET</span></span>
            </div>
          </div>

          <div className="border border-zinc-900 bg-zinc-950/20 overflow-hidden font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/80 text-[10px] text-zinc-500 select-none">
                  <th 
                    onClick={() => handleSort('name')}
                    className="p-3 font-bold tracking-widest uppercase cursor-pointer hover:text-zinc-200 transition-colors"
                  >
                    PROFILE NAME {sortKey === 'name' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
                  </th>
                  <th 
                    onClick={() => handleSort('similarity')}
                    className="p-3 font-bold tracking-widest uppercase cursor-pointer hover:text-zinc-200 transition-colors text-right"
                  >
                    SIMILARITY {sortKey === 'similarity' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
                  </th>
                  <th 
                    onClick={() => handleSort('flow')}
                    className="p-3 font-bold tracking-widest uppercase cursor-pointer hover:text-zinc-200 transition-colors text-right"
                  >
                    FLOW PROB. {sortKey === 'flow' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
                  </th>
                  <th 
                    onClick={() => handleSort('sustainability')}
                    className="p-3 font-bold tracking-widest uppercase cursor-pointer hover:text-zinc-200 transition-colors text-right"
                  >
                    SUSTAINABILITY {sortKey === 'sustainability' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
                  </th>
                  <th 
                    onClick={() => handleSort('risk')}
                    className="p-3 font-bold tracking-widest uppercase cursor-pointer hover:text-zinc-200 transition-colors text-right"
                  >
                    RISK LEVEL {sortKey === 'risk' ? (sortOrder === 'desc' ? '▼' : '▲') : ''}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40">
                {sortedArchetypes.map(arch => {
                  const isCurrent = activeArchetype === arch.name;
                  const isSafest = arch.id === safestArchetypeId;
                  
                  let rowStyle = "hover:bg-zinc-950/30 transition-colors";
                  if (isCurrent) rowStyle = "bg-amber-950/5 border-y border-amber-900/30 text-amber-100 font-bold";
                  else if (isSafest) rowStyle = "bg-emerald-950/5 border-y border-emerald-900/30 text-emerald-100";

                  return (
                    <tr key={arch.id} className={rowStyle}>
                      <td className="p-3 flex items-center space-x-2">
                        {isCurrent && <span className="w-1 h-3 bg-amber-500 inline-block"></span>}
                        {isSafest && <span className="w-1 h-3 bg-emerald-500 inline-block"></span>}
                        <span className="uppercase">{arch.name}</span>
                      </td>
                      <td className="p-3 text-right text-zinc-350">{arch.similarity}%</td>
                      <td className="p-3 text-right text-indigo-400 font-bold">{arch.flow}%</td>
                      <td className="p-3 text-right text-zinc-400">{arch.sustainability}</td>
                      <td className={`p-3 text-right ${arch.risk.color}`}>{arch.risk.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECTION 5: STATE TRANSITION ROADMAP ── */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900/60 pb-2">
            <h2 className="font-mono text-xs text-zinc-550 uppercase tracking-widest">
              05 // STATE TRANSITION ROADMAP
            </h2>
            <p className="font-sans text-[10px] text-zinc-550 italic mt-0.5">
              Deterministic 3-week projection plan. Select a recovery profile target to calculate expected neural updates.
            </p>
          </div>

          {/* Interactive target selection */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-widest">SELECT TARGET ECOSYSTEM PROJECTION:</span>
              <div className="flex flex-wrap gap-1.5">
                {recoveryArchetypes.map(arch => (
                  <button
                    key={arch.id}
                    onClick={() => setRoadmapTargetId(arch.id)}
                    className={`px-3 py-1.5 border font-mono text-[9px] uppercase tracking-wider font-bold transition-all duration-200 cursor-pointer ${
                      roadmapTargetId === arch.id
                        ? 'border-amber-500 bg-amber-950/10 text-amber-500'
                        : 'border-zinc-850 hover:border-zinc-600 bg-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {arch.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Week-by-Week Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              
              {/* WEEK 1 CARD */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="font-bold text-zinc-100 uppercase tracking-widest">WEEK 1: INITIAL STAGE</span>
                    <span className="text-[9px] text-amber-500 font-bold">PRIORITY</span>
                  </div>
                  
                  <div className="space-y-1 text-[11px]">
                    <span className="text-zinc-550 block text-[9px] tracking-wider">ADJUST SLIDERS:</span>
                    <div className="text-zinc-200 font-bold uppercase">&gt; {roadmapDeltas[0].label}: {roadmapDeltas[0].tar}% <span className="text-zinc-500 font-normal">({roadmapDeltas[0].diff > 0 ? '+' : ''}{roadmapDeltas[0].diff}%)</span></div>
                    <div className="text-zinc-200 font-bold uppercase">&gt; {roadmapDeltas[1].label}: {roadmapDeltas[1].tar}% <span className="text-zinc-500 font-normal">({roadmapDeltas[1].diff > 0 ? '+' : ''}{roadmapDeltas[1].diff}%)</span></div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-550 block text-[9px] tracking-wider">EXPECTED STEADY-STATE:</span>
                    <div className="grid grid-cols-5 gap-1 text-[9px] text-center">
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">ATT</span><span className="text-zinc-250 font-bold">{Math.round(projections.week1.scores.attention)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">LOAD</span><span className="text-zinc-250 font-bold">{Math.round(projections.week1.scores.nervous)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">ID</span><span className="text-zinc-250 font-bold">{Math.round(projections.week1.scores.identity)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">AGY</span><span className="text-zinc-250 font-bold">{Math.round(projections.week1.scores.agency)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">MNG</span><span className="text-zinc-250 font-bold">{Math.round(projections.week1.scores.meaning)}%</span></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-2 space-y-1.5 text-[9px] font-sans">
                  <div>
                    <span className="font-mono font-bold text-red-500/80 block uppercase tracking-wider">RISK PROFILE:</span>
                    <p className="text-zinc-500 leading-tight">Physical output adaptation shock; potential fatigue symptoms from sleep cycle reset.</p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-emerald-500 block uppercase tracking-wider">TARGET SIGNAL:</span>
                    <p className="text-zinc-500 leading-tight">Nervous system load stabilizing; core focus capacity recovering at morning hours.</p>
                  </div>
                </div>
              </div>

              {/* WEEK 2 CARD */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="font-bold text-zinc-100 uppercase tracking-widest">WEEK 2: DEEP PROTOCOL</span>
                    <span className="text-[9px] text-indigo-400 font-bold">SECONDARY</span>
                  </div>
                  
                  <div className="space-y-1 text-[11px]">
                    <span className="text-zinc-550 block text-[9px] tracking-wider">ADJUST SLIDERS:</span>
                    <div className="text-zinc-200 font-bold uppercase">&gt; {roadmapDeltas[2].label}: {roadmapDeltas[2].tar}% <span className="text-zinc-500 font-normal">({roadmapDeltas[2].diff > 0 ? '+' : ''}{roadmapDeltas[2].diff}%)</span></div>
                    <div className="text-zinc-200 font-bold uppercase">&gt; {roadmapDeltas[3].label}: {roadmapDeltas[3].tar}% <span className="text-zinc-500 font-normal">({roadmapDeltas[3].diff > 0 ? '+' : ''}{roadmapDeltas[3].diff}%)</span></div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-550 block text-[9px] tracking-wider">EXPECTED STEADY-STATE:</span>
                    <div className="grid grid-cols-5 gap-1 text-[9px] text-center">
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">ATT</span><span className="text-zinc-250 font-bold">{Math.round(projections.week2.scores.attention)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">LOAD</span><span className="text-zinc-250 font-bold">{Math.round(projections.week2.scores.nervous)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">ID</span><span className="text-zinc-250 font-bold">{Math.round(projections.week2.scores.identity)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">AGY</span><span className="text-zinc-250 font-bold">{Math.round(projections.week2.scores.agency)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">MNG</span><span className="text-zinc-250 font-bold">{Math.round(projections.week2.scores.meaning)}%</span></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-2 space-y-1.5 text-[9px] font-sans">
                  <div>
                    <span className="font-mono font-bold text-red-500/80 block uppercase tracking-wider">RISK PROFILE:</span>
                    <p className="text-zinc-500 leading-tight">Dopamine withdrawal; high impulse to break stimulus thresholds and return to scrolling cycles.</p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-emerald-500 block uppercase tracking-wider">TARGET SIGNAL:</span>
                    <p className="text-zinc-500 leading-tight">Noticeable reduction of cognitive noise; attention span expanding on analytical reading.</p>
                  </div>
                </div>
              </div>

              {/* WEEK 3 CARD */}
              <div className="border border-zinc-900 bg-zinc-950/40 p-4 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                    <span className="font-bold text-zinc-100 uppercase tracking-widest">WEEK 3: STABILIZATION</span>
                    <span className="text-[9px] text-emerald-500 font-bold">FINE-TUNE</span>
                  </div>
                  
                  <div className="space-y-1 text-[11px]">
                    <span className="text-zinc-550 block text-[9px] tracking-wider">ADJUST SLIDERS:</span>
                    <div className="text-zinc-200 font-bold uppercase">&gt; {roadmapDeltas[4].label}: {roadmapDeltas[4].tar}% <span className="text-zinc-500 font-normal">({roadmapDeltas[4].diff > 0 ? '+' : ''}{roadmapDeltas[4].diff}%)</span></div>
                    <div className="text-zinc-200 font-bold uppercase">&gt; {roadmapDeltas[5].label}: {roadmapDeltas[5].tar}% <span className="text-zinc-500 font-normal">({roadmapDeltas[5].diff > 0 ? '+' : ''}{roadmapDeltas[5].diff}%)</span></div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-zinc-550 block text-[9px] tracking-wider">EXPECTED STEADY-STATE:</span>
                    <div className="grid grid-cols-5 gap-1 text-[9px] text-center">
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">ATT</span><span className="text-zinc-250 font-bold">{Math.round(projections.week3.scores.attention)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">LOAD</span><span className="text-zinc-250 font-bold">{Math.round(projections.week3.scores.nervous)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">ID</span><span className="text-zinc-250 font-bold">{Math.round(projections.week3.scores.identity)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">AGY</span><span className="text-zinc-250 font-bold">{Math.round(projections.week3.scores.agency)}%</span></div>
                      <div className="bg-zinc-900 p-1"><span className="text-zinc-550 block">MNG</span><span className="text-zinc-250 font-bold">{Math.round(projections.week3.scores.meaning)}%</span></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-2 space-y-1.5 text-[9px] font-sans">
                  <div>
                    <span className="font-mono font-bold text-red-500/80 block uppercase tracking-wider">RISK PROFILE:</span>
                    <p className="text-zinc-500 leading-tight">Difficulty in maintaining synthetic limits when interfacing with modern workspaces.</p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-emerald-500 block uppercase tracking-wider">TARGET SIGNAL:</span>
                    <p className="text-zinc-500 leading-tight">Ego boundary stabilizing; existential anchor consolidated; cognitive balance secured.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 6: CRITICAL THRESHOLDS REFERENCE ── */}
        <section className="space-y-6">
          <div className="border-b border-zinc-900/60 pb-2">
            <h2 className="font-mono text-xs text-zinc-550 uppercase tracking-widest">
              06 // CRITICAL THRESHOLDS REFERENCE
            </h2>
            <p className="font-sans text-[10px] text-zinc-550 italic mt-0.5">
              Monospace lookup blueprint of the system's threshold values and boundaries.
            </p>
          </div>

          <div className="space-y-8">
            {referenceData.map(sys => (
              <div key={sys.systemName} className="space-y-2">
                <h3 className="font-mono text-[10px] font-bold text-indigo-400/90 tracking-widest uppercase">
                  :: {sys.systemName}
                </h3>
                <div className="border border-zinc-900 bg-zinc-950/20 overflow-hidden font-mono text-[11px] leading-normal">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/70 text-[9px] text-zinc-500 select-none">
                        <th className="p-2.5 font-bold tracking-wider uppercase w-20">SCORE</th>
                        <th className="p-2.5 font-bold tracking-wider uppercase w-28">STATE</th>
                        <th className="p-2.5 font-bold tracking-wider uppercase w-1/3">SUBJECT EXPERIENCE</th>
                        <th className="p-2.5 font-bold tracking-wider uppercase">FUNCTIONAL EFFECT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40">
                      {sys.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-zinc-950/30 transition-colors">
                          <td className="p-2.5 font-bold text-zinc-400">{row.range}</td>
                          <td className={`p-2.5 font-bold uppercase ${
                            row.range.includes('80-100') || row.range.includes('0-29') && sys.systemName.includes('INVERTED')
                              ? 'text-emerald-500'
                              : row.range.includes('0-29') || row.range.includes('71-100')
                              ? 'text-red-500'
                              : 'text-amber-500'
                          }`}>{row.state}</td>
                          <td className="p-2.5 text-zinc-350 font-sans text-xs italic">"{row.feel}"</td>
                          <td className="p-2.5 text-zinc-450 font-sans text-xs">{row.enable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer info */}
        <footer className="border-t border-zinc-900 pt-8 font-mono text-[10px] text-zinc-600 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
          <span>// SYNAPTIC TELEMETRY INDEX COMPILER // v1.0.4</span>
          <span>THE ENVIRONMENT SHAPED THIS. NOT THE PERSON.</span>
        </footer>

      </div>
    </div>
  );
}
