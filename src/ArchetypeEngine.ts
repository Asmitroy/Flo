export interface Archetype {
  name: string;
  id: string;
  summary: string;
  targets: {
    sleepDebt: number;
    stimulation: number;
    socialPressure: number;
    economicStress: number;
    physicalMovement: number;
    syntheticInteraction: number;
    natureExposure: number;
    purposeClarity: number;
  };
  sustainabilityHours?: number | null;
}

export const ARCHETYPES: Archetype[] = [
  {
    name: "Modern Student",
    id: "modern-student",
    summary: "High stimulation. Low sleep. Unstable identity.",
    targets: {
      sleepDebt: 75,
      stimulation: 85,
      socialPressure: 70,
      economicStress: 60,
      physicalMovement: 20,
      syntheticInteraction: 60,
      natureExposure: 10,
      purposeClarity: 45
    },
    sustainabilityHours: null
  },
  {
    name: "Corporate Burnout",
    id: "corporate-burnout",
    summary: "Chronic exhaustion. Dwindling focus. High stress.",
    targets: {
      sleepDebt: 65,
      stimulation: 55,
      socialPressure: 80,
      economicStress: 75,
      physicalMovement: 15,
      syntheticInteraction: 40,
      natureExposure: 15,
      purposeClarity: 65
    },
    sustainabilityHours: null
  },
  {
    name: "Hyperonline",
    id: "hyperonline",
    summary: "Extreme screen time. Brain fog. Sensory overflow.",
    targets: {
      sleepDebt: 50,
      stimulation: 95,
      socialPressure: 85,
      economicStress: 30,
      physicalMovement: 10,
      syntheticInteraction: 85,
      natureExposure: 5,
      purposeClarity: 20
    },
    sustainabilityHours: null
  },
  {
    name: "Cyberpunk Megacity",
    id: "cyberpunk-megacity",
    summary: "Maximum stimulation. Total neural load. Overload.",
    targets: {
      sleepDebt: 80,
      stimulation: 100,
      socialPressure: 90,
      economicStress: 90,
      physicalMovement: 5,
      syntheticInteraction: 90,
      natureExposure: 0,
      purposeClarity: 40
    },
    sustainabilityHours: null
  },
  {
    name: "Deep Flow",
    id: "deep-flow",
    summary: "High cognitive load. Peak output window. Finite.",
    targets: {
      sleepDebt: 15,
      stimulation: 55,
      socialPressure: 20,
      economicStress: 25,
      physicalMovement: 75,
      syntheticInteraction: 15,
      natureExposure: 25,
      purposeClarity: 90
    },
    sustainabilityHours: 2
  },
  {
    name: "Chronic Caregiver",
    id: "chronic-caregiver",
    summary: "Sustained emotional labour. Self-deprioritized.",
    targets: {
      sleepDebt: 70,
      stimulation: 45,
      socialPressure: 85,
      economicStress: 65,
      physicalMovement: 20,
      syntheticInteraction: 60,
      natureExposure: 30,
      purposeClarity: 60
    },
    sustainabilityHours: null
  },
  {
    name: "Recovery Cabin",
    id: "recovery-cabin",
    summary: "Restful environment. High physical movement.",
    targets: {
      sleepDebt: 10,
      stimulation: 5,
      socialPressure: 10,
      economicStress: 15,
      physicalMovement: 80,
      syntheticInteraction: 10,
      natureExposure: 85,
      purposeClarity: 30
    },
    sustainabilityHours: null
  },
  {
    name: "Meaningful Work",
    id: "meaningful-work",
    summary: "Productive engagement. Solid existential balance.",
    targets: {
      sleepDebt: 25,
      stimulation: 40,
      socialPressure: 30,
      economicStress: 35,
      physicalMovement: 55,
      syntheticInteraction: 25,
      natureExposure: 35,
      purposeClarity: 80
    },
    sustainabilityHours: null
  },
  {
    name: "Sustainable High Performance",
    id: "sustainable-high-performance",
    summary: "Moderate load, structured recovery. Long-term viable. Peak output without burnout trajectory.",
    targets: {
      sleepDebt: 20,
      stimulation: 50,
      socialPressure: 35,
      economicStress: 40,
      physicalMovement: 60,
      syntheticInteraction: 25,
      natureExposure: 40,
      purposeClarity: 75
    },
    sustainabilityHours: null
  },
  {
    name: "Digital Detox",
    id: "digital-detox",
    summary: "Intentional disconnection. Attention rebuilding.",
    targets: {
      sleepDebt: 15,
      stimulation: 8,
      socialPressure: 25,
      economicStress: 30,
      physicalMovement: 50,
      syntheticInteraction: 5,
      natureExposure: 70,
      purposeClarity: 50
    },
    sustainabilityHours: null
  },
  {
    name: "Athletic Recovery",
    id: "athletic-recovery",
    summary: "Physical load as cognitive medicine.",
    targets: {
      sleepDebt: 10,
      stimulation: 20,
      socialPressure: 30,
      economicStress: 25,
      physicalMovement: 90,
      syntheticInteraction: 15,
      natureExposure: 60,
      purposeClarity: 55
    },
    sustainabilityHours: null
  },
  {
    name: "Creative Solitude",
    id: "creative-solitude",
    summary: "Low noise. Internal signal. Slow output.",
    targets: {
      sleepDebt: 20,
      stimulation: 30,
      socialPressure: 15,
      economicStress: 35,
      physicalMovement: 40,
      syntheticInteraction: 10,
      natureExposure: 50,
      purposeClarity: 60
    },
    sustainabilityHours: null
  }
];

let globalSelectArchetype: ((id: string) => void) | null = null;

export function registerSelectArchetype(fn: ((id: string) => void) | null) {
  globalSelectArchetype = fn;
}

export function setArchetype(name: string) {
  const query = name.toLowerCase().trim();
  const found = ARCHETYPES.find(
    a => a.name.toLowerCase() === query || a.id.toLowerCase() === query
  );
  if (found && globalSelectArchetype) {
    globalSelectArchetype(found.id);
  } else if (!globalSelectArchetype) {
    console.warn("ArchetypeSelector is not mounted.");
  } else {
    console.warn(`Archetype "${name}" not found.`);
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { setArchetype: typeof setArchetype }).setArchetype = setArchetype;
}
