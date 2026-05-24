import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHETYPES } from './ArchetypeEngine';

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
  onApplyTargets: (
    targets: {
      stimulation?: number;
      sleepDebt?: number;
      socialPressure?: number;
      economicStress?: number;
      physicalMovement?: number;
      syntheticInteraction?: number;
    },
    targetArchetypeId: string | null
  ) => void;
  currentNearestArchetype: string;
}

const RECOVERY_AND_FLOW_IDS = [
  "recovery-cabin",
  "meaningful-work",
  "sustainable-high-performance",
  "digital-detox",
  "athletic-recovery",
  "creative-solitude"
];

export const EnvironmentalPrescription: React.FC<EnvironmentalPrescriptionProps> = ({
  systemScores,
  sliderValues,
  activeArchetype,
  insight,
  isOpen,
  onClose,
  onApplyTargets,
  currentNearestArchetype,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("athletic-recovery");

  // Get target values for selected archetype
  const targetArch = ARCHETYPES.find(a => a.id === selectedTargetId);
  const targetTargets = targetArch ? targetArch.targets : {
    sleepDebt: 10,
    stimulation: 20,
    socialPressure: 30,
    economicStress: 25,
    physicalMovement: 90,
    syntheticInteraction: 15,
  };

  const targetProfiles = ARCHETYPES.filter(a => RECOVERY_AND_FLOW_IDS.includes(a.id));

  const getFlowProbability = (name: string): number => {
    if (name === "Athletic Recovery") return 40;
    if (name === "Sustainable High Performance") return 25;
    if (name === "Meaningful Work") return 20;
    if (name === "Creative Solitude") return 15;
    if (name === "Recovery Cabin" || name === "Digital Detox") return 5;
    return 0;
  };

  const bestFitArchetype = targetProfiles.reduce((best, arch) => {
    const flowProb = getFlowProbability(arch.name);
    if (flowProb === 0) return best;
    
    const totalDelta = Math.abs(arch.targets.stimulation - sliderValues.stimulation)
      + Math.abs(arch.targets.sleepDebt - sliderValues.sleepDebt)
      + Math.abs(arch.targets.physicalMovement - sliderValues.physicalMovement)
      + Math.abs(arch.targets.economicStress - sliderValues.economicStress)
      + Math.abs(arch.targets.socialPressure - sliderValues.socialPressure)
      + Math.abs(arch.targets.syntheticInteraction - sliderValues.syntheticInteraction);
    
    const score = flowProb / (totalDelta + 1) * 100;
    return score > best.score ? { name: arch.name, score } : best;
  }, { name: '', score: 0 });

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

  // 2. Map dimensions order and compute deltas
  const dimensionKeys = [
    'physicalMovement',
    'stimulation',
    'sleepDebt',
    'syntheticInteraction',
    'economicStress',
    'socialPressure'
  ];

  const deltas = dimensionKeys.map(key => {
    const currentVal = sliderValues[key as keyof SliderSnapshot];
    const targetVal = targetTargets[key as keyof typeof targetTargets];
    return {
      key,
      currentVal,
      targetVal,
      delta: targetVal - currentVal,
      absDelta: Math.abs(targetVal - currentVal)
    };
  });

  const totalDelta = deltas.reduce((sum, d) => sum + d.absDelta, 0);

  const shouldShowDelta = (sliderName: string, delta: number): boolean => {
    let mappedName = sliderName;
    if (sliderName === 'physicalMovement') mappedName = 'movement';
    else if (sliderName === 'economicStress') mappedName = 'economic';
    else if (sliderName === 'socialPressure') mappedName = 'social';
    else if (sliderName === 'syntheticInteraction') mappedName = 'synthetic';

    const stressors = ['stimulation', 'sleepDebt', 'economic', 'social', 'synthetic'];
    const protective = ['movement'];
    
    if (stressors.includes(mappedName) && delta > 0) return false;
    // Don't recommend increasing stressors
    if (protective.includes(mappedName) && delta < 0) return false;
    // Don't recommend decreasing protective factors
    if (Math.abs(delta) < 5) return false;
    // Don't show negligible changes
    
    return true;
  };

  const visibleDeltas = deltas.filter(d => shouldShowDelta(d.key, d.delta));
  const someFiltered = visibleDeltas.length < deltas.length;

  // 3. Maintenance Note
  let maintenanceNote = "This load level is survivable short-term. Sustainable performance requires scheduled recovery windows.";
  const isCabin = activeArchetype === "Recovery Cabin";
  const allWellnessAbove50 = 
    wellnessScores.attention >= 50 &&
    wellnessScores.nervous >= 50 &&
    wellnessScores.identity >= 50 &&
    wellnessScores.agency >= 50 &&
    wellnessScores.meaning >= 50;

  const isHighLoad = activeArchetype && ["Modern Student", "Corporate Burnout", "Hyperonline", "Cyberpunk Megacity", "Deep Flow", "Chronic Caregiver"].includes(activeArchetype);

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
    Object.entries(targetTargets).forEach(([k, v]) => {
      if (typeof v === 'number') {
        finalTargets[k] = v;
      }
    });
    onApplyTargets(finalTargets, selectedTargetId);
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

  // Render dynamic phases checklist
  const renderTransitionProtocol = () => {
    if (totalDelta < 100) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '9px', color: '#4ade80', fontWeight: 'bold', marginBottom: '2px' }}>
            SINGLE-PHASE TRANSITION. ACHIEVABLE IN 1-2 DAYS.
          </div>
          <div style={{ fontSize: '9px', color: '#a1a1aa', fontWeight: 'bold' }}>
            PHASE 1 (DAYS 1-2):
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Align all environment parameters directly.
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Target values: STIM: {targetTargets.stimulation}%, SLEEP: {targetTargets.sleepDebt}%, PHYS: {targetTargets.physicalMovement}%.
          </div>
        </div>
      );
    } else if (totalDelta >= 100 && totalDelta <= 250) {
      const sortedDeltas = [...deltas].sort((a, b) => b.absDelta - a.absDelta);
      const high1 = sortedDeltas[0];
      const high2 = sortedDeltas[1];
      const halfway1 = Math.round(high1.currentVal + high1.delta / 2);
      const halfway2 = Math.round(high2.currentVal + high2.delta / 2);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '9px', color: '#fbbf24', fontWeight: 'bold', marginBottom: '2px' }}>
            TWO-PHASE TRANSITION RECOMMENDED.
          </div>
          
          <div style={{ fontSize: '9px', color: '#a1a1aa', fontWeight: 'bold' }}>
            PHASE 1 (DAYS 1-3): ADDRESS THE 2 HIGHEST-DELTA SLIDERS HALFWAY
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Adjust {getSliderDisplayName(high1.key)}: target {halfway1}% (currently {Math.round(high1.currentVal)}%)
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Adjust {getSliderDisplayName(high2.key)}: target {halfway2}% (currently {Math.round(high2.currentVal)}%)
          </div>

          <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '4px', fontWeight: 'bold' }}>
            PHASE 2 (DAYS 4-7): COMPLETE REMAINING ADJUSTMENTS
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Adjust {getSliderDisplayName(high1.key)} to {high1.targetVal}% and {getSliderDisplayName(high2.key)} to {high2.targetVal}%
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Bring remaining parameters to target archetype values
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '9px', color: '#f87171', fontWeight: 'bold', marginBottom: '2px' }}>
            GRADUATED THREE-PHASE TRANSITION REQUIRED.
          </div>

          <div style={{ fontSize: '9px', color: '#a1a1aa', fontWeight: 'bold' }}>
            PHASE 1 (WEEK 1): SLEEP DEBT AND PHYSICAL MOVEMENT ONLY
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Prioritize sleep: target sleep debt below {targetTargets.sleepDebt}% (current: {Math.round(sliderValues.sleepDebt)}%)
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Begin movement: target physical movement above {targetTargets.physicalMovement}% (current: {Math.round(sliderValues.physicalMovement)}%)
          </div>

          <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '4px', fontWeight: 'bold' }}>
            PHASE 2 (WEEK 2): STIMULATION AND SOCIAL PRESSURE REDUCTION
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Reduce stimulation: target below {targetTargets.stimulation}% (current: {Math.round(sliderValues.stimulation)}%)
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Reduce social comparison exposure: target below {targetTargets.socialPressure}% (current: {Math.round(sliderValues.socialPressure)}%)
          </div>

          <div style={{ fontSize: '9px', color: '#a1a1aa', marginTop: '4px', fontWeight: 'bold' }}>
            PHASE 3 (WEEK 3): FINE-TUNE REMAINING VARIABLES
          </div>
          <div style={{ fontSize: '9px', color: '#71717a', paddingLeft: '8px' }}>
            &gt; Adjust synthetic interaction to {targetTargets.syntheticInteraction}% and economic stress to {targetTargets.economicStress}%
          </div>
        </div>
      );
    }
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
              maxHeight: '90vh',
              overflowY: 'auto'
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
              <SectionLabel>01 — DIAGNOSIS</SectionLabel>
              <div style={{ fontSize: '10px', lineHeight: '1.5', color: '#888', fontStyle: 'italic' }}>
                {insight}
              </div>
            </div>

            {/* SECTION 2 — TRANSITION TARGET */}
            <div>
              <SectionLabel>02 — TRANSITION TARGET</SectionLabel>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
                You are currently operating closest to: <span style={{ color: '#fff', fontWeight: 'bold' }}>{currentNearestArchetype || "Manual"}</span>
              </div>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '6px', letterSpacing: '0.05em' }}>
                SELECT A TARGET PROFILE:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '4px' }}>
                {targetProfiles.map((arch) => {
                  const isSelected = selectedTargetId === arch.id;
                  const isBestFit = arch.name === bestFitArchetype.name;
                  return (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedTargetId(arch.id)}
                      style={{
                        padding: '6px 4px',
                        background: isSelected ? 'rgba(245, 200, 66, 0.08)' : '#070707',
                        border: isSelected ? '1px solid #F5C842' : '1px solid #1a1a1a',
                        color: isSelected ? '#F5C842' : '#888',
                        fontFamily: 'monospace',
                        fontSize: '9px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                      title={arch.summary}
                    >
                      <span style={{ fontWeight: isSelected ? 'bold' : 'normal', textTransform: 'uppercase', fontSize: '8px' }}>
                        {arch.name}
                      </span>
                      {isBestFit && (
                        <span style={{ 
                          fontSize: '7px', 
                          color: isSelected ? '#fff' : '#c2992b',
                          background: isSelected ? '#c2992b' : 'rgba(245,200,66,0.05)',
                          padding: '0px 3px', 
                          borderRadius: '1px', 
                          fontWeight: 'bold',
                          marginTop: '2px'
                        }}>
                          BEST FIT FOR YOU
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3 - TARGET ENVIRONMENT */}
            <div>
              <SectionLabel>03 — TARGET ENVIRONMENT</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                {visibleDeltas.map(({ key, currentVal, targetVal, delta }) => {
                  let directionArrow = ' ';
                  let arrowColor = '#666';
                  let deltaText = '';
                  
                  if (delta > 0) {
                    directionArrow = '▲';
                    arrowColor = '#4ade80';
                    deltaText = `+${Math.round(delta)}`;
                  } else if (delta < 0) {
                    directionArrow = '▼';
                    arrowColor = '#f43f5e';
                    deltaText = `${Math.round(delta)}`;
                  } else {
                    directionArrow = '=';
                    arrowColor = '#666';
                    deltaText = '0';
                  }

                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '9px',
                        background: '#090909',
                        padding: '5px 8px',
                        border: '1px solid #141414',
                      }}
                    >
                      <span style={{ color: '#aaa', fontWeight: 'bold' }}>{getSliderDisplayName(key)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#555', width: '28px', textAlign: 'right' }}>{Math.round(currentVal)}%</span>
                        <span style={{ color: '#888' }}>→</span>
                        <span style={{ color: '#fff', fontWeight: 'bold', width: '28px', textAlign: 'left' }}>
                          {Math.round(targetVal)}%
                        </span>
                        <span style={{ 
                          color: arrowColor, 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          width: '45px', 
                          textAlign: 'right',
                          fontFamily: 'monospace'
                        }}>
                          {directionArrow} {deltaText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {someFiltered && (
                <div style={{ fontSize: '9px', color: '#71717a', fontStyle: 'italic', marginTop: '6px', textAlign: 'left' }}>
                  Minor adjustments omitted. Focus on the changes above.
                </div>
              )}
            </div>

            {/* SECTION 4 - TRANSITION PROTOCOL */}
            <div>
              <SectionLabel>04 — TRANSITION PROTOCOL</SectionLabel>
              <div style={{ background: '#070707', border: '1px solid #141414', padding: '10px', marginTop: '2px' }}>
                {renderTransitionProtocol()}
              </div>
            </div>

            {/* SECTION 5 - MAINTENANCE NOTE */}
            <div>
              <SectionLabel>05 — MAINTENANCE NOTE</SectionLabel>
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
