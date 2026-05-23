import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animate, MotionValue } from 'framer-motion';
import { ARCHETYPES, registerSelectArchetype } from './ArchetypeEngine';

interface ArchetypeSelectorProps {
  stimulationLevel: MotionValue<number>;
  sleepDebt: MotionValue<number>;
  socialPressure: MotionValue<number>;
  economicStress: MotionValue<number>;
  physicalMovement: MotionValue<number>;
  disabled?: boolean;
  onArchetypeSelect?: (name: string) => void;
}

export const ArchetypeSelector = React.memo(({
  stimulationLevel,
  sleepDebt,
  socialPressure,
  economicStress,
  physicalMovement,
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

    // Trigger smooth 3-second LERP animations for the 5 environment sliders
    const duration = 3;
    const ease = "linear";

    activeLerpsRef.current = [
      animate(stimulationLevel, archetype.targets.stimulation, { duration, ease }),
      animate(sleepDebt, archetype.targets.sleepDebt, { duration, ease }),
      animate(socialPressure, archetype.targets.socialPressure, { duration, ease }),
      animate(economicStress, archetype.targets.economicStress, { duration, ease }),
      animate(physicalMovement, archetype.targets.physicalMovement, { duration, ease })
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
  }, [stimulationLevel, sleepDebt, socialPressure, economicStress, physicalMovement, disabled, onArchetypeSelect]);

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

  return (
    <div className="w-full space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2">
        <div className="flex items-center space-x-2 text-zinc-500">
          <span className="text-[9px] tracking-widest font-bold uppercase">ARCHETYPE PRESETS</span>
        </div>
        <span className="text-[8px] text-zinc-600 bg-black/40 border border-zinc-900 px-1.5 rounded py-0.5">
          ENGINE ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ARCHETYPES.map((a) => {
          const isSelected = activeId === a.id;
          const isLoading = isSelected && progress > 0 && progress < 100;

          return (
            <div
              key={a.id}
              onClick={() => handleSelect(a.id)}
              className={`group flex flex-col justify-between border rounded p-3 h-[90px] cursor-pointer transition-all duration-300 relative overflow-hidden select-none ${
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
                <span className={`text-[10px] font-bold tracking-wider uppercase font-mono transition-colors ${
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
                <div className="font-mono text-[9px] text-zinc-400 space-y-1 mt-auto z-10">
                  <div className="text-zinc-500 animate-pulse">&gt; loading subject profile...</div>
                  <div className="flex items-center space-x-1.5 text-[9px] text-zinc-350 font-mono">
                    <span>[{getProgressBar(progress)}]</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-end h-full mt-2">
                  <span className="text-[9px] text-zinc-500 line-clamp-1 leading-normal tracking-wide font-mono">
                    {a.summary}
                  </span>
                  
                  {/* Sparkline chart of the 5 values */}
                  <div className="flex items-end gap-1.5 h-3.5 mt-2">
                    {Object.entries(a.targets).map(([key, val]) => (
                      <div key={key} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                        <div
                          style={{ height: `${val}%` }}
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            isSelected
                              ? "bg-zinc-300"
                              : "bg-zinc-800/60 group-hover:bg-zinc-600"
                          }`}
                        />
                        {/* Custom compact tooltip on hover */}
                        <div className="absolute bottom-full mb-1 scale-0 group-hover/bar:scale-100 transition-all font-mono text-[8px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-1 py-0.5 rounded pointer-events-none whitespace-nowrap z-25 shadow-md">
                          {key}: {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

ArchetypeSelector.displayName = 'ArchetypeSelector';
