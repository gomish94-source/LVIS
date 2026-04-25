/**
 * Calculates the moon's illumination percentage.
 * Uses a simplified algorithm based on the time elapsed since a known New Moon.
 */

const LUNAR_MONTH = 29.530588853;
const KNOWN_NEW_MOON = new Date('1970-01-07T18:00:00Z').getTime(); // Reference point

export interface MoonData {
  illumination: number; // 0 to 1
  phaseName: string;
  isWaxing: boolean;
}

export function getMoonData(date: Date = new Date()): MoonData {
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

  return { illumination, phaseName, isWaxing };
}
