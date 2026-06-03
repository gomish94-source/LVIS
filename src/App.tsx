import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, MapPin, Loader2, Info, RefreshCw, Compass, Sparkles, TrendingUp, CloudSun, Globe, Newspaper, Eye } from 'lucide-react';
import { getMoonData, MoonData, getMoonZodiacConstellation, ConstellationDetails, ZODIAC_SURROUNDINGS, LUNA_ADVICE, getNepaliDate, NepaliDateDetails, TRANSIT_ONE_WORDS, CONSTELLATIONS } from './utils/astro';
import { getCurrentMuhurta, Muhurta, MUHURTAS } from './utils/vedic';

const ZODIAC_SYMBOLS: Record<string, string> = {
  "Aries": "♈",
  "Taurus": "♉",
  "Gemini": "♊",
  "Cancer": "♋",
  "Leo": "♌",
  "Virgo": "♍",
  "Libra": "♎",
  "Scorpio": "♏",
  "Sagittarius": "♐",
  "Capricorn": "♑",
  "Aquarius": "♒",
  "Pisces": "♓"
};

const ELEMENT_BACKGROUNDS: Record<string, string> = {
  "Fire": "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?auto=format&fit=crop&w=400&q=80",
  "Earth": "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=400&q=80",
  "Air": "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=400&q=80",
  "Water": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80"
};

const CONSTELLATION_GEOMETRY: Record<string, { stars: Array<{x: number, y: number}>, lines: Array<[number, number]> }> = {
  "Aries": {
    stars: [{x: 15, y: 45}, {x: 45, y: 30}, {x: 70, y: 45}, {x: 85, y: 60}],
    lines: [[0, 1], [1, 2], [2, 3]]
  },
  "Taurus": {
    stars: [{x: 40, y: 55}, {x: 50, y: 50}, {x: 55, y: 60}, {x: 45, y: 65}, {x: 25, y: 30}, {x: 10, y: 20}, {x: 60, y: 40}, {x: 75, y: 30}, {x: 65, y: 80}, {x: 85, y: 75}],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5], [2, 6], [6, 7], [0, 8], [8, 9]]
  },
  "Gemini": {
    stars: [{x: 25, y: 20}, {x: 25, y: 45}, {x: 25, y: 75}, {x: 15, y: 35}, {x: 35, y: 35}, {x: 55, y: 20}, {x: 55, y: 45}, {x: 55, y: 75}, {x: 45, y: 35}, {x: 65, y: 35}],
    lines: [[0, 1], [1, 2], [3, 4], [5, 6], [6, 7], [8, 9], [4, 8]]
  },
  "Cancer": {
    stars: [{x: 50, y: 45}, {x: 30, y: 25}, {x: 70, y: 25}, {x: 50, y: 65}, {x: 40, y: 85}, {x: 60, y: 85}],
    lines: [[0, 1], [0, 2], [0, 3], [3, 4], [3, 5]]
  },
  "Leo": {
    stars: [{x: 75, y: 45}, {x: 70, y: 30}, {x: 55, y: 25}, {x: 45, y: 30}, {x: 45, y: 45}, {x: 55, y: 55}, {x: 25, y: 60}, {x: 20, y: 75}, {x: 35, y: 80}],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 5], [5, 0]]
  },
  "Virgo": {
    stars: [{x: 50, y: 20}, {x: 35, y: 35}, {x: 30, y: 55}, {x: 60, y: 45}, {x: 55, y: 70}, {x: 75, y: 80}, {x: 80, y: 30}],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 2], [4, 5], [3, 6]]
  },
  "Libra": {
    stars: [{x: 20, y: 35}, {x: 40, y: 30}, {x: 80, y: 25}, {x: 30, y: 65}, {x: 45, y: 55}, {x: 70, y: 55}, {x: 55, y: 60}],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 0], [2, 5], [5, 6], [6, 2]]
  },
  "Scorpio": {
    stars: [{x: 30, y: 20}, {x: 50, y: 30}, {x: 70, y: 20}, {x: 50, y: 50}, {x: 45, y: 65}, {x: 55, y: 75}, {x: 70, y: 75}, {x: 78, y: 65}],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7]]
  },
  "Sagittarius": {
    stars: [{x: 35, y: 45}, {x: 65, y: 45}, {x: 65, y: 75}, {x: 35, y: 75}, {x: 50, y: 25}, {x: 20, y: 55}, {x: 80, y: 55}],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1], [0, 5], [5, 3], [1, 6], [6, 2]]
  },
  "Capricorn": {
    stars: [{x: 20, y: 30}, {x: 35, y: 65}, {x: 60, y: 70}, {x: 55, y: 35}, {x: 80, y: 45}],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2]]
  },
  "Aquarius": {
    stars: [{x: 35, y: 25}, {x: 50, y: 30}, {x: 45, y: 45}, {x: 30, y: 55}, {x: 25, y: 75}, {x: 55, y: 65}, {x: 65, y: 80}],
    lines: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [2, 5], [5, 6]]
  },
  "Pisces": {
    stars: [{x: 20, y: 25}, {x: 30, y: 20}, {x: 35, y: 30}, {x: 25, y: 35}, {x: 40, y: 55}, {x: 55, y: 75}, {x: 75, y: 50}, {x: 80, y: 40}, {x: 70, y: 40}, {x: 65, y: 50}],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [6, 7], [7, 8], [8, 9], [9, 6], [9, 5]]
  }
};

function getWeatherCondition(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
    85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Thunderstorm with Heavy Hail"
  };
  return codes[code] || "Cosmic Sky";
}

const MAJOR_ARCANA = [
  {
    id: 0,
    name: "The Fool",
    number: "0",
    concept: "Pure Potential",
    generalMeaning: "A blank celestial slate. Today, fresh impulses and untamed free-will align to open unexpected pathways.",
    cosmicGuidance: "Adopt absolute open-mindedness. Release rigid strategies and take a courageous step of faith.",
    themeColor: "text-amber-400 border-amber-500/20 shadow-amber-500/5 bg-[#17130a]/60",
    accentColor: "#d4af37",
    iconType: "fool"
  },
  {
    id: 1,
    name: "The Magician",
    number: "I",
    concept: "Manifestation",
    generalMeaning: "All cosmic elements are at your disposal today. Focused action and willpower catalyze instant results.",
    cosmicGuidance: "Direct your primary attention toward a single execution. Your creative skill is highly magnified.",
    themeColor: "text-emerald-400 border-emerald-500/20 shadow-emerald-500/5 bg-[#0a1711]/60",
    accentColor: "#34d399",
    iconType: "magician"
  },
  {
    id: 2,
    name: "The High Priestess",
    number: "II",
    concept: "Inner Intuition",
    generalMeaning: "The veil is thin. Deep insights, whispers from dreams, and subconscious patterns reveal hidden directions.",
    cosmicGuidance: "Pause external activity. Trust the quiet inner voice before taking any tangible steps.",
    themeColor: "text-cyan-400 border-cyan-500/20 shadow-cyan-500/5 bg-[#0a1617]/60",
    accentColor: "#22d3ee",
    iconType: "priestess"
  },
  {
    id: 3,
    name: "The Empress",
    number: "III",
    concept: "Cosmic Abundance",
    generalMeaning: "Today is rich with creative fertility and natural comfort. Ideas and projects find direct nourishment.",
    cosmicGuidance: "Express artistic impulses, indulge in sensory connection with nature, and nurture growing projects.",
    themeColor: "text-pink-400 border-pink-500/20 shadow-pink-500/5 bg-[#170a13]/60",
    accentColor: "#f472b6",
    iconType: "empress"
  },
  {
    id: 4,
    name: "The Emperor",
    number: "IV",
    concept: "Sovereign Order",
    generalMeaning: "Structure, discipline, and organized efforts stand firm today. You hold the ultimate authority of your focus.",
    cosmicGuidance: "Establish precise boundaries. Organize messy tasks and construct robust frameworks for others.",
    themeColor: "text-rose-400 border-rose-500/20 shadow-rose-500/5 bg-[#170a0a]/60",
    accentColor: "#f43f5e",
    iconType: "emperor"
  },
  {
    id: 5,
    name: "The Hierophant",
    number: "V",
    concept: "Sacred Formats",
    generalMeaning: "Aligned with timeless principles and established wisdom, classical structures provide deep security.",
    cosmicGuidance: "Honor master techniques, study lineage patterns, or follow proven, orderly protocols.",
    themeColor: "text-yellow-500 border-yellow-500/20 shadow-yellow-500/5 bg-[#17150a]/60",
    accentColor: "#eab308",
    iconType: "hierophant"
  },
  {
    id: 6,
    name: "The Lovers",
    number: "VI",
    concept: "Perfect Harmony",
    generalMeaning: "Bridges of cooperation and value-alignment form effortlessly today. Your desires synchronize perfectly.",
    cosmicGuidance: "Choose from a place of unified values. Coordinate and collaborate closely with partners.",
    themeColor: "text-teal-400 border-teal-500/20 shadow-teal-500/5 bg-[#0a1714]/60",
    accentColor: "#2dd4bf",
    iconType: "lovers"
  },
  {
    id: 7,
    name: "The Chariot",
    number: "VII",
    concept: "Victory & Will",
    generalMeaning: "Conflicting currents are harnessed under single-minded willpower. A focused surge overcomes obstacles.",
    cosmicGuidance: "Proceed with absolute determination. Manage distractions and speed forward.",
    themeColor: "text-indigo-400 border-indigo-500/20 shadow-indigo-500/5 bg-[#0d0a17]/60",
    accentColor: "#818cf8",
    iconType: "chariot"
  },
  {
    id: 8,
    name: "Strength",
    number: "VIII",
    concept: "Quiet Fortitude",
    generalMeaning: "Gentle patience and inner resolve conquer force. Your calm composure is your greatest power.",
    cosmicGuidance: "Lead with empathy, quiet confidence, and soft influence instead of aggressive demands.",
    themeColor: "text-amber-500 border-amber-600/20 shadow-amber-600/5 bg-[#17120a]/60",
    accentColor: "#f59e0b",
    iconType: "strength"
  },
  {
    id: 9,
    name: "The Hermit",
    number: "IX",
    concept: "Deep Sanctuary",
    generalMeaning: "Retreating slightly from noisy chatter allows your inner lantern to reveal critical long-term truths.",
    cosmicGuidance: "Engage in silent observation. Rest your senses and reflect on your core trajectory.",
    themeColor: "text-purple-400 border-purple-500/20 shadow-purple-500/5 bg-[#120a17]/60",
    accentColor: "#c084fc",
    iconType: "hermit"
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    number: "X",
    concept: "Destiny Shift",
    generalMeaning: "Rhythms of transition are active today. Aligning with natural cycles brings sudden, auspicious breakthroughs.",
    cosmicGuidance: "Stay fluid and adaptable. Welcome unexpected changes as divine pivots in your path.",
    themeColor: "text-gold border-gold/20 shadow-gold/5 bg-[#14120a]/60",
    accentColor: "#d4af37",
    iconType: "wheel"
  },
  {
    id: 11,
    name: "Justice",
    number: "XI",
    concept: "Absolute Clarity",
    generalMeaning: "Truth, intellectual fairness, and balance prevail today. Honest assessments clear confusion.",
    cosmicGuidance: "Evaluate decisions logically. Act with high-integrity fairness and seek objective truths.",
    themeColor: "text-emerald-500 border-emerald-500/20 shadow-emerald-500/5 bg-[#0a170d]/60",
    accentColor: "#10b981",
    iconType: "justice"
  },
  {
    id: 12,
    name: "The Hanged Man",
    number: "XII",
    concept: "New Perspective",
    generalMeaning: "A pause in kinetic output triggers powerful internal wisdom. Today, surrendering control brings clarity.",
    cosmicGuidance: "Suspend immediate action. View your current puzzle from an inverted, counter-intuitive angle.",
    themeColor: "text-violet-400 border-violet-500/20 shadow-violet-500/5 bg-[#0e0a17]/60",
    accentColor: "#a78bfa",
    iconType: "hanged"
  },
  {
    id: 13,
    name: "Death",
    number: "XIII",
    concept: "Rebirth Cycles",
    generalMeaning: "Outworn behaviors or stale routines fade naturally today to clear the path for powerful rejuvenation.",
    cosmicGuidance: "Release old patterns gracefully. Let go of what is finished to allow fresh light to enter.",
    themeColor: "text-fuchsia-500 border-fuchsia-500/20 shadow-fuchsia-500/5 bg-[#170a16]/60",
    accentColor: "#d946ef",
    iconType: "death"
  },
  {
    id: 14,
    name: "Temperance",
    number: "XIV",
    concept: "Divine Balance",
    generalMeaning: "Flowing patience and perfect alchemy integrate diverse activities beautifully. Harmony guides your hours.",
    cosmicGuidance: "Synthesize disparate goals. Practice beautiful moderation and maintain calm pacing.",
    themeColor: "text-sky-400 border-sky-500/20 shadow-sky-500/5 bg-[#0a1417]/60",
    accentColor: "#38bdf8",
    iconType: "temperance"
  },
  {
    id: 15,
    name: "The Devil",
    number: "XV",
    concept: "Self Liberation",
    generalMeaning: "Awareness of self-imposed limits or subconscious anchors rises, allowing complete detachment.",
    cosmicGuidance: "Acknowledge hidden dependency loops. Walk directly out of illusory cages with quiet laughter.",
    themeColor: "text-red-500 border-red-500/20 shadow-red-500/5 bg-[#170a0a]/60",
    accentColor: "#ef4444",
    iconType: "devil"
  },
  {
    id: 16,
    name: "The Tower",
    number: "XVI",
    concept: "Sovereign Shift",
    generalMeaning: "Sudden clarity dismantles weak illusions. Solid ground is revealed beneath fading assumptions.",
    cosmicGuidance: "Welcome structural shakes. They remove heavy mental static to reveal absolute reality.",
    themeColor: "text-orange-400 border-orange-500/20 shadow-orange-500/5 bg-[#170e0a]/60",
    accentColor: "#fb923c",
    iconType: "tower"
  },
  {
    id: 17,
    name: "The Star",
    number: "XVII",
    concept: "Celestial Hope",
    generalMeaning: "Divine inspiration and deep peaceful restoration pour into your aura today. You are fully supported.",
    cosmicGuidance: "Breathe deeply, practice complete optimism, and believe in the graceful flow of your destiny.",
    themeColor: "text-cyan-300 border-cyan-400/20 shadow-cyan-400/5 bg-[#0a1617]/60",
    accentColor: "#67e8f9",
    iconType: "star"
  },
  {
    id: 18,
    name: "The Moon",
    number: "XVIII",
    concept: "Instinctual Shadows",
    generalMeaning: "Flickering twilight heightens receptive psychic currents. Rely on deep, cellular instinct.",
    cosmicGuidance: "Honor mysterious feelings. Avoid analyzing everything logically; let quiet symbols guide you.",
    themeColor: "text-blue-400 border-blue-500/20 shadow-blue-500/5 bg-[#0a0d17]/60",
    accentColor: "#60a5fa",
    iconType: "moon"
  },
  {
    id: 19,
    name: "The Sun",
    number: "XIX",
    concept: "Radiant Clarity",
    generalMeaning: "Glorious vitality, pure joy, and success illuminate today's tasks. All works are filled with warmth.",
    cosmicGuidance: "Adopt absolute transparency. Share your bright enthusiasm and bask in complete success.",
    themeColor: "text-amber-500 border-amber-500/30 shadow-amber-500/10 bg-[#17130a]/50",
    accentColor: "#f59e0b",
    iconType: "sun"
  },
  {
    id: 20,
    name: "Judgment",
    number: "XX",
    concept: "Higher Awakening",
    generalMeaning: "A clear inner clarion call sounds today. You are ready to step into a higher expression of yourself.",
    cosmicGuidance: "Answer the quiet call of your purpose. Rise above past regrets and take the higher road.",
    themeColor: "text-yellow-400 border-yellow-500/20 shadow-yellow-500/5 bg-[#17140a]/60",
    accentColor: "#facc15",
    iconType: "judgment"
  },
  {
    id: 21,
    name: "The World",
    number: "XXI",
    concept: "Universal Synthesis",
    generalMeaning: "Ultimate completion, master cosmic integration, and pristine alignment surround you on all axes.",
    cosmicGuidance: "Celebrate the seamless alignment. You are exactly where you belong in the cosmic coordinate grid.",
    themeColor: "text-purple-500 border-purple-500/20 shadow-purple-500/5 bg-[#120a17]/60",
    accentColor: "#a855f7",
    iconType: "world"
  }
];

function selectDailyTarot(
  lat: number,
  lng: number,
  dateStr: string,
  weatherCode: number,
  marketDir: string,
  synergyPct: number
): typeof MAJOR_ARCANA[0] {
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) {
    sum += dateStr.charCodeAt(i);
  }
  sum += Math.floor(Math.abs(lat) * 10) + Math.floor(Math.abs(lng) * 10);
  sum += weatherCode * 17;
  if (marketDir === "up") sum += 53;
  else if (marketDir === "down") sum += 19;
  sum += Math.floor(synergyPct * 7);
  
  const index = sum % MAJOR_ARCANA.length;
  return MAJOR_ARCANA[index];
}

function generateAlchemicalExplanation(
  cardName: string,
  concept: string,
  weatherText: string,
  weatherTemp: number,
  moonPhase: string,
  moonConstellation: string,
  moonElement: string,
  moonRuler: string,
  isWaxing: boolean
): string {
  let weatherSensing = "";
  const tempStr = `${weatherTemp.toFixed(1)}°C`;
  const lowerWeather = weatherText.toLowerCase();

  if (lowerWeather.includes("clear") || lowerWeather.includes("sunny")) {
    weatherSensing = `Under a clear and open sky at ${tempStr}, direct cosmic solar frequencies filter down unimpeded, highly amplifying the card's active agency.`;
  } else if (lowerWeather.includes("cloud") || lowerWeather.includes("overcast") || lowerWeather.includes("gloom") || lowerWeather.includes("sky")) {
    weatherSensing = `Calibrated beneath an overcast, cloud-shielded canopy at ${tempStr}, external noise is filtered, concentrating the card's currents inward for contemplation.`;
  } else if (lowerWeather.includes("rain") || lowerWeather.includes("drizzle") || lowerWeather.includes("shower") || lowerWeather.includes("thunderstorm")) {
    weatherSensing = `With energetic rain and atmospheric charges present at ${tempStr}, today's natural current triggers rapid alchemical transformation.`;
  } else {
    weatherSensing = `Sensed at a steady ${tempStr} under ${lowerWeather} conditions, local atmospheric pressure reinforces stable, rhythmic integration.`;
  }

  const cycleDirection = isWaxing ? "rising waxing currents (building phase)" : "releasing waning currents (introspective phase)";
  const astroSensing = `Simultaneously, the Moon passes through ${moonConstellation} (a powerful ${moonElement.toLowerCase()} sign ruled by ${moonRuler}). This coordinates the card's core meaning through the lens of ${moonElement.toUpperCase()} and merges with ${cycleDirection}.`;

  return `${weatherSensing} ${astroSensing} Therefore, today's drawn archetype of ${concept.toUpperCase()} is directly infused with these physical elements, recommending that you channel its advice in accordance with these cosmic inputs.`;
}


const renderTarotIcon = (iconType: string, accentColor: string) => {
  switch (iconType) {
    case "fool":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 15,50 Q 35,20 50,50 T 85,50" fill="none" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx="50" cy="50" r="10" fill="none" stroke={accentColor} strokeWidth="2" />
          <line x1="50" y1="20" x2="50" y2="80" stroke={accentColor} strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="2" fill={accentColor} />
          <circle cx="30" cy="30" r="1.5" fill="#fff" className="animate-pulse" />
          <circle cx="70" cy="70" r="1" fill="#fff" />
          <circle cx="75" cy="25" r="1" fill="#fff" className="animate-pulse" />
        </svg>
      );
    case "magician":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 25,50 C 25,35 45,35 50,50 C 55,65 75,65 75,50 C 75,35 55,35 50,50 C 45,65 25,65 25,50 Z" fill="none" stroke={accentColor} strokeWidth="2" />
          <circle cx="50" cy="15" r="3" fill="#fff" />
          <line x1="50" y1="15" x2="50" y2="35" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="20" cy="25" r="1.5" fill={accentColor} />
          <circle cx="80" cy="25" r="1.5" fill={accentColor} />
          <circle cx="20" cy="75" r="1.5" fill={accentColor} />
          <circle cx="80" cy="75" r="1.5" fill={accentColor} />
        </svg>
      );
    case "priestess":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 15,15 L 15,85 M 85,15 L 85,85" stroke={accentColor} strokeWidth="2.5" />
          <path d="M 35,50 A 15,15 0 0,0 65,50 A 13,13 0 0,1 35,50" fill={accentColor} />
          <circle cx="50" cy="50" r="22" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="3,3" />
        </svg>
      );
    case "empress":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="50" cy="40" r="18" fill="none" stroke={accentColor} strokeWidth="2" />
          <path d="M 35,50 Q 50,75 65,50" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="50" cy="58" r="6" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <line x1="50" y1="64" x2="50" y2="78" stroke={accentColor} strokeWidth="1.5" />
          <line x1="43" y1="71" x2="57" y2="71" stroke={accentColor} strokeWidth="1.5" />
          {[0, 90, 180, 270].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const sx = 50 + 26 * Math.cos(rad);
            const sy = 40 + 26 * Math.sin(rad);
            return <circle key={i} cx={sx} cy={sy} r="1.5" fill="#fff" className="animate-pulse" />;
          })}
        </svg>
      );
    case "emperor":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <rect x="30" y="30" width="40" height="40" rx="3" fill="none" stroke={accentColor} strokeWidth="1" className="opacity-10" />
          <path d="M 35,32 Q 50,52 65,32" fill="none" stroke={accentColor} strokeWidth="2" />
          <path d="M 32,38 Q 20,40 25,28 Q 30,16 38,32" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 68,38 Q 80,40 75,28 Q 70,16 62,32" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <line x1="50" y1="20" x2="50" y2="80" stroke={accentColor} strokeWidth="2.5" />
          <circle cx="50" cy="18" r="4.5" fill={accentColor} />
        </svg>
      );
    case "hierophant":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <line x1="50" y1="15" x2="50" y2="80" stroke={accentColor} strokeWidth="2.5" />
          <line x1="30" y1="30" x2="70" y2="30" stroke={accentColor} strokeWidth="2.5" />
          <line x1="35" y1="42" x2="65" y2="42" stroke={accentColor} strokeWidth="2" />
          <line x1="42" y1="54" x2="58" y2="54" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="39" cy="77" r="3" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="61" cy="77" r="3" fill="none" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      );
    case "lovers":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="32" cy="50" r="10" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="68" cy="50" r="10" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 50,36 C 50,28 38,28 38,36 C 38,44 50,55 50,55 C 50,55 62,44 62,36 C 62,28 50,28 50,36 Z" fill={accentColor} className="opacity-75" />
        </svg>
      );
    case "chariot":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <polygon points="50,15 15,45 85,45" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <line x1="30" y1="45" x2="30" y2="85" stroke={accentColor} strokeWidth="2" />
          <line x1="70" y1="45" x2="70" y2="85" stroke={accentColor} strokeWidth="2" />
          <circle cx="50" cy="65" r="9" fill="none" stroke={accentColor} strokeWidth="2" />
        </svg>
      );
    case "strength":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 50,20 C 35,20 35,32 50,32 C 65,32 65,20 50,20 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="50" cy="48" r="12" fill="none" stroke={accentColor} strokeWidth="1.1" strokeDasharray="2,2" />
          <polygon points="50,40 42,56 58,56" fill="none" stroke={accentColor} strokeWidth="2" />
        </svg>
      );
    case "hermit":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="50" cy="45" r="14" fill="none" stroke={accentColor} strokeWidth="2" />
          <polygon points="50,36 58,50 42,50" fill="none" stroke="#fff" strokeWidth="1" />
          <polygon points="50,54 58,40 42,40" fill="none" stroke="#fff" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="80" stroke={accentColor} strokeWidth="2" />
        </svg>
      );
    case "wheel":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="50" cy="50" r="22" fill="none" stroke={accentColor} strokeWidth="2" />
          <circle cx="50" cy="50" r="10" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="4,2" />
          {[0, 90, 180, 270].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const sx = 50 + 22 * Math.cos(rad);
            const sy = 50 + 22 * Math.sin(rad);
            return <line key={i} x1="50" y1="50" x2={sx} y2={sy} stroke={accentColor} strokeWidth="1" />;
          })}
        </svg>
      );
    case "justice":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <line x1="50" y1="20" x2="50" y2="78" stroke={accentColor} strokeWidth="2.5" />
          <line x1="25" y1="36" x2="75" y2="36" stroke={accentColor} strokeWidth="2.5" />
          <line x1="25" y1="36" x2="18" y2="60" stroke={accentColor} strokeWidth="1" />
          <line x1="75" y1="36" x2="82" y2="60" stroke={accentColor} strokeWidth="1" />
          <path d="M 14,60 Q 25,70 36,60 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 64,60 Q 75,70 86,60 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      );
    case "hanged":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="50" cy="74" r="14" fill="none" stroke={accentColor} strokeWidth="1.5" className="animate-pulse" />
          <line x1="50" y1="15" x2="50" y2="60" stroke={accentColor} strokeWidth="2" />
          <polygon points="50,60 38,40 62,40" fill="none" stroke={accentColor} strokeWidth="2" />
        </svg>
      );
    case "death":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 15,75 Q 50,55 85,75" fill="none" stroke={accentColor} strokeWidth="2" />
          <path d="M 50,75 L 50,28" stroke={accentColor} strokeWidth="2" />
          <path d="M 50,28 C 30,35 25,15 50,15 C 75,15 70,35 50,28 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      );
    case "temperance":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 30,22 L 40,22 L 35,42 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 60,68 L 70,68 L 65,48 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 35,32 Q 50,45 65,58" fill="none" stroke={accentColor} strokeWidth="2" className="animate-pulse" strokeDasharray="4,2" />
        </svg>
      );
    case "devil":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 30,25 Q 50,45 70,25" fill="none" stroke={accentColor} strokeWidth="2" />
          <line x1="50" y1="35" x2="50" y2="80" stroke={accentColor} strokeWidth="2" />
          <circle cx="50" cy="50" r="14" fill="none" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      );
    case "tower":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <line x1="35" y1="80" x2="42" y2="30" stroke={accentColor} strokeWidth="2" />
          <line x1="65" y1="80" x2="58" y2="30" stroke={accentColor} strokeWidth="2" />
          <path d="M 70,12 L 53,30 L 61,33 L 42,54" fill="none" stroke="#fff" strokeWidth="2" className="animate-pulse" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <polygon points="50,15 54,34 72,34 58,45 62,64 50,52 38,64 42,45 28,34 46,34" fill="none" stroke={accentColor} strokeWidth="2" />
          <circle cx="20" cy="24" r="1" fill="#fff" />
          <circle cx="80" cy="24" r="1.5" fill="#fff" className="animate-pulse" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="50" cy="42" r="18" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 50,24 A 18,18 0 0,0 50,60" fill={accentColor} className="opacity-40" />
          <rect x="18" y="44" width="4" height="38" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <rect x="78" y="44" width="4" height="38" fill="none" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <circle cx="50" cy="50" r="16" fill="none" stroke={accentColor} strokeWidth="2" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 50 + 19 * Math.cos(rad);
            const y1 = 50 + 19 * Math.sin(rad);
            const x2 = 50 + 28 * Math.cos(rad);
            const y2 = 50 + 28 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accentColor} strokeWidth="1.5" />;
          })}
        </svg>
      );
    case "judgment":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <path d="M 50,15 L 44,48 L 56,48 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <path d="M 44,48 Q 50,65 32,85 L 68,85 Q 50,65 56,48" fill="none" stroke={accentColor} strokeWidth="1.5" />
        </svg>
      );
    case "world":
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-95 mx-auto">
          <ellipse cx="50" cy="50" rx="20" ry="28" fill="none" stroke={accentColor} strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="none" stroke="#fff" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sunrise, setSunrise] = useState<Date | null>(null);
  const [sunset, setSunset] = useState<Date | null>(null);
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [nepaliDate, setNepaliDate] = useState<NepaliDateDetails | null>(null);
  const [currentMuhurta, setCurrentMuhurta] = useState<Muhurta | null>(null);
  const [synergy, setSynergy] = useState<{ status: string; percentage: number; situation: string; advice: string } | null>(null);

  const [moonTransitPresent, setMoonTransitPresent] = useState<{ constellation: ConstellationDetails; longitude: number; startTime: Date; endTime: Date } | null>(null);
  const [moonTransitPast, setMoonTransitPast] = useState<{ constellation: ConstellationDetails; longitude: number; startTime: Date; endTime: Date } | null>(null);
  const [moonTransitUpcoming, setMoonTransitUpcoming] = useState<{ constellation: ConstellationDetails; longitude: number; startTime: Date; endTime: Date } | null>(null);
  const [all12Transits, setAll12Transits] = useState<Array<{
    constellation: ConstellationDetails;
    startTime: Date;
    endTime: Date;
    impact: string;
    precaution: string;
    task: string;
    isActive: boolean;
    isUpcoming: boolean;
    isPast: boolean;
  }>>([]);

  const [isMirrorFlipped, setIsMirrorFlipped] = useState(false);
  const [tarotSynthesis, setTarotSynthesis] = useState<any | null>(null);

  const [tarotAnalysisStep, setTarotAnalysisStep] = useState<number>(0);
  const [isTarotAnalyzing, setIsTarotAnalyzing] = useState<boolean>(false);

  const startTarotSynthesis = () => {
    setIsTarotAnalyzing(true);
    setTarotAnalysisStep(1);
    
    setTimeout(() => {
      setTarotAnalysisStep(2);
      setTimeout(() => {
        setTarotAnalysisStep(3);
        setTimeout(() => {
          setTarotAnalysisStep(4);
          setTimeout(() => {
            setTarotAnalysisStep(5);
            setIsTarotAnalyzing(false);
          }, 950);
        }, 950);
      }, 950);
    }, 950);
  };

  const fetchAstroData = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
      const data = await response.json();
      if (data.status === 'OK') {
        return {
          sunrise: new Date(data.results.sunrise),
          sunset: new Date(data.results.sunset)
        };
      }
    } catch (e) {
      console.error('Failed to fetch sunrise/sunset', e);
    }
    const defSr = new Date(); defSr.setHours(6, 0, 0, 0);
    const defSs = new Date(); defSs.setHours(18, 0, 0, 0);
    return { sunrise: defSr, sunset: defSs };
  };

  const calculateAll = async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      // Moon Data
      const md = getMoonData(now, location?.lat, location?.lng);
      setMoonData(md);

      const nepDate = getNepaliDate(now);
      setNepaliDate(nepDate);

      // Sunrise/Muhurta base
      let sr = sunrise;
      if (location && (!sr || !sunset)) {
        try {
          const astro = await fetchAstroData(location.lat, location.lng);
          sr = astro.sunrise;
          setSunrise(sr);
          setSunset(astro.sunset);
        } catch (fetchErr) {
          console.warn("Sunrise fetch failed", fetchErr);
        }
      }
      
      if (!sr) {
        sr = new Date();
        sr.setHours(6, 0, 0, 0);
      }

      const muhurta = getCurrentMuhurta(now, sr);
      setCurrentMuhurta(muhurta);

      // New Theory Integration
      const mi = md.illumination * 100; // Actual illumination, no inversion
      const pm = muhurta.cumulativePercentage;
      
      // Synergy calculation (synchronization of stage and time)
      const synergyValue = (mi + pm) / 2.0;
      
      // Determine Status and Situation
      let status = "Neutral";
      let situation = "";
      let advice = "";

      const isAuspicious = !muhurta.nature.includes('Inauspicious');

      if (!isAuspicious) {
        status = "Challenging";
        situation = `${muhurta.name} Muhurta is currently active, which is inherently ${muhurta.nature.toLowerCase()}.`;
        advice = "Avoid starting high-stakes projects. Maintain a low profile and focus on routine maintenance tasks.";
      } else {
        if (!md.isWaxing) {
          status = "High Autonomy";
          situation = "Waning Moon cycle is synchronizing with an auspicious Muhurta, maximizing the freedom of personal thought.";
          advice = "Ideal time for introspection, creative breakthroughs, and individual decision-making. Your free will is at its peak.";
        } else {
          status = "Guided Action";
          situation = "Waxing moon illumination is increasing. Personal free will is subtly guided by rising external frequencies.";
          advice = "Excellent for collective efforts and following established patterns. Practice mindfulness to distinguish your own voice from common trends.";
        }
      }

      setSynergy({ status, percentage: synergyValue, situation, advice });

      // Calculate Moon Zodiac Transit Constellations (Past, Present, Upcoming)
      const presMoonTransit = getMoonZodiacConstellation(now);
      setMoonTransitPresent(presMoonTransit);

      // Find index of present constellation
      const presIndex = CONSTELLATIONS.findIndex(c => c.name === presMoonTransit.constellation.name);

      // Past Moon Constellation (calculated as preceding sign relative to current to guarantee absolute astrological order, e.g., Virgo before Libra)
      const pastIndex = (presIndex !== -1) ? (presIndex - 1 + 12) % 12 : 5;
      const pastConstellation = CONSTELLATIONS[pastIndex];
      const pastEndTime = presMoonTransit.startTime;
      const pastStartTime = new Date(pastEndTime.getTime() - 54.58 * 60 * 60 * 1000);
      setMoonTransitPast({
        constellation: pastConstellation,
        longitude: pastIndex * 30 + 15,
        startTime: pastStartTime,
        endTime: pastEndTime,
      });

      // Upcoming Moon Constellation (calculated as succeeding sign relative to current to guarantee absolute astronomical progression, e.g., Scorpio after Libra)
      const upcomingIndex = (presIndex !== -1) ? (presIndex + 1) % 12 : 7;
      const upcomingConstellation = CONSTELLATIONS[upcomingIndex];
      const upcomingStartTime = presMoonTransit.endTime;
      const upcomingEndTime = new Date(upcomingStartTime.getTime() + 54.58 * 60 * 60 * 1000);
      setMoonTransitUpcoming({
        constellation: upcomingConstellation,
        longitude: upcomingIndex * 30 + 15,
        startTime: upcomingStartTime,
        endTime: upcomingEndTime,
      });

      // Generate all 12 transits chronologically centered around the current active transit to guarantee perfect, seamless astronomical cycles
      const activeIdx = (presIndex !== -1) ? presIndex : 0;
      const transitList = CONSTELLATIONS.map((constellation, i) => {
        let stepDiff = i - activeIdx;
        if (stepDiff > 6) stepDiff -= 12;
        if (stepDiff < -6) stepDiff += 12;

        const avgDuration = 54.5833 * 60 * 60 * 1000; // ~54.58 hours average transit speed
        
        let startTime: Date;
        let endTime: Date;

        if (stepDiff === 0) {
          startTime = presMoonTransit.startTime;
          endTime = presMoonTransit.endTime;
        } else {
          const offsetMs = stepDiff * avgDuration;
          startTime = new Date(presMoonTransit.startTime.getTime() + offsetMs);
          endTime = new Date(presMoonTransit.endTime.getTime() + offsetMs);
        }

        const oneWord = TRANSIT_ONE_WORDS[constellation.name] || { impact: "Transition", precaution: "Adaptation", task: "Awareness" };

        return {
          constellation,
          startTime,
          endTime,
          impact: oneWord.impact,
          precaution: oneWord.precaution,
          task: oneWord.task,
          isActive: stepDiff === 0,
          isUpcoming: stepDiff > 0,
          isPast: stepDiff < 0
        };
      });
      setAll12Transits(transitList);
 
      // 3. Daily Tarot Card Synthesis and Environmental Analytics
      const activeLat = location?.lat ?? 27.67;
      const activeLng = location?.lng ?? 85.42;

      let weatherTemp = 24.5;
      let weatherCode = 0;
      let weatherText = "Mainly Clear Sky";
      let isWeatherFetched = false;
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${activeLat}&longitude=${activeLng}&current_weather=true`);
        const weatherData = await weatherRes.json();
        if (weatherData && weatherData.current_weather) {
          weatherTemp = weatherData.current_weather.temperature;
          weatherCode = weatherData.current_weather.weathercode;
          weatherText = getWeatherCondition(weatherCode);
          isWeatherFetched = true;
        }
      } catch (err) {
        console.warn("Weather fetch failed, utilizing baseline forecast", err);
      }

      let finalCity = "Bhaktapur";
      let finalCountry = "Nepal";
      let isNepal = true;

      if (activeLat >= 26.0 && activeLat <= 31.0 && activeLng >= 80.0 && activeLng <= 89.0) {
        finalCity = "Bhaktapur";
        finalCountry = "Nepal";
        isNepal = true;
      } else {
        isNepal = false;
        if (Math.abs(activeLat - 40.71) < 1.5 && Math.abs(activeLng - (-74.0)) < 1.5) {
          finalCity = "New York City";
          finalCountry = "USA";
        } else if (Math.abs(activeLat - 51.5) < 1.5 && Math.abs(activeLng - 0) < 1.5) {
          finalCity = "London";
          finalCountry = "UK";
        } else if (Math.abs(activeLat - 35.67) < 1.5 && Math.abs(activeLng - 139.65) < 1.5) {
          finalCity = "Tokyo";
          finalCountry = "Japan";
        } else if (Math.abs(activeLat - (-33.86)) < 1.5 && Math.abs(activeLng - 151.2) < 1.5) {
          finalCity = "Sydney";
          finalCountry = "Australia";
        } else if (Math.abs(activeLat - 28.6) < 1.5 && Math.abs(activeLng - 77.2) < 1.5) {
          finalCity = "New Delhi";
          finalCountry = "India";
        } else {
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${activeLat}&lon=${activeLng}&zoom=10`, {
              headers: { "User-Agent": "AstroCalibrateApplet/1.0" }
            });
            const geoData = await geoRes.json();
            if (geoData && geoData.address) {
              finalCity = geoData.address.city || geoData.address.town || geoData.address.suburb || geoData.address.village || "Ecliptic Node";
              finalCountry = geoData.address.country || "Ecliptic Realm";
              if (finalCountry.toLowerCase().includes("nepal")) {
                isNepal = true;
              }
            } else {
              finalCity = "Ecliptic Node";
              finalCountry = "Global Grid";
            }
          } catch (_) {
            finalCity = `Lat: ${activeLat.toFixed(1)}°`;
            finalCountry = `Lng: ${activeLng.toFixed(1)}°`;
          }
        }
      }

      let newsHeadline = "";
      let marketName = "";
      let marketIndex = "";
      let marketChange = "";
      let marketDirection: 'up' | 'down' | 'neutral' = 'neutral';
      let isRealDataCombined = false;

      // Real live date verification
      const isDateToday = (pubDateStr: string): boolean => {
        if (!pubDateStr) return false;
        try {
          const pubDate = new Date(pubDateStr);
          const nowTime = new Date();
          // Maximum 30 hours threshold to account for timezone differences (Nepal is UTC+5:45)
          const diffHours = Math.abs(nowTime.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
          return diffHours <= 30;
        } catch (e) {
          return false;
        }
      };

      try {
        if (isNepal) {
          // Attempt to fetch custom MeroLagani RSS and parse NEPSE index
          const nepseUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://merolagani.com/RssFeed.aspx?type=news`;
          const newsUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://english.onlinekhabar.com/feed`;

          const [nepseRes, newsRes] = await Promise.all([
            fetch(nepseUrl).then(r => r.json()).catch(() => null),
            fetch(newsUrl).then(r => r.json()).catch(() => null)
          ]);

          let foundNepse = false;
          let foundNews = false;

          if (nepseRes && nepseRes.status === "ok" && Array.isArray(nepseRes.items)) {
            // Traverse items to find NEPSE update
            const nepseItem = nepseRes.items.find((item: any) => 
              item.title.toUpperCase().includes("NEPSE") || 
              item.title.toUpperCase().includes("INDEX") ||
              item.title.toUpperCase().includes("MARKET")
            );

            if (nepseItem && isDateToday(nepseItem.pubDate)) {
              const numbers = nepseItem.title.match(/\b[123]\d{3}(?:\.\d+)?\b/);
              const indexValue = numbers ? parseFloat(numbers[0]) : null;
              
              if (indexValue) {
                marketName = "NEPSE (Nepal)";
                marketIndex = indexValue.toFixed(2);
                
                let dir: 'up' | 'down' | 'neutral' = 'neutral';
                const titleLower = nepseItem.title.toLowerCase();
                if (titleLower.includes("increase") || titleLower.includes("gain") || titleLower.includes("up") || titleLower.includes("climbs") || titleLower.includes("advance") || titleLower.includes("rise")) {
                  dir = 'up';
                } else if (titleLower.includes("decrease") || titleLower.includes("loss") || titleLower.includes("down") || titleLower.includes("falls") || titleLower.includes("slips") || titleLower.includes("decline")) {
                  dir = 'down';
                }
                marketDirection = dir;

                const pointsMatch = nepseItem.title.match(/(\d+\.\d+)\s*point/i);
                const pointChange = pointsMatch ? parseFloat(pointsMatch[1]) : null;
                if (pointChange) {
                  marketChange = `${dir === 'up' ? '+' : '-'}${pointChange.toFixed(2)} (${dir === 'up' ? '+' : '-'}${((pointChange / indexValue) * 100).toFixed(2)}%)`;
                } else {
                  marketChange = dir === 'up' ? '+0.45%' : dir === 'down' ? '-0.45%' : '0.00%';
                }
                foundNepse = true;
              }
            }
          }

          if (newsRes && newsRes.status === "ok" && Array.isArray(newsRes.items) && newsRes.items.length > 0) {
            const newsItem = newsRes.items[0];
            if (newsItem && isDateToday(newsItem.pubDate)) {
              newsHeadline = newsItem.title;
              foundNews = true;
            }
          }

          if (foundNepse && foundNews) {
            isRealDataCombined = true;
          }
        } else {
          // If NOT in Nepal, attempt to fetch global S&P 500 equivalent and US News
          const globalFinanceUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://finance.yahoo.com/rss/topstories`;
          const globalNewsUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en`;

          const [financeRes, newsRes] = await Promise.all([
            fetch(globalFinanceUrl).then(r => r.json()).catch(() => null),
            fetch(globalNewsUrl).then(r => r.json()).catch(() => null)
          ]);

          let foundFinance = false;
          let foundNews = false;

          if (financeRes && financeRes.status === "ok" && Array.isArray(financeRes.items) && financeRes.items.length > 0) {
            const financeItem = financeRes.items[0];
            if (financeItem && isDateToday(financeItem.pubDate)) {
              marketName = "S&P 500 (USA)";
              const numMatch = financeItem.title.match(/\b([456]\d{3}(?:\.\d+)?)\b/);
              const indexValue = numMatch ? parseFloat(numMatch[1]) : 5210.50;
              marketIndex = indexValue.toFixed(2);
              
              let dir: 'up' | 'down' | 'neutral' = 'neutral';
              const titleLower = financeItem.title.toLowerCase();
              if (titleLower.includes("up") || titleLower.includes("gains") || titleLower.includes("rises") || titleLower.includes("climbs") || titleLower.includes("higher") || titleLower.includes("advance")) {
                dir = 'up';
              } else if (titleLower.includes("down") || titleLower.includes("falls") || titleLower.includes("slips") || titleLower.includes("lower") || titleLower.includes("decline")) {
                dir = 'down';
              }
              marketDirection = dir;
              marketChange = dir === 'up' ? '+0.35%' : dir === 'down' ? '-0.35%' : '0.00%';
              foundFinance = true;
            }
          }

          if (newsRes && newsRes.status === "ok" && Array.isArray(newsRes.items) && newsRes.items.length > 0) {
            const newsItem = newsRes.items[0];
            if (newsItem && isDateToday(newsItem.pubDate)) {
              newsHeadline = newsItem.title;
              foundNews = true;
            }
          }

          if (foundFinance && foundNews) {
            isRealDataCombined = true;
          }
        }
      } catch (err) {
        console.warn("Real stock and news API fetch failed", err);
      }

      const dateString = now.toISOString().split('T')[0];
      const drawnCard = selectDailyTarot(
        activeLat,
        activeLng,
        dateString,
        isWeatherFetched ? weatherCode : 0,
        isRealDataCombined ? marketDirection : "neutral",
        isRealDataCombined ? synergyValue : 0
      );

      setTarotSynthesis({
        card: drawnCard,
        weather: {
          temp: weatherTemp,
          text: weatherText,
          code: weatherCode,
          isFetched: isWeatherFetched
        },
        news: {
          headline: newsHeadline,
          marketName,
          marketIndex,
          marketChange,
          marketDirection,
          cityName: finalCity,
          countryName: finalCountry
        },
        moon: {
          illumination: md.illumination,
          phaseName: md.phaseName,
          isWaxing: md.isWaxing,
          constellationName: presMoonTransit?.constellation.name || "Aries",
          sanskritName: presMoonTransit?.constellation.sanskritName || "Mesha",
          ruler: presMoonTransit?.constellation.ruler || "Mars",
          element: presMoonTransit?.constellation.element || "Fire",
          longitude: presMoonTransit?.longitude ?? 15,
        },
        isRealDataCombined
      });
      setTarotAnalysisStep(0);

    } catch (err) {
      console.error("Calculate synergy error", err);
      setError("Sync Error: Using basic mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial calculation with defaults immediately so the screen isn't white
    calculateAll();

    // 2. Safety timeout: If everything hangs, stop the loading spinner after 4 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const init = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setError(null);
            },
            (err) => {
              console.warn('Geolocation failed', err);
              setError("Using default location (GPS timeout/denied).");
              // Already called calculateAll with defaults at start
            },
            { 
              enableHighAccuracy: false, 
              timeout: 6000, 
              maximumAge: 120000 
            }
          );
        } else {
          setError("Location services unavailable.");
        }
      } catch (e) {
        console.error("Initialization error", e);
        setError("Error initializing sensors. Using defaults.");
      }
    };

    init();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location || error) {
      calculateAll();
    }
  }, [location, error]);

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-gold/30 flex flex-col">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-bg flex flex-col items-center justify-center gap-6"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-gold/20 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-gold tracking-[0.4em] uppercase text-xs font-bold animate-pulse">Initializing Cosmic Synergy</h1>
              <span className="text-white/20 text-[10px] tracking-widest uppercase">Calibrating for Poco X5 Pro</span>
            </div>
            {error && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setLoading(false)}
                className="mt-4 px-4 py-2 border border-white/10 rounded text-[9px] uppercase tracking-widest text-white/40 hover:bg-white/5"
              >
                Skip Wait & View
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background radial accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-gold)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-10 py-10 flex-1 flex flex-col">
        <header className="flex justify-between items-end border-b border-white/10 pb-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl font-light tracking-wide uppercase">
              {location ? `BHAKTAPUR, NEPAL` : "GLOBAL POSITION"}
            </h1>
            <p className="text-dim text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              <span className="opacity-30">&bull;</span>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="text-[10px] text-gold border border-gold/40 px-3 py-1 rounded-full uppercase tracking-widest font-medium">
               EMA STABLE
             </div>
             {error && <span className="text-[9px] text-red-400 uppercase tracking-tighter italic">{error}</span>}
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sun className="w-3 h-3" /> Sunrise
            </div>
            <div className="text-xl font-light">{sunrise ? sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/20 border-t-gold rounded-full" /> Sunset
            </div>
            <div className="text-xl font-light">{sunset ? sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Moon className="w-3 h-3" /> Moonrise
            </div>
            <div className="text-xl font-light">{moonData?.moonrise ? moonData.moonrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/20 border-b-gold rounded-full" /> Moonset
            </div>
            <div className="text-xl font-light">{moonData?.moonset ? moonData.moonset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Moon className="w-3 h-3 text-gold/60" /> Transit
            </div>
            <div className="text-xl font-light">{moonData?.moonTransit ? moonData.moonTransit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
            <div className="text-[8px] text-dim font-mono uppercase mt-1">High Point</div>
          </div>
          <div className="bg-white/5 border border-gold/10 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group shadow-[0_4px_20px_-10px_rgba(212,175,55,0.1)]">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <RefreshCw className="w-8 h-8 text-gold" />
            </div>
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              Peak Lunar
            </div>
            <div className="text-xl font-light text-gold">{((moonData?.peakIllumination ?? 0) * 100).toFixed(1)}%</div>
            <div className="text-[9px] text-dim font-mono uppercase mt-1">at {moonData?.peakIlluminationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-12 flex-1">
          {/* Left Sidebar: Lunar Phases */}
          <aside className="bg-white/[0.03] border border-white/5 rounded-sm p-6 flex flex-col h-full max-h-[600px]">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-dim mb-6 border-b border-white/5 pb-3">Lunar Phases</h2>
            
            <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { name: "New Moon", range: "0%" },
                { name: "Waxing Crescent", range: "1-49%" },
                { name: "First Quarter", range: "50%" },
                { name: "Waxing Gibbous", range: "51-99%" },
                { name: "Full Moon", range: "100%" },
                { name: "Waning Gibbous", range: "99-51%" },
                { name: "Last Quarter", range: "50%" },
                { name: "Waning Crescent", range: "49-1%" },
              ].map((phase) => {
                const isActive = moonData?.phaseName === phase.name;
                return (
                  <div 
                    key={phase.name}
                    className={`flex justify-between py-2 px-3 text-[11px] transition-all duration-500 rounded ${
                      isActive ? 'bg-gold/10 text-gold font-bold opacity-100' : 'opacity-40 text-white'
                    }`}
                  >
                    <span>{phase.name}</span>
                    <span className="font-mono">{isActive ? `${((moonData?.illumination ?? 0) * 100).toFixed(0)}%` : phase.range}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Hero Panel */}
          <main className="flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {loading ? null : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center mb-6 group">
                    <div className={`absolute inset-0 border border-dashed rounded-full animate-[spin_60s_linear_infinite] ${
                      synergy?.status === 'Good' ? 'border-gold/30' : synergy?.status === 'Less Favourable' ? 'border-orange-500/30' : 'border-white/10'
                    }`} />
                    <div className="absolute inset-4 border border-white/5 rounded-full" />
                    
                    {/* Visual Moon Projection */}
                    <div 
                      id="moon-visual-projection-container"
                      onClick={() => setIsMirrorFlipped(!isMirrorFlipped)}
                      title="Click to Mirror Flip (Northern ⇄ Southern Hemisphere View)"
                      className="w-32 h-32 rounded-full overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.05)] cursor-pointer hover:scale-105 active:scale-95 transition-all duration-500 flex items-center justify-center"
                      style={{ transform: isMirrorFlipped ? 'scaleX(-1)' : 'none' }}
                    >
                      <div 
                        className="absolute inset-0 bg-white"
                        style={{ 
                          clipPath: `inset(0 0 0 ${100 - (moonData?.illumination ?? 0) * 100}%)`
                        }}
                      />
                      <div className="absolute inset-0 bg-dark-bg/60 mix-blend-multiply" />
                    </div>
                  </div>

                  {/* Bikram Sambat Calendar Badge Panel */}
                  {nepaliDate && (
                    <div id="nepali-astro-calendar-panel" className="flex items-center justify-center gap-3.5 mb-8 px-5 py-2 bg-white/[0.03] border border-white/10 rounded-full max-w-sm mx-auto shadow-xl backdrop-blur-md">
                      {/* Bikram Sambat Date */}
                      <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase border border-white/10 px-1.5 py-0.5 rounded">B.S.</span>
                      <span className="text-sm text-gold font-bold tracking-wider cursor-help" title={`BS: ${nepaliDate.formattedBS} (${nepaliDate.formattedBSNepali})`}>
                        {nepaliDate.formattedBS}
                      </span>
                      <span className="text-zinc-600 font-light select-none">•</span>
                      {/* Weekday */}
                      <span className="text-xs text-zinc-300 font-medium cursor-help" title={nepaliDate.dayOfWeekNepali}>
                        {nepaliDate.dayOfWeekEnglish}
                      </span>
                    </div>
                  )}

                  <span className="text-[11px] font-medium tracking-[0.4em] uppercase text-gold mb-4">Lunar-Muhurta Synergy</span>
                  <h2 className={`font-serif italic text-6xl md:text-7xl font-black transition-colors duration-700 drop-shadow-2xl mb-2 tracking-tighter ${
                    synergy?.status === 'High Autonomy' ? 'text-gold' : synergy?.status === 'Guided Action' ? 'text-blue-300' : 'text-red-400'
                  }`}>
                    {synergy?.status ?? "Initializing"} <span className="text-3xl not-italic font-sans font-light text-white/40">with {(synergy?.percentage ?? 0).toFixed(2)}%</span>
                  </h2>
                                    <div className="max-w-xl mx-auto mt-8 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left backdrop-blur-md">
                      <div className="text-[10px] text-dim uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info className="w-3 h-3 text-gold" />
                        Cosmic Analysis
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed font-light mb-4">
                        {synergy?.situation}
                      </p>
                      
                      {currentMuhurta && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gold uppercase tracking-[0.2em]">{currentMuhurta.name} Details</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${currentMuhurta.nature.includes('Inauspicious') ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                              {currentMuhurta.nature}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 py-1 border-y border-white/5">
                            <div>
                              <span className="text-[8px] text-dim uppercase block">Starts</span>
                              <span className="text-xs font-mono">{currentMuhurta.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="w-full h-[1px] bg-white/5 relative">
                              <div className="absolute top-1/2 left-0 w-1 h-1 bg-gold rounded-full -translate-y-1/2" />
                              <div className="absolute top-1/2 right-0 w-1 h-1 bg-white/20 rounded-full -translate-y-1/2" />
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-dim uppercase block">Ends</span>
                              <span className="text-xs font-mono">{currentMuhurta.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          <p className="text-white/60 text-xs italic leading-snug">
                            {currentMuhurta.description}
                          </p>
                          <div className="bg-white/5 p-3 rounded-xl">
                            <span className="text-[9px] text-dim uppercase block mb-1">Primary Focus</span>
                            <p className="text-white/90 text-xs">{currentMuhurta.focus}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && <p className="mt-4 text-xs text-red-400 opacity-50 max-w-xs">{error}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Right Column Container */}
          <div className="flex flex-col gap-6">
            {/* Daily Cosmic Tarot Card */}
            {tarotSynthesis && (
              <div id="ecliptic-tarot-synthesis-box" className="bg-[#0b0c10] border border-white/10 rounded-2xl p-5 flex flex-col shadow-2xl relative overflow-hidden group min-w-[300px]">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-gold animate-pulse" /> Ecliptic Tarot Synthesis
                  </span>
                  {tarotAnalysisStep === 5 && (
                    <button 
                      onClick={() => setTarotAnalysisStep(0)}
                      className="text-[8px] font-mono text-zinc-500 uppercase hover:text-gold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5 animate-spin-reverse" /> Re-Analyze
                    </button>
                  )}
                </div>

                {tarotAnalysisStep === 0 && (
                  <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative w-20 h-20 flex items-center justify-center border border-gold/10 rounded-full bg-white/[0.01]">
                      <div className="absolute inset-2 border border-dashed border-gold/25 rounded-full animate-[spin_12s_linear_infinite]" />
                      <Eye className="w-8 h-8 text-gold/60 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase text-gold tracking-widest">Sensing Matrix Idle</h4>
                      <p className="text-[10px] text-zinc-400 font-light leading-relaxed max-w-[240px]">
                        Requires live data parsing from this page itself (Atmospheric Forecasts, Moon Constellation Transits, and Market streams) to reveal today's drawn talisman.
                      </p>
                    </div>
                    <button
                      onClick={startTarotSynthesis}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-gold/15 to-amber-500/10 hover:from-gold/25 hover:to-amber-500/15 border border-gold/30 hover:border-gold/60 rounded-xl text-[10px] uppercase tracking-widest text-gold font-bold transition-all duration-300 shadow-md shadow-gold/5 flex items-center justify-center gap-2 group animate-bounce-subtle"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                      Analyze & Draw Today's Card
                    </button>
                  </div>
                )}

                {/* ANIMATED PROGRESS STEPS LOGS */}
                {tarotAnalysisStep > 0 && tarotAnalysisStep < 5 && (
                  <div className="py-6 px-3 flex flex-col justify-center min-h-[220px] space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                        <span>CALIBRATING SENSORY MATRIX</span>
                        <span className="text-gold font-bold">{tarotAnalysisStep * 25}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-gold to-amber-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${tarotAnalysisStep * 25}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5 font-mono text-[9.5px] leading-relaxed text-left">
                      {/* Step 1 Log */}
                      <div className={`flex items-start gap-2.5 transition-opacity duration-300 ${tarotAnalysisStep >= 1 ? 'opacity-100' : 'opacity-20'}`}>
                        <span className={`shrink-0 ${tarotAnalysisStep > 1 ? 'text-emerald-400 font-bold' : 'text-gold animate-pulse'}`}>
                          {tarotAnalysisStep > 1 ? "✓" : "▶"}
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-zinc-300 uppercase tracking-wider font-semibold">1. Sensing Atmosphere:</span>
                          {tarotAnalysisStep >= 2 && (
                            <p className="text-zinc-500 text-[8.5px]">Synced with Open-Meteo. Detected: {tarotSynthesis.weather.text} ({tarotSynthesis.weather.temp}°C) at coordinates.</p>
                          )}
                        </div>
                      </div>

                      {/* Step 2 Log */}
                      <div className={`flex items-start gap-2.5 transition-opacity duration-300 ${tarotAnalysisStep >= 2 ? 'opacity-100' : 'opacity-20'}`}>
                        <span className={`shrink-0 ${tarotAnalysisStep > 2 ? 'text-emerald-400 font-bold' : tarotAnalysisStep === 2 ? 'text-gold animate-pulse' : 'text-zinc-600'}`}>
                          {tarotAnalysisStep > 2 ? "✓" : tarotAnalysisStep === 2 ? "▶" : "◦"}
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-zinc-300 uppercase tracking-wider font-semibold">2. Lunar Orbit Positioned:</span>
                          {tarotAnalysisStep >= 3 && (
                            <p className="text-zinc-500 text-[8.5px]">Moon is in front of {tarotSynthesis.moon.constellationName} ({tarotSynthesis.moon.sanskritName}) constellation at {tarotSynthesis.moon.longitude.toFixed(1)}° longitude.</p>
                          )}
                        </div>
                      </div>

                      {/* Step 3 Log */}
                      <div className={`flex items-start gap-2.5 transition-opacity duration-300 ${tarotAnalysisStep >= 3 ? 'opacity-100' : 'opacity-20'}`}>
                        <span className={`shrink-0 ${tarotAnalysisStep > 3 ? 'text-emerald-400 font-bold' : tarotAnalysisStep === 3 ? 'text-gold animate-pulse' : 'text-zinc-600'}`}>
                          {tarotAnalysisStep > 3 ? "✓" : tarotAnalysisStep === 3 ? "▶" : "◦"}
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-zinc-300 uppercase tracking-wider font-semibold">3. Cultural & Market Forces Parsed:</span>
                          {tarotAnalysisStep >= 4 && (
                            <p className="text-zinc-500 text-[8.5px]">Market details evaluated: {tarotSynthesis.news.marketName || "Global Finance"} index is {tarotSynthesis.news.marketDirection || "neutral"}.</p>
                          )}
                        </div>
                      </div>

                      {/* Step 4 Log */}
                      <div className={`flex items-start gap-2.5 transition-opacity duration-300 ${tarotAnalysisStep >= 4 ? 'opacity-100' : 'opacity-20'}`}>
                        <span className={`shrink-0 ${tarotAnalysisStep === 4 ? 'text-gold animate-pulse text-xs font-bold' : 'text-zinc-600'}`}>
                          {tarotAnalysisStep === 4 ? "⌬" : "◦"}
                        </span>
                        <div className="space-y-0.5 font-sans">
                          <span className="text-zinc-300 uppercase tracking-wider font-mono font-semibold">4. Harmonizing Card Alchemy...</span>
                          {tarotAnalysisStep === 4 && (
                            <p className="text-gold/80 text-[8.5px] animate-pulse font-mono">Hashing weather text "{tarotSynthesis.weather.text}" & constellation "{tarotSynthesis.moon.constellationName}" into Gateway card selector...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* COMPLETED CARD DISPLAY */}
                {tarotAnalysisStep === 5 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col animate-fadeIn"
                  >
                    {/* The Physical Card Rendering */}
                    <div className="relative w-full aspect-[2/3.2] max-w-[190px] mx-auto mb-5 rounded-2xl border-2 border-gold/30 bg-[#07080e] shadow-[0_0_25px_rgba(212,175,55,0.05)] p-3 flex flex-col justify-between group-hover:border-gold/60 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.12)] transition-all duration-500 overflow-hidden">
                      {/* Mystic Inner Frame */}
                      <div className="absolute inset-1 border border-gold/15 rounded-[12px] pointer-events-none" />
                      
                      {/* Card Header */}
                      <div className="text-center z-10 pt-1">
                        <span className="text-[10px] font-mono text-gold/60 block tracking-[0.3em] uppercase leading-none font-semibold">
                          {tarotSynthesis.card.number}
                        </span>
                        <span className="text-xs font-serif font-black tracking-widest text-white block uppercase mt-0.5">
                          {tarotSynthesis.card.name}
                        </span>
                      </div>

                      {/* Core Celestial Symbol - Placed In Centre */}
                      <div className="my-auto flex items-center justify-center relative w-24 h-24 mx-auto bg-black rounded-full border border-white/5 shadow-inner z-10">
                        <div className="absolute inset-0 rounded-full bg-radial-gradient from-white/[0.03] to-transparent" />
                        {renderTarotIcon(tarotSynthesis.card.iconType, tarotSynthesis.card.accentColor)}
                      </div>

                      {/* Calibrated Stamps on Card Face (Injected Weather and Moon Details) */}
                      <div className="z-10 px-1.5 py-1 mb-1.5 bg-black/65 backdrop-blur-sm rounded border border-white/5 text-left font-mono text-[7.5px] text-zinc-500 leading-normal">
                        <div className="flex justify-between items-center border-b border-white/5 pb-0.5 mb-0.5">
                          <span>WEATHER:</span>
                          <span className="text-gold/90 font-bold truncate max-w-[90px]">{tarotSynthesis.weather.text} ({tarotSynthesis.weather.temp.toFixed(1)}°C)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>LUNA GRID:</span>
                          <span className="text-zinc-300 font-medium truncate max-w-[90px]">{tarotSynthesis.moon.phaseName} @ {tarotSynthesis.moon.constellationName}</span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="text-center z-10 pb-1">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-mono bg-gold/5 px-2 py-0.5 rounded border border-gold/10 inline-block">
                          {tarotSynthesis.card.concept}
                        </span>
                      </div>
                    </div>

                    {/* Card Interpretation and Dynamic Synthesis References */}
                    <div className="space-y-4">
                      <div className="border-t border-white/5 pt-3">
                        <h3 className="text-[11px] uppercase tracking-wider font-bold text-gold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" /> Sensed Alchemy Synthesis
                        </h3>
                        <p className="text-zinc-300 text-[11px] leading-relaxed mt-2 font-normal p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl italic">
                          "{generateAlchemicalExplanation(
                            tarotSynthesis.card.name,
                            tarotSynthesis.card.concept,
                            tarotSynthesis.weather.text,
                            tarotSynthesis.weather.temp,
                            tarotSynthesis.moon.phaseName,
                            tarotSynthesis.moon.constellationName,
                            tarotSynthesis.moon.element,
                            tarotSynthesis.moon.ruler,
                            tarotSynthesis.moon.isWaxing
                          )}"
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[11px] font-semibold text-white/95">Baseline Major Arcana Interpretation</h4>
                        <p className="text-zinc-400 text-[10.5px] leading-relaxed font-light">
                          {tarotSynthesis.card.generalMeaning}
                        </p>
                      </div>

                      {/* GPS Environmental Context Panel */}
                      {tarotSynthesis.isRealDataCombined && (
                        <div className="pt-3 border-t border-white/5 space-y-2">
                          <div className="text-[8px] uppercase tracking-widest text-zinc-500 font-mono">
                            GPS Calibrated Inputs ({tarotSynthesis.news.cityName})
                          </div>
                          
                          <div className="grid grid-cols-1 gap-1.5 font-mono text-[9px] text-zinc-400">
                            {/* Weather Row */}
                            <div className="flex items-center gap-2 bg-white/[0.01] px-2.5 py-1 rounded border border-white/[0.02]">
                              <CloudSun className="w-3 h-3 text-gold/80 shrink-0" />
                              <span className="truncate">
                                Weather: {tarotSynthesis.weather.temp}°C, {tarotSynthesis.weather.text}
                              </span>
                            </div>

                            {/* Market Row */}
                            <div className="flex items-center gap-2 bg-white/[0.01] px-2.5 py-1 rounded border border-white/[0.02]">
                              <TrendingUp className={`w-3 h-3 shrink-0 ${tarotSynthesis.news.marketDirection === 'up' ? 'text-emerald-400' : 'text-red-400'}`} />
                              <span className="truncate">
                                {tarotSynthesis.news.marketName}: {tarotSynthesis.news.marketIndex} ({tarotSynthesis.news.marketChange})
                              </span>
                            </div>

                            {/* Local News Headline Row */}
                            <div className="flex items-start gap-2 bg-white/[0.01] px-2.5 py-1.5 rounded border border-white/[0.02]">
                              <Newspaper className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                              <span className="leading-snug break-words">
                                News: "{tarotSynthesis.news.headline}"
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Right Sidebar: Muhurta Cycle */}
            <aside className="bg-white/[0.03] border border-white/5 rounded-xl p-5 flex flex-col h-[320px]">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Muhurta Cycle</h2>
                <span className="text-[8px] font-mono text-zinc-500 uppercase">30 Divisions</span>
              </div>
              
              <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {MUHURTAS.map((m) => {
                  const isActive = currentMuhurta?.id === m.id;
                  const perc = ((m.id) * 3.33);
                  
                  // Calculate time range for this specific muhurta
                  let timeStr = "";
                  if (sunrise) {
                    const s = new Date(sunrise);
                    const start = new Date(s.getTime() + ((m.id - 1) * 48 * 60 * 1000));
                    const end = new Date(start.getTime() + (48 * 60 * 1000));
                    timeStr = `\nTime: ${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
                  }

                  return (
                    <div 
                      key={m.id}
                      title={`${m.nature}: ${m.description}\nFocus: ${m.focus}${timeStr}`}
                      className={`flex justify-between py-1.5 px-3 text-[10px] transition-all duration-300 rounded cursor-help group ${
                        isActive ? 'bg-gold/10 text-gold font-bold opacity-100 border-l-2 border-gold shadow-[inset_0_0_10px_rgba(212,175,55,0.05)]' : 'opacity-40 text-dim hover:opacity-100 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                         <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-gold animate-pulse' : 'bg-transparent'}`} />
                         <span className="opacity-30">{m.id.toString().padStart(2, '0')}</span>
                         {m.name}
                      </span>
                      <span className="font-mono group-hover:text-gold transition-colors">{perc.toFixed(2)}%</span>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>

        {/* Moon Zodiac Transit Section */}
        {moonTransitPresent && (
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
              <div>
                <span className="text-[10px] text-gold uppercase tracking-[0.3em] font-medium flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5" /> Luna Transit Gateways
                </span>
                <h2 className="text-xl font-light uppercase tracking-wide mt-1 text-white flex items-center gap-2">
                  <span>Moon Zodiac Transit Alignment</span>
                  <span className="text-xs text-gold font-mono bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/25 text-transform-none animate-pulse">
                    #moonzodiactransit
                  </span>
                </h2>
                <p className="text-xs text-dim mt-1">
                  The active Zodiac sign the Moon is physically transiting, along with the surrounding constellations coloring its celestial coordinate neighborhood.
                </p>
              </div>

              {/* Angle indication with Coordinates */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-4 font-mono text-[10px] bg-white/5 border border-white/5 px-4 py-2 rounded">
                  <span className="text-dim">LUNAR ECLIPTIC LONGITUDE:</span>
                  <span className="text-gold font-bold">{moonTransitPresent.longitude.toFixed(2)}°</span>
                </div>
                <div className="text-[10px] font-mono text-dim/80 bg-white/5 px-4 py-2 rounded">
                  Lat: <span className="text-white font-semibold">{(location?.lat ?? 25.31).toFixed(2)}°</span>, Lng: <span className="text-white font-semibold">{(location?.lng ?? 85.42).toFixed(2)}°</span>
                </div>
              </div>
            </div>

            {/* Layout: MOON ZODIAC TRANSIT GRID SYSTEM */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
              
              {/* UPCOMING MOON TRANSIT */}
              {moonTransitUpcoming && (
                <div className="bg-gradient-to-tr from-emerald-500/[0.03] to-white/[0.02] border border-emerald-500/10 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] transition-all duration-500 group shadow-lg">
                  <div>
                    <div className="text-[8px] text-emerald-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span>Upcoming Moon Transit</span>
                      <span className="text-[7px] text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 bg-emerald-500/5 rounded font-bold uppercase font-mono tracking-wider">Rising</span>
                    </div>
                    <div className="text-sm font-sans font-light text-white/90 flex items-center gap-2">
                      <span>{moonTransitUpcoming.constellation.name}</span>
                      <span className="text-[10px] text-white/30 font-mono">({moonTransitUpcoming.constellation.sanskritName})</span>
                    </div>
                    <div className="text-[10px] text-dim font-mono mt-1">
                      {moonTransitUpcoming.startTime.toLocaleDateString([], { month: 'short', day: '2-digit' }) + " " + moonTransitUpcoming.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {moonTransitUpcoming.endTime.toLocaleDateString([], { month: 'short', day: '2-digit' }) + " " + moonTransitUpcoming.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-emerald-500/10 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-400/60 uppercase tracking-wider font-medium">Impact</span>
                      <span className="text-white font-mono uppercase font-bold text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 text-right max-w-[140px] truncate">
                        {TRANSIT_ONE_WORDS[moonTransitUpcoming.constellation.name]?.impact}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-red-400/60 uppercase tracking-wider font-medium">Precaution</span>
                      <span className="text-red-300 font-mono uppercase font-bold text-[10px] bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 text-right max-w-[140px] truncate">
                        {TRANSIT_ONE_WORDS[moonTransitUpcoming.constellation.name]?.precaution}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-400/60 uppercase tracking-wider font-medium">Task</span>
                      <span className="text-emerald-300 font-mono uppercase font-bold text-[10px] bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-right max-w-[140px] truncate">
                        {TRANSIT_ONE_WORDS[moonTransitUpcoming.constellation.name]?.task}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PRESENT MOON TRANSIT (MAJESTIC MIDDLE PANEL) */}
              {moonTransitPresent && (
                <div className="bg-gradient-to-br from-gold/[0.04] to-transparent border border-gold/20 p-8 rounded-2xl relative overflow-hidden shadow-[0_4px_30px_rgba(212,175,55,0.03)] ring-1 ring-gold/10 md:col-span-1 xl:col-span-2 flex flex-col justify-between">
                  <div className="absolute top-0 right-0 bg-gold/10 border-l border-b border-gold/20 text-gold text-[8px] tracking-widest uppercase px-3 py-1.5 rounded-bl-xl font-semibold animate-pulse">
                    Currently Transiting
                  </div>
                  
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="text-[9px] text-gold uppercase tracking-[0.2em] mb-4">Active Moon Transit Sign</div>
                      <h3 className="text-3xl font-light text-gold tracking-wide">
                        {moonTransitPresent.constellation.name} <span className="text-lg text-white/40 italic font-serif">({moonTransitPresent.constellation.sanskritName})</span>
                      </h3>
                      
                      {/* Subtitles: Ruler & Element */}
                      <div className="flex gap-2 mt-2">
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">Ruler: {moonTransitPresent.constellation.ruler}</span>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono">Element: {moonTransitPresent.constellation.element}</span>
                        <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-gold/5 text-gold font-mono font-semibold">Lon Range: {Math.floor(moonTransitPresent.longitude / 30) * 30}° – {Math.floor(moonTransitPresent.longitude / 30) * 30 + 30}°</span>
                      </div>
 
                      {/* Vedic Celestial Alignment */}
                      <div className="mt-6">
                        <div className="space-y-1">
                          <span className="text-[10px] text-amber-300 font-medium uppercase tracking-widest block">Vedic Lunar View</span>
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-light">
                            {moonTransitPresent.constellation.vedicView}
                          </p>
                        </div>
                      </div>

                      {/* Aligning Frequencies Panel: One-word Impact, Precaution, and Task */}
                      <div className="grid grid-cols-3 gap-2.5 mt-8 border-t border-white/5 pt-6">
                        {/* Impact */}
                        <div className="bg-purple-950/20 border border-purple-500/10 p-4 rounded-xl text-center shadow-sm hover:bg-purple-950/35 transition-all duration-300 group">
                          <span className="text-[9px] text-purple-400 font-mono tracking-widest uppercase block font-semibold">Impact</span>
                          <span className="text-xs sm:text-sm font-bold text-white tracking-wide block mt-1 uppercase">
                            {TRANSIT_ONE_WORDS[moonTransitPresent.constellation.name]?.impact}
                          </span>
                        </div>
                        {/* Precaution */}
                        <div className="bg-red-950/20 border border-red-500/10 p-4 rounded-xl text-center shadow-sm hover:bg-red-950/35 transition-all duration-300 group">
                          <span className="text-[9px] text-red-400 font-mono tracking-widest uppercase block font-semibold">Precaution</span>
                          <span className="text-xs sm:text-sm font-bold text-red-300 tracking-wide block mt-1 uppercase">
                            {TRANSIT_ONE_WORDS[moonTransitPresent.constellation.name]?.precaution}
                          </span>
                        </div>
                        {/* Task */}
                        <div className="bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-xl text-center shadow-sm hover:bg-emerald-950/35 transition-all duration-300 group">
                          <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase block font-semibold">Task</span>
                          <span className="text-xs sm:text-sm font-bold text-emerald-300 tracking-wide block mt-1 uppercase">
                            {TRANSIT_ONE_WORDS[moonTransitPresent.constellation.name]?.task}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
 
              {/* PAST MOON TRANSIT */}
              {moonTransitPast && (
                <div className="bg-gradient-to-bl from-white/[0.01] to-transparent border border-white/5 opacity-40 hover:opacity-90 transition-all duration-500 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px] group shadow-inner">
                  <div>
                    <div className="text-[8px] text-white/40 uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span>Past Moon Transit</span>
                      <span className="text-[7px] text-white/40 border border-white/10 px-1.5 py-0.5 bg-white/5 rounded font-bold uppercase font-mono tracking-wider">Faded</span>
                    </div>
                    <div className="text-sm font-sans font-light text-white/50 flex items-center gap-2">
                      <span>{moonTransitPast.constellation.name}</span>
                      <span className="text-[10px] text-white/20 font-mono">({moonTransitPast.constellation.sanskritName})</span>
                    </div>
                    <div className="text-[10px] text-white/30 font-mono mt-1">
                      {moonTransitPast.startTime.toLocaleDateString([], { month: 'short', day: '2-digit' }) + " " + moonTransitPast.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {moonTransitPast.endTime.toLocaleDateString([], { month: 'short', day: '2-digit' }) + " " + moonTransitPast.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/40 uppercase tracking-wider font-medium">Past Impact</span>
                      <span className="text-white/60 font-mono uppercase font-semibold text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-right max-w-[140px] truncate">
                        {TRANSIT_ONE_WORDS[moonTransitPast.constellation.name]?.impact}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/40 uppercase tracking-wider font-medium">Precaution</span>
                      <span className="text-white/50 font-mono uppercase font-semibold text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-right max-w-[140px] truncate">
                        {TRANSIT_ONE_WORDS[moonTransitPast.constellation.name]?.precaution}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-white/40 uppercase tracking-wider font-medium">Task</span>
                      <span className="text-white/60 font-mono uppercase font-semibold text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-right max-w-[140px] truncate">
                        {TRANSIT_ONE_WORDS[moonTransitPast.constellation.name]?.task}
                      </span>
                    </div>
                  </div>
                </div>
              )}
 
            </div>

            {/* SURROUNDING CONSTELLATIONS FOR ACTIVE MOON TRANSIT */}
            {moonTransitPresent && ZODIAC_SURROUNDINGS[moonTransitPresent.constellation.name] && (
              <div className="mt-10">
                <div className="border-t border-white/10 pt-10 mb-6 font-sans">
                  <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-medium block mb-1">
                    Moon coordinate celestial neighborhood
                  </span>
                  <h3 className="text-lg font-light tracking-wide text-white uppercase">
                    Celestial Surrounding Constellations (Sky Neighborhood for {moonTransitPresent.constellation.name})
                  </h3>
                  <p className="text-xs text-dim mt-1">
                    These physical stars surround {moonTransitPresent.constellation.name} along the ecliptic plane, casting additional sub-frequencies onto the lunar transit path.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ZODIAC_SURROUNDINGS[moonTransitPresent.constellation.name].map((surr, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:bg-white/[0.04] hover:border-gold/30 transition-all duration-300 group shadow-md"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[8px] uppercase tracking-widest text-gold font-mono font-semibold inline-block bg-gold/10 px-2 py-0.5 rounded border border-gold/10">
                            {surr.direction}
                          </span>
                          <span className="text-[8px] uppercase tracking-wider text-dim text-right max-w-[125px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                            {surr.relation}
                          </span>
                        </div>
                        <h4 className="text-sm font-sans font-medium text-white group-hover:text-gold transition-colors flex items-center gap-1.5 mt-2">
                          <span>{surr.name}</span>
                          <span className="text-[9px] text-white/40 font-mono italic">({surr.sanskritName})</span>
                        </h4>
                        <p className="text-[11px] text-dim mt-2.5 leading-relaxed font-light">
                          {surr.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12 ZODIAC MOON TRANSIT CYCLE MATRIX */}
            {all12Transits && all12Transits.length > 0 && (
              <div className="mt-16 border-t border-white/10 pt-12">
                <div className="mb-8 font-sans">
                  <span className="text-[10px] text-gold uppercase tracking-[0.2em] font-medium block mb-1">
                    Complete Sidereal Lunar Orbit
                  </span>
                  <h3 className="text-lg font-light tracking-wide text-white uppercase flex items-center gap-2">
                    <span>12 Zodiac Moon Transits Schedule</span>
                    <span className="text-xs text-white/40 font-mono">({location ? `GPS: ${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°` : "Local Time Zone"})</span>
                  </h3>
                  <p className="text-xs text-dim mt-1">
                    All 12 planetary sign constellations mapped continuously with exact entry/exit windows calibrated for your local city timezone.
                  </p>
                </div>

                {/* Reference/Synthesis notice */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-gold" /> Astronomical Calibration & Global Database Synthesis
                    </h4>
                    <p className="text-dim text-[11px] font-light leading-relaxed mt-1">
                      Calculated dynamically for your location's GPS coordinates and active local timezone. Predictive transit attributes represent a unified consensus compiled from classical Vedic and Western lunar charts published by authority sites, including <span className="text-white/80 font-medium">ProKerala.com</span>, <span className="text-white/80 font-medium font-serif italic">Drik Panchang</span>, <span className="text-white/80 font-medium font-serif italic">Astro-Seek.com</span>, <span className="text-white/80 font-medium">VedicMarga</span>, and <span className="text-gold font-medium">AstroSage.com</span>.
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-dim border border-white/10 px-3 py-1.5 rounded bg-white/5 whitespace-nowrap self-stretch md:self-auto flex items-center justify-between md:justify-start gap-4">
                    <span>STATUS:</span>
                    <span className="text-gold font-bold">12-ZONE CALIBRATOR</span>
                  </div>
                </div>

                {/* 12 Zodiac transit card array */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {all12Transits.map((item, idx) => {
                    const symbol = ZODIAC_SYMBOLS[item.constellation.name] || "🌙";
                    const isUpcomingNext = !item.isActive && item.isUpcoming && item.constellation.name === moonTransitUpcoming?.constellation.name;
                    const isPastDirect = !item.isActive && item.isPast && item.constellation.name === moonTransitPast?.constellation.name;

                    let statusText = "Upcoming";
                    let badgeClass = "text-white/40 border-white/5 bg-white/5";
                    let cardClass = "bg-[#0b0c10] border-white/10";

                    if (item.isActive) {
                      statusText = "Active Transit";
                      badgeClass = "text-gold border-gold/30 bg-gold/10 animate-pulse font-bold";
                      cardClass = "bg-[#13110d] border-gold/40 shadow-[0_0_15px_-3px_rgba(212,175,55,0.05)]";
                    } else if (isUpcomingNext) {
                      statusText = "Next In Line";
                      badgeClass = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 font-bold";
                      cardClass = "bg-[#0b1411] border-emerald-500/30 hover:border-emerald-500/50";
                    } else if (isPastDirect) {
                      statusText = "Preceding Past";
                      badgeClass = "text-purple-400 border-purple-500/20 bg-purple-500/10 font-medium";
                      cardClass = "bg-[#0f0b14] border-purple-500/20 hover:border-purple-500/40";
                    } else if (item.isPast) {
                      statusText = "Completed";
                      badgeClass = "text-white/20 border-white/5 bg-white/[0.01]";
                      cardClass = "bg-[#07080e] border-white/5 opacity-75 hover:opacity-100 transition-opacity duration-300";
                    }

                    const geom = CONSTELLATION_GEOMETRY[item.constellation.name];
                    const svgColorClass = item.isActive 
                      ? "text-gold/40 group-hover:text-gold/60" 
                      : isUpcomingNext 
                        ? "text-emerald-400/30 group-hover:text-emerald-400/50" 
                        : isPastDirect
                          ? "text-purple-400/25 group-hover:text-purple-400/45"
                          : "text-white/20 group-hover:text-white/35";

                    return (
                      <div 
                        key={idx} 
                        className={`relative overflow-hidden border rounded-2xl p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:bg-white/[0.04] group shadow-inner ${cardClass}`}
                      >
                        {/* Interactive Constellation Overlay Vector Map - Placed In Centre */}
                        {geom && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                            <svg 
                              viewBox="0 0 100 100" 
                              className={`w-28 h-28 pointer-events-none transition-all duration-500 ease-out z-0 transform group-hover:scale-110 ${svgColorClass}`}
                            >
                              {/* Lines connecting stars */}
                              {geom.lines.map(([fromIdx, toIdx], lineIdx) => {
                                const fromStar = geom.stars[fromIdx];
                                const toStar = geom.stars[toIdx];
                                if (!fromStar || !toStar) return null;
                                return (
                                  <line
                                    key={lineIdx}
                                    x1={fromStar.x}
                                    y1={fromStar.y}
                                    x2={toStar.x}
                                    y2={toStar.y}
                                    className="stroke-current transition-all duration-500"
                                    strokeWidth="0.85"
                                    strokeDasharray={item.isActive ? "none" : "3,2.5"}
                                  />
                                );
                              })}
                              {/* Highlighted stars */}
                              {geom.stars.map((star, starIdx) => {
                                // Make the first star or bright star larger/glowing dynamically
                                const isBrightStar = starIdx === 0 || (starIdx === 4 && item.constellation.name === "Virgo");
                                const starRadius = isBrightStar ? 2.5 : 1.6;
                                return (
                                  <circle
                                    key={starIdx}
                                    cx={star.x}
                                    cy={star.y}
                                    r={starRadius}
                                    className="fill-current drop-shadow-[0_0_2px_rgba(255,255,255,0.7)] group-hover:drop-shadow-[0_0_4px_rgba(212,175,55,0.95)] transition-all duration-300"
                                  />
                                );
                              })}
                            </svg>
                          </div>
                        )}

                        <div className="relative z-10">
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-sans font-medium text-white flex items-center gap-1.5">
                              <span className="text-lg" role="img" aria-label={item.constellation.name}>{symbol}</span>
                              <span className="group-hover:text-gold transition-colors">{item.constellation.name}</span>
                              <span className="text-[10px] text-white/30 font-mono">({item.constellation.sanskritName})</span>
                            </h4>
                            <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border font-mono ${badgeClass}`}>
                              {statusText}
                            </span>
                          </div>

                          {/* Time interval */}
                          <div className="text-[10px] text-white/40 font-mono tracking-tight leading-relaxed">
                            {item.startTime.toLocaleDateString([], { month: 'short', day: '2-digit' }) + " " + item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {item.endTime.toLocaleDateString([], { month: 'short', day: '2-digit' }) + " " + item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Mid Parameters List */}
                        <div className="relative z-10 mt-4 pt-4 border-t border-white/5 space-y-2 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-white/40 uppercase tracking-wider font-light text-[9px]">Impact</span>
                            <span className="text-white/80 font-mono font-semibold truncate max-w-[150px]" title={item.impact}>{item.impact}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/40 uppercase tracking-wider font-light text-[9px]">Precaution</span>
                            <span className="text-red-400 font-mono font-medium truncate max-w-[150px]" title={item.precaution}>{item.precaution}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/40 uppercase tracking-wider font-light text-[9px]">Task</span>
                            <span className="text-emerald-400 font-mono font-bold truncate max-w-[150px]" title={item.task}>{item.task}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-[10px] text-dim tracking-[0.1em] uppercase font-light">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-60">
            <span>Free Will Impact Analysis</span>
            <span className="opacity-20">|</span>
            <span>Synergy = (Illumination + Muhurta) / 2</span>
            <span className="opacity-20">|</span>
            <span>Vedic Calibration Active</span>
            <span className="opacity-20">|</span>
            <span 
              className="flex items-center gap-1 cursor-pointer hover:text-gold transition-colors"
              onClick={calculateAll}
            >
              <RefreshCw className="w-2.5 h-2.5" /> Force Sync
            </span>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.5); }
      `}</style>
    </div>
  );
}

