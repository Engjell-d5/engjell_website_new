// Single source of truth for the speaking page and its structured data, in the
// same spirit as lib/ventures.ts.
//
// Everything here has to be true. A speaker page is read by people deciding
// whether to put you in front of their audience, and one inflated claim that
// gets checked costs more than the booking was worth. Every number below traces
// to something real: the tool count and approval rule come from the d5
// management system, the five-to-two figure from the recruitment function, the
// 85%+ automated and months-to-weeks figures and the AI timeline (one system
// from Nov 2025, first agents Apr 2026) from his own BNA 2026 deck ("Biznesi
// x10"), and the stage credits are the ones he confirmed: the Albanian
// Developers Conference talk and the KosICT panel, both 2023. Nothing is padded.

export interface Talk {
  title: string;
  /** Two lines maximum. A programme committee scans, it does not read. */
  abstract: string;
  /** Who leaves with something useful. */
  audience: string;
  takeaways: string[];
}

export const TALKS: Talk[] = [
  {
    // Was "We replaced five roles with two people and 350 tools" until
    // 2026-11-12: it overstated five→two (people, not roles; unconfirmed at
    // today's volume) and the BNA deck no longer uses that number.
    title: 'AI proposes, a person decides: running a company on agents',
    abstract:
      'A working account of putting AI agents into a real business, including what they took over, what we refused to let them touch, and the one rule that keeps a human in every outbound decision.',
    audience: 'Founders and operators running service businesses of 10 to 100 people',
    takeaways: [
      'Which work an agent does alone, and which waits for a person',
      'Which parts of a pipeline are assembly work and which are judgment',
      'What actually broke, and what it cost to fix',
    ],
  },
  {
    title: "Services don't scale, and other things I believed for ten years",
    abstract:
      'The rule that services cannot scale was never about services. It was about founders. A decade of running a tech company, and which constraints turned out to be self-inflicted.',
    audience: 'Founders, particularly bootstrapped and service-based',
    takeaways: [
      'Why founder dependency is a stage rather than a property of the model',
      'How to make expertise structural so people leaving is a setback, not a hole',
      'The growth ceiling word of mouth builds, and the three ways out of it',
    ],
  },
  {
    title: 'Building a tech company outside Silicon Valley',
    abstract:
      'What it takes to build durable technology businesses from Albania, without venture capital, where cash flow is the measure rather than a funding announcement.',
    audience: 'Founders and ecosystem builders in emerging tech markets',
    takeaways: [
      'Why the no-capital constraint produces better unit economics',
      'Hiring and keeping senior engineers outside the established hubs',
      'What regional ecosystems need more of, and what they have too much of',
    ],
  },
  {
    // First given in Albanian at BNA Tirana, 2026-11-14 ("Biznesi x10").
    // Replaced "What breaks when you put AI agents into a real business",
    // which overlapped the first talk.
    // The deck's closing slide, asked as a question on purpose: no 10x figure
    // has been confirmed, so this must not become a "we 10x'd" claim.
    title: 'Will AI 10x your business?',
    abstract:
      'How division5 went from people running every process to more than 85% automated in a year, and the five steps any business can follow: list the processes, put the data in one place, build software on it, then add agents and automated workflows.',
    audience: 'Business owners and managers, technical or not',
    takeaways: [
      'The four steps behind every process change, and why AI cut each cycle from months to weeks',
      'The order that works: data in one place first, agents last',
      'Why it is hard: doing it well at low cost, trusting an agent to act as you, and finding the balance between too much AI and too little',
    ],
  },
];

export interface SpeakingCredit {
  event: string;
  url?: string;
  location: string;
  year: number;
  /** Exact ISO date when known; used as the Event startDate in structured data. */
  date?: string;
  /** Time and room, as the organiser's programme gives them. */
  session?: string;
  /** Who shares the stage, as the organiser lists them. */
  with?: string;
  format: string;
  /** What the talk was about, as he described it. Organisers book on topic. */
  topic?: string;
}

/**
 * The homepage "On stage" section (added 2026-11-10). Reads the credits below,
 * so adding a talk is all it takes:
 * - featured: the soonest upcoming talk ("Next"), else the most recent one
 *   ("Latest"). Credits with an exact `date` sort by it, others by year.
 * - rest: every other credit, newest first.
 * `today` is an ISO date (YYYY-MM-DD); the homepage renders per request, so
 * "Next" turns into "Latest" by itself the day after the event.
 */
export function stagesForHome(today: string): {
  kind: 'next' | 'latest';
  featured: SpeakingCredit;
  rest: SpeakingCredit[];
} | null {
  if (SPEAKING_CREDITS.length === 0) return null;
  const key = (c: SpeakingCredit) => c.date ?? `${c.year}-12-31`;
  const upcoming = SPEAKING_CREDITS.filter((c) => c.date && c.date >= today).sort((a, b) => key(a).localeCompare(key(b)));
  const byNewest = [...SPEAKING_CREDITS].sort((a, b) => key(b).localeCompare(key(a)));
  const featured = upcoming[0] ?? byNewest[0];
  return { kind: upcoming[0] ? 'next' : 'latest', featured, rest: byNewest.filter((c) => c !== featured) };
}

export const SPEAKING_CREDITS: SpeakingCredit[] = [
  {
    // Business Network Albania's conference. Session 14:25 to 15:10 in Salla
    // Vjosa, on stage with Erjon Curraj (Smart360). The organiser's speaker
    // page is the url; added 2026-11-10, four days before the event.
    event: 'BNA Tirana Conference',
    url: 'https://event.bna.al/en/speakers/Engjell-rraklli',
    location: 'Tirana, Albania',
    year: 2026,
    date: '2026-11-14',
    session: '14:25 to 15:10, Salla Vjosa',
    with: 'Erjon Curraj, Smart360',
    format: 'Panel',
    topic: 'AI, challenges and opportunities',
  },
  {
    // Second edition, Saturday 20 May 2023. He confirmed Pristina; AlbaniaTech's
    // listing (the url) says Tirana, which is wrong.
    event: 'Albanian Developers Conference',
    url: 'https://albaniatech.org/event/albanian-developers-conference-2023/',
    location: 'Pristina, Kosovo',
    year: 2023,
    format: 'Talk',
    topic: '3D on the web',
  },
  {
    event: 'KosICT',
    url: 'https://kosict.org',
    location: 'Pristina, Kosovo',
    year: 2023,
    format: 'Panel',
    topic: 'Hiring and employment in tech',
  },
];

/**
 * Recorded long-form interviews he has hosted, from the youTubeVideo table.
 *
 * This is the strongest evidence on the page and it was previously a passing
 * mention. A programme committee's real question is whether someone can hold an
 * audience and think without a script, and two stage credits do not answer it.
 * Fourteen recorded conversations do, and they can be watched.
 *
 * Update the number when the count changes. An inflated one is worse than none,
 * because it is checkable in a single click.
 */
export const HOSTED_EPISODES = 14;

export const FORMATS = [
  {
    name: 'Conference talk',
    detail: '20 to 40 minutes, built around one argument and the numbers behind it.',
  },
  {
    name: 'Panel',
    detail: 'Comfortable disagreeing in public, which is the only reason a panel is worth watching.',
  },
  {
    name: 'Workshop',
    detail: 'Half day, hands on, mapping a real pipeline and deciding what an agent should and should not own.',
  },
  {
    name: 'Podcast',
    detail: 'Remote or in person. I host a show myself, so I know what makes an episode worth editing.',
  },
];

/**
 * Bios at three lengths because organisers and producers copy-paste them into
 * their own programme, site and show notes. Making somebody ask for a shorter
 * version is a small piece of friction that costs bookings.
 */
export const DECLINES = [
  'Predictions. If I have not run it, I have nothing useful to say about it',
  'Tool roundups and vendor comparisons. I am not a good judge and I have a conflict',
  'Panels where everyone agrees. There is no reason for an audience to watch that',
  'Anything requiring me to pretend a project went smoothly',
];
