// Single source of truth for time-based site facts so copy can't drift
// ("11+ years" vs "ten years ago" vs a 2014 timeline entry).
export const FOUNDING_YEAR = 2014;

export function yearsOfBuilding(): number {
  return new Date().getFullYear() - FOUNDING_YEAR;
}

// The year hiring started, which is deliberately NOT the founding year — the
// impact claim is "11 years of job opportunities" while the experience claim
// is "12+ years of building", and both appear on the homepage. Deriving each
// from its own constant keeps them one year apart on purpose instead of
// looking like one of them is a typo, and both roll over on their own.
export const HIRING_SINCE_YEAR = 2015;

export function yearsOfHiring(): number {
  return new Date().getFullYear() - HIRING_SINCE_YEAR;
}
