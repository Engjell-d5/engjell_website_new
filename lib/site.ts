// Single source of truth for time-based site facts so copy can't drift
// ("11+ years" vs "ten years ago" vs a 2014 timeline entry).
export const FOUNDING_YEAR = 2014;

export function yearsOfBuilding(): number {
  return new Date().getFullYear() - FOUNDING_YEAR;
}

// division5 — the venture that actually employs people — was founded in May
// 2015 ("In May 2015, I finally took the first step and founded division5",
// /journal/challenges-running-a-service-based-business). The building story
// starts a year earlier, so the impact claim is deliberately one year behind
// yearsOfBuilding(): 11 years of jobs, 12+ years of building.
export const HIRING_SINCE_YEAR = 2015;

export function yearsOfHiring(): number {
  return new Date().getFullYear() - HIRING_SINCE_YEAR;
}
