/**
 * The one idea the whole site is about, and every bio built on it.
 *
 * Before this file the site described him five different ways (header
 * descriptor, default and homepage meta, WebSite schema, Person schema, the
 * three speaker bios), each a list of activities: founded this, builds that,
 * hosts a podcast. Lists don't stick. One idea does, and every part of the
 * work answers it: division5 is the people, divisionAI the systems, the
 * Sprint and playbook the method, the podcast and talks where it is told.
 *
 * Header, metadata, Person schema, /speaking and /llms.txt all read from
 * here. Paste the same text into LinkedIn, X, YouTube, podcast and conference
 * profiles: identical wording everywhere is how people and AI assistants
 * learn it is one person.
 *
 * Every claim traces to copy already on the site (about chapters, homepage
 * receipts, lib/ventures.ts, lib/speaking.ts). Add one only once it is public.
 */

/** Header descriptor and WebSite schema description. */
export const TAGLINE = "Building companies that don't need their founder";

/** First sentence of every bio, and the default page description (under 160 characters). */
export const ONE_LINE =
  "Engjell Rraklli builds service businesses that don't depend on their founder: with vetted engineers, AI agents and written systems, from Tirana.";

export const BIOS = {
  short: `${ONE_LINE} He founded division5 and divisionAI, and hosts the podcast Scaling the Unscalable.`,
  medium: `${ONE_LINE} He founded division5 in 2015, a marketplace placing vetted AI-native Balkan engineers with companies across Europe, and divisionAI, which builds business systems with AI agents inside them. He speaks on running AI agents in a real company and hosts the podcast Scaling the Unscalable.`,
  long: `${ONE_LINE} He founded division5 in 2015 at the age of 23, with no capital and no network, and spent a decade as the bottleneck in his own company before learning to take himself out of it. Today division5 is a staffing marketplace that connects vetted AI-native engineers across the Balkans with companies in Europe and beyond. Its recruitment used to take five people and now runs with two: agents do the assembly work, and a person approves everything that leaves the building. divisionAI builds the same agent-driven systems for other companies. He turned what he learned into the Constraint Sprint and a free playbook, writes about the constraints founders invent for themselves, hosts the podcast Scaling the Unscalable, and speaks on AI in operations, bootstrapped growth, and the Albanian and wider Balkan tech ecosystem.`,
};

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}
