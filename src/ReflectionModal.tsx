import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SystemScores {
  attention: number;
  nervous: number; // Raw load (high = bad)
  identity: number;
  agency: number;
  meaning: number;
}

export interface SliderSnapshot {
  sleepDebt: number;
  stimulation: number;
  socialPressure: number;
  economicStress: number;
  physicalMovement: number;
}

interface ReflectionModalProps {
  systemScores: SystemScores;
  systemStartScores: SystemScores;
  sliderValues: SliderSnapshot;
  activeArchetype: string | null;
  sessionDuration: number; // seconds
  onClose: (insight: string) => void;
  isOpen: boolean;
  firedEvents: { name: string; category: 'destabilizer' | 'stabilizer' }[];
  peakLoad?: number;
}

// ─── Section 1: Environment Report ─────────────────────────────────────────

function buildEnvironmentReport(
  sliders: SliderSnapshot,
  sessionDuration: number,
  firedEvents: { name: string; category: 'destabilizer' | 'stabilizer' }[],
  systemScores: SystemScores,
  systemStartScores: SystemScores,
  peakLoad?: number
): string[] {
  const lines: string[] = [];

  // 1. Duration framing
  if (sessionDuration < 90) {
    lines.push("This represents a brief environmental exposure.");
  } else if (sessionDuration >= 90 && sessionDuration < 300) {
    lines.push("The subject was exposed for a sustained period.");
  } else {
    lines.push("Extended exposure duration amplified cumulative effects.");
  }

  // 2. Event summary
  const destabilizers = firedEvents.filter(e => e.category === 'destabilizer');
  const stabilizers = firedEvents.filter(e => e.category === 'stabilizer');

  const anyDroppedOver15 = (
    (systemStartScores.attention - systemScores.attention > 15) ||
    (systemScores.nervous - systemStartScores.nervous > 15) ||
    (systemStartScores.identity - systemScores.identity > 15) ||
    (systemStartScores.agency - systemScores.agency > 15) ||
    (systemStartScores.meaning - systemScores.meaning > 15)
  );

  if (destabilizers.length >= 1 && stabilizers.length >= 1) {
    lines.push("The environment alternated between stress and recovery cycles.");
  }
  if (destabilizers.length >= 2 && peakLoad !== undefined && peakLoad > 50) {
    lines.push("Multiple destabilizing events compounded system stress.");
  }
  if (stabilizers.length >= 2 && anyDroppedOver15) {
    lines.push("Recovery events interrupted degradation trajectories.");
  }

  // 3. Peak load note
  if (peakLoad !== undefined) {
    if (peakLoad > 70) {
      lines.push("Peak nervous system load reached critical threshold.");
    } else if (peakLoad >= 50) {
      lines.push("Moderate load peaks were recorded during exposure.");
    } else if (peakLoad < 30) {
      lines.push("Load remained subcritical throughout.");
    }
  }

  // 4. Static environment parameters (cap total sentences at 7)
  // Sleep
  if (sliders.sleepDebt > 60) {
    lines.push("Chronic sleep debt was present throughout.");
  } else if (sliders.sleepDebt < 30) {
    lines.push("Sleep was largely intact.");
  }

  // Stimulation
  if (sliders.stimulation > 70) {
    lines.push("The subject was exposed to extreme algorithmic and sensory stimulation.");
  } else if (sliders.stimulation < 40) {
    lines.push("The environment was low in external stimulation.");
  }

  // Social pressure
  if (sliders.socialPressure > 65) {
    lines.push("Social comparison and external validation pressure were high.");
  } else if (sliders.socialPressure < 35) {
    lines.push("Social pressure was minimal.");
  }

  // Economic stress
  if (sliders.economicStress > 65) {
    lines.push("Economic uncertainty acted as a persistent background stressor.");
  } else if (sliders.economicStress < 35) {
    lines.push("Economic conditions were stable.");
  }

  // Physical movement
  if (sliders.physicalMovement > 60) {
    lines.push("Regular physical movement was a stabilizing factor.");
  } else if (sliders.physicalMovement < 30) {
    lines.push("Physical movement was largely absent from this environment.");
  }

  return lines.slice(0, 7);
}

// ─── Section 2: System Descriptors ─────────────────────────────────────────

function attentionDescriptor(score: number): string {
  if (score < 30) return "severely fragmented";
  if (score < 60) return "degraded";
  if (score < 80) return "intact";
  return "sustained";
}

function nervousDescriptor(score: number): string {
  const nervousWellness = 100 - score;
  if (nervousWellness < 30) return "critically overloaded";
  if (nervousWellness < 60) return "chronically stressed";
  if (nervousWellness < 80) return "manageable";
  return "regulated";
}

function identityDescriptor(score: number): string {
  if (score < 30) return "structurally collapsed";
  if (score < 60) return "unstable";
  if (score < 80) return "coherent";
  return "grounded";
}

function agencyDescriptor(score: number): string {
  if (score < 30) return "paralyzed";
  if (score < 60) return "impaired";
  if (score < 80) return "functional";
  return "strong";
}

function meaningDescriptor(score: number): string {
  if (score < 30) return "absent";
  if (score < 60) return "eroded";
  if (score < 80) return "present";
  return "deep";
}

interface SystemRow {
  label: string;
  start: number;
  end: number;
  descriptor: string;
}

function buildSystemRows(start: SystemScores, end: SystemScores): SystemRow[] {
  return [
    { label: "ATTENTION",   start: start.attention, end: end.attention, descriptor: attentionDescriptor(end.attention) },
    { label: "NERVOUS SYS", start: start.nervous,   end: end.nervous,   descriptor: nervousDescriptor(end.nervous) },
    { label: "IDENTITY",    start: start.identity,  end: end.identity,  descriptor: identityDescriptor(end.identity) },
    { label: "AGENCY",      start: start.agency,    end: end.agency,    descriptor: agencyDescriptor(end.agency) },
    { label: "MEANING",     start: start.meaning,   end: end.meaning,   descriptor: meaningDescriptor(end.meaning) },
  ];
}

// ─── Section 3: Deterministic Insight Generator ────────────────────────────

const ARCHETYPE_PREFIXES: Record<string, string> = {
  "Modern Student":      "This is a common cognitive profile for people in high-demand academic environments.",
  "Corporate Burnout":   "This pattern is well-documented in sustained high-pressure professional contexts.",
  "Hyperonline":         "This profile reflects a mind shaped almost entirely by algorithmic feedback loops.",
  "Recovery Cabin":      "Low-stimulation environments consistently produce this stabilization trajectory.",
  "Cyberpunk Megacity":  "This represents near-maximum environmental load. Few systems survive intact.",
  "Meaningful Work":     "Even moderate environmental stress is buffered significantly by purpose and movement.",
};

type SystemKey = 'attention' | 'nervous' | 'identity' | 'agency' | 'meaning';

export function generateInsight(
  sliders: SliderSnapshot,
  scores: SystemScores,
  archetype: string | null
): string {
  // Convert all scores to wellness metrics (high = good, low = bad)
  const wellnessScores = {
    attention: scores.attention,
    nervous: 100 - scores.nervous,
    identity: scores.identity,
    agency: scores.agency,
    meaning: scores.meaning
  };

  // ── Recovery Branch Selection Checks (First) ──
  const isRecovery = Object.values(wellnessScores).filter(s => s > 70).length >= 3;

  if (isRecovery) {
    if (wellnessScores.meaning < 50) {
      return "The nervous system stabilized. Agency recovered. But meaning did not follow. Rest without purpose restores capacity without direction.";
    }
    if (archetype === "Recovery Cabin") {
      return "Low stimulation and high physical movement consistently produce this pattern. The nervous system is not resilient by default — it is resilient because the environment stopped attacking it.";
    }
    if (archetype === "Meaningful Work") {
      return "Purpose-structured environments buffer moderate stress effectively. Agency and meaning scores rising together is the signature of environments that give the mind a reason to engage rather than escape.";
    }
    return "When the environmental load decreases, the systems do not snap back — they drift back, slowly, the same way they drifted forward into degradation. Recovery is not an event. It is a direction.";
  }

  // ── Degradation Branch Selection ──
  const entries: [SystemKey, number][] = [
    ['attention', wellnessScores.attention],
    ['nervous',   wellnessScores.nervous],
    ['identity',  wellnessScores.identity],
    ['agency',    wellnessScores.agency],
    ['meaning',   wellnessScores.meaning],
  ];
  const sorted = [...entries].sort((a, b) => a[1] - b[1]);
  const [worstKey]        = sorted[0];
  const [secondWorstKey]  = sorted[1];
  const degradedPair = new Set([worstKey, secondWorstKey]);

  // Dominant environmental cause (highest slider above 60)
  const stressorMap: [string, number][] = [
    ['stimulation',   sliders.stimulation],
    ['sleepDebt',     sliders.sleepDebt],
    ['socialPressure',sliders.socialPressure],
    ['economicStress',sliders.economicStress],
  ];
  const dominant = stressorMap
    .filter(([, v]) => v > 60)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Insight lookup
  let insight = "";

  if (degradedPair.has('nervous') && degradedPair.has('attention') && dominant === 'stimulation') {
    insight = "The nervous system and attention architecture degraded in parallel — a predictable outcome of sustained high-stimulation environments. This is not a focus problem. It is a load problem.";
  } else if (degradedPair.has('nervous') && degradedPair.has('attention') && dominant === 'sleepDebt') {
    insight = "Sleep debt acted as a force multiplier. Every other stressor hit harder because the system had no recovery window. The degradation here was arithmetic, not personal.";
  } else if (degradedPair.has('identity') && degradedPair.has('meaning') && dominant === 'stimulation') {
    insight = "Chronic algorithmic stimulation accelerated identity drift and meaning erosion simultaneously. When the environment constantly supplies novelty, the mind never has to generate its own orientation. Over time, it forgets how.";
  } else if (degradedPair.has('identity') && degradedPair.has('meaning') && dominant === 'socialPressure') {
    insight = "High social comparison pressure destabilized identity before meaning had a chance to form. The self was being redefined by external signals faster than internal ones could consolidate.";
  } else if (degradedPair.has('agency') && degradedPair.has('meaning') && dominant === 'economicStress') {
    insight = "Economic stress created a persistent background of low-grade threat that slowly consumed the systems responsible for initiative and purpose. The result looks like laziness. It is not.";
  } else if (degradedPair.has('agency') && degradedPair.has('nervous') && dominant === 'sleepDebt') {
    insight = "The combination of sleep debt and nervous system overload reliably produces a state that looks like depression but is better described as a system in protective shutdown. Rest is not a reward here. It is the intervention.";
  } else if (degradedPair.has('attention') && degradedPair.has('agency') && dominant === 'stimulation') {
    insight = "Extreme stimulation fragmented attention and drained agency in sequence — first the ability to focus, then the ability to begin. These are not separate problems. They are the same problem at two stages.";
  } else if (degradedPair.has('identity') && degradedPair.has('agency') && dominant === 'socialPressure') {
    insight = "Social pressure eroded identity coherence, and without a stable sense of self, the agency system had no reference point for what to initiate. Paralysis followed not from weakness but from ambiguity.";
  } else {
    insight = "The environmental conditions present in this simulation reliably produce these outcomes across populations. The specific degradation pattern reflects the specific stressors — not the specific person.";
  }

  // Prepend archetype context if available
  if (archetype && ARCHETYPE_PREFIXES[archetype]) {
    return `${ARCHETYPE_PREFIXES[archetype]} ${insight}`;
  }

  return insight;
}

// ─── Direction Indicator ────────────────────────────────────────────────────

function DirectionIndicator({ start, end }: { start: number; end: number }) {
  const delta = end - start;
  if (delta < -10) {
    return <span style={{ color: '#E24B4A' }}>↓</span>;
  }
  if (delta > 10) {
    return <span style={{ color: '#1D9E75' }}>↑</span>;
  }
  return <span style={{ color: '#71717a' }}>→</span>;
}

// ─── Main Component ─────────────────────────────────────────────────────────

const ReflectionModal = React.memo(function ReflectionModal({
  systemScores,
  systemStartScores,
  sliderValues,
  activeArchetype,
  sessionDuration,
  onClose,
  isOpen,
  firedEvents,
  peakLoad,
}: ReflectionModalProps) {
  const environmentLines = buildEnvironmentReport(sliderValues, sessionDuration, firedEvents, systemScores, systemStartScores, peakLoad);
  const systemRows       = buildSystemRows(systemStartScores, systemScores);
  const insight          = generateInsight(sliderValues, systemScores, activeArchetype);

  const durationLabel = (() => {
    const m = Math.floor(sessionDuration / 60);
    const s = Math.floor(sessionDuration % 60);
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(insight); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl overflow-y-auto"
            style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #1c1c1c',
              borderRadius: 0,
              maxHeight: '90vh',
            }}
          >
            {/* ── Modal Header ── */}
            <div style={{ borderBottom: '1px solid #1a1a1a', padding: '20px 24px 16px' }}>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#3f3f3f',
                  marginBottom: '6px',
                }}
              >
                // SYSTEM NEURAL MONITOR // DIAGNOSTIC REPORT
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#a0a0a0',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Cognitive Reflection
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '9px',
                    color: '#2f2f2f',
                    letterSpacing: '0.1em',
                  }}
                >
                  SESSION: {durationLabel}
                  {activeArchetype && (
                    <span style={{ marginLeft: '10px', color: '#383838' }}>
                      / {activeArchetype.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 1: Environment Report ── */}
            <div style={{ padding: '20px 24px 0' }}>
              <SectionLabel>01 — ENVIRONMENT REPORT</SectionLabel>
              <div style={{ marginTop: '10px' }}>
                {environmentLines.length > 0 ? (
                  environmentLines.map((line, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: '#5a5a5a',
                        lineHeight: 1.7,
                        margin: '0 0 4px',
                      }}
                    >
                      {line}
                    </p>
                  ))
                ) : (
                  <p
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#3a3a3a',
                      lineHeight: 1.7,
                    }}
                  >
                    All environment variables were within moderate ranges.
                  </p>
                )}
              </div>
            </div>

            {/* ── Section 2: System Impact ── */}
            <div style={{ padding: '20px 24px 0' }}>
              <SectionLabel>02 — SYSTEM IMPACT</SectionLabel>
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {systemRows.map((row) => {
                  const delta = row.label === "NERVOUS SYS" ? (row.start - row.end) : (row.end - row.start);
                  const isNervous = row.label === "NERVOUS SYS";
                  const startDisp = isNervous ? row.start : row.start;
                  const endDisp = isNervous ? row.end : row.end;

                  const deltaLabel = delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`;
                  return (
                    <div
                      key={row.label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '108px 1fr auto',
                        alignItems: 'baseline',
                        gap: '8px',
                        padding: '5px 0',
                        borderBottom: '1px solid #111',
                      }}
                    >
                      {/* System name */}
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          color: '#383838',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {row.label}
                      </span>

                      {/* Score change */}
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#555',
                          letterSpacing: '0.04em',
                        }}
                      >
                        <DirectionIndicator start={isNervous ? endDisp : startDisp} end={isNervous ? startDisp : endDisp} />
                        {' '}
                        <span style={{ color: '#3a3a3a' }}>{Math.round(startDisp)}</span>
                        <span style={{ color: '#2a2a2a', margin: '0 3px' }}>→</span>
                        <span style={{
                          color: delta < -10 ? '#7a2a29' : delta > 10 ? '#1a5a44' : '#4a4a4a'
                        }}>
                          {Math.round(endDisp)}
                        </span>
                        <span style={{ color: '#2e2e2e', marginLeft: '6px', fontSize: '10px' }}>
                          ({deltaLabel})
                        </span>
                      </span>

                      {/* Descriptor */}
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '10px',
                          color: '#404040',
                          letterSpacing: '0.06em',
                          textAlign: 'right',
                        }}
                      >
                        {row.descriptor}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Section 3: The Insight ── */}
            <div style={{ padding: '20px 24px 0' }}>
              <SectionLabel>03 — ANALYTICAL SUMMARY</SectionLabel>
              <p
                style={{
                  fontFamily: '"Georgia", "Times New Roman", serif',
                  fontSize: '13.5px',
                  color: '#606060',
                  lineHeight: 1.75,
                  marginTop: '12px',
                  marginBottom: 0,
                  fontStyle: 'normal',
                }}
              >
                {insight}
              </p>
            </div>

            {/* ── Section 4: Closing & Button ── */}
            <div
              style={{
                padding: '28px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  color: '#2a2a2a',
                  textTransform: 'uppercase',
                  opacity: 0.7,
                }}
              >
                THE ENVIRONMENT SHAPED THIS. NOT THE PERSON.
              </div>

              <button
                onClick={() => onClose(insight)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#505050',
                  background: 'transparent',
                  border: '1px solid #222',
                  borderRadius: 0,
                  padding: '10px 0',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#888';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#383838';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#505050';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#222';
                }}
              >
                UNDERSTOOD
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Small helper ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: '9px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#2a2a2a',
        paddingBottom: '6px',
        borderBottom: '1px solid #141414',
      }}
    >
      {children}
    </div>
  );
}

export default ReflectionModal;
