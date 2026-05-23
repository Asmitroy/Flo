import React from 'react';
import { motion, MotionValue, useMotionValue, useTransform, useAnimationFrame } from 'framer-motion';

interface IdentityCoreProps {
  coherence: MotionValue<number>;
}

export const IdentityCore = React.memo(function IdentityCore({ coherence }: IdentityCoreProps) {
  const smoothed = useMotionValue(coherence.get());
  const time = useMotionValue(0);

  // Viscous frame-rate independent LERP to slow down transitions organically to 3-5 seconds
  useAnimationFrame((elapsed, delta) => {
    const target = coherence.get();
    const current = smoothed.get();
    const diff = target - current;
    // Viscous factor (0.0022 gives a beautiful, agonizingly slow drift shift)
    const rate = 1 - Math.exp(-0.0022 * delta);
    smoothed.set(current + diff * rate);
    time.set(elapsed / 1000);
  });

  // Calculate drift factor as a motion value
  const drift = useTransform(smoothed, (val) => {
    if (val >= 80) return 0;
    if (val >= 40) {
      const t = (80 - val) / 40; // 0 to 1
      return t * 35;
    } else {
      const t = (40 - val) / 40; // 0 to 1
      return 35 + t * 95;
    }
  });

  // Orbit factor
  const orbitFactor = useTransform(smoothed, (val) => {
    return val >= 80 ? 0 : Math.min(1, (80 - val) / 10);
  });

  // Fill opacity
  const fillOpacity = useTransform(smoothed, (val) => {
    if (val >= 80) return 0.85;
    if (val >= 40) {
      const t = (80 - val) / 40; // 0 to 1
      return 0.85 - t * 0.45; // scales 0.85 down to 0.40
    } else {
      const t = (40 - val) / 40; // 0 to 1
      return 0.40 * (1 - t); // scales 0.40 down to 0 (completely hollow)
    }
  });

  // Stroke opacity
  const strokeOpacity = useTransform(smoothed, (val) => {
    if (val >= 80) return 0;
    if (val >= 40) {
      const t = (80 - val) / 40; // 0 to 1
      return t * 0.35; // scales 0 to 0.35
    } else {
      const t = (40 - val) / 40; // 0 to 1
      return 0.35 + t * 0.15; // scales 0.35 to 0.50
    }
  });

  // Stroke width
  const strokeWidth = useTransform(smoothed, (val) => (val < 40 ? 1 : 1.5));

  // Mix blend mode
  const mixBlendMode = useTransform<number, React.CSSProperties['mixBlendMode']>(smoothed, (val) => {
    return val >= 80 ? 'normal' : (val >= 40 ? 'exclusion' : 'normal');
  });

  // Base opacity
  const baseOpacity = useTransform(smoothed, (val) => {
    if (val >= 80) return 0.9;
    if (val >= 40) return 0.4;
    const t = (40 - val) / 40;
    return 0.4 - t * 0.18; // scales 0.4 down to 0.22 (fade out in hollow state)
  });

  // Derived opacities to avoid calling useTransform inside loop callback
  const innerDiamondOpacity = useTransform(baseOpacity, (v) => v * 0.8);
  const innerLineStrokeOpacity = useTransform(strokeOpacity, (v) => v * 0.7);

  // Layer transforms using multi-value transforms
  const layer1Transform = useTransform([time, orbitFactor, drift], (vals: number[]) => {
    const [t, of, d] = vals;
    const angle = (150 * Math.PI) / 180 + t * 0.08 * of;
    const x = Math.cos(angle) * d;
    const y = Math.sin(angle) * d;
    const rotate = t * 1.5 * of;
    return `translate(${200 + x}px, ${200 + y}px) rotate(${rotate}deg)`;
  });

  const layer2Transform = useTransform([time, orbitFactor, drift], (vals: number[]) => {
    const [t, of, d] = vals;
    const angle = (30 * Math.PI) / 180 - t * 0.11 * of;
    const x = Math.cos(angle) * d;
    const y = Math.sin(angle) * d;
    const rotate = -t * 2.1 * of;
    return `translate(${200 + x}px, ${200 + y}px) rotate(${rotate}deg)`;
  });

  const layer3Transform = useTransform([time, orbitFactor, drift], (vals: number[]) => {
    const [t, of, d] = vals;
    const angle = (270 * Math.PI) / 180 + t * 0.06 * of;
    const x = Math.cos(angle) * d;
    const y = Math.sin(angle) * d;
    const rotate = t * 1.1 * of;
    return `translate(${200 + x}px, ${200 + y}px) rotate(${rotate}deg)`;
  });

  const shadowFilter = useTransform(smoothed, (val) => {
    return val >= 80 ? 'url(#emblem-shadow)' : 'none';
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-visible">
      {/* SVG Canvas centering the emblem elements */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[420px] aspect-square overflow-visible opacity-30 md:opacity-40"
      >
        <defs>
          {/* Classical stone radial gradient */}
          <radialGradient id="stone-emblem" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#eae7df" />
            <stop offset="75%" stopColor="#b8b3a5" />
            <stop offset="92%" stopColor="#7a7566" />
            <stop offset="100%" stopColor="#4f4c42" />
          </radialGradient>

          {/* Deep soft shadow for volumetric weight in Coherence */}
          <filter id="emblem-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Draw the 3 layers */}
        {[
          { id: 1, transform: layer1Transform },
          { id: 2, transform: layer2Transform },
          { id: 3, transform: layer3Transform }
        ].map((layer) => (
          <motion.g
            key={`layer-${layer.id}`}
            transform={layer.transform}
            filter={shadowFilter}
            style={{
              willChange: 'transform',
            }}
          >
            {/* Sacred Geometry Classical Crest Design */}
            {/* Outer Ring */}
            <motion.circle
              cx="0"
              cy="0"
              r="64"
              fill="none"
              stroke="#e2e1dc"
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              opacity={baseOpacity}
              style={{ mixBlendMode }}
            />

            {/* Inner Diamond (Rotated Square) */}
            <motion.path
              d="M 0,-50 L 50,0 L 0,50 L -50,0 Z"
              fill="none"
              stroke="#e2e1dc"
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              opacity={innerDiamondOpacity}
              style={{ mixBlendMode }}
            />

            {/* Center Core Stone Solid Sphere */}
            <motion.circle
              cx="0"
              cy="0"
              r="36"
              fill="url(#stone-emblem)"
              fillOpacity={fillOpacity}
              stroke="#e2e1dc"
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              opacity={baseOpacity}
              style={{ mixBlendMode }}
            />

            {/* Minimalist Crest Inner Lines */}
            <motion.line
              x1="-24"
              y1="0"
              x2="24"
              y2="0"
              stroke="#e2e1dc"
              strokeWidth={strokeWidth}
              strokeOpacity={innerLineStrokeOpacity}
              opacity={baseOpacity}
              style={{ mixBlendMode }}
            />
            <motion.line
              x1="0"
              y1="-24"
              x2="0"
              y2="24"
              stroke="#e2e1dc"
              strokeWidth={strokeWidth}
              strokeOpacity={innerLineStrokeOpacity}
              opacity={baseOpacity}
              style={{ mixBlendMode }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
});

export default IdentityCore;
