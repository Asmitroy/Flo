import React, { useRef } from 'react';
import { useAnimationFrame, MotionValue } from 'framer-motion';

interface AttentionGraphProps {
  load: MotionValue<number>;
}

interface NodeBase {
  id: number;
  name: string;
  r: number;
  theta: number;
  size: number;
}

const BASE_NODES: NodeBase[] = [
  { id: 0, name: "Core", r: 35, theta: 0, size: 7.5 },
  { id: 1, name: "Synthesis", r: 65, theta: Math.PI * 0.4, size: 5.5 },
  { id: 2, name: "Memory", r: 75, theta: Math.PI * 0.9, size: 6.5 },
  { id: 3, name: "Perception", r: 70, theta: Math.PI * 1.3, size: 5.5 },
  { id: 4, name: "Identity", r: 55, theta: Math.PI * 1.7, size: 6.5 },
  { id: 5, name: "Focus", r: 120, theta: Math.PI * 0.2, size: 4.5 },
  { id: 6, name: "Reason", r: 110, theta: Math.PI * 0.7, size: 5.5 },
  { id: 7, name: "Affect", r: 130, theta: Math.PI * 1.1, size: 4.5 },
  { id: 8, name: "Soma", r: 115, theta: Math.PI * 1.6, size: 5.5 }
];

const NODE_PARAMS = [
  { freq: 0.8, amp: 8, speed: 0.03, phase: 0 },
  { freq: 1.2, amp: 12, speed: -0.04, phase: 1.2 },
  { freq: 0.7, amp: 14, speed: 0.05, phase: 2.5 },
  { freq: 1.5, amp: 10, speed: -0.03, phase: 3.8 },
  { freq: 0.9, amp: 11, speed: 0.06, phase: 0.7 },
  { freq: 1.1, amp: 15, speed: -0.05, phase: 4.2 },
  { freq: 0.6, amp: 18, speed: 0.04, phase: 2.1 },
  { freq: 1.4, amp: 16, speed: -0.06, phase: 1.8 },
  { freq: 1.0, amp: 13, speed: 0.05, phase: 5.0 },
];

const LINKS = [
  { from: 0, to: 1, snapThreshold: 65 },
  { from: 0, to: 2, snapThreshold: 60 },
  { from: 0, to: 3, snapThreshold: 50 },
  { from: 0, to: 4, snapThreshold: 55 },
  { from: 1, to: 5, snapThreshold: 40 },
  { from: 2, to: 6, snapThreshold: 45 },
  { from: 3, to: 7, snapThreshold: 42 },
  { from: 4, to: 8, snapThreshold: 48 },
  { from: 5, to: 6, snapThreshold: 35 },
  { from: 7, to: 8, snapThreshold: 38 },
  { from: 1, to: 2, snapThreshold: 52 },
  { from: 3, to: 4, snapThreshold: 58 }
];

export const AttentionGraph = React.memo(function AttentionGraph({ load }: AttentionGraphProps) {
  const smoothedLoadRef = useRef(load.get());

  // Refs for direct DOM manipulation to run locked at 60fps, bypassing React renders
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const cyanSplitRefs = useRef<(SVGCircleElement | null)[]>([]);
  const redSplitRefs = useRef<(SVGCircleElement | null)[]>([]);
  const linkRefs = useRef<(SVGLineElement | null)[]>([]);
  const reflectionRefs = useRef<(SVGCircleElement | null)[]>([]);

  useAnimationFrame((elapsed, delta) => {
    const targetLoad = load.get();
    const currentLoad = smoothedLoadRef.current;
    
    // Viscous LERP:
    const diff = targetLoad - currentLoad;
    const rate = 1 - Math.exp(-0.0022 * delta);
    smoothedLoadRef.current = currentLoad + diff * rate;
    const curLoad = smoothedLoadRef.current;

    const t = elapsed / 1000;

    // Dispersion factor
    let dispersion = 0.55;
    if (curLoad > 20) {
      if (curLoad >= 75) {
        dispersion = 1.45 + ((curLoad - 75) / 25) * 0.15;
      } else {
        dispersion = 0.55 + ((curLoad - 20) / 55) * 0.90;
      }
    }

    // Drift intensity
    const driftIntensity = curLoad <= 20 ? 0 : Math.min(1, (curLoad - 20) / 55);

    // Link opacity
    const linkOpacity = curLoad <= 20 ? 0.28 : (curLoad >= 75 ? 0 : 0.28 * ((75 - curLoad) / 55));

    // Jitter strength
    const jitterStrength = curLoad < 75 ? 0 : ((curLoad - 75) / 25) * 4.5;

    // Chromatic split
    const splitVal = curLoad < 75 ? 0 : ((curLoad - 75) / 25) * 4.0;

    // Compute node coordinates
    const sharedAngle = t * 0.08;
    const positions = BASE_NODES.map((node) => {
      const param = NODE_PARAMS[node.id];
      const wobbleX = Math.sin(t * param.freq + param.phase) * param.amp * driftIntensity;
      const wobbleY = Math.cos(t * param.freq * 0.85 + param.phase + 1) * param.amp * driftIntensity;
      
      const angle = node.theta + sharedAngle + (t * param.speed * driftIntensity);
      const xBase = 200 + Math.cos(angle) * node.r * dispersion + wobbleX;
      const yBase = 200 + Math.sin(angle) * node.r * dispersion + wobbleY;

      let jitterX = 0;
      let jitterY = 0;
      if (jitterStrength > 0) {
        jitterX = Math.sin(t * 320 + node.id * 17.3) * jitterStrength;
        jitterY = Math.cos(t * 290 + node.id * 23.7) * jitterStrength;
      }

      return { x: xBase + jitterX, y: yBase + jitterY };
    });

    // Update reflections & nodes directly in DOM
    BASE_NODES.forEach((node) => {
      const pos = positions[node.id];

      // Reflection
      const refl = reflectionRefs.current[node.id];
      if (refl) {
        refl.setAttribute('cx', pos.x.toString());
        refl.setAttribute('cy', (pos.y + 8).toString());
        const reflectionOpacity = Math.max(0, 0.16 * (1 - (curLoad - 10) / 90));
        refl.setAttribute('opacity', reflectionOpacity.toString());
      }

      // Cyan / Red split circles
      const cyan = cyanSplitRefs.current[node.id];
      const red = redSplitRefs.current[node.id];
      if (cyan && red) {
        if (splitVal > 0.4) {
          const splitJitter = Math.sin(t * 210 + node.id * 13.7) * 0.75;
          const finalSplit = splitVal + splitJitter;
          
          cyan.setAttribute('cx', (pos.x - finalSplit).toString());
          cyan.setAttribute('cy', pos.y.toString());
          cyan.setAttribute('opacity', '0.5');
          
          red.setAttribute('cx', (pos.x + finalSplit).toString());
          red.setAttribute('cy', pos.y.toString());
          red.setAttribute('opacity', '0.5');
        } else {
          cyan.setAttribute('opacity', '0');
          red.setAttribute('opacity', '0');
        }
      }

      // Stable core circle
      const circle = nodeRefs.current[node.id];
      if (circle) {
        circle.setAttribute('cx', pos.x.toString());
        circle.setAttribute('cy', pos.y.toString());
      }
    });

    // Update connection lines directly in DOM
    LINKS.forEach((link, idx) => {
      const line = linkRefs.current[idx];
      if (line) {
        if (curLoad > link.snapThreshold || linkOpacity <= 0) {
          line.setAttribute('opacity', '0');
        } else {
          const fromNode = positions[link.from];
          const toNode = positions[link.to];
          line.setAttribute('x1', fromNode.x.toString());
          line.setAttribute('y1', fromNode.y.toString());
          line.setAttribute('x2', toNode.x.toString());
          line.setAttribute('y2', toNode.y.toString());

          let currentOpacity = linkOpacity;
          if (link.snapThreshold - curLoad < 4) {
            const flicker = Math.sin(t * 65 + idx * 12) > 0 ? 0.35 : 0.05;
            currentOpacity = linkOpacity * flicker;
          }
          line.setAttribute('opacity', currentOpacity.toString());
        }
      }
    });
  });

  return (
    <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center bg-zinc-950/10 border border-zinc-900/40 rounded-xl p-4 select-none backdrop-blur-sm overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-[#030303]/95 pointer-events-none rounded-xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_70%)] pointer-events-none" />

      <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          <radialGradient id="marble-node-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f5f5f3" />
            <stop offset="70%" stopColor="#d1cfc7" />
            <stop offset="90%" stopColor="#9c9990" />
            <stop offset="100%" stopColor="#575550" />
          </radialGradient>

          <radialGradient id="stone-node-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fcfbfa" />
            <stop offset="30%" stopColor="#e3ded5" />
            <stop offset="70%" stopColor="#b2ac9d" />
            <stop offset="92%" stopColor="#7a7465" />
            <stop offset="100%" stopColor="#454137" />
          </radialGradient>

          <radialGradient id="reflection-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Reflection Glows */}
        {BASE_NODES.map((node) => (
          <circle
            key={`reflection-${node.id}`}
            ref={(el) => { reflectionRefs.current[node.id] = el; }}
            cx={200}
            cy={208}
            r={node.size * 2.2}
            fill="url(#reflection-glow)"
            opacity={0.16}
            pointerEvents="none"
          />
        ))}

        {/* 2. Connection Links */}
        {LINKS.map((_, idx) => (
          <line
            key={`link-${idx}`}
            ref={(el) => { linkRefs.current[idx] = el; }}
            x1={200}
            y1={200}
            x2={200}
            y2={200}
            stroke="#ffffff"
            strokeWidth={0.75}
            opacity={0.28}
            filter="url(#line-glow)"
          />
        ))}

        {/* 3. Chromatic Aberration & Stable Nodes */}
        {BASE_NODES.map((node) => {
          const isStoneGrad = node.id % 2 === 1;
          const fillGrad = isStoneGrad ? "url(#stone-node-grad)" : "url(#marble-node-grad)";
          return (
            <g key={`node-group-${node.id}`} className="cursor-pointer">
              {/* Cyan split circle */}
              <circle
                ref={(el) => { cyanSplitRefs.current[node.id] = el; }}
                cx={200}
                cy={200}
                r={node.size}
                fill="#00ffff"
                opacity={0}
                style={{ mixBlendMode: "screen" }}
              />
              {/* Red split circle */}
              <circle
                ref={(el) => { redSplitRefs.current[node.id] = el; }}
                cx={200}
                cy={200}
                r={node.size}
                fill="#ff2a5f"
                opacity={0}
                style={{ mixBlendMode: "screen" }}
              />
              {/* Center stone circle */}
              <circle
                ref={(el) => { nodeRefs.current[node.id] = el; }}
                cx={200}
                cy={200}
                r={node.size}
                fill={fillGrad}
                opacity={0.9}
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
});

export default AttentionGraph;
