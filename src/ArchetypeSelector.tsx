import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animate, MotionValue } from 'framer-motion';
import { ARCHETYPES, registerSelectArchetype, type Archetype } from './ArchetypeEngine';

interface ArchetypeSelectorProps {
  stimulationLevel: MotionValue<number>;
  sleepDebt: MotionValue<number>;
  socialPressure: MotionValue<number>;
  economicStress: MotionValue<number>;
  physicalMovement: MotionValue<number>;
  syntheticInteraction: MotionValue<number>;
  disabled?: boolean;
  onArchetypeSelect?: (name: string) => void;
}

export const ArchetypeSelector = React.memo(({
  stimulationLevel,
  sleepDebt,
  socialPressure,
  economicStress,
  physicalMovement,
  syntheticInteraction,
  disabled = false,
  onArchetypeSelect,
}: ArchetypeSelectorProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  const progressAnimRef = useRef<{ stop: () => void } | null>(null);
  const activeLerpsRef = useRef<{ stop: () => void }[]>([]);

  const handleSelect = useCallback((id: string) => {
    if (disabled) return;
    const archetype = ARCHETYPES.find(a => a.id === id);
    if (!archetype) return;

    setActiveId(id);
    setProgress(0.1); // Small non-zero start to trigger render

    // Notify parent of archetype selection (for ReflectionModal tracking)
    if (onArchetypeSelect) {
      onArchetypeSelect(archetype.name);
    }

    // Stop existing progress and slider animations if any
    if (progressAnimRef.current) {
      progressAnimRef.current.stop();
    }
    activeLerpsRef.current.forEach(anim => anim.stop());
    activeLerpsRef.current = [];

    // Trigger smooth 3-second LERP animations for all 6 environment sliders
    const duration = 3;
    const ease = "linear";

    activeLerpsRef.current = [
      animate(stimulationLevel, archetype.targets.stimulation, { duration, ease }),
      animate(sleepDebt, archetype.targets.sleepDebt, { duration, ease }),
      animate(socialPressure, archetype.targets.socialPressure, { duration, ease }),
      animate(economicStress, archetype.targets.economicStress, { duration, ease }),
      animate(physicalMovement, archetype.targets.physicalMovement, { duration, ease }),
      animate(syntheticInteraction, archetype.targets.syntheticInteraction, { duration, ease })
    ];

    // Animate local progress state over 3 seconds
    progressAnimRef.current = animate(0, 100, {
      duration,
      ease,
      onUpdate: (latest) => {
        setProgress(latest);
      },
      onComplete: () => {
        setProgress(100);
        // Clear loading state after a tiny delay for visual payoff
        setTimeout(() => {
          setProgress(0);
          setActiveId(null);
        }, 400);
      }
    });
  }, [stimulationLevel, sleepDebt, socialPressure, economicStress, physicalMovement, syntheticInteraction, disabled, onArchetypeSelect]);

  useEffect(() => {
    registerSelectArchetype(handleSelect);
    return () => {
      registerSelectArchetype(null);
      if (progressAnimRef.current) {
        progressAnimRef.current.stop();
      }
      activeLerpsRef.current.forEach(anim => anim.stop());
    };
  }, [handleSelect]);

  const getProgressBar = (prog: number) => {
    const totalBlocks = 8;
    const filledBlocks = Math.min(totalBlocks, Math.floor(prog / (100 / totalBlocks)));
    const emptyBlocks = totalBlocks - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  // Pure function: calculate flow probability FROM the archetype's own target slider values
  const calcFlowProbability = (targets: Archetype['targets']): number => {
    const nervousLoad = Math.min(100,
      targets.stimulation * (1 + targets.sleepDebt / 100 * 0.8));
    
    const attention = Math.max(0, 100 - nervousLoad * 0.8);
    const agency = Math.max(0, 30 + targets.physicalMovement * 0.30
      - targets.economicStress * 0.30 - targets.sleepDebt * 0.25);
    const meaning = Math.max(0, 15 + targets.physicalMovement * 0.40
      - targets.stimulation * 0.25);

    const inChannel = (
      attention > 75 &&
      agency > 70 &&
      nervousLoad >= 35 && nervousLoad <= 65 &&
      meaning > 60 &&
      targets.socialPressure < 40
    );
    if (!inChannel) return 0;
    
    const depth = Math.min(100, Math.round(
      ((attention - 75) / 25 * 30) +
      ((agency - 70) / 30 * 30) +
      (1 - Math.abs(nervousLoad - 50) / 15) * 40
    ));
    return Math.max(0, depth);
  };

  // Split configurations
  const row1Ids = ["modern-student", "corporate-burnout", "hyperonline", "cyberpunk-megacity"];
  const row2Ids = ["recovery-cabin", "meaningful-work", "deep-flow", "sustainable-high-performance"];

  const row1Archetypes = row1Ids.map(id => ARCHETYPES.find(a => a.id === id)).filter(Boolean) as Archetype[];
  const row2Archetypes = row2Ids.map(id => ARCHETYPES.find(a => a.id === id)).filter(Boolean) as Archetype[];

  const renderCard = (a: Archetype) => {
    const isSelected = activeId === a.id;
    const isLoading = isSelected && progress > 0 && progress < 100;
    const flowProb = calcFlowProbability(a.targets);

    return (
      <div
        key={a.id}
        onClick={() => handleSelect(a.id)}
        className={`group flex flex-col justify-between border rounded p-3 h-[105px] cursor-pointer transition-all duration-300 relative overflow-hidden select-none ${
          isSelected
            ? "border-zinc-500 bg-zinc-900/10 shadow-[0_0_12px_rgba(255,255,255,0.02)]"
            : "border-zinc-900/80 bg-zinc-950/20 hover:border-zinc-800/80 hover:-translate-y-0.5"
        }`}
      >
        {/* Background scanning effect when loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-500/5 to-transparent pointer-events-none animate-pulse" />
        )}

        {/* Title & Blinky status indicator */}
        <div className="flex items-start justify-between w-full">
          <span className={`text-[9px] font-bold tracking-wider uppercase font-mono transition-colors ${
            isSelected ? "text-zinc-200" : "text-zinc-400 group-hover:text-zinc-300"
          }`}>
            {a.name}
          </span>
          
          <div className="flex items-center">
            {isSelected && (
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-400"></span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Terminal readout or normal summary & bar chart */}
        {isLoading ? (
          <div className="font-mono text-[8px] text-zinc-400 space-y-1 mt-auto z-10">
            <div className="text-zinc-500 animate-pulse">&gt; loading subject profile...</div>
            <div className="flex items-center space-x-1.5 text-[8px] text-zinc-350 font-mono">
              <span>[{getProgressBar(progress)}]</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-end h-full mt-1.5">
            <span className="text-[8.5px] text-zinc-500 line-clamp-1 leading-normal tracking-wide font-mono">
              {a.summary}
            </span>
            
            {/* Sparkline chart of the 6 values */}
            <div className="flex items-end gap-1 h-3 mt-1.5">
              {Object.entries(a.targets).map(([key, val]) => (
                <div key={key} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                  <div
                    style={{ height: `${val}%` }}
                    className={`w-full rounded-t-[1px] transition-all duration-300 ${
                      isSelected
                        ? "bg-zinc-300"
                        : "bg-zinc-800/60 group-hover:bg-zinc-650"
                    }`}
                  />
                  {/* Custom compact tooltip on hover */}
                  <div className="absolute bottom-full mb-1 scale-0 group-hover/bar:scale-100 transition-all font-mono text-[7px] bg-zinc-950 border border-zinc-850 text-zinc-400 px-1 py-0.5 rounded pointer-events-none whitespace-nowrap z-25 shadow-md">
                    {key}: {val}
                  </div>
                </div>
              ))}
            </div>

            {/* Flow Probability small text label */}
            <div className="flex items-center justify-between text-[7px] text-zinc-500/80 mt-1.5 tracking-wider font-mono">
              <span>FLOW PROBABILITY</span>
              <span className={flowProb > 60 ? "text-[#F5C842] font-bold" : "text-zinc-500"}>
                {flowProb}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 font-mono">
      {/* Row 1: High Load */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between border-b border-zinc-900/40 pb-1">
          <span className="text-[8px] tracking-widest font-bold text-zinc-500 uppercase">HIGH LOAD PROFILES</span>
          <span className="text-[7px] text-red-500/60 bg-red-950/5 border border-red-950/20 px-1 rounded">DEGRADATION VECTOR</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {row1Archetypes.map(renderCard)}
        </div>
      </div>

      {/* Row 2: Recovery & Flow */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between border-b border-zinc-900/40 pb-1">
          <span className="text-[8px] tracking-widest font-bold text-zinc-500 uppercase">RECOVERY & FLOW PROFILES</span>
          <span className="text-[7px] text-yellow-500/60 bg-yellow-950/5 border border-yellow-950/20 px-1 rounded">STABILIZATION VECTOR</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {row2Archetypes.map(renderCard)}
        </div>
      </div>
    </div>
  );
});

ArchetypeSelector.displayName = 'ArchetypeSelector';
