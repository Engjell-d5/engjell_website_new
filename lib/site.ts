// Single source of truth for time-based site facts so copy can't drift
// ("11+ years" vs "ten years ago" vs a 2014 timeline entry).
export const FOUNDING_YEAR = 2014;

export function yearsOfBuilding(): number {
  return new Date().getFullYear() - FOUNDING_YEAR;
}

// Hiring started the same year the first venture was founded, so the impact
// claim ("N years of job opportunities") and the experience claim ("N+ years
// of building") report the same number. Kept as its own constant so the two
// can diverge later without hunting through copy.
export const HIRING_SINCE_YEAR = FOUNDING_YEAR;

export function yearsOfHiring(): number {
  return new Date().getFullYear() - HIRING_SINCE_YEAR;
}
