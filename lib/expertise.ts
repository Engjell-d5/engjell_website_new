/**
 * The four things he wants to be found for, each with the evidence the site
 * already publishes. Rendered on /about, listed in /llms.txt, and folded into
 * the Person schema's knowsAbout, so the claim reads the same to a visitor, a
 * search engine and an assistant.
 *
 * Every sentence traces to copy that already exists: the about chapters, the
 * homepage receipts (5 → 2, 350+), lib/speaking.ts, lib/ventures.ts and /invest.
 * Add a claim here only once it is true and public somewhere else on the site.
 */
export interface ExpertiseArea {
  /** Short heading, also used as a knowsAbout entry. */
  name: string;
  body: string;
  /** Where the proof lives, on this site or a venture's. */
  link: { href: string; label: string };
}

export const EXPERTISE: ExpertiseArea[] = [
  {
    name: 'AI agents in business operations',
    body: 'I run agents inside my own companies, not in a demo. At division5 our recruitment used to take five people and now runs with two: agents do the assembly work across more than 350 tools, and a person still approves everything that leaves the building. divisionAI builds the same systems for other companies.',
    link: { href: '/speaking', label: 'Talks on AI in operations' },
  },
  {
    name: 'Building software engineering teams in Albania and Kosovo',
    body: 'I have been building engineering teams in Albania since 2015, first for division5’s own client projects and now as a marketplace that vets AI-native engineers across the Balkans for companies in Europe and beyond.',
    link: { href: 'https://division5.co', label: 'division5' },
  },
  {
    name: 'Scaling service businesses',
    body: 'I spent a decade as the bottleneck in my own service business before learning how to take myself out of it. The playbook and the Constraint Sprint are the diagnostics that came out of that.',
    link: { href: '/playbook', label: 'The free playbook' },
  },
  {
    name: 'The Albanian tech ecosystem',
    body: 'Albania exports its best people, and everything I build is a bet that it does not have to. I invest in founders building B2B productized services in Albania and Kosovo who are already selling in Europe or the US.',
    link: { href: '/invest', label: 'Angel investing' },
  },
];
