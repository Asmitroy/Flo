import React, { useRef, useEffect, useState } from 'react';
import { useAnimationFrame, MotionValue, useMotionValue, motion, AnimatePresence } from 'framer-motion';

interface AgencyMeterProps {
  agencyScore: MotionValue<number>;
}

export const AgencyMeter = React.memo(function AgencyMeter({ agencyScore }: AgencyMeterProps) {
  const smoothedAgency = useMotionValue(agencyScore.get());
  const rotation = useMotionValue(0);

  const [currentState, setCurrentState] = useState<'initiating' | 'stalling' | 'paralysis'>('stalling');

  // Monitor smoothedAgency for boundary crossings
  useEffect(() => {
    const unsubscribe = smoothedAgency.on('change', (v) => {
      let newState: 'initiating' | 'stalling' | 'paralysis' = 'stalling';
      if (v > 70) {
        newState = 'initiating';
      } else if (v < 30) {
        newState = 'paralysis';
      }
      setCurrentState(prev => {
        if (prev !== newState) return newState;
        return prev;
      });
    });
    return () => unsubscribe();
  }, [smoothedAgency]);

  // DOM Refs for direct manipulation to prevent component re-renders of the high-speed visuals
  const barFillRef = useRef<HTMLDivElement>(null);
  const flywheelRef = useRef<SVGSVGElement>(null);

  useAnimationFrame((_, delta) => {
    // 1. Smooth out the agencyScore with viscous LERP
    const target = agencyScore.get();
    const current = smoothedAgency.get();
    const diff = target - current;
    const rate = 1 - Math.exp(-0.0022 * delta);
    const newSmooth = current + diff * rate;
    smoothedAgency.set(newSmooth);

    // 2. Rotate the flywheel proportional to agency level (frozen if <30)
    const speed = newSmooth > 30 ? ((newSmooth - 30) / 70) * 8.5 : 0;
    const currentRot = rotation.get();
    rotation.set(currentRot + speed * (delta / 1000) * 57.2958); // convert to degrees

    // 3. Update Bar Fill Height, Gradients, and Glows directly
    const barFill = barFillRef.current;
    if (barFill) {
      barFill.style.height = `${newSmooth}%`;
      if (newSmooth > 70) {
        barFill.style.background = 'linear-gradient(to top, #6366f1, #a5b4fc)';
        barFill.style.boxShadow = '0 0 14px rgba(99, 102, 241, 0.45)';
      } else if (newSmooth > 30) {
        barFill.style.background = 'linear-gradient(to top, #d97706, #fcd34d)';
        barFill.style.boxShadow = '0 0 8px rgba(217, 119, 6, 0.25)';
      } else {
        barFill.style.background = 'linear-gradient(to top, #4b5563, #6b7280)';
        barFill.style.boxShadow = 'none';
      }
    }

    // 4. Update Flywheel Rotation and Opacity directly
    const flywheel = flywheelRef.current;
    if (flywheel) {
      flywheel.style.transform = `rotate(${rotation.get()}deg)`;
      const opacity = newSmooth > 30 ? 0.35 + ((newSmooth - 30) / 70) * 0.65 : 0.15;
      flywheel.style.opacity = opacity.toString();
    }

    // 5. Emit paralysis hover delay class directly on document body
    if (newSmooth < 30) {
      document.body.classList.add('agency-paralyzed');
    } else {
      document.body.classList.remove('agency-paralyzed');
    }
  });

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('agency-paralyzed');
    };
  }, []);

  const stateLabel = currentState.toUpperCase();
  const labelColor = currentState === 'initiating' 
    ? '#EF9F27' 
    : (currentState === 'paralysis' ? '#E24B4A' : 'rgba(255,255,255,0.4)');

  const monologueText = currentState === 'initiating'
    ? "I'll start now."
    : (currentState === 'paralysis' ? "What's the point?" : "Maybe after this.");

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none w-full px-3">

      {/* Flywheel Mechanical Spinner */}
      <div className="flex items-center justify-center my-4 h-16 w-16 relative">
        <div className="absolute inset-0 rounded-full bg-indigo-500/5 filter blur-md pointer-events-none" />
        <svg 
          ref={flywheelRef} 
          viewBox="0 0 100 100" 
          className="w-14 h-14 text-zinc-400 will-change-transform opacity-60"
        >
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 4" className="opacity-25" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <line x1="50" y1="18" x2="50" y2="82" stroke="currentColor" strokeWidth="1.25" />
          <line x1="18" y1="50" x2="82" y2="50" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="50" cy="18" r="3.5" fill="currentColor" />
          <circle cx="50" cy="82" r="3.5" fill="currentColor" />
          <circle cx="18" cy="50" r="3.5" fill="currentColor" />
          <circle cx="82" cy="50" r="3.5" fill="currentColor" />
          <circle cx="50" cy="50" r="10" fill="#030303" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* State label above the bar */}
      <div className="text-center mb-1.5 select-none h-4 flex items-center justify-center">
        <span 
          className="text-[10px] font-mono font-bold tracking-wider"
          style={{ color: labelColor }}
        >
          {stateLabel}
        </span>
      </div>

      {/* Momentum Bar */}
      <div className="flex-1 flex justify-center items-center py-2 h-full w-full min-h-[160px]">
        <div className="w-2.5 h-full min-h-[160px] bg-zinc-950/80 border border-zinc-900 rounded-full relative overflow-hidden">
          <div 
            ref={barFillRef} 
            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
            style={{ height: '0%' }}
          />
        </div>
      </div>

      {/* Internal Monologue below the bar */}
      <div className="min-h-[32px] flex items-center justify-center mt-3 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentState}
            initial={{ opacity: 0, filter: 'blur(3px)' }}
            animate={{ opacity: 0.5, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(3px)' }}
            transition={{ duration: 1.5 }}
            className="font-mono text-[9px] italic text-center text-zinc-400 max-w-[120px] leading-relaxed"
          >
            "{monologueText}"
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

export default AgencyMeter;
