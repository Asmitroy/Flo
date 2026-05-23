import React, { useRef } from 'react';
import { useAnimationFrame, MotionValue, useMotionValue } from 'framer-motion';

interface ExistentialDepthProps {
  meaningScore: MotionValue<number>;
}

export const ExistentialDepth = React.memo(function ExistentialDepth({ meaningScore }: ExistentialDepthProps) {
  const smoothedMeaning = useMotionValue(meaningScore.get());

  // DOM Refs for direct manipulation to prevent component re-renders
  const svgRef = useRef<SVGSVGElement>(null);
  const shaftRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const textOverlayRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);

  useAnimationFrame((_, delta) => {
    // 1. Smooth out the meaningScore with viscous LERP
    const target = meaningScore.get();
    const current = smoothedMeaning.get();
    const diff = target - current;
    const rate = 1 - Math.exp(-0.0022 * delta);
    const newSmooth = current + diff * rate;
    smoothedMeaning.set(newSmooth);

    const t = performance.now() / 1000;

    // 2. Animate SVG viewBox (Shaft narrows from 0 0 200 160 to narrower)
    const svg = svgRef.current;
    if (svg) {
      const vbX = 30 * (1 - newSmooth / 100);
      const vbW = 140 + 60 * (newSmooth / 100);
      svg.setAttribute('viewBox', `${vbX} 0 ${vbW} 160`);
    }

    // 3. Animate shaft rect dimensions
    const shaft = shaftRef.current;
    if (shaft) {
      const shaftWidth = 40 + (newSmooth / 100) * 100;
      const shaftX = 100 - shaftWidth / 2;
      shaft.setAttribute('x', shaftX.toString());
      shaft.setAttribute('width', shaftWidth.toString());
    }

    // 4. Animate radial glow opacity at the bottom
    const glow = glowRef.current;
    if (glow) {
      const glowOpacity = (newSmooth / 100) * 0.8;
      glow.setAttribute('opacity', glowOpacity.toString());
    }

    // 5. Word cycling overlay at meaning < 20
    const textOverlay = textOverlayRef.current;
    if (textOverlay) {
      const OVERLAY_WORDS = ["emptiness", "drift", "nothing", "later", "eventually"];
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

    // 6. Update Status State Text directly
    const statusText = statusTextRef.current;
    if (statusText) {
      let stateStr = "DRIFTING";
      let statusCol = "text-amber-500";

      if (newSmooth > 60) {
        stateStr = "GROUNDED";
        statusCol = "text-zinc-400 font-bold";
      } else if (newSmooth < 30) {
        stateStr = "VOID";
        statusCol = "text-rose-950 font-bold animate-pulse";
      }

      if (statusText.textContent !== stateStr) {
        statusText.textContent = stateStr;
        statusText.className = `text-[10px] font-mono font-bold tracking-wider ${statusCol}`;
      }
    }
  });

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 select-none w-full px-3">

      {/* SVG Depth Field / Well */}
      <div className="flex-1 flex justify-center items-center py-2 h-full w-full relative" style={{ width: '100%', minHeight: '120px' }}>
        <svg 
          ref={svgRef}
          viewBox="0 0 200 160" 
          width="100%"
          height="160"
          className="border border-zinc-950 bg-black/40 rounded-lg overflow-hidden"
        >
          <defs>
            {/* Soft amber radial glow representing reflection from deep inside well */}
            <radialGradient id="well-glow" cx="50%" cy="85%" r="50%">
              <stop offset="0%" stopColor="rgb(239,159,39)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="rgb(120,53,15)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(0,0,0)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Depth Well Shaft */}
          <rect
            ref={shaftRef}
            x="30"
            y="0"
            width="140"
            height="160"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />

          {/* Left Wall */}
          <line x1="30" y1="0" x2="30" y2="160" stroke="#1f2937" strokeWidth="1" opacity="0.35" />
          <line x1="33" y1="0" x2="33" y2="160" stroke="#111827" strokeWidth="0.5" opacity="0.2" />

          {/* Right Wall */}
          <line x1="170" y1="0" x2="170" y2="160" stroke="#1f2937" strokeWidth="1" opacity="0.35" />
          <line x1="167" y1="0" x2="167" y2="160" stroke="#111827" strokeWidth="0.5" opacity="0.2" />

          {/* Deep Faint Glow */}
          <circle 
            ref={glowRef}
            cx="100" 
            cy="140" 
            r="50" 
            fill="url(#well-glow)" 
            opacity="0.8" 
          />

          {/* Centered Depth Indicator Markings */}
          <line x1="90" y1="40" x2="110" y2="40" stroke="#374151" strokeWidth="0.5" opacity="0.15" />
          <line x1="90" y1="80" x2="110" y2="80" stroke="#374151" strokeWidth="0.5" opacity="0.15" />
          <line x1="90" y1="120" x2="110" y2="120" stroke="#374151" strokeWidth="0.5" opacity="0.15" />
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

      {/* Status Word */}
      <div className="flex flex-col items-center mt-3 text-center w-full">
        <span 
          ref={statusTextRef} 
          className="text-[10px] font-mono font-bold tracking-wider text-amber-500"
        >
          DRIFTING
        </span>
      </div>
    </div>
  );
});

export default ExistentialDepth;
