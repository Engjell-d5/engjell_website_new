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
    // First given in Albanian at BNA Tirana, 2026-11-14 ("Biznesi x10").
    // Replaced two talks on 2026-11-12 that told the same story: "We replaced
    // five roles with two people and 350 tools" (five→two was people, not
    // roles, and is unconfirmed at today's volume) and "What breaks when you
    // put AI agents into a real business".
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
  {
    title: "Services don't scale, and other things I believed for ten years",
    abstract:
      'The rule that services cannot scale was never about services. It was about founders. Eleven years of running a tech company, and which constraints turned out to be self-inflicted.',
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
  /** A photo from this event; the homepage card shows it when this credit is featured. */
  photo?: { src: string; alt: string };
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
    // page is the url; added 2026-11-10, four days before the event. Took
    // place 2026-11-14; the homepage hides `session` once a talk is past.
    // Programmed as a panel ("AI, challenges and opportunities"), but he
    // confirmed 2026-11-16 it was co-hosted: each gave his own talk in his own
    // slot. His was "Biznesi x10", in Albanian (TALKS[0]). The photo is cropped
    // to him alone.
    event: 'BNA Tirana Conference',
    url: 'https://event.bna.al/en/speakers/Engjell-rraklli',
    location: 'Tirana, Albania',
    year: 2026,
    date: '2026-11-14',
    session: '14:25 to 15:10, Salla Vjosa',
    with: 'Erjon Curraj, Smart360',
    format: 'Talk',
    topic: 'Will AI 10x your business?',
    photo: {
      src: '/photos/stage-bna-2026.jpg',
      alt: 'Engjell Rraklli giving his talk at the BNA Tirana Conference 2026',
    },
  },
  {
    // LDA Europe's youth conference; the url is the organiser's own report,
    // whose agenda lists him on the first panel. He took part in two smaller
    // LDA sessions as well and chose not to list them (2026-11-16).
    event: 'LEAPin Albania',
    url: 'https://ldaeurope.com/wp-content/uploads/2024/11/LEAPin-Albania-2024.pdf',
    location: 'Tirana, Albania',
    year: 2024,
    date: '2024-11-16',
    with: 'Hudi Shehu, Postjer Group, and Nexhi Sula',
    format: 'Panel',
    topic: 'AI and innovation',
  },
  {
    // Albanian Skills' first "Aftësi, Karrierë & Punësim" festival, 13 to 15
    // December 2023 (the stage banner in his Drive photos). He confirmed the
    // panel 2026-11-16; the exact day and topic are not known, so no date.
    event: 'Albanian Skills: Skills, Career and Employment Festival',
    url: 'https://www.albanianskills.org/',
    location: 'Tirana, Albania',
    year: 2023,
    format: 'Panel',
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
    // No url: kosict.org has had no DNS record since at least 2026-11-12.
    event: 'KosICT',
    location: 'Pristina, Kosovo',
    year: 2023,
    format: 'Panel',
    topic: 'Hiring and employment in tech',
  },
  {
    // His word, 2026-11-16: a panel ICT Lab hosted on games in education.
    // No public page found; exact date unknown, so it sorts by year.
    event: 'ICT Lab',
    location: 'Tirana, Albania',
    year: 2019,
    format: 'Panel',
    topic: 'Games in education',
  },
  {
    // Fireside chat at Innospace, Tirana, with his co-founder Ariol Sollaku.
    // The organiser's event page is the url; he confirmed it 2026-11-16.
    // Kept newest-first: /speaking and /llms.txt list this array in order.
    event: 'Startup Grind Tirana',
    url: 'https://www.startupgrind.com/events/details/startup-grind-tirana-presents-division5-engjell-rraklli-ariol-sollaku/',
    location: 'Tirana, Albania',
    year: 2019,
    date: '2019-07-25',
    with: 'Ariol Sollaku, division5',
    format: 'Fireside chat',
    topic: 'Building division5',
  },
];

/**
 * Juries and mentoring, as he confirmed them on 2026-11-16. Albanian Skills
 * 2023 and 2024 are backed by photos in Drive (Engjell's Brand / Foto); 2021
 * and 2022 are his word. Startup Live has no public page naming him.
 */
export interface JuryRole {
  event: string;
  url?: string;
  role: string;
  years: string;
  detail?: string;
}

export const JURY_AND_MENTORING: JuryRole[] = [
  {
    event: 'Albanian Skills',
    url: 'https://www.albanianskills.org/',
    role: 'Jury, entrepreneurship',
    years: '2021 to 2024',
    detail: 'Four years judging the Entrepreneurship and Business Development competition at the national skills championship.',
  },
  {
    // His word, 2026-11-16; not yet checked against a public page.
    event: 'Pirate Summit',
    role: 'Ambassador',
    years: '2019 to 2023',
    detail: 'The startup conference in Cologne.',
  },
  {
    event: 'Startup Live',
    role: 'Mentor',
    years: '2019',
  },
  {
    // His word, 2026-11-16: he taught three sessions; EESTEC organised the
    // first two and Epoka University the third.
    event: 'Game development training',
    role: 'Trainer',
    years: '2015 to 2018',
    detail: 'Three sessions: two organised by EESTEC, one by Epoka University.',
  },
  {
    // He was a candidate, not on the published top 40; no public page names
    // him, so no link and never "listed" or "named".
    event: 'BLOconomy 40 under 40',
    role: 'Candidate',
    years: '2021',
    detail: 'Young entrepreneurs across Albania, Kosovo and North Macedonia.',
  },
];

/** Shows he has been a guest on, newest first. Both links checked 2026-11-16. */
export interface GuestAppearance {
  show: string;
  title: string;
  url: string;
  /** ISO date published. */
  date: string;
  language: 'English' | 'Albanian';
}

export const GUEST_APPEARANCES: GuestAppearance[] = [
  {
    show: 'Podcast "Me Kampionët", Albanian Skills',
    title: 'Episode 11, with Engjëll Rraklli',
    url: 'https://www.youtube.com/watch?v=HicW4ppz3-o',
    date: '2026-04-10',
    language: 'Albanian',
  },
  {
    show: 'AI Ascension',
    title: 'Scaling a Software Business from Albania to the World',
    url: 'https://www.youtube.com/watch?v=5aQXdHMtQ2w',
    date: '2025-07-31',
    language: 'English',
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
