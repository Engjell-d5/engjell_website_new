// Independent coverage of Engjell, in the same spirit as lib/ventures.ts and
// lib/speaking.ts: one list feeds the About page, the Person schema
// (subjectOf) and /llms.txt.
//
// Why it matters: AI visibility sweeps (Nov 2026) found assistants could not
// find him by name, and no engine cited the one independent feature that
// exists, because nothing on this site pointed to it. A third-party article
// linked from the person's own page and schema is how search engines and
// assistants join the two.
//
// Only real, published pieces. Summaries describe what the article covers,
// in neutral words, and never quote numbers it reported that are now out of
// date.

export interface PressItem {
  outlet: string;
  outletUrl: string;
  title: string;
  url: string;
  /** ISO date the piece was published. */
  date: string;
  /** One line on what it covers. */
  summary: string;
}

export const PRESS: PressItem[] = [
  {
    outlet: 'The Recursive',
    outletUrl: 'https://therecursive.com',
    title: 'For This Albanian Entrepreneur Stubbornness Is Key to Success',
    url: 'https://therecursive.com/albanian-entrepreneur-stubbornness-precondition-success/',
    date: '2022-08-01',
    summary: 'A feature on founding division5, the road from rock bands to software and games, and building startups in Albania.',
  },
];
