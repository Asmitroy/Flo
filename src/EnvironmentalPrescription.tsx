import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  syntheticInteraction: number;
}

interface EnvironmentalPrescriptionProps {
  systemScores: SystemScores;
  sliderValues: SliderSnapshot;
  activeArchetype: string | null;
  insight: string;
  isOpen: boolean;
  onClose: () => void;
  onApplyTargets: (targets: {
    stimulation?: number;
    sleepDebt?: number;
    socialPressure?: number;
    economicStress?: number;
    physicalMovement?: number;
    syntheticInteraction?: number;
  }) => void;
}

export const EnvironmentalPrescription: React.FC<EnvironmentalPrescriptionProps> = ({
  systemScores,
  sliderValues,
  activeArchetype,
  insight,
  isOpen,
  onClose,
  onApplyTargets,
}) => {

  // 1. Identify primary failure
  const wellnessScores = {
    attention: systemScores.attention,
    nervous: 100 - systemScores.nervous,
    identity: systemScores.identity,
    agency: systemScores.agency,
    meaning: systemScores.meaning,
  };

  const scoresList = [
    { id: 'attention', val: wellnessScores.attention },
    { id: 'nervous', val: wellnessScores.nervous },
    { id: 'identity', val: wellnessScores.identity },
    { id: 'agency', val: wellnessScores.agency },
    { id: 'meaning', val: wellnessScores.meaning },
  ];
  scoresList.sort((a, b) => a.val - b.val);
  const primaryFailure = scoresList[0].id;

  // 2. Generate 3-4 slider targets
  const targets: Record<string, number | string> = {};
  
  // Rule 1: Primary failure targets
  if (primaryFailure === 'nervous' || primaryFailure === 'attention') {
    targets.stimulation = Math.max(sliderValues.stimulation - 30, 10);
    targets.sleepDebt = Math.max(sliderValues.sleepDebt - 40, 0);
  } else if (primaryFailure === 'agency') {
    targets.physicalMovement = Math.min(sliderValues.physicalMovement + 35, 80);
    targets.economicStress = "address external — simulation cannot prescribe";
  } else if (primaryFailure === 'meaning') {
    targets.physicalMovement = Math.min(sliderValues.physicalMovement + 30, 75);
    targets.stimulation = Math.max(sliderValues.stimulation - 25, 15);
  } else if (primaryFailure === 'identity') {
    targets.syntheticInteraction = Math.max(sliderValues.syntheticInteraction - 40, 10);
    targets.socialPressure = Math.max(sliderValues.socialPressure - 35, 10);
  }

  // Add secondary targets to guarantee 3-4 suggestions if we don't have enough
  const currentSliders = [
    { key: 'stimulation', val: sliderValues.stimulation, safeMin: 10, safeMax: 50, targetVal: 30 },
    { key: 'sleepDebt', val: sliderValues.sleepDebt, safeMin: 0, safeMax: 30, targetVal: 15 },
    { key: 'physicalMovement', val: sliderValues.physicalMovement, safeMin: 40, safeMax: 100, targetVal: 65 },
    { key: 'socialPressure', val: sliderValues.socialPressure, safeMin: 0, safeMax: 40, targetVal: 20 },
    { key: 'syntheticInteraction', val: sliderValues.syntheticInteraction, safeMin: 0, safeMax: 35, targetVal: 15 },
  ];

  for (const s of currentSliders) {
    if (Object.keys(targets).length >= 4) break;
    if (targets[s.key] !== undefined) continue;

    // Check if slider is out of safe bounds
    if (s.key === 'physicalMovement' ? s.val < s.safeMin : s.val > s.safeMax) {
      if (s.key === 'physicalMovement') {
        targets[s.key] = Math.min(s.val + 25, 75);
      } else {
        targets[s.key] = Math.max(s.val - 25, s.targetVal);
      }
    }
  }

  // Guarantee at least 3 elements
  if (Object.keys(targets).length < 3) {
    if (targets.stimulation === undefined) targets.stimulation = 30;
    if (targets.sleepDebt === undefined) targets.sleepDebt = 15;
    if (targets.physicalMovement === undefined) targets.physicalMovement = 65;
  }

  // Helper function to calculate flow metrics
  const evaluateFlow = (
    stim: number,
    sleep: number,
    social: number,
    econ: number,
    phys: number,
    synth: number
  ) => {
    const load = Math.min(100, stim * (1 + (sleep * 0.015)));
    const attention = 100 - load;
    const agency = Math.max(0, Math.min(100, 30 + (phys * 0.30) - (econ * 0.30) - (sleep * 0.25) - (load * 0.15)));
    const meaning = Math.max(0, Math.min(100, 15 + (phys * 0.40) - (stim * 0.25) + (100 - synth) * 0.15 - (econ * 0.15) - (sleep * 0.10)));

    let satisfied = 0;
    if (attention > 35) satisfied++;
    if (agency > 40) satisfied++;
    if (load >= 35 && load <= 65) satisfied++;
    if (meaning > 45) satisfied++;
    if (social < 40) satisfied++;

    const inFlowChannel = (
      attention > 35 &&
      agency > 40 &&
      load >= 35 && load <= 65 &&
      meaning > 45 &&
      social < 40
    );

    let prob = 0;
    if (inFlowChannel) {
      const attentionContrib = (attention - 35) / 65 * 0.3;
      const agencyContrib = (agency - 40) / 60 * 0.3;
      const loadContrib = 1 - Math.abs(load - 50) / 15 * 0.4;
      prob = Math.min(1, Math.max(0, attentionContrib + agencyContrib + loadContrib));
    }

    return { prob, satisfied };
  };

  // Current flow assessment
  const currentFlow = evaluateFlow(
    sliderValues.stimulation,
    sliderValues.sleepDebt,
    sliderValues.socialPressure,
    sliderValues.economicStress,
    sliderValues.physicalMovement,
    sliderValues.syntheticInteraction
  );
  const flowCompatibilityPercent = Math.round((currentFlow.satisfied / 5) * 100);

  // 3. Flow optimization calculator
  const optimizations: { label: string; deltaProb: number; deltaSatisfied: number; key: string; direction: 'up' | 'down'; targetVal: number }[] = [];

  const slidersToTest = [
    { key: 'stimulation', label: 'STIMULATION', current: sliderValues.stimulation, isNegative: true },
    { key: 'sleepDebt', label: 'SLEEP DEBT', current: sliderValues.sleepDebt, isNegative: true },
    { key: 'socialPressure', label: 'SOCIAL PRESSURE', current: sliderValues.socialPressure, isNegative: true },
    { key: 'economicStress', label: 'ECONOMIC STRESS', current: sliderValues.economicStress, isNegative: true },
    { key: 'physicalMovement', label: 'PHYSICAL MOVEMENT', current: sliderValues.physicalMovement, isNegative: false },
    { key: 'syntheticInteraction', label: 'SYNTHETIC INTERACTION', current: sliderValues.syntheticInteraction, isNegative: true },
  ];

  slidersToTest.forEach(s => {
    // If we move it in the beneficial direction by 20 points
    const step = s.isNegative ? -20 : 20;
    const testVal = Math.max(0, Math.min(100, s.current + step));

    // Skip if there's no actual change (already at boundary)
    if (testVal === s.current) return;

    // Simulate flow with new value
    const simulated = evaluateFlow(
      s.key === 'stimulation' ? testVal : sliderValues.stimulation,
      s.key === 'sleepDebt' ? testVal : sliderValues.sleepDebt,
      s.key === 'socialPressure' ? testVal : sliderValues.socialPressure,
      s.key === 'economicStress' ? testVal : sliderValues.economicStress,
      s.key === 'physicalMovement' ? testVal : sliderValues.physicalMovement,
      s.key === 'syntheticInteraction' ? testVal : sliderValues.syntheticInteraction
    );

    const deltaProb = simulated.prob - currentFlow.prob;
    const deltaSatisfied = simulated.satisfied - currentFlow.satisfied;

    const actionText = s.isNegative 
      ? `Decrease ${s.label} by 20 points` 
      : `Increase ${s.label} by 20 points`;

    optimizations.push({
      label: actionText,
      deltaProb,
      deltaSatisfied,
      key: s.key,
      direction: s.isNegative ? 'down' : 'up',
      targetVal: testVal
    });
  });

  // Sort primarily by deltaProb (flow state entry probability gain), secondarily by deltaSatisfied (conditions met)
  optimizations.sort((a, b) => {
    if (Math.abs(a.deltaProb - b.deltaProb) > 0.01) {
      return b.deltaProb - a.deltaProb;
    }
    return b.deltaSatisfied - a.deltaSatisfied;
  });

  const topOptimizations = optimizations.slice(0, 2);

  // 4. Maintenance Note
  let maintenanceNote = "This load level is survivable short-term. Sustainable performance requires scheduled recovery windows.";
  const isCabin = activeArchetype === "Recovery Cabin";
  const allWellnessAbove50 = 
    wellnessScores.attention >= 50 &&
    wellnessScores.nervous >= 50 &&
    wellnessScores.identity >= 50 &&
    wellnessScores.agency >= 50 &&
    wellnessScores.meaning >= 50;

  const isHighLoad = activeArchetype && ["Modern Student", "Corporate Burnout", "Hyperonline", "Cyberpunk Megacity"].includes(activeArchetype);

  if (primaryFailure === 'meaning') {
    maintenanceNote = "No environment prescription addresses meaning directly. Meaning is generated through engagement, not rest.";
  } else if (isCabin) {
    maintenanceNote = "This environment is sustainable indefinitely. The constraint is re-entry — returning here after high-load exposure requires deliberate transition time.";
  } else if (isHighLoad && allWellnessAbove50) {
    maintenanceNote = "This load level is survivable short-term. Sustainable performance requires scheduled recovery windows.";
  }

  // Handle Targets Application
  const handleApply = () => {
    const finalTargets: Record<string, number> = {};
    Object.entries(targets).forEach(([k, v]) => {
      if (typeof v === 'number') {
        finalTargets[k] = v;
      }
    });
    onApplyTargets(finalTargets);
    onClose();
  };

  const getSliderDisplayName = (key: string) => {
    const names: Record<string, string> = {
      stimulation: "STIMULATION LEVEL",
      sleepDebt: "SLEEP DEBT",
      socialPressure: "SOCIAL PRESSURE",
      economicStress: "ECONOMIC STRESS",
      physicalMovement: "PHYSICAL MOVEMENT",
      syntheticInteraction: "SYNTHETIC INTERACTION",
    };
    return names[key] || key.toUpperCase();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            fontFamily: 'monospace',
            padding: '20px',
            color: '#d4d4d8',
          }}
        >
          {/* CRT effect inside prescription */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            style={{
              backgroundColor: '#050505',
              border: '1px solid #1a1a1a',
              borderRadius: 0,
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '13px', letterSpacing: '0.15em', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                  ENVIRONMENTAL PRESCRIPTION
                </h2>
                <span style={{ fontSize: '8px', color: '#F5C842', border: '1px solid #c2992b', padding: '1px 5px', textTransform: 'uppercase' }}>
                  TELEMETRY OPTIMIZATION
                </span>
              </div>
              <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
                Based on session telemetry — {activeArchetype || 'Manual Configuration'}
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px dashed #1a1a1a', margin: 0 }} />

            {/* SECTION 1 - DIAGNOSIS */}
            <div>
              <SectionLabel>SECTION 1 — DIAGNOSIS</SectionLabel>
              <div style={{ fontSize: '10px', lineHeight: '1.5', color: '#888', fontStyle: 'italic' }}>
                {insight}
              </div>
            </div>

            {/* SECTION 2 - TARGET ENVIRONMENT */}
            <div>
              <SectionLabel>SECTION 2 — TARGET ENVIRONMENT</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                {Object.entries(targets).map(([key, targetVal]) => {
                  const currentVal = sliderValues[key as keyof SliderSnapshot];
                  const isString = typeof targetVal === 'string';
                  
                  let directionArrow = '→';
                  let arrowColor = '#666';
                  if (!isString) {
                    if (targetVal > currentVal) {
                      directionArrow = '▲';
                      arrowColor = '#4ade80';
                    } else if (targetVal < currentVal) {
                      directionArrow = '▼';
                      arrowColor = '#f43f5e';
                    }
                  }

                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '10px',
                        background: '#090909',
                        padding: '6px 10px',
                        border: '1px solid #141414',
                      }}
                    >
                      <span style={{ color: '#aaa', fontWeight: 'bold' }}>{getSliderDisplayName(key)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#555' }}>{currentVal}%</span>
                        <span style={{ color: '#888' }}>→</span>
                        <span style={{ color: isString ? '#8b5cf6' : '#fff', fontWeight: 'bold' }}>
                          {isString ? 'EXTERNAL' : `${Math.round(targetVal as number)}%`}
                        </span>
                        <span style={{ color: arrowColor, fontSize: '9px', width: '10px', textAlign: 'center' }}>
                          {directionArrow}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3 - FLOW STATE WINDOW */}
            <div>
              <SectionLabel>SECTION 3 — FLOW STATE WINDOW</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '10px', color: '#bbb' }}>
                  Your environment is <span style={{ color: '#F5C842', fontWeight: 'bold' }}>{flowCompatibilityPercent}%</span> compatible with flow state entry.
                </div>
                
                {topOptimizations.length > 0 && (
                  <div style={{ background: 'rgba(245, 200, 66, 0.03)', border: '1px solid rgba(245, 200, 66, 0.1)', padding: '8px 10px', marginTop: '2px' }}>
                    <div style={{ fontSize: '8px', color: '#c2992b', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 'bold' }}>
                      RECOMMENDED CORE SLIDER ADAPTATIONS FOR FLOW STATE:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {topOptimizations.map((opt, i) => (
                        <div key={i} style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px', color: '#d4d4d8' }}>
                          <span style={{ color: '#F5C842' }}>&gt;</span>
                          <span>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4 - MAINTENANCE NOTE */}
            <div>
              <SectionLabel>SECTION 4 — MAINTENANCE NOTE</SectionLabel>
              <div style={{ fontSize: '10px', lineHeight: '1.4', color: '#777' }}>
                {maintenanceNote}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#666',
                  background: 'transparent',
                  border: '1px solid #1a1a1a',
                  padding: '10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#999';
                  e.currentTarget.style.borderColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#666';
                  e.currentTarget.style.borderColor = '#1a1a1a';
                }}
              >
                DISMISS
              </button>
              
              <button
                onClick={handleApply}
                style={{
                  flex: 2,
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#000',
                  background: '#F5C842',
                  border: '1px solid #F5C842',
                  padding: '10px 0',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(245,200,66,0.15)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffd863';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(245,200,66,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F5C842';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(245,200,66,0.15)';
                }}
              >
                APPLY TARGETS
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper components
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: '8px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#444',
        paddingBottom: '4px',
        borderBottom: '1px solid #141414',
        marginBottom: '6px',
      }}
    >
      {children}
    </div>
  );
}
