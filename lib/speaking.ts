// Single source of truth for the speaking page and its structured data, in the
// same spirit as lib/ventures.ts.
//
// Everything here has to be true. A speaker page is read by people deciding
// whether to put you in front of their audience, and one inflated claim that
// gets checked costs more than the booking was worth. Every number below traces
// to something real: the tool count and approval rule come from the d5
// management system, the five-to-two figure from the recruitment function, and
// the KosICT panel is the one speaking credit to date. Nothing is padded.

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
    title: 'We replaced five roles with two people and 350 tools',
    abstract:
      'A working account of putting AI agents into a real business, including what they took over, what we refused to let them touch, and the one rule that keeps a human in every outbound decision.',
    audience: 'Founders and operators running service businesses of 10 to 100 people',
    takeaways: [
      'The read versus write rule that decides what an agent may do unsupervised',
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
    title: 'What breaks when you put AI agents into a real business',
    abstract:
      'The unglamorous version. Approval queues, permission scoping, the failure modes nobody demos, and why the leverage comes from removing assembly work rather than removing people.',
    audience: 'Technical leaders and operators evaluating agentic systems',
    takeaways: [
      'Designing the approval surface before designing the agent',
      'Why scheduled playbooks beat chat interfaces for operational work',
      'Honest failure modes from a system running in production',
    ],
  },
];

export interface SpeakingCredit {
  event: string;
  url?: string;
  location: string;
  year: number;
  format: string;
}

export const SPEAKING_CREDITS: SpeakingCredit[] = [
  {
    event: 'KosICT',
    url: 'https://kosict.org',
    location: 'Pristina, Kosovo',
    year: 2023,
    format: 'Panel',
  },
];

/**
 * Recorded long-form interviews he has hosted, from the youTubeVideo table.
 *
 * This is the strongest evidence on the page and it was previously a passing
 * mention. A programme committee's real question is whether someone can hold an
 * audience and think without a script, and one panel credit does not answer it.
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

export const BIOS = {
  short:
    'Engjell Rraklli is a homegrown Albanian tech entrepreneur based in Tirana. He founded division5, a staffing marketplace placing vetted AI-native Balkan engineers with companies across Europe, and builds AI-powered business systems at divisionAI.',
  medium:
    'Engjell Rraklli is a homegrown Albanian tech entrepreneur based in Tirana. He founded division5 in 2015, today a staffing marketplace connecting vetted AI-native engineers across the Balkans with companies in Europe and beyond, and builds AI-powered business management systems at divisionAI. He writes about scaling service businesses and hosts the podcast Scaling the Unscalable.',
  long:
    'Engjell Rraklli is a homegrown Albanian tech entrepreneur based in Tirana. He founded division5 in 2015 at the age of 23, with no capital and no network, and spent the following decade building it into a staffing marketplace that connects vetted AI-native engineers across the Balkans with companies in Europe and beyond. He also builds AI-powered business management systems at divisionAI, where agent-driven workflows run operations that previously required whole departments. He writes about scaling service businesses, the constraints founders invent for themselves, and building technology companies outside the established hubs. He hosts the podcast Scaling the Unscalable, and speaks on AI in operations, bootstrapped growth, and the Albanian and wider Balkan tech ecosystem.',
};
