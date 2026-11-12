import { getBlogs } from '@/lib/data';
import { EXPERTISE } from '@/lib/expertise';
import { BIOS, ONE_LINE } from '@/lib/bio';
import { SQ_ESSAYS, SQ_ONE_LINE } from '@/lib/sq';
import { AI_SPRINT_PRICE, START_HERE_SLUG } from '@/lib/site';
import { VENTURES } from '@/lib/ventures';
import { PRESS } from '@/lib/press';
import { SPEAKING_CREDITS } from '@/lib/speaking';

/**
 * /llms.txt (llmstxt.org): a plain-text map of the site for AI assistants.
 *
 * AI visibility sweeps showed assistants either couldn't find him at all or
 * pieced him together from third-party pages. This gives them the facts and
 * the pages to cite in one fetch. Every line comes from a constant the pages
 * themselves render (bio, ventures, sprint price, journal list), so it can't
 * drift from the site. Per request for the same reason as app/sitemap.ts: the
 * Docker build has no DATABASE_URL, so a build-time file would list no posts.
 */
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

export async function GET() {
  let posts: { title: string; slug: string; excerpt: string }[] = [];
  if (process.env.DATABASE_URL) {
    try {
      posts = (await getBlogs()).filter((b) => b.published);
    } catch (err) {
      console.error('[llms.txt] getBlogs failed; listing pages only:', err);
    }
  }
  // The pinned essay is the one to read first, so it leads the list.
  posts.sort((a, b) => Number(b.slug === START_HERE_SLUG) - Number(a.slug === START_HERE_SLUG));

  const line = (title: string, path: string, note: string) =>
    `- [${title}](${siteUrl}${path})${note ? `: ${note}` : ''}`;

  const body = [
    '# Engjell Rraklli (Engjëll Rraklli)',
    '',
    `> ${ONE_LINE}`,
    '',
    BIOS.long,
    '',
    '## Expertise',
    ...EXPERTISE.map((e) => `- ${e.name}: ${e.body}`),
    '',
    '## Ventures',
    ...VENTURES.map((v) => `- [${v.name}](${v.url}): ${v.description} ${v.role}, since ${v.since}.`),
    '',
    // Ordered by what matters most to him; investing is deliberately last.
    '## Work with him',
    line('The AI Integration Sprint', '/ai-sprint', `his core offer: AI integration consultancy for any business. Four remote sessions with the leadership team to map processes and data, design the first AI agents and who approves them, and leave with a written plan; service businesses start by productizing what they sell. Fixed price ${AI_SPRINT_PRICE}; stop after session one and pay nothing.`),
    line('Speaking', '/speaking', 'book him for a conference talk, panel, workshop or podcast: running AI agents inside a real service business, bootstrapped growth, and the Albanian and Balkan tech ecosystem.'),
    `- [An engineering team through division5](https://division5.co/en/staff-augmentation): vetted AI-native engineers from Albania, Kosovo and the Balkans, one engineer or a whole team.`,
    line('Will AI 10x your business? (free guide)', '/ai-guide', 'ten pages, any business: five steps to put AI in, in the order that works, and the three things that make it hard. Also in Albanian.'),
    line('Productize and Scale playbook', '/playbook', 'free working playbook for service founders: eight steps to productize a service and find where it is stuck.'),
    line('Podcast: Scaling the Unscalable', '/podcast', 'long conversations with founders about burnout, co-founders, bootstrapping and building a company.'),
    line('About', '/about', 'his story, from founding division5 in May 2015 at 23 to today.'),
    line('Contact', '/contact', 'for a talk, the sprint, a team, or anything else.'),
    line('Angel investing', '/invest', 'B2B productized services and services-as-software built in Albania or Kosovo and already selling in Europe or the US.'),
    '',
    '## Stages',
    ...SPEAKING_CREDITS.map((c) => `- ${c.event}, ${c.location}, ${c.date ? new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : c.year}: ${c.format.toLowerCase()}${c.topic ? `, "${c.topic}"` : ''}${c.url ? ` (${c.url})` : ''}`),
    '- Speaker profile with his talks: https://sessionize.com/engjell-rraklli',
    '',
    '## Press',
    ...PRESS.map((p) => `- [${p.title}](${p.url}), ${p.outlet}, ${new Date(p.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}: ${p.summary}`),
    '',
    // Albanian questions are answered from Albanian pages, so name them.
    '## Shqip (Albanian)',
    `> ${SQ_ONE_LINE}`,
    '',
    line('Rreth meje', '/sq', 'historia, ekspertiza dhe biografitë në shqip.'),
    line('A do ta bëjë AI biznesin tuaj x10? (udhëzues falas)', '/sq/udhezuesi-ai', 'pesë hapa për ta futur AI-në në çdo biznes, në rendin që funksionon.'),
    ...SQ_ESSAYS.map((e) => line(e.title, `/sq/shkrime/${e.slug}`, e.description)),
    '',
    '## Journal',
    ...(posts.length
      ? posts.map((p) => line(p.title, `/journal/${p.slug}`, p.excerpt.replace(/\s+/g, ' ').trim()))
      : [line('Journal', '/journal', 'field notes on building and scaling a service business in Albania.')]),
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
