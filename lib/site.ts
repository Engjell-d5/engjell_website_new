// Single source of truth for time-based site facts so copy can't drift
// ("11+ years" vs "ten years ago" vs a 2014 timeline entry).
// 2015, not 2014: he confirmed "11 years in business" on 2026-11-12, i.e. from
// division5's founding in May 2015.
export const FOUNDING_YEAR = 2015;

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

// The AI Integration Sprint's fixed price (/ai-sprint, /llms.txt): four remote
// sessions over two weeks. Set 2026-11-12, when the Constraint Sprint (same
// price) was merged into it.
export const AI_SPRINT_PRICE = '€7,500';

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

/**
 * The subjects this person should be findable for, used in every Person schema
 * on the site.
 *
 * Kept here because it previously lived inline in three files and drifted: two
 * were updated and the sitewide one in app/layout.tsx was missed, so the
 * generic list kept rendering on every page while the specific one appeared on
 * two. One export, imported everywhere, makes that impossible.
 *
 * Specific on purpose. "Technology" and "Startups" are true of several million
 * people and so match nobody's query. This is the field search engines and
 * assistants use to decide who can speak to a subject, so it should name the
 * things worth being asked about.
 */
export const KNOWS_ABOUT = [
  'Scaling service businesses',
  'AI agents in business operations',
  'Agentic workflows',
  'Bootstrapped software companies',
  'Software development outsourcing',
  'Albanian tech ecosystem',
  'Founder-led growth',
  'B2B productized services',
  // The software and recruitment side of division5, which the site had never
  // claimed even though it is the business that pays the salaries.
  'Building software engineering teams in Albania and Kosovo',
  'Technical recruitment and vetting of software engineers',
  'Artificial intelligence in business',
  'Albanian entrepreneurship',
  // Kept, but last: investing is the least important of his positions.
  'Angel investing in Albania and Kosovo',
] as const;
