import { getBlogs } from '@/lib/data';
import { BIOS } from '@/lib/speaking';
import { SPRINT_PRICE, START_HERE_SLUG } from '@/lib/site';
import { VENTURES } from '@/lib/ventures';

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
    `> ${BIOS.medium}`,
    '',
    BIOS.long,
    '',
    '## Ventures',
    ...VENTURES.map((v) => `- [${v.name}](${v.url}): ${v.description} ${v.role}, since ${v.since}.`),
    '',
    '## Work with him',
    line('The Constraint Sprint', '/sprint', `four remote sessions with a service business's leadership team to name the constraint holding growth back, ending in a written analysis and a 90-day plan. Fixed price ${SPRINT_PRICE}.`),
    line('Productize and Scale playbook', '/playbook', 'free working playbook: eight steps to productize a service and find where it is stuck.'),
    line('Angel investing', '/invest', 'angel investment for B2B productized services and services-as-software built in Albania or Kosovo and already selling in Europe or the US.'),
    line('Speaking', '/speaking', 'talks on running AI agents inside a real service business, bootstrapped growth, and the Albanian and Balkan tech ecosystem.'),
    line('Podcast: Scaling the Unscalable', '/podcast', 'long conversations with founders about burnout, co-founders, bootstrapping and building a company.'),
    line('About', '/about', 'his story, from founding division5 in May 2015 at 23 to today.'),
    line('Contact', '/contact', 'for the sprint, a talk, an investment, or anything else.'),
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
