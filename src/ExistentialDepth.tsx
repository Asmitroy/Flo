import React, { useRef } from 'react';
import { useAnimationFrame, MotionValue, useMotionValue } from 'framer-motion';

interface ExistentialDepthProps {
  meaningScore: MotionValue<number>;
}

const OVERLAY_WORDS = ["emptiness", "drift", "nothing", "later", "eventually"];

export const ExistentialDepth = React.memo(function ExistentialDepth({ meaningScore }: ExistentialDepthProps) {
  const smoothedMeaning = useMotionValue(meaningScore.get());

  // DOM Refs for direct manipulation to prevent component re-renders
  const svgRef = useRef<SVGSVGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const textOverlayRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const monologueRef = useRef<HTMLDivElement>(null);

  useAnimationFrame((_, delta) => {
    // 1. Smooth out the meaningScore with viscous LERP
    const target = meaningScore.get();
    const current = smoothedMeaning.get();
    const diff = target - current;
    const rate = 1 - Math.exp(-0.0022 * delta);
    const newSmooth = current + diff * rate;
    smoothedMeaning.set(newSmooth);

    const t = performance.now() / 1000;

    // 2. Animate SVG viewBox (Shaft narrows from 0 0 100 200 to 20 0 60 200)
    const svg = svgRef.current;
    if (svg) {
      const vbX = 20 * (1 - newSmooth / 100);
      const vbW = 60 + 40 * (newSmooth / 100);
      svg.setAttribute('viewBox', `${vbX} 0 ${vbW} 200`);
    }

    // 3. Animate radial glow opacity at the bottom
    const glow = glowRef.current;
    if (glow) {
      const glowOpacity = (newSmooth / 100) * 0.8;
      glow.setAttribute('opacity', glowOpacity.toString());
    }

    // 4. Word cycling overlay at meaning < 20
    const textOverlay = textOverlayRef.current;
    if (textOverlay) {
      if (newSmooth < 20) {
        const wordIdx = Math.floor(t / 4) % OVERLAY_WORDS.length;
        const targetWord = OVERLAY_WORDS[wordIdx];
        if (textOverlay.textContent !== targetWord) {
          textOverlay.textContent = targetWord;
        }
        
        // Calculate fade opacity
        const scale = (20 - newSmooth) / 20; // 0 at 20, 1 at 0
        const fade = Math.abs(Math.sin((t * Math.PI) / 4));
        const opacity = fade * 0.3 * scale;
        textOverlay.style.opacity = opacity.toString();
      } else {
        textOverlay.style.opacity = '0';
      }
    }

    // 5. Update Status State Text, Monologue, and Colors directly
    const statusText = statusTextRef.current;
    const monologue = monologueRef.current;
    if (statusText && monologue) {
      let stateStr = "QUESTIONING";
      let monologueStr = "What lies ahead?";
      let monologueCol = "text-amber-500/70";
      let statusCol = "text-amber-500";

      if (newSmooth > 70) {
        stateStr = "GROUNDED";
        monologueStr = "The horizon is clear.";
        monologueCol = "text-zinc-400/90 font-bold";
        statusCol = "text-zinc-400 font-bold";
      } else if (newSmooth < 30) {
        stateStr = "VOID";
        monologueStr = "Nothing remains.";
        monologueCol = "text-zinc-700/80 italic";
        statusCol = "text-rose-950 font-bold animate-pulse";
      }

      if (statusText.textContent !== stateStr) {
        statusText.textContent = stateStr;
        statusText.className = `text-[10px] font-mono font-bold tracking-wider ${statusCol}`;
      }

      if (monologue.textContent !== monologueStr) {
        monologue.textContent = monologueStr;
        monologue.className = `text-[9px] font-mono max-w-[120px] leading-relaxed transition-all duration-300 ${monologueCol}`;
      }
    }
  });

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none w-full border-r border-zinc-900/30 px-3">
      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest text-center">
        Meaning Core
      </div>

      {/* SVG Depth Field / Well */}
      <div className="flex-1 flex justify-center items-center py-2 h-full w-full min-h-[220px] relative">
        <svg 
          ref={svgRef}
          viewBox="0 0 100 200" 
          className="w-full h-full max-h-[220px] border border-zinc-950 bg-black/40 rounded-lg overflow-hidden"
        >
          <defs>
            {/* Soft amber radial glow representing reflection from deep inside well */}
            <radialGradient id="well-glow" cx="50%" cy="90%" r="50%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#78350f" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Depth Well Walls (close in visually via viewBox transform) */}
          {/* Left Wall */}
          <line x1="20" y1="0" x2="20" y2="200" stroke="#1f2937" strokeWidth="1" opacity="0.35" />
          <line x1="23" y1="0" x2="23" y2="200" stroke="#111827" strokeWidth="0.5" opacity="0.2" />

          {/* Right Wall */}
          <line x1="80" y1="0" x2="80" y2="200" stroke="#1f2937" strokeWidth="1" opacity="0.35" />
          <line x1="77" y1="0" x2="77" y2="200" stroke="#111827" strokeWidth="0.5" opacity="0.2" />

          {/* Deep Faint Glow */}
          <circle 
            ref={glowRef}
            cx="50" 
            cy="180" 
            r="40" 
            fill="url(#well-glow)" 
            opacity="0.8" 
          />

          {/* Centered Depth Indicator Markings */}
          <line x1="45" y1="50" x2="55" y2="50" stroke="#374151" strokeWidth="0.5" opacity="0.15" />
          <line x1="45" y1="100" x2="55" y2="100" stroke="#374151" strokeWidth="0.5" opacity="0.15" />
          <line x1="45" y1="150" x2="55" y2="150" stroke="#374151" strokeWidth="0.5" opacity="0.15" />
        </svg>

        {/* Faint Text Overlay for Paralysis/Void */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div 
            ref={textOverlayRef} 
            className="text-[9px] font-mono tracking-[0.25em] text-zinc-600/40 uppercase text-center transition-opacity duration-1000" 
            style={{ opacity: 0 }}
          >
            emptiness
          </div>
        </div>
      </div>

      {/* State & Monologue Text */}
      <div className="flex flex-col items-center mt-4 text-center space-y-1.5 w-full">
        <span 
          ref={statusTextRef} 
          className="text-[10px] font-mono font-bold tracking-wider text-zinc-500"
        >
          QUESTIONING
        </span>
        <div className="min-h-[28px] flex items-center justify-center">
          <div 
            ref={monologueRef} 
            className="text-[9px] font-mono max-w-[120px] leading-relaxed transition-all duration-300 text-zinc-500/80"
          >
            "What lies ahead?"
          </div>
        </div>
      </div>
    </div>
  );
});

export default ExistentialDepth;
