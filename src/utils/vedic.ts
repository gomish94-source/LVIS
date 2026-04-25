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
}

export const MUHURTAS: Omit<Muhurta, 'cumulativePercentage'>[] = [
  { id: 1, name: 'Rudra', nature: 'Inauspicious' },
  { id: 2, name: 'Ahi', nature: 'Inauspicious' },
  { id: 3, name: 'Mitra', nature: 'Auspicious' },
  { id: 4, name: 'Pitri', nature: 'Inauspicious' },
  { id: 5, name: 'Vasu', nature: 'Auspicious' },
  { id: 6, name: 'Varaha', nature: 'Auspicious' },
  { id: 7, name: 'Visvedeva', nature: 'Auspicious' },
  { id: 8, name: 'Vidhi (Abhijit)', nature: 'Auspicious' },
  { id: 9, name: 'Sutamukhi', nature: 'Auspicious' },
  { id: 10, name: 'Puruhuta', nature: 'Inauspicious' },
  { id: 11, name: 'Vahini', nature: 'Inauspicious' },
  { id: 12, name: 'Naktanakarā', nature: 'Inauspicious' },
  { id: 13, name: 'Varuna', nature: 'Auspicious' },
  { id: 14, name: 'Aryaman', nature: 'Auspicious' },
  { id: 15, name: 'Bhaga', nature: 'Inauspicious' },
  { id: 16, name: 'Girisha', nature: 'Inauspicious' },
  { id: 17, name: 'Ajapada', nature: 'Inauspicious' },
  { id: 18, name: 'Ahirbudhyna', nature: 'Auspicious' },
  { id: 19, name: 'Pushya', nature: 'Auspicious' },
  { id: 20, name: 'Ashvini', nature: 'Auspicious' },
  { id: 21, name: 'Yama', nature: 'Inauspicious' },
  { id: 22, name: 'Agni', nature: 'Auspicious' },
  { id: 23, name: 'Vidhatru', nature: 'Auspicious' },
  { id: 24, name: 'Kanda', nature: 'Auspicious' },
  { id: 25, name: 'Aditi', nature: 'Auspicious' },
  { id: 26, name: 'Jivamruta', nature: 'Auspicious' },
  { id: 27, name: 'Vishnu', nature: 'Auspicious' },
  { id: 28, name: 'Dyumadgadyuti', nature: 'Auspicious' },
  { id: 29, name: 'Brahma', nature: 'Very Auspicious' },
  { id: 30, name: 'Samudra', nature: 'Auspicious' },
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
