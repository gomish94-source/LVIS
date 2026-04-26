/**
 * Calculates Vedic Muhurta.
 * A day is divided into 30 Muhurtas of 48 minutes each.
 * Standard calculation starts from sunrise.
 * If sunrise is unknown, we approximate based on 6:00 AM.
 */

export interface Muhurta {
  id: number;
  name: string;
  nature: 'Auspicious' | 'Inauspicious' | 'Very Auspicious';
  cumulativePercentage: number;
  description: string;
  focus: string;
}

export const MUHURTAS: Omit<Muhurta, 'cumulativePercentage'>[] = [
  { id: 1, name: 'Rudra', nature: 'Inauspicious', description: 'Associated with transformation through destruction.', focus: 'Cleansing and ending bad habits.' },
  { id: 2, name: 'Ahi', nature: 'Inauspicious', description: 'Symbolized by the serpent, representing hidden obstacles.', focus: 'Caution and self-protection.' },
  { id: 3, name: 'Mitra', nature: 'Auspicious', description: 'Ruled by the god of friendship and harmony.', focus: 'Networking, social gatherings, and treaties.' },
  { id: 4, name: 'Pitri', nature: 'Inauspicious', description: 'Dedicated to ancestors and karmic debts.', focus: 'Respecting elders and charity.' },
  { id: 5, name: 'Vasu', nature: 'Auspicious', description: 'Governed by the eight elemental deities.', focus: 'Material gains and wealth management.' },
  { id: 6, name: 'Varaha', nature: 'Auspicious', description: 'The boar avatar, representing strength to lift burdens.', focus: 'Hard work and solving difficult problems.' },
  { id: 7, name: 'Visvedeva', nature: 'Auspicious', description: 'The collective of universal powers.', focus: 'General prosperity and group tasks.' },
  { id: 8, name: 'Vidhi (Abhijit)', nature: 'Auspicious', description: 'The "Invisible Quarter", considered highly powerful.', focus: 'All significant new beginnings.' },
  { id: 9, name: 'Sutamukhi', nature: 'Auspicious', description: 'Face of birth, representing the arrival of ideas.', focus: 'Planning and creative thinking.' },
  { id: 10, name: 'Puruhuta', nature: 'Inauspicious', description: 'Related to ego and prideful actions.', focus: 'Self-reflection and humility.' },
  { id: 11, name: 'Vahini', nature: 'Inauspicious', description: 'Flowing water, but can represent instability.', focus: 'Fluidity and adapting to change.' },
  { id: 12, name: 'Naktanakarā', nature: 'Inauspicious', description: 'The night-maker; focused on inner darkness.', focus: 'Rest and introspection only.' },
  { id: 13, name: 'Varuna', nature: 'Auspicious', description: 'God of the cosmic order and waters.', focus: 'Healing, purification, and truth-telling.' },
  { id: 14, name: 'Aryaman', nature: 'Auspicious', description: 'God of chivalry and social contracts.', focus: 'Marriage, contracts, and partnerships.' },
  { id: 15, name: 'Bhaga', nature: 'Inauspicious', description: 'Related to material inheritance and fortune.', focus: 'Managing assets quietly.' },
  { id: 16, name: 'Girisha', nature: 'Inauspicious', description: 'Lord of the mountains; solitary energy.', focus: 'Meditation and isolation.' },
  { id: 17, name: 'Ajapada', nature: 'Inauspicious', description: 'One-footed deity, representing imbalance.', focus: 'Re-centering and finding stability.' },
  { id: 18, name: 'Ahirbudhyna', nature: 'Auspicious', description: 'Knowledge from the deep foundations.', focus: 'Research, studies, and deep wisdom.' },
  { id: 19, name: 'Pushya', nature: 'Auspicious', description: 'The nurturer; the most nourishing energy.', focus: 'Personal care, health, and nourishment.' },
  { id: 20, name: 'Ashvini', nature: 'Auspicious', description: 'The cosmic physicians; speed and technology.', focus: 'Medical treatments and fast transport.' },
  { id: 21, name: 'Yama', nature: 'Inauspicious', description: 'The god of justice and endings.', focus: 'Finalizing deals and settling accounts.' },
  { id: 22, name: 'Agni', nature: 'Auspicious', description: 'The sacred fire of transformation.', focus: 'Rituals, energy work, and passion.' },
  { id: 23, name: 'Vidhatru', nature: 'Auspicious', description: 'The supporter of creation.', focus: 'Building structures and legacies.' },
  { id: 24, name: 'Kanda', nature: 'Auspicious', description: 'Symbolizing the node of growth.', focus: 'Expansion of business or family.' },
  { id: 25, name: 'Aditi', nature: 'Auspicious', description: 'Mother of the gods; limitless freedom.', focus: 'Seeking freedom and breaking boundaries.' },
  { id: 26, name: 'Jivamruta', nature: 'Auspicious', description: 'The nectar that provides life.', focus: 'Vitality and restoration.' },
  { id: 27, name: 'Vishnu', nature: 'Auspicious', description: 'The preserver of the universe.', focus: 'Sustaining projects and relationships.' },
  { id: 28, name: 'Dyumadgadyuti', nature: 'Auspicious', description: 'Splendor and clarity of thought.', focus: 'Speech, writing, and teaching.' },
  { id: 29, name: 'Brahma', nature: 'Very Auspicious', description: 'Highest state of consciousness; absolute creation.', focus: 'Prayer, high-level meditation, and deep spirit.' },
  { id: 30, name: 'Samudra', nature: 'Auspicious', description: 'The vast ocean; completion of the cycle.', focus: 'Completion, travel, and grand vision.' },
];

export function getCurrentMuhurta(date: Date = new Date(), sunrise: Date = new Date()): Muhurta {
  // Approximate sunrise to 6 AM if not provided correctly
  const s = new Date(date);
  s.setHours(6, 0, 0, 0); 
  
  // Actually, let's just use the current time relative to the 24h cycle
  // starting at sunrise (6 AM for simplicity unless we fetch it)
  let diffMs = date.getTime() - s.getTime();
  if (diffMs < 0) {
    // Before 6 AM, it's the late muhurtas of the previous day
    diffMs += 24 * 60 * 60 * 1000;
  }

  const minsSinceSunrise = diffMs / (60 * 1000);
  const muhurtaIndex = Math.floor(minsSinceSunrise / 48) % 30;
  
  const m = MUHURTAS[muhurtaIndex];
  return {
    ...m,
    cumulativePercentage: ((muhurtaIndex + 1) * 3.33333333)
  };
}
