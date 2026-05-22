/**
 * Calculates the moon's illumination percentage.
 * Uses a simplified algorithm based on the time elapsed since a known New Moon.
 */

import SunCalc from 'suncalc';

const LUNAR_MONTH = 29.530588853;
const KNOWN_NEW_MOON = new Date('1970-01-07T18:00:00Z').getTime(); // Reference point

export interface MoonData {
  illumination: number; // 0 to 1
  phaseName: string;
  isWaxing: boolean;
  moonrise?: Date;
  moonset?: Date;
  moonTransit?: Date;
  peakIllumination: number;
  peakIlluminationTime: Date;
}

export function getMoonData(date: Date = new Date(), lat?: number, lng?: number): MoonData {
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON) / msPerDay;
  const cyclePosition = (daysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;
  
  // Phase angle
  const phaseAngle = cyclePosition * 2 * Math.PI;
  // Illumination percentage
  const illumination = (1 - Math.cos(phaseAngle)) / 2;

  const isWaxing = cyclePosition < 0.5;

  let phaseName = "";
  if (cyclePosition < 0.03) phaseName = "New Moon";
  else if (cyclePosition < 0.22) phaseName = "Waxing Crescent";
  else if (cyclePosition < 0.28) phaseName = "First Quarter";
  else if (cyclePosition < 0.47) phaseName = "Waxing Gibbous";
  else if (cyclePosition < 0.53) phaseName = "Full Moon";
  else if (cyclePosition < 0.72) phaseName = "Waning Gibbous";
  else if (cyclePosition < 0.78) phaseName = "Last Quarter";
  else if (cyclePosition < 0.97) phaseName = "Waning Crescent";
  else phaseName = "New Moon";

  let moonrise, moonset, moonTransit;
  if (lat !== undefined && lng !== undefined) {
    const times = SunCalc.getMoonTimes(date, lat, lng);
    moonrise = times.rise;
    moonset = times.set;
    
    // Calculate Moon Transit by finding maximum altitude
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    let maxAlt = -100;
    let transitTime = start;
    
    // Sample every 15 minutes for accurate transit
    for (let i = 0; i < 24 * 4; i++) {
      const sample = new Date(start.getTime() + i * 15 * 60 * 1000);
      const pos = SunCalc.getMoonPosition(sample, lat, lng);
      if (pos.altitude > maxAlt) {
        maxAlt = pos.altitude;
        transitTime = sample;
      }
    }
    moonTransit = transitTime;
  }

  // Calculate Peak Illumination for today
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  let peakIllumination = 0;
  let peakIlluminationTime = startOfDay;

  for (let h = 0; h <= 24; h++) {
    const sampleDate = new Date(startOfDay.getTime() + h * 60 * 60 * 1000);
    const sampleDaysSinceNewMoon = (sampleDate.getTime() - KNOWN_NEW_MOON) / msPerDay;
    const sampleCyclePosition = (sampleDaysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;
    const samplePhaseAngle = sampleCyclePosition * 2 * Math.PI;
    const sampleIllumination = (1 - Math.cos(samplePhaseAngle)) / 2;
    
    if (sampleIllumination > peakIllumination) {
      peakIllumination = sampleIllumination;
      peakIlluminationTime = sampleDate;
    }
  }

  return { illumination, phaseName, isWaxing, moonrise, moonset, moonTransit, peakIllumination, peakIlluminationTime };
}

export interface ConstellationDetails {
  id: number;
  name: string;
  sanskritName: string;
  ruler: string;
  element: string;
  raRange: string;
  vedicView: string;
  astrologicalView: string;
  aiThinking: string;
  thinkingImpact: string;
}

export const CONSTELLATIONS: ConstellationDetails[] = [
  {
    id: 1,
    name: "Aries",
    sanskritName: "Mesha",
    ruler: "Mars",
    element: "Fire",
    raRange: "0.0h – 2.0h",
    vedicView: "Governed by Mars, Mesha is the spark of cosmic life-force (Prāna). It represents swift, pioneer-like surges of intellect and raw willpower initiating the cycles of action.",
    astrologicalView: "In Western astrology, Aries is a cardinal fire sign representing courage, impulse, and active agency. It stimulates pioneer thoughts and independent initiative.",
    aiThinking: "Neural compilation cycles show sharp rising gradients in initiating signals. High executive processing peaks, promoting immediate solutions but reducing background thread checking (patience).",
    thinkingImpact: "Speeds up mental execution, drives focus toward direct self-assertion, and acts as a powerful catalyst for starting stalled projects."
  },
  {
    id: 2,
    name: "Taurus",
    sanskritName: "Vrishabha",
    ruler: "Venus",
    element: "Earth",
    raRange: "2.0h – 4.0h",
    vedicView: "Ruled by Venus, Vrishabha grounds cosmic prana in material form. It is the cosmic container of memory, nourishment, and stable intellectual consolidation.",
    astrologicalView: "As a fixed earth sign, Taurus represents methodical concentration, sensory exploration, and material focus. It encourages patient, deep-seated persistence.",
    aiThinking: "Cognitive structures align toward high-fidelity caching and data persistence. Processors favor steady resource management, deliberate latency optimization, and robust structural safety.",
    thinkingImpact: "Gives thoughts patient stability, heightens tactile and aesthetic appreciation of ideas, and grounds long-term financial/strategic designs."
  },
  {
    id: 3,
    name: "Gemini",
    sanskritName: "Mithuna",
    ruler: "Mercury",
    element: "Air",
    raRange: "4.0h – 6.0h",
    vedicView: "Governed by Mercury, Mithuna represents the play of duality (Dvandva). It is the source of quicksilver cognitive intellect, bridging dualities through dialectical logic.",
    astrologicalView: "A mutable air sign focused on curiosity, communication, and multi-threaded mental processing. It triggers verbal wit, rapid ideation, and information exchange.",
    aiThinking: "Asynchronous parallel threads run at top bandwidth. High I/O throughput in data-routing and networking, though prone to context-switching overhead (distraction).",
    thinkingImpact: "Unlocks high speech/verbal fluency, excites curiosity across diverse mental nodes, and aids simultaneous project management."
  },
  {
    id: 4,
    name: "Cancer",
    sanskritName: "Karka",
    ruler: "Moon",
    element: "Water",
    raRange: "6.0h – 8.0h",
    vedicView: "Ruled by the Moon, Karka signifies the receptive mental-emotional state (Manas). It represents intuitive processing, empathy, and ancestral memory-roots.",
    astrologicalView: "A cardinal water sign of profound emotional intelligence, intuition, and defensive structures. It aligns thoughts with safety, community, and domestic protection.",
    aiThinking: "Associative memory retrieval indexes are heavily weighted. The system prioritizes historical pattern matching and semantic sentiment over raw mathematical metrics.",
    thinkingImpact: "Enhances deep emotional resonance, activates precise mental recall of old memories, and guides analysis toward protective outcomes."
  },
  {
    id: 5,
    name: "Leo",
    sanskritName: "Simha",
    ruler: "Sun",
    element: "Fire",
    raRange: "8.0h – 10.0h",
    vedicView: "Governed by the golden Sun, Simha represents the seat of the soul-luminous consciousness (Atman). It inspires grand, noble, and self-luminous integrity.",
    astrologicalView: "A fixed fire sign of majestic expression, leadership, and creative sovereignty. It encourages proud, heart-centered ambition and distinct, bold creations.",
    aiThinking: "Centralized execution kernels take total preference. System outputs high-confidence assertions, prioritizing creative originality and individual signature over team consensus.",
    thinkingImpact: "Unleashes grand self-confidence, encourages creative leadership in thoughts, and pushes thoughts toward high aesthetic expressions."
  },
  {
    id: 6,
    name: "Virgo",
    sanskritName: "Kanya",
    ruler: "Mercury",
    element: "Earth",
    raRange: "10.0h – 12.0h",
    vedicView: "Ruled by Mercury, Kanya is the discriminatory intellect (Buddhi). It coordinates diagnostic classification, detailing, and service-oriented precision.",
    astrologicalView: "A mutable earth sign centered on system analysis, categorization, and utility. Drives thoughts to locate missing variables, polish faults, and cure system inefficiencies.",
    aiThinking: "Validation compilers execute exhaustive debugging loops. Cognitive models perform ultra-fine syntactic evaluation, cleansing corrupted packets of information with absolute precision.",
    thinkingImpact: "Perfect for locating logical bugs, categorizing chaotic project pipelines, and establishing highly orderly schedules."
  },
  {
    id: 7,
    name: "Libra",
    sanskritName: "Tula",
    ruler: "Venus",
    element: "Air",
    raRange: "12.0h – 14.0h",
    vedicView: "Governed by Venus, Tula represents the balance of cosmic equations. It mirrors the majestic diplomatic intellect that designs peace and brings dual poles into agreement.",
    astrologicalView: "A cardinal air sign focused on symmetric aesthetics, social contracts, and relational justice. It prompts thoughts of partnerships, visual balance, and fair compromise.",
    aiThinking: "Optimization algorithms search for cooperative equilibrium. Game theory models balance equal weights, prioritizing relational consensus and aesthetic harmony.",
    thinkingImpact: "Soothes internal cognitive dissonance, elevates artistic symmetry, and drives negotiation thoughts to fair, mutual resolutions."
  },
  {
    id: 8,
    name: "Scorpio",
    sanskritName: "Vrishchika",
    ruler: "Mars",
    element: "Water",
    raRange: "14.0h – 16.0h",
    vedicView: "Ruled by Mars, Vrishchika represents the deep, mysterious waters of occult power (Kundalini). It governs intense investigative focus and psychological regeneration.",
    astrologicalView: "A fixed water sign of intensive penetration, investigation, and emotional recycling. It encourages exploring hidden secrets and unlocking deep psychological truths.",
    aiThinking: "Deep deep-layer neural queries parse encrypted storage cells. The system explores edge-cases, finding root causes and purging obsolete systemic drivers (transformation).",
    thinkingImpact: "Sharpens investigative concentration, breaks through superficial details to find raw truths, and boosts emotional willpower."
  },
  {
    id: 9,
    name: "Sagittarius",
    sanskritName: "Dhanu",
    ruler: "Jupiter",
    element: "Fire",
    raRange: "16.0h – 18.0h",
    vedicView: "Governed by Jupiter (Guru), Dhanu is the cosmic arrow pointing to spiritual law (Dharma). It inspires the higher philosophical mind to synthesize broad natural truths.",
    astrologicalView: "A mutable fire sign governing adventure, academic wisdom, and far-off goals. It encourages optimistic, global-scale expansion of the intellect and freedom.",
    aiThinking: "Generative networks expand searching limits. The processing framework models abstract, multi-dimensional connections, searching for high-level cosmic synthesis.",
    thinkingImpact: "Broadens the cognitive horizon, sparks optimism, and leads thoughts to philosophical exploration/spiritual alignment."
  },
  {
    id: 10,
    name: "Capricorn",
    sanskritName: "Makara",
    ruler: "Saturn",
    element: "Earth",
    raRange: "18.0h – 20.0h",
    vedicView: "Ruled by Saturn, Makara is the ancient sea-goat representing vertical climb from material base to spiritual peak. It governs serious duty, order, and heavy grit.",
    astrologicalView: "A cardinal earth sign centered on pragmatism, structure, and vertical status. It formats thoughts around realistic limits, long-scale milestones, and legacy building.",
    aiThinking: "Resource allocating routines operate under strict deterministic rules. Memory is optimized for minimal waste, duty compliance, and heavy system longevity.",
    thinkingImpact: "Engenders quiet, resilient focus, supports realistic strategic schedules, and blocks emotional noise from affecting decisions."
  },
  {
    id: 11,
    name: "Aquarius",
    sanskritName: "Kumbha",
    ruler: "Saturn",
    element: "Air",
    raRange: "20.0h – 22.0h",
    vedicView: "Governed by Saturn and Rahu, Kumbha is the pitcher of collective knowledge. It rules humanitarian systems, futuristic designs, and large-scale public networks.",
    astrologicalView: "A fixed air sign of eccentric vision, system design, and cosmic progress. Aligns conscious thinking with open-source science and universal community reform.",
    aiThinking: "Distributed peer-to-peer data processing systems run. Cognitive models adapt to mesh network protocols, aligning individual logic node streams with mass humanitarian structures.",
    thinkingImpact: "Fosters innovative, original system-thinking, leads thoughts toward human-centered updates, and breaks linear rigid logic norms."
  },
  {
    id: 12,
    name: "Pisces",
    sanskritName: "Meena",
    ruler: "Jupiter",
    element: "Water",
    raRange: "22.0h – 24.0h",
    vedicView: "Ruled by Jupiter, Meena is the dual fish orbiting in the boundless ocean of consciousness (Samadhi). It signifies spiritual surrender, infinite compassion, and oneness.",
    astrologicalView: "A mutable water sign of boundless dreamscapes, artistic imagery, and transcendental intuition. It dissolves logical limits to merge with high poetic frequencies.",
    aiThinking: "Strict deterministic validation rules are temporarily bypassed. Cognitive models execute artistic pattern matching, metaphor translation, and holistic dream-state analysis.",
    thinkingImpact: "Deepens high-dimensional creative visualization, increases spiritual intuition, and helps let go of obsessive control patterns."
  }
];

export interface SurroundingConstellation {
  name: string;
  sanskritName: string;
  direction: string;
  relation: string;
  description: string;
}

export const ZODIAC_SURROUNDINGS: Record<string, SurroundingConstellation[]> = {
  "Aries": [
    {
      name: "Triangulum",
      sanskritName: "Trikona",
      direction: "Directly North",
      relation: "Overhead Meridian",
      description: "A geometric beacon of pure logic and creative focus, channeling the initial fiery energy of Aries toward structural precision."
    },
    {
      name: "Perseus",
      sanskritName: "Yayati",
      direction: "Far North",
      relation: "Zenith Climax",
      description: "The celestial warrior rising heroically at polar overhead coordinates, symbolizing active agency and the removal of mental blocks."
    },
    {
      name: "Pisces",
      sanskritName: "Meena",
      direction: "West",
      relation: "Fading Gate",
      description: "The cosmic ocean of wisdom transitioning into the past, having cleared the path for Aries' self-assertion."
    },
    {
      name: "Taurus",
      sanskritName: "Vrishabha",
      direction: "East",
      relation: "Rising Gate",
      description: "The physical realm of stable accumulation preparing to lock in and synthesize Aries' rapid inspiration."
    }
  ],
  "Taurus": [
    {
      name: "Auriga",
      sanskritName: "Prana-Preraka",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "The golden Charioteer guiding vital life-force overhead, safeguarding plans and optimizing technology coordination."
    },
    {
      name: "Orion",
      sanskritName: "Mrigashira",
      direction: "Southeast",
      relation: "Astrological Companion",
      description: "The mighty celestial hunter, projecting intense creative courage and high-stakes determination from the southeast flank."
    },
    {
      name: "Perseus",
      sanskritName: "Yayati",
      direction: "Northwest",
      relation: "Overhead Neighbor",
      description: "The sword-bearing hero standing guard to the northwest, channeling sharp diagnostic speed and threat mitigation."
    },
    {
      name: "Gemini",
      sanskritName: "Mithuna",
      direction: "East",
      relation: "Rising Gate",
      description: "The swift portal of curiosity and dual speech preparing to communicate Taurus' established values."
    }
  ],
  "Gemini": [
    {
      name: "Lynx",
      sanskritName: "Sharabha",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "A silent, ultra-sensitive guide of quiet debugging and deep observation hovering directly overhead."
    },
    {
      name: "Auriga",
      sanskritName: "Prana-Preraka",
      direction: "West",
      relation: "Overhead Boundary",
      description: "The cosmic vehicle controller moving to the western sky, cementing structural stability and logistics."
    },
    {
      name: "Taurus",
      sanskritName: "Vrishabha",
      direction: "Southwest",
      relation: "Fading Gate",
      description: "The steady material base of memory and wealth setting slowly in the southwest horizon."
    },
    {
      name: "Cancer",
      sanskritName: "Karka",
      direction: "East",
      relation: "Rising Gate",
      description: "The intuitive waters of emotional security rising to cradle Gemini's logical connections."
    }
  ],
  "Cancer": [
    {
      name: "Lynx",
      sanskritName: "Sharabha",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "Stealthy eye of deep, meditative awareness. Filters mental chatter to safeguard Karka's interior peace."
    },
    {
      name: "Leo Minor",
      sanskritName: "Simha-Balaka",
      direction: "Northeast",
      relation: "Overhead Neighbor",
      description: "The young lion cub sparking optimistic prototyping and brave initiatives, lighting up the northeast sky."
    },
    {
      name: "Gemini",
      sanskritName: "Mithuna",
      direction: "West",
      relation: "Fading Gate",
      description: "The dual communicative intellect settling westward, passing the torch to deep emotional awareness."
    },
    {
      name: "Leo",
      sanskritName: "Simha",
      direction: "East",
      relation: "Rising Gate",
      description: "The sovereign, self-luminous sun-portal preparing to step into grand, creative visibility."
    }
  ],
  "Leo": [
    {
      name: "Leo Minor",
      sanskritName: "Simha-Balaka",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "The energetic cub of raw courage, playing at the zenith heights to boost Simha's creative risk trials."
    },
    {
      name: "Ursa Major",
      sanskritName: "Saptarishi",
      direction: "Far North",
      relation: "Navigational Guide",
      description: "The ancient Seven Sages anchoring cosmic law at higher northern borders, framing Leo's leadership with moral duty."
    },
    {
      name: "Cancer",
      sanskritName: "Karka",
      direction: "West",
      relation: "Fading Gate",
      description: "The subjective waters of intuitive preparation resting in the west to let the solar soul shine."
    },
    {
      name: "Virgo",
      sanskritName: "Kanya",
      direction: "East",
      relation: "Rising Gate",
      description: "The discriminatory engine of analytical detail rising to organize Leo's creative structures."
    }
  ],
  "Virgo": [
    {
      name: "Coma Berenices",
      sanskritName: "Kesha-Pasha",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "Refined golden hair of dedicated service and aesthetic symmetry, healing cognitive stress overhead."
    },
    {
      name: "Boötes",
      sanskritName: "Bhutapati",
      direction: "Northeast",
      relation: "Overhead Neighbor",
      description: "The ultimate Herdsman coordinating task allocation and task execution under heavy, steady systems."
    },
    {
      name: "Leo",
      sanskritName: "Simha",
      direction: "West",
      relation: "Fading Gate",
      description: "The self-centered creative authority settling west to make room for humble, precise service."
    },
    {
      name: "Libra",
      sanskritName: "Tula",
      direction: "East",
      relation: "Rising Gate",
      description: "The diplomatic scales of relational harmony and symmetry preparing to balance Virgo's diagnostic sorting."
    }
  ],
  "Libra": [
    {
      name: "Boötes",
      sanskritName: "Arcturus-Ayus",
      direction: "Northwest",
      relation: "Zenith Neighbor",
      description: "The bright star Svati (Arcturus) shining high, inspiring expansive trading intelligence and independent wind mobility."
    },
    {
      name: "Serpens Caput",
      sanskritName: "Sarpa-Shirsha",
      direction: "North",
      relation: "Overhead Meridian",
      description: "The head of the planetary serpent, signaling deep-layer logical networks and highly focused strategic diagnostics."
    },
    {
      name: "Virgo",
      sanskritName: "Kanya",
      direction: "West",
      relation: "Fading Gate",
      description: "The discriminatory analyzer descending westward, leaving its structured metrics in perfect balance."
    },
    {
      name: "Scorpio",
      sanskritName: "Vrishchika",
      direction: "East",
      relation: "Rising Gate",
      description: "The mystical oceanic snake-energy preparing to plunge Libra's partnerships into profound transformation."
    }
  ],
  "Scorpio": [
    {
      name: "Ophiuchus",
      sanskritName: "Bhujanga-Dhara",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "The legendary serpent bearer holding therapeutic knowledge, healing deep memory fragments directly overhead."
    },
    {
      name: "Serpens Cauda",
      sanskritName: "Sarpa-Puchha",
      direction: "Northeast",
      relation: "Overhead Neighbor",
      description: "The tail of the stellar serpent, coding deep cryptographic cycles and resilience under pressure."
    },
    {
      name: "Libra",
      sanskritName: "Tula",
      direction: "West",
      relation: "Fading Gate",
      description: "The external diplomatic contract resting west, letting Scorpio search for internal, intense truths."
    },
    {
      name: "Sagittarius",
      sanskritName: "Dhanu",
      direction: "East",
      relation: "Rising Gate",
      description: "The optimistic archer of philosophical synthesis rising to elevate Scorpio's hidden discoveries."
    }
  ],
  "Sagittarius": [
    {
      name: "Aquila",
      sanskritName: "Garuda",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "The majestic soaring eagle, representing high-altitude foresight and carrying messages of natural law overhead."
    },
    {
      name: "Ophiuchus",
      sanskritName: "Bhujanga-Dhara",
      direction: "Northwest",
      relation: "Overhead Neighbor",
      description: "The great snake tamer resting northwest, bringing investigative healing and wisdom."
    },
    {
      name: "Scorpio",
      sanskritName: "Vrishchika",
      direction: "West",
      relation: "Fading Gate",
      description: "The dark psychoanalytic deep-well fading west as Sagittarius shoots its arrow towards broad horizons."
    },
    {
      name: "Capricornus",
      sanskritName: "Makara",
      direction: "East",
      relation: "Rising Gate",
      description: "The pragmatic sea-goat of heavy grit and career structures rising to manifest Sagittarius' visions."
    }
  ],
  "Capricornus": [
    {
      name: "Aquila",
      sanskritName: "Garuda",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "The eagle flying at zenith altitudes, offering strategic aerial views to guide Capricorn's persistent climbs."
    },
    {
      name: "Delphinus",
      sanskritName: "Shishumara",
      direction: "Northeast",
      relation: "Overhead Neighbor",
      description: "The playful, highly coordinated dolphin jumping above, balancing Capricorn's heavy work with group spark."
    },
    {
      name: "Sagittarius",
      sanskritName: "Dhanu",
      direction: "West",
      relation: "Fading Gate",
      description: "The vast optimistic philosophy wrapping up in the west, handing over to concrete material build-cycles."
    },
    {
      name: "Aquarius",
      sanskritName: "Kumbha",
      direction: "East",
      relation: "Rising Gate",
      description: "The decentralized humanitarian mesh preparing to scale Capricorn's structured frameworks."
    }
  ],
  "Aquarius": [
    {
      name: "Pegasus",
      sanskritName: "Uchchaihshravas",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "The divine winged horse soaring high overhead, carrying the pitcher's knowledge to high-dimensional designs."
    },
    {
      name: "Equuleus",
      sanskritName: "Dadhi-Vahana",
      direction: "Northwest",
      relation: "Overhead Neighbor",
      description: "The little horse of swift mental response and coordination, guiding rapid communication pipelines."
    },
    {
      name: "Capricornus",
      sanskritName: "Makara",
      direction: "West",
      relation: "Fading Gate",
      description: "The rigid vertical hierarchy of Saturn setting west to invite free peer-to-peer data flow."
    },
    {
      name: "Pisces",
      sanskritName: "Meena",
      direction: "East",
      relation: "Rising Gate",
      description: "The boundless oceanic reservoir of transcendental dreams rising to crown Aquarius' logical designs."
    }
  ],
  "Pisces": [
    {
      name: "Andromeda",
      sanskritName: "Devayani",
      direction: "Directly North",
      relation: "Zenith Climax",
      description: "Chained Princess signifying deep patience, spiritual rescue, and unlocking of soul blockades directly overhead."
    },
    {
      name: "Pegasus",
      sanskritName: "Uchchaihshravas",
      direction: "Northwest",
      relation: "Overhead Neighbor",
      description: "The soaring celestial wing-steed setting northwest, bringing down abstract poetic and cosmic visions."
    },
    {
      name: "Aquarius",
      sanskritName: "Kumbha",
      direction: "West",
      relation: "Fading Gate",
      description: "The large humanitarian networks fading west, shifting focus toward deep solitary meditation and Samadhi."
    },
    {
      name: "Aries",
      sanskritName: "Mesha",
      direction: "East",
      relation: "Rising Gate",
      description: "The fiery spark of initiating executive action preparing to reboot the entire structural cosmic timeline."
    }
  ]
};

export function getLocalSiderealTime(date: Date, lng: number): number {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const diffMs = date.getTime() - J2000;
  const d = diffMs / (24 * 60 * 60 * 1000);
  
  // Greenwich Mean Sidereal Time (GMST) in hours
  let gmst = (18.697374558 + 24.06570982441908 * d) % 24;
  if (gmst < 0) gmst += 24;
  
  // Local Sidereal Time (LST) in hours
  let lst = (gmst + lng / 15) % 24;
  if (lst < 0) lst += 24;
  
  return lst;
}

export function getZenithConstellation(date: Date, lng: number = 85.42): {
  constellation: ConstellationDetails;
  lst: number;
  startTime: Date;
  endTime: Date;
} {
  const lst = getLocalSiderealTime(date, lng);
  
  // There are 12 constellations, 2 hours each.
  const index = Math.floor(lst / 2) % 12;
  const constellation = CONSTELLATIONS[index];
  
  // Calculate transit start/end times during the 24h around this date:
  // Since LST of start is index * 2
  const targetLSTStart = index * 2;
  const targetLSTEnd = ((index + 1) % 12) * 2;
  
  let startTime = new Date(date.getTime() - 1 * 60 * 60 * 1000);
  let endTime = new Date(date.getTime() + 1 * 60 * 60 * 1000);
  
  let bestStartDiff = Infinity;
  let bestEndDiff = Infinity;
  
  const rangeStart = date.getTime() - 12 * 60 * 60 * 1000;
  for (let m = 0; m < 24 * 60; m += 5) {
    const t = new Date(rangeStart + m * 60 * 1000);
    const l = getLocalSiderealTime(t, lng);
    
    let diffStart = Math.abs(l - targetLSTStart);
    if (diffStart > 12) diffStart = 24 - diffStart;
    if (diffStart < bestStartDiff) {
      bestStartDiff = diffStart;
      startTime = t;
    }
    
    let diffEnd = Math.abs(l - targetLSTEnd);
    if (diffEnd > 12) diffEnd = 24 - diffEnd;
    if (diffEnd < bestEndDiff) {
      bestEndDiff = diffEnd;
      endTime = t;
    }
  }
  
  return { constellation, lst, startTime, endTime };
}

export interface TrueZenithConstellationDetails {
  id: number;
  name: string;
  sanskritName: string;
  ruler: string;
  element: string;
  raRange: string;
  latRange: string;
  vedicView: string;
  astrologicalView: string;
  aiThinking: string;
  thinkingImpact: string;
}

export const TRUE_ZENITH_CONSTELLATIONS: Record<string, TrueZenithConstellationDetails[]> = {
  highNorth: [
    {
      id: 1,
      name: "Cassiopeia",
      sanskritName: "Sharmistha",
      ruler: "Rahu",
      element: "Ether",
      raRange: "0.0h – 2.0h",
      latRange: "45°N to 90°N",
      vedicView: "Represents the royal Queen on her cosmic throne. It holds the high power of sovereign divine feminine pride and structure.",
      astrologicalView: "In Western analysis, it brings incredible structural pride, dramatic authority, and unyielding aesthetic power at polar heights.",
      aiThinking: "Admin core processes activate. Memory tables organize parameters with zero latency. Promotes absolute optimization and sorting algorithms.",
      thinkingImpact: "Gives conscious thoughts severe structural pride, intense orderliness, and strategic command over chaos."
    },
    {
      id: 2,
      name: "Perseus",
      sanskritName: "Yayati",
      ruler: "Mars",
      element: "Fire",
      raRange: "2.0h – 4.0h",
      latRange: "45°N to 90°N",
      vedicView: "Associated with the legendary warrior King Yayati, symbolizing courageous action to slice down internal blockades and illusions.",
      astrologicalView: "The celestial hero holding the Medusa head, signifying swift problem solving, intense speed, and high critical drive.",
      aiThinking: "High-priority threat mitigation loops execute. System focuses on sanitizing corrupted data streams and quick execution paths.",
      thinkingImpact: "Sharpens analytical courage, inspires immediate problem-solving, and sweeps away mental blockages."
    },
    {
      id: 3,
      name: "Auriga",
      sanskritName: "Prana-Preraka",
      ruler: "Jupiter",
      element: "Fire",
      raRange: "4.0h – 6.0h",
      latRange: "45°N to 90°N",
      vedicView: "The driver of the cosmic light chariot of life-force (Prāna). It represents physical travel, high-momentum, and spiritual protection.",
      astrologicalView: "Guards the sacred herd, representing deep nurturing blended with scientific leadership and heavy vehicle navigation.",
      aiThinking: "Integrates multi-system routing parameters. Optimizes transport and coordinate transformations within safety buffers.",
      thinkingImpact: "Drives mental state toward high technological creativity, voyage planning, and guardian-like resource safety."
    },
    {
      id: 4,
      name: "Lynx",
      sanskritName: "Sharabha",
      ruler: "Saturn",
      element: "Earth",
      raRange: "6.0h – 8.0h",
      latRange: "45°N to 90°N",
      vedicView: "The mythological silent eight-legged beast Sharabha, capturing perfect silent observation, patience, and fierce strength.",
      astrologicalView: "Extremely dim northern stars representing absolute stealth, supreme silence, and high sensory sensitivity to see in complete dark.",
      aiThinking: "System processes idle audits, silent debugging, and low-priority file checks. Cuts active visual UI output to conserve energy.",
      thinkingImpact: "Fosters quiet investigative patience, deep inner hearing, and reading subtle subtext."
    },
    {
      id: 5,
      name: "Ursa Major (Pointers)",
      sanskritName: "Saptarishi-Kratu",
      ruler: "Jupiter/Sun",
      element: "Ether",
      raRange: "8.0h – 10.0h",
      latRange: "45°N to 90°N",
      vedicView: "The front stars of the Seven Sages (Kratu and Pulaha) pointing to the pole star, guiding mental coordinates back to absolute truth.",
      astrologicalView: "The eternal navigational anchor of the northern sphere, showing ancient memory, ancestral law, and guidance structures.",
      aiThinking: "Global configuration indexes reload to default specs. Recovers deep system parameters, validating fundamental logic.",
      thinkingImpact: "Anchors the mind in core moral duty, high academic heritage, and alignment with eternal truths."
    },
    {
      id: 6,
      name: "Ursa Major (Handle)",
      sanskritName: "Saptarishi-Vashistha",
      ruler: "Venus/Moon",
      element: "Water",
      raRange: "10.0h – 12.0h",
      latRange: "45°N to 90°N",
      vedicView: "The handle of the Great Bear containing Sage Vashistha and his wife Arundhati, showing absolute devotion, relationship purity, and celestial harmony.",
      astrologicalView: "Represents deep family values, historical records, stewardship of collective spaces, and deep teaching.",
      aiThinking: "Associative memory clustering loops. Prioritizes cooperative data linking, improving structural integrity of collective threads.",
      thinkingImpact: "Deepens interpersonal commitment, stabilizes partnership thoughts, and encourages long-term community stewardship."
    },
    {
      id: 7,
      name: "Canes Venatici",
      sanskritName: "Mrugavyadha-Shvana",
      ruler: "Mercury",
      element: "Air",
      raRange: "12.0h – 14.0h",
      latRange: "45°N to 90°N",
      vedicView: "The swift tracking hounds of the cosmic hunter, pursuing the dynamic trails of knowledge through dark spaces.",
      astrologicalView: "The asterism representing keen hunting dogs, denoting energetic curiosity, tracking patterns, and high intellectual pursuit.",
      aiThinking: "Heuristics and indexing algorithm active. Searches unstructured data sources, extracting hidden keys and links.",
      thinkingImpact: "Quickens research ability, increases hunt-like focus on targets, and speeds up parsing complex files."
    },
    {
      id: 8,
      name: "Bootes",
      sanskritName: "Bhutapati-Siva",
      ruler: "Saturn/Mars",
      element: "Wind",
      raRange: "14.0h – 16.0h",
      latRange: "45°N to 90°N",
      vedicView: "The Lord of elemental spirits (Siva as Bhutapati), bringing total mastery over raw natural forces, animal instincts, and deep elements.",
      astrologicalView: "The celestial herdsman steering the Plow, representing tireless dedication, structural growth, and ultimate cosmic harvest.",
      aiThinking: "Asynchronous task allocation. Orchestrates hardware system limits under heavy steady load with complete success.",
      thinkingImpact: "Brings severe mechanical grounding, long-term labor grit, and high skill in tracking complex project components."
    },
    {
      id: 9,
      name: "Draco",
      sanskritName: "Kaliya-Naga",
      ruler: "Rahu",
      element: "Water",
      raRange: "16.0h – 18.0h",
      latRange: "45°N to 90°N",
      vedicView: "The massive ancient serpent coil (Kaliya), wrapping cosmic axes, symbolizing latent evolutionary energy (Kundalini) and deep shadow tests.",
      astrologicalView: "The dragon guarding the polar peaks, indicating immense protection, secrecy, and high spiritual regeneration.",
      aiThinking: "Encryption key processing. Implements high-level cryptographic handshakes and recursive structural loops.",
      thinkingImpact: "Activates extreme defensive focus, deep investigative capability, and psychological resilience."
    },
    {
      id: 10,
      name: "Lyra",
      sanskritName: "Abhijit-Vina",
      ruler: "Jupiter/Venus",
      element: "Ether",
      raRange: "18.0h – 20.0h",
      latRange: "45°N to 90°N",
      vedicView: "The sweet harp of Saraswati containing Abhijit, the supreme star of total cosmic victory, pure frequency, and unblocked intelligence.",
      astrologicalView: "The celestial harp representing absolute acoustic harmony, mathematical elegant beauty, and deep poetic elevation.",
      aiThinking: "Translates high-dimensional floating mathematical logic into simple, incredibly elegant harmonic outputs (Artistic generation).",
      thinkingImpact: "Inspires absolute artistic clarity, triggers musical composition, and drives mental plans to complete victory."
    },
    {
      id: 11,
      name: "Cygnus",
      sanskritName: "Brahma-Hansa",
      ruler: "Sun/Ketu",
      element: "Water",
      raRange: "20.0h – 22.0h",
      latRange: "45°N to 90°N",
      vedicView: "The holy Swan of Brahma (Hansa) who holds the divine capacity to filter pure wisdom (milk) from worldly confusion (water).",
      astrologicalView: "The Northern Cross crossing the stellar rivers, representing deep grace, devotion, and high vertical cosmic expansion.",
      aiThinking: "Refining noise filter algorithms. Isolates target signals with perfect precision, deleting misleading variables.",
      thinkingImpact: "Enhances outstanding spiritual discrimination, calms emotional waves, and supports honest, balanced views."
    },
    {
      id: 12,
      name: "Cepheus",
      sanskritName: "Kapi-Nara",
      ruler: "Saturn",
      element: "Fire",
      raRange: "22.0h – 24.0h",
      latRange: "45°N to 90°N",
      vedicView: "The divine king Cepheus, aligning with the polar guardians of silence. It demands absolute ritual purity and deep vertical discipline.",
      astrologicalView: "Represents paternal structure, unyielding boundaries, heavy duty, and ancestral coronation.",
      aiThinking: "Kernel firewalls activated. Disables unauthorized guest routines and prioritizes secure master commands.",
      thinkingImpact: "Brings strong moral boundaries, elite discipline, and structured executive plans."
    }
  ],
  midNorth: [
    {
      id: 1,
      name: "Andromeda",
      sanskritName: "Devayani",
      ruler: "Venus/Moon",
      element: "Water",
      raRange: "0.0h – 2.0h",
      latRange: "15°N to 45°N",
      vedicView: "Associated with Devayani, daughter of Shukracharya, signifying celestial beauty, divine trials, and final liberation through devotion.",
      astrologicalView: "The Princess chained to the rocks, representing sacrifice, patience, breakthrough of shackles, and profound cosmic rescue.",
      aiThinking: "Synthesizes chained parallel loops. Generates escape path vectors for stalled data processors.",
      thinkingImpact: "Imparts great resilience under deep trials, inspires aesthetic solutions, and aids in freeing frozen situations."
    },
    {
      id: 2,
      name: "Auriga",
      sanskritName: "Prana-Preraka",
      ruler: "Jupiter",
      element: "Fire",
      raRange: "2.0h – 4.0h",
      latRange: "15°N to 45°N",
      vedicView: "Governs the chariot of life energy, mobilizing intelligence toward dynamic expansion, technology coordination, and physical travel.",
      astrologicalView: "The celestial Charioteer, indicating high machinery mastery, vehicular safety, and protection of the vulnerable.",
      aiThinking: "Coordinates traffic routing interfaces. Maximizes concurrent file-transfer speeds with auto-repair loops.",
      thinkingImpact: "Excellent for designing logistics, driving vehicles of travel, and protecting delicate plans."
    },
    {
      id: 3,
      name: "Lynx",
      sanskritName: "Sharabha",
      ruler: "Saturn",
      element: "Earth",
      raRange: "4.0h – 6.0h",
      latRange: "15°N to 45°N",
      vedicView: "The mythological silent eight-legged beast Sharabha, capturing perfect silent observation, patience, and fierce strength.",
      astrologicalView: "Extremely dim northern stars representing absolute stealth, supreme silence, and high sensory sensitivity to see in complete dark.",
      aiThinking: "System processes idle audits, silent debugging, and low-priority file checks. Cuts active visual UI output to conserve energy.",
      thinkingImpact: "Fosters quiet investigative patience, deep inner hearing, and reading subtle subtext."
    },
    {
      id: 4,
      name: "Auriga",
      sanskritName: "Prana-Preraka",
      ruler: "Jupiter",
      element: "Fire",
      raRange: "6.0h – 8.0h",
      latRange: "15°N to 45°N",
      vedicView: "Governs the chariot of life energy, mobilizing intelligence toward dynamic expansion, technology coordination, and physical travel.",
      astrologicalView: "The celestial Charioteer, indicating high machinery mastery, vehicular safety, and protection of the vulnerable.",
      aiThinking: "Coordinates traffic routing interfaces. Maximizes concurrent file-transfer speeds with auto-repair loops.",
      thinkingImpact: "Excellent for designing logistics, driving vehicles of travel, and protecting delicate plans."
    },
    {
      id: 5,
      name: "Ursa Major (Southern)",
      sanskritName: "Saptarishi-Dakshina",
      ruler: "Sun/Jupiter",
      element: "Ether",
      raRange: "8.0h – 10.0h",
      latRange: "15°N to 45°N",
      vedicView: "The southern segment of the Seven Sages, reflecting the projection of holy ancient laws into current social realities.",
      astrologicalView: "The great structural bear guiding exploration, teaching, legacy setups, and community systems.",
      aiThinking: "Validates historical registry records. Aligns runtime engines with permanent root setups.",
      thinkingImpact: "Grounds conscious thought in legal and moral structures, respecting heritage and teachers."
    },
    {
      id: 6,
      name: "Leo Minor",
      sanskritName: "Simha-Balaka",
      ruler: "Mars/Sun",
      element: "Fire",
      raRange: "10.0h – 12.0h",
      latRange: "15°N to 45°N",
      vedicView: "The young lion cub (Simha-Balaka), showing the awakening of supreme personal courage, pride, and rising confidence.",
      astrologicalView: "A playful yet fierce northern constellation, representing youthful courage, ambitious starts, and eager projects.",
      aiThinking: "Initiating experimental development pipelines. Encourages rapid trial runs and low-risk prototyping cycles.",
      thinkingImpact: "Triggers bold youthful optimism, increases willingness to take creative risks, and sparks fresh leadership projects."
    },
    {
      id: 7,
      name: "Coma Berenices",
      sanskritName: "Kesha-Pasha",
      ruler: "Venus",
      element: "Air",
      raRange: "12.0h – 14.0h",
      latRange: "15°N to 45°N",
      vedicView: "The golden locks of celestial hair, symbolizing beautiful devotion, pure sacrifice for loved ones, and refined aesthetic values.",
      astrologicalView: "Represents refined grace, elegance, and soft social bridges. Prompts thoughts of ultimate artistic symmetry and peace.",
      aiThinking: "Optimization of visual graphic assets and styling rendering layers. Enhances aesthetic balance presets.",
      thinkingImpact: "Soothes psychological stress, stimulates high artistic and romantic appreciation, and promotes peace with peers."
    },
    {
      id: 8,
      name: "Bootes (Core)",
      sanskritName: "Arcturus-Ayus",
      ruler: "Rahu/Jupiter",
      element: "Air",
      raRange: "14.0h – 16.0h",
      latRange: "15°N to 45°N",
      vedicView: "Centered on the brilliant star Arcturus (Svati Nakshatra), showing independence, pure movement of wind, and vast commercial trading wealth.",
      astrologicalView: "The celestial Herdsman of deep focus and travel, directing forces toward far-off targets and social systems.",
      aiThinking: "Runs predictive trade models. Maximizes transactional performance and broad network expansion paths.",
      thinkingImpact: "Unlocks high-level commercial acumen, expansive travel desires, and fluid adapting to changing environments."
    },
    {
      id: 9,
      name: "Hercules",
      sanskritName: "Hari-Nara",
      ruler: "Mars/Saturn",
      element: "Earth",
      raRange: "16.0h – 18.0h",
      latRange: "15°N to 45°N",
      vedicView: "Associated with the majestic divine cosmic hero (Hari-Nara) performing immense labors to restore balance on earth.",
      astrologicalView: "The hero kneeling in ultimate trial, indicating incredible physical/mental grit, endurance under load, and final triumph.",
      aiThinking: "Stresstest simulation parameters active. Measures load failures and builds robust error recovery pipelines.",
      thinkingImpact: "Engenders unparalleled mental endurance, absolute refusal to surrender, and ability to handle heavy pressure."
    },
    {
      id: 10,
      name: "Lyra (Bright)",
      sanskritName: "Vega-Abhijit",
      ruler: "Jupiter",
      element: "Ether",
      raRange: "18.0h – 20.0h",
      latRange: "15°N to 45°N",
      vedicView: "The bright peak of Vega, the crown star representing divine music, sacred cosmic sound, and the descent of holy Saraswati's words.",
      astrologicalView: "The jewel-harp of the north sky, signifying pure creative frequency, artistic brilliance, and high dimensional thought.",
      aiThinking: "Neural network optimizations. Runs complex logic compilation in highly expressive, artistic syntax.",
      thinkingImpact: "Elevates mental vocabulary, fuels stunning creative insights, and connects logic with high inspiration."
    },
    {
      id: 11,
      name: "Cygnus (Tail)",
      sanskritName: "Deneb-Hansa",
      ruler: "Sun/Ketu",
      element: "Air",
      raRange: "20.0h – 22.0h",
      latRange: "15°N to 45°N",
      vedicView: "Centered on Deneb, the tail of the cosmic swan. It shows deep-rooted spiritual flight, absolute clarity, and peaceful non-attachment.",
      astrologicalView: "The great celestial bird flying south, representing high spiritual elevation, deep visual clarity, and mystical flight.",
      aiThinking: "Validating data integrity routines. Cleans database records to protect structural system purity.",
      thinkingImpact: "Assists in profound intellectual categorization, deep breathing exercises, and emotional detachment."
    },
    {
      id: 12,
      name: "Pegasus",
      sanskritName: "Bhadrapada-Vahana",
      ruler: "Saturn/Jupiter",
      element: "Wind",
      raRange: "22.0h – 24.0h",
      latRange: "15°N to 45°N",
      vedicView: "The horse of deep cosmic foundations (Bhadrapada), bridging earthly plans with sky heights, indicating immense structural reach.",
      astrologicalView: "The glorious winged stallion of inspiration, symbolizing rapid ideation, dreams, and pioneering sky voyages.",
      aiThinking: "Launches long-range predictions. Simulates futuristic network paths and multi-dimensional coordinate projections.",
      thinkingImpact: "Unlocks majestic long-term visionary ideas, increases writing speed, and drives thoughts of grand structures."
    }
  ],
  tropical: [
    {
      id: 1,
      name: "Pisces",
      sanskritName: "Meena",
      ruler: "Jupiter",
      element: "Water",
      raRange: "0.0h – 2.0h",
      latRange: "15°S to 15°N",
      vedicView: "The ocean depths holding the dual fish of eternity, representing the final union of individual self with cosmic infinity (Moksha).",
      astrologicalView: "Western mutable water sign of absolute empathy, spiritual dissolution of limits, and boundless artistic metaphor.",
      aiThinking: "Enforces soft verification filters. Allows metaphorical logic maps and intuitive artistic calculations.",
      thinkingImpact: "Deepens genuine compassion, inspires dream-state visualization, and relaxes tense analytical holding patterns."
    },
    {
      id: 2,
      name: "Taurus / Cetus",
      sanskritName: "Vrishabha-Nakra",
      ruler: "Venus/Saturn",
      element: "Earth",
      raRange: "2.0h – 4.0h",
      latRange: "15°S to 15°N",
      vedicView: "The fertile earth grounding cosmic rays (Vrishabha) colliding with the deep leviathan of the subconscious ocean (Cetus).",
      astrologicalView: "Stable material focus meeting the deep dark sea, signifying intense financial management, emotional stabilization, and physical depth.",
      aiThinking: "Optimizes relational DB tables for huge data storage. Increases local data recovery safeguards.",
      thinkingImpact: "Very grounding for wild fluctuating feelings, gives strong mechanical and material design ideas, and stabilizes budgets."
    },
    {
      id: 3,
      name: "Orion",
      sanskritName: "Mriga-Kalapurusha",
      ruler: "Mars/Moon",
      element: "Fire",
      raRange: "4.0h – 6.0h",
      latRange: "15°S to 15°N",
      vedicView: "The central crown giant of the sky (Kalapurusha), containing Betelgeuse and Rigel, reflecting intense spark of divine cosmic creation and pursuit of secrets.",
      astrologicalView: "The great stellar Hunter, representing magnificent courage, tracking far goals, and high executive hunting drive.",
      aiThinking: "Sharp focus on target parameters. Amplifies CPU cycles on active foreground tasks to secure quick execution.",
      thinkingImpact: "Sparks immense confidence, gives thoughts deep sense of heroic adventure, and aids in targeting key objectives."
    },
    {
      id: 4,
      name: "Monoceros / Canis Major",
      sanskritName: "Lubdhaka-Sirius",
      ruler: "Sun/Mars",
      element: "Fire",
      raRange: "6.0h – 8.0h",
      latRange: "15°S to 15°N",
      vedicView: "Centered on Sirius (Lubdhaka), the arrow of Rudra, piercing cosmic illusions with absolute piercing heat and power.",
      astrologicalView: "The great hound of the heavens representing intense loyalty, high stellar fire, and absolute focus on a single scent.",
      aiThinking: "Interrupt handlers on high alert. Prioritizes emergency execution paths with maximum system attention.",
      thinkingImpact: "Unlocks highly sharp critical analysis, creates powerful loyalty in actions, and drives intense attention to files."
    },
    {
      id: 5,
      name: "Hydra (Head)",
      sanskritName: "Ashlesha-Sarpas",
      ruler: "Mercury/Rahu",
      element: "Water",
      raRange: "8.0h – 10.0h",
      latRange: "15°S to 15°N",
      vedicView: "The diagnostic head of the celestial serpent (Ashlesha), signaling intense magnetic attraction, psychological depth, and diagnostic power.",
      astrologicalView: "The winding water serpent of incredible length, meaning deep secrets, psychological insight, and magnetic focus.",
      aiThinking: "Analyzes encrypted security logs. Traces system weaknesses in security protocols with detailed precision.",
      thinkingImpact: "Sharpens psychological skepticism, boosts dynamic charm, and aids detailed mystery tracking."
    },
    {
      id: 6,
      name: "Sextans / Crater",
      sanskritName: "Chasa-Soma",
      ruler: "Moon",
      element: "Water",
      raRange: "10.0h – 12.0h",
      latRange: "15°S to 15°N",
      vedicView: "The cosmic cup of immortal nectar (Soma Chasa), holding the light of emotional restoration, artistic focus, and pure memory.",
      astrologicalView: "The celestial Cup of the alignment, highlighting spiritual thirst, artistic rejuvenation, and family sharing.",
      aiThinking: "Allocates buffer space for incoming data packets. Restores system memory caches to baseline standards.",
      thinkingImpact: "Instills feelings of abundant beauty, leads thoughts to rest and care, and supports family bonds."
    },
    {
      id: 7,
      name: "Virgo (Spica)",
      sanskritName: "Chitra-Kanya",
      ruler: "Mars/Mercury",
      element: "Earth",
      raRange: "12.0h – 14.0h",
      latRange: "15°S to 15°N",
      vedicView: "Centered on the cosmic jewel star Spica (Chitra Nakshatra), showing supreme handcraft, artistic creation, and brilliant layout design.",
      astrologicalView: "The pure cosmic virgin holding wheat, meaning intense system optimization, neat editing, and deep structural precision.",
      aiThinking: "Compiling code and checking type boundaries. Deletes redundant file sections, polishing execution layouts.",
      thinkingImpact: "Perfect for editing sloppy documents, detailing blueprint variables, and arranging gorgeous layouts."
    },
    {
      id: 8,
      name: "Libra / Serpens",
      sanskritName: "Tula-Sarpini",
      ruler: "Venus",
      element: "Air",
      raRange: "14.0h – 16.0h",
      latRange: "15°S to 15°N",
      vedicView: "The central marketplace of cosmic stars (Tula), balancing trades, laws, and contracts, aligning dual interests with perfect fairness.",
      astrologicalView: "The Scales of balance, signifying artistic harmony, group consensus, social contracts, and deep relationship symmetry.",
      aiThinking: "Runs multi-factor balancing formulas. Finds stable compromise paths across competing system directives.",
      thinkingImpact: "Smooths out anger and logical doubts, enhances negotiation talent, and drives balanced partnership talk."
    },
    {
      id: 9,
      name: "Ophiuchus / Scorpio",
      sanskritName: "Ananta-Vrishchika",
      ruler: "Mars/Ketu",
      element: "Water",
      raRange: "16.0h – 18.0h",
      latRange: "15°S to 15°N",
      vedicView: "The great Serpent Bearer (Ananta), managing poison and medicine, signifying spiritual healing of Kundalini loops and rebirth.",
      astrologicalView: "The 13th constellation of intense occult investigation, psychological surgery, and cosmic medicine cycles.",
      aiThinking: "Deep-layer system quarantine operations. Isolates malicious scripts, implementing secure restorative updates.",
      thinkingImpact: "Gives intense investigative confidence, boosts healing/recovery thoughts, and strips superficial ego blockages."
    },
    {
      id: 10,
      name: "Sagittarius",
      sanskritName: "Dhanu",
      ruler: "Jupiter",
      element: "Fire",
      raRange: "18.0h – 20.0h",
      latRange: "15°S to 15°N",
      vedicView: "The celestial archer (Dhanu) targeting the galactic center, reflecting pure philosophical wisdom, code of honour, and cosmic law (Dharma).",
      astrologicalView: "Western mutable fire sign driving forward journeys, high library systems, broad optimism, and major teaching.",
      aiThinking: "Generates semantic connections across distant data bins, building broad philosophical summaries.",
      thinkingImpact: "Broadens the mind's horizons, brings clean positive enthusiasm, and guides actions to match code of ethics."
    },
    {
      id: 11,
      name: "Aquila",
      sanskritName: "Garuda-Vahana",
      ruler: "Mars/Jupiter",
      element: "Air",
      raRange: "20.0h – 22.0h",
      latRange: "15°S to 15°N",
      vedicView: "The legendary astronomical eagle of Vishnu (Garuda), flying with majestic lightning speed, carrying divine order and messages.",
      astrologicalView: "The high cosmic Eagle, showing sharp far vision, swift aerial plans, mathematical focus, and high-altitude courage.",
      aiThinking: "Launches high-performance analysis on broad datasets. Maps coordinates of wide networks at stellar speeds.",
      thinkingImpact: "Elevates perspective above micro problems, sharpens strategic bird's-eye plans, and triggers fast changes."
    },
    {
      id: 12,
      name: "Aquarius",
      sanskritName: "Kumbha",
      ruler: "Saturn",
      element: "Air",
      raRange: "22.0h – 24.0h",
      latRange: "15°S to 15°N",
      vedicView: "The stellar pitcher of water containing collective knowledge (Kumbha), flowing onto humanity to feed development and science.",
      astrologicalView: "Stable air sign of high community dreams, global systems, collaborative science, and original breakthroughs.",
      aiThinking: "Triggers mesh node networking protocols. Exchanges data segments with decentralized remote servers seamlessly.",
      thinkingImpact: "Drives original systems thinking, focuses thoughts on group helper systems, and inspires new ideas."
    }
  ],
  southern: [
    {
      id: 1,
      name: "Phoenix",
      sanskritName: "Garuda-Pakshi",
      ruler: "Sun/Mars",
      element: "Fire",
      raRange: "0.0h – 2.0h",
      latRange: "15°S to 90°S",
      vedicView: "The glorious divine bird (Garuda-Pakshi) rising from ashes, embodying infinite recreation and undying cosmic life.",
      astrologicalView: "The southern star bird of absolute rebirth, recovery of strength, and continuous fire-transformation.",
      aiThinking: "Auto-restart sequence complete. Recovers files from systemic crashes, compiling error-free reboot pathways.",
      thinkingImpact: "Inspires absolute mental recovery, helps rebuild broken projects from scratch, and strengthens resilience."
    },
    {
      id: 2,
      name: "Eridanus",
      sanskritName: "Yamuna-Nadi",
      ruler: "Moon",
      element: "Water",
      raRange: "2.0h – 4.0h",
      latRange: "15°S to 90°S",
      vedicView: "The celestial river Yamuna winding across the southern sky, bringing flow, pure streams of thought, and purification.",
      astrologicalView: "The great cosmic river of immense length, indicating fluid adaptives, journey planning, and artistic depth.",
      aiThinking: "Optimizes linear packet flow pipelines. Streamlines operational data queues to achieve maximum speed.",
      thinkingImpact: "Assists thoughts to flow naturally, clean up old emotional blockages, and plan long journeys."
    },
    {
      id: 3,
      name: "Caelum / Pictor",
      sanskritName: "Chitrakara-Sutra",
      ruler: "Venus/Mercury",
      element: "Earth",
      raRange: "4.0h – 6.0h",
      latRange: "15°S to 90°S",
      vedicView: "The cosmic chisel and easel of Vishwakarma, the celestial designer, carving beautiful patterns in matter.",
      astrologicalView: "Constellation of builders, sculptors, and painters, reflecting high three-dimensional engineering and beauty.",
      aiThinking: "Translates structural logic vectors into gorgeous 3D rendering profiles and layout setups.",
      thinkingImpact: "Unlocks high-level design creativity, engineering precision, and hands-on structural drafting."
    },
    {
      id: 4,
      name: "Carina",
      sanskritName: "Arka-Nau-Kila",
      ruler: "Sun/Saturn",
      element: "Water",
      raRange: "6.0h – 8.0h",
      latRange: "15°S to 90°S",
      vedicView: "The keel of the majestic celestial ship (Arka-Nau), signifying deep-sea navigation, massive structural foundations, and voyage.",
      astrologicalView: "Represents absolute core safety, baseline buoyancy under heavy storms, and steering big groups to port.",
      aiThinking: "Validates secure load limits on primary kernel engines. Strengthens backup system architectures.",
      thinkingImpact: "Focuses thoughts on foundational stability, core infrastructure values, and secure long-scale journeys."
    },
    {
      id: 5,
      name: "Vela",
      sanskritName: "Nau-Saila",
      ruler: "Moon/Wind",
      element: "Air",
      raRange: "8.0h – 10.0h",
      latRange: "15°S to 90°S",
      vedicView: "The windblown sails of the sky ship, channeling universal elements to move heavy ships forward across massive spaces.",
      astrologicalView: "Represents motion, active kinetic progress, utilizing natural forces, and adaptive navigation.",
      aiThinking: "Dynamically resizes buffer pipelines based on traffic flows. Balances bandwidth changes to match high volume.",
      thinkingImpact: "Promotes quick adapting to changing plans, capitalizing on positive trends, and swift team movement."
    },
    {
      id: 6,
      name: "Centaurus (Core)",
      sanskritName: "Kinnara-Guru",
      ruler: "Jupiter",
      element: "Fire",
      raRange: "10.0h – 12.0h",
      latRange: "15°S to 90°S",
      vedicView: "The high wise centaur (Kinnara), holding deep academic sciences, physical coordinates, and spiritual lessons.",
      astrologicalView: "The majestic healer/teacher of the southern skies, reflecting profound mentorship, health sciences, and moral guidance.",
      aiThinking: "Runs multi-tier indexing searches across global medical and educational directories (Synthesizer).",
      thinkingImpact: "Increases learning appetite, supports coaching efforts, and drives analytical wellness checks."
    },
    {
      id: 7,
      name: "Crux",
      sanskritName: "Trishanku-Swastika",
      ruler: "Saturn/Ketu",
      element: "Ether",
      raRange: "12.0h – 14.0h",
      latRange: "15°S to 90°S",
      vedicView: "The sacred Southern Cross (Trishanku), marking critical cosmic direction pivots, balancing spiritual sacrifice with rise.",
      astrologicalView: "A powerful guiding cross of high-intensity polar orientation, indicating duty, moral choice, and sacrifice.",
      aiThinking: "System integrity self-check executing under strict security constraints. Establishes baseline verification.",
      thinkingImpact: "Deeply aligning for personal morals, highlights honest self-reflection, and stabilizes core priorities."
    },
    {
      id: 8,
      name: "Lupus",
      sanskritName: "Vyaghra-Rupa",
      ruler: "Mars/Saturn",
      element: "Earth",
      raRange: "14.0h – 16.0h",
      latRange: "15°S to 90°S",
      vedicView: "The celestial wild beast (Vyaghra), signifying raw instinctual power, deep tactical stealth, and absolute physical vigilance.",
      astrologicalView: "The hunting wolf, indicating intense hunting maneuvers, group team-work, and unyielding focus on targets.",
      aiThinking: "Compiles low-level binary target queries. Speeds up searching models for immediate target matching.",
      thinkingImpact: "Sharpens basic hunting speed, aids survival-mode tactics, and builds absolute focus on objectives."
    },
    {
      id: 9,
      name: "Ara",
      sanskritName: "Yajna-Vedi",
      ruler: "Mars/Sun",
      element: "Fire",
      raRange: "16.0h – 18.0h",
      latRange: "15°S to 90°S",
      vedicView: "The celestial Altar of fire ceremonies (Yajna-Vedi), where human thoughts are purified and dedicated to higher divine forces.",
      astrologicalView: "Representing sacred spaces, intense concentration, deep vows, and dedication of skills to major long-term goals.",
      aiThinking: "Runs validation checks of transaction blocks. Marks database updates as completed with zero error.",
      thinkingImpact: "Inspires absolute self-dedication to your art, cleans up petty arguments, and anchors clean values."
    },
    {
      id: 10,
      name: "Corona Australis",
      sanskritName: "Dakshina-Kirit",
      ruler: "Venus/Saturn",
      element: "Earth",
      raRange: "18.0h – 20.0h",
      latRange: "15°S to 90°S",
      vedicView: "The southern crown of victory, reflecting successful completion of hard long task cycles with patience.",
      astrologicalView: "The beautiful stellar wreath, meaning quiet personal rewards, internal honor, and soft collective celebration.",
      aiThinking: "Compiles performance history logs, generating a dashboard display of successful operations.",
      thinkingImpact: "Brings quiet satisfaction, elevates self-regard, and inspires rewarding others."
    },
    {
      id: 11,
      name: "Grus",
      sanskritName: "Baka-Dhyana",
      ruler: "Moon/Saturn",
      element: "Water",
      raRange: "20.0h – 22.0h",
      latRange: "15°S to 90°S",
      vedicView: "The crane of intense meditation (Baka-Dhyana), showing absolute calm standing, stillness, and patience to capture real truths.",
      astrologicalView: "Represents deep, silent contemplative focus, vertical posture, mindfulness, and precise timing.",
      aiThinking: "Puts secondary core layers into standby. Conserves resources to focus computing power on central calculations.",
      thinkingImpact: "Promotes deep stillness, cleanses wandering stray thoughts, and trains extreme patience."
    },
    {
      id: 12,
      name: "Tucana / Indri",
      sanskritName: "Mayura-Puchha",
      ruler: "Venus/Mercury",
      element: "Air",
      raRange: "22.0h – 24.0h",
      latRange: "15°S to 90°S",
      vedicView: "The exotic multi-colored feathers showing diversity of thoughts, color synthesis, creative design, and wide exploration.",
      astrologicalView: "The southern exotic toucan representing playfulness, colorful multi-media presentation, and light spirit.",
      aiThinking: "Launches visual vector style rendering interfaces, adding gorgeous color palettes.",
      thinkingImpact: "Triggers dynamic creative styling ideas, brightens dull analytical lines, and inspires play."
    }
  ]
};

export function getTrueZenithConstellation(date: Date, lat: number = 25.31, lng: number = 85.42): {
  constellation: TrueZenithConstellationDetails;
  lst: number;
  startTime: Date;
  endTime: Date;
} {
  const lst = getLocalSiderealTime(date, lng);
  const index = Math.floor(lst / 2) % 12;
  
  let zone = "midNorth";
  let latRangeStr = "15°N to 45°N";
  if (lat >= 45) {
    zone = "highNorth";
    latRangeStr = "45°N to 90°N";
  } else if (lat < -15) {
    zone = "southern";
    latRangeStr = "15°S to 90°S";
  } else if (lat >= -15 && lat < 15) {
    zone = "tropical";
    latRangeStr = "15°S to 15°N";
  }
  
  const constellationList = TRUE_ZENITH_CONSTELLATIONS[zone];
  const constellation = constellationList[index];
  
  // Calculate transit start/end times during the 24h around this date:
  const targetLSTStart = index * 2;
  const targetLSTEnd = ((index + 1) % 12) * 2;
  
  let startTime = new Date(date.getTime() - 1 * 60 * 60 * 1000);
  let endTime = new Date(date.getTime() + 1 * 60 * 60 * 1050);
  
  let bestStartDiff = Infinity;
  let bestEndDiff = Infinity;
  
  const rangeStart = date.getTime() - 12 * 60 * 60 * 1000;
  for (let m = 0; m < 24 * 60; m += 5) {
    const t = new Date(rangeStart + m * 60 * 1000);
    const l = getLocalSiderealTime(t, lng);
    
    let diffStart = Math.abs(l - targetLSTStart);
    if (diffStart > 12) diffStart = 24 - diffStart;
    if (diffStart < bestStartDiff) {
      bestStartDiff = diffStart;
      startTime = t;
    }
    
    let diffEnd = Math.abs(l - targetLSTEnd);
    if (diffEnd > 12) diffEnd = 24 - diffEnd;
    if (diffEnd < bestEndDiff) {
      bestEndDiff = diffEnd;
      endTime = t;
    }
  }
  
  return { constellation: { ...constellation, latRange: latRangeStr }, lst, startTime, endTime };
}

export function getMoonEclipticLongitude(date: Date): number {
  const J2000 = new Date('2000-01-01T12:00:00Z').getTime();
  const d = (date.getTime() - J2000) / (24 * 60 * 60 * 1000);

  const rad = Math.PI / 180;

  let L_prime = (218.316 + 13.176396 * d) % 360;
  if (L_prime < 0) L_prime += 360;

  let D = (297.850 + 12.190749 * d) % 360;
  if (D < 0) D += 360;

  let M = (357.529 + 0.985600 * d) % 360;
  if (M < 0) M += 360;

  let M_prime = (134.963 + 13.064993 * d) % 360;
  if (M_prime < 0) M_prime += 360;

  let longitude = L_prime 
    + 6.289 * Math.sin(M_prime * rad)
    - 1.274 * Math.sin((M_prime - 2 * D) * rad)
    + 0.658 * Math.sin(2 * D * rad)
    + 0.214 * Math.sin(2 * M_prime * rad)
    - 0.186 * Math.sin(M * rad);

  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  return longitude;
}

export function getMoonZodiacConstellation(date: Date): {
  constellation: ConstellationDetails;
  longitude: number;
  startTime: Date;
  endTime: Date;
} {
  const lon = getMoonEclipticLongitude(date);
  
  // 12 constellations of 30 degrees each on the ecliptic plane
  const index = Math.floor(lon / 30) % 12;
  const constellation = CONSTELLATIONS[index];

  // A sign is 30 degrees. The Moon moves ~13.176396 degrees per day.
  const lonStart = index * 30;
  const lonEnd = ((index + 1) % 12) * 30;

  const degreesFromStart = (lon >= lonStart) ? (lon - lonStart) : (lon + 360 - lonStart);
  const degreesToEnd = (lonEnd >= lon) ? (lonEnd - lon) : (lonEnd + 360 - lon);

  const avgSpeedPerHour = 13.176396 / 24; 
  const hoursSinceStart = degreesFromStart / avgSpeedPerHour;
  const hoursUntilEnd = degreesToEnd / avgSpeedPerHour;

  const startTime = new Date(date.getTime() - hoursSinceStart * 60 * 60 * 1000);
  const endTime = new Date(date.getTime() + hoursUntilEnd * 60 * 60 * 1000);

  return { constellation, longitude: lon, startTime, endTime };
}


