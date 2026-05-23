import React, { useState, useEffect, useRef } from 'react';
import { ARCHETYPES } from './ArchetypeEngine';

interface OnboardingQuestionnaireProps {
  onComplete: (values: {
    sleepDebt: number;
    stimulationLevel: number;
    socialPressure: number;
    economicStress: number;
    physicalMovement: number;
    syntheticInteraction: number;
  }) => void;
}

export const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [sleepInput, setSleepInput] = useState<string>('');
  const [screenTimeInput, setScreenTimeInput] = useState<string>('');
  const [financialRating, setFinancialRating] = useState<number | null>(null);
  const [movementRating, setMovementRating] = useState<number | null>(null);
  const [comparisonRating, setComparisonRating] = useState<number | null>(null);
  
  // Terminal logs state for the final processing screen
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [logsComplete, setLogsComplete] = useState<boolean>(false);
  
  // Typewriter text state
  const [displayedPrompt, setDisplayedPrompt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const prompts = [
    "How many hours did you sleep last night? (0-12):",
    "Estimate your screen time yesterday (hours) (0-16):",
    "Rate financial stress this month (1-5):",
    "How much did you move your body today? (1=none, 5=a lot) (1-5):",
    "How much social comparison did you experience today? (1-5):"
  ];

  // Auto-focus text input on step change
  useEffect(() => {
    if (currentStep < 2 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  // Typewriter effect for prompts
  useEffect(() => {
    if (currentStep < 5) {
      let isCancelled = false;
      const targetText = prompts[currentStep];
      setDisplayedPrompt('');
      setErrorMsg('');
      let index = 0;
      
      const interval = setInterval(() => {
        if (!isCancelled) {
          setDisplayedPrompt(prev => prev + targetText.charAt(index));
          index++;
          if (index >= targetText.length) {
            clearInterval(interval);
          }
        }
      }, 20);

      return () => {
        isCancelled = true;
        clearInterval(interval);
      };
    }
  }, [currentStep]);

  // Handle number rating selections for Q3, Q4, Q5
  const selectRating = (val: number) => {
    setErrorMsg('');
    if (currentStep === 2) {
      setFinancialRating(val);
      setTimeout(() => setCurrentStep(3), 200);
    } else if (currentStep === 3) {
      setMovementRating(val);
      setTimeout(() => setCurrentStep(4), 200);
    } else if (currentStep === 4) {
      setComparisonRating(val);
      // Proceed to processing logs
      processOnboarding(sleepInput, screenTimeInput, financialRating!, movementRating!, val);
    }
  };

  // Keyboard navigation for selector questions
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentStep >= 2 && currentStep <= 4) {
        if (e.key >= '1' && e.key <= '5') {
          selectRating(parseInt(e.key));
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, sleepInput, screenTimeInput, financialRating, movementRating]);

  // Handle number input submissions for Q1 and Q2
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentStep === 0) {
      const hours = parseFloat(sleepInput);
      if (isNaN(hours) || hours < 0 || hours > 12) {
        setErrorMsg("[err] sleep_hours must be a number between 0 and 12.");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      const hours = parseFloat(screenTimeInput);
      if (isNaN(hours) || hours < 0 || hours > 16) {
        setErrorMsg("[err] screen_time must be a number between 0 and 16.");
        return;
      }
      setCurrentStep(2);
    }
  };

  // Calculate scores and nearest archetype, then trigger initialized animation
  const processOnboarding = (
    sleepHrs: string, 
    screenHrs: string, 
    finVal: number, 
    moveVal: number, 
    compVal: number
  ) => {
    setCurrentStep(5); // Show log animation state
    
    const sleepHours = parseFloat(sleepHrs);
    const screenHours = parseFloat(screenHrs);
    
    // Mappings
    const sleepDebt = Math.max(0, Math.min(100, (8 - sleepHours) * 12.5));
    const stimulationLevel = Math.min(100, screenHours * 7);
    const economicStress = (finVal - 1) * 25;
    const physicalMovement = (moveVal - 1) * 25;
    const syntheticInteraction = (compVal - 1) * 25;
    const socialPressure = (compVal - 1) * 25;

    // Euclidean match
    let bestMatch = ARCHETYPES[0];
    let minD = Infinity;
    ARCHETYPES.forEach(arc => {
      const dist = Math.sqrt(
        Math.pow(arc.targets.sleepDebt - sleepDebt, 2) +
        Math.pow(arc.targets.stimulation - stimulationLevel, 2) +
        Math.pow(arc.targets.socialPressure - socialPressure, 2) +
        Math.pow(arc.targets.economicStress - economicStress, 2) +
        Math.pow(arc.targets.physicalMovement - physicalMovement, 2) +
        Math.pow(arc.targets.syntheticInteraction - syntheticInteraction, 2)
      );
      if (dist < minD) {
        minD = dist;
        bestMatch = arc;
      }
    });
    // Boot terminal log output animation
    const logs = [
      "> INITIATING COGNITIVE PROFILING PROTOCOL...",
      "> EXTRAPOLATING NEURAL DRIFT CONSTANTS...",
      `> sleepDebt mapped to: ${Math.round(sleepDebt)}%`,
      `> stimulationLevel mapped to: ${Math.round(stimulationLevel)}%`,
      `> economicStress mapped to: ${Math.round(economicStress)}%`,
      `> physicalMovement mapped to: ${Math.round(physicalMovement)}%`,
      `> syntheticInteraction mapped to: ${Math.round(syntheticInteraction)}%`,
      `> socialPressure mapped to: ${Math.round(socialPressure)}%`,
      `> CALCULATING NEAREST SYSTEM CONFIGURATION PATTERNS...`,
      `> [SUCCESS] NEURAL ARCHETYPE CORRELATION FOUND.`,
      `> Subject archetype profile: [${bestMatch.name.toUpperCase()}]`,
      `> -----------------------------------------------------`,
      `> SUBJECT PROFILE INITIALIZED`,
      `> You are currently operating in: [${bestMatch.name}]`,
      `> -----------------------------------------------------`
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      setTerminalLogs(prev => [...prev, logs[logIndex]]);
      logIndex++;
      if (logIndex >= logs.length) {
        clearInterval(logInterval);
        setLogsComplete(true);
      }
    }, 150);
  };

  const handleFinish = () => {
    const sleepHours = parseFloat(sleepInput);
    const screenHours = parseFloat(screenTimeInput);
    
    const sleepDebt = Math.max(0, Math.min(100, (8 - sleepHours) * 12.5));
    const stimulationLevel = Math.min(100, screenHours * 7);
    const economicStress = (financialRating! - 1) * 25;
    const physicalMovement = (movementRating! - 1) * 25;
    const syntheticInteraction = (comparisonRating! - 1) * 25;
    const socialPressure = (comparisonRating! - 1) * 25;

    localStorage.setItem('snm_onboarded', 'true');
    localStorage.setItem('snm_profile', JSON.stringify({
      sleepDebt,
      stimulationLevel,
      economicStress,
      physicalMovement,
      syntheticInteraction,
      socialPressure,
      timestamp: Date.now()
    }));
    onComplete({
      sleepDebt,
      stimulationLevel,
      socialPressure,
      economicStress,
      physicalMovement,
      syntheticInteraction
    });
  };

  // Allow clicking Enter to complete when logs are done
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (currentStep === 5 && logsComplete && e.key === 'Enter') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [currentStep, logsComplete, sleepInput, screenTimeInput, financialRating, movementRating, comparisonRating]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 font-mono text-[#00ff66] select-none select-text overflow-hidden">
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,30,10,0.15)_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40 animate-pulse" />
      
      <div className="w-full max-w-2xl border border-[#00aa44]/55 bg-black/85 p-8 relative shadow-[0_0_30px_rgba(0,255,100,0.07)]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#00aa44]/40 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 bg-[#00ff66] rounded-full animate-ping" />
            <span className="text-[11px] font-bold tracking-widest text-[#00dd55]">SYSTEM NEURAL MONITOR // ONBOARDING</span>
          </div>
          <span className="text-[9px] text-[#008833] border border-[#008833] px-1.5 py-0.5 rounded uppercase">
            SECURE_COMMS
          </span>
        </div>

        {/* Questionnaire Flow */}
        {currentStep < 5 ? (
          <div className="space-y-6">
            <div className="min-h-[60px] text-zinc-350 leading-relaxed text-sm">
              <span className="text-white mr-2">&gt;</span>
              <span>{displayedPrompt}</span>
              <span className="inline-block w-1.5 h-4 bg-[#00ff66] ml-0.5 animate-[blink_1s_steps(2)_infinite]" />
            </div>

            {/* Answer inputs based on step type */}
            {currentStep < 2 ? (
              <form onSubmit={handleInputSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 border-b border-[#006622]/40 pb-1 w-64">
                  <span className="text-zinc-600 text-xs">$ enter value:</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentStep === 0 ? sleepInput : screenTimeInput}
                    onChange={(e) => currentStep === 0 ? setSleepInput(e.target.value) : setScreenTimeInput(e.target.value)}
                    className="bg-transparent border-none outline-none text-[#00ff66] font-mono text-sm w-full focus:ring-0 p-0"
                    placeholder="--"
                    autoComplete="off"
                  />
                </div>
                <div className="text-[10px] text-zinc-500">
                  Press [ENTER] to confirm target coefficient.
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => selectRating(val)}
                      className="border border-[#00aa44]/40 hover:border-[#00ff66] hover:bg-[#002208]/40 hover:shadow-[0_0_8px_rgba(0,255,100,0.15)] text-[#00dd55] hover:text-white px-4 py-2 text-xs font-bold transition-all duration-150 rounded bg-zinc-950/40 w-12 text-center"
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Select key [1-5] on your keyboard or click a selector node.
                </div>
              </div>
            )}

            {/* Validation warning */}
            {errorMsg && (
              <div className="text-xs text-rose-500 border border-rose-950/60 bg-rose-950/10 p-2 rounded animate-pulse mt-4">
                {errorMsg}
              </div>
            )}
          </div>
        ) : (
          /* Logs Screen */
          <div className="space-y-6">
            <div className="space-y-1 h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#005522] pr-2 text-xs text-[#00dd55]/90 font-mono">
              {terminalLogs.map((log, i) => (
                <div key={i} className={log.startsWith("> [SUCCESS]") ? "text-yellow-400 font-bold" : log.includes("SUBJECT PROFILE INITIALIZED") ? "text-white font-extrabold text-sm py-1" : ""}>
                  {log}
                </div>
              ))}
              {!logsComplete && (
                <div className="flex items-center space-x-1">
                  <span>&gt; processing</span>
                  <span className="animate-pulse">...</span>
                </div>
              )}
            </div>

            {logsComplete && (
              <div className="pt-4 border-t border-[#00aa44]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-[10px] text-zinc-500 max-w-sm">
                  Neural baseline profile has been generated. Press ENTER to connect your neural sensors.
                </div>
                <button
                  onClick={handleFinish}
                  className="bg-[#00993d] hover:bg-[#00ff66] text-black font-bold uppercase tracking-widest text-xs px-6 py-3 transition-all duration-200 border border-[#00ff66] shadow-[0_0_15px_rgba(0,255,100,0.25)] hover:scale-105 active:scale-95"
                >
                  Synchronize Monitor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
