// Single source of truth for time-based site facts so copy can't drift
// ("11+ years" vs "ten years ago" vs a 2014 timeline entry).
export const FOUNDING_YEAR = 2014;

export function yearsOfBuilding(): number {
  return new Date().getFullYear() - FOUNDING_YEAR;
}

// division5, the venture that actually employs people, was founded in May
// 2015 ("In May 2015, I finally took the first step and founded division5",
// /journal/challenges-running-a-service-based-business). The building story
// starts a year earlier, so the impact claim is deliberately one year behind
// yearsOfBuilding(): 11 years of jobs, 12+ years of building.
export const HIRING_SINCE_YEAR = 2015;

export function yearsOfHiring(): number {
  return new Date().getFullYear() - HIRING_SINCE_YEAR;
}

// Journal listing config, shared by app/journal/page.tsx and app/sitemap.ts so
// the two can never disagree about how many pages exist.
export const POSTS_PER_PAGE = 10;

// One post pinned to a "Start here" slot above the date-sorted feed. It is
// removed from the feed itself, so it also shifts the pagination maths, which
// is exactly why the sitemap has to read the same constant.
// Set to null to turn the slot off.
export const START_HERE_SLUG: string | null = 'how-to-scale-a-service-business-in-the-ai-era';

/** Number of paginated /journal pages for a given set of published slugs. */
export function journalPageCount(publishedSlugs: string[]): number {
  const inFeed = START_HERE_SLUG
    ? publishedSlugs.filter((s) => s !== START_HERE_SLUG).length
    : publishedSlugs.length;
  return Math.max(1, Math.ceil(inFeed / POSTS_PER_PAGE));
}
