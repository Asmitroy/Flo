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
  };
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
