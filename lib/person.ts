import { BIOS } from '@/lib/bio';
import { KNOWS_ABOUT } from '@/lib/site';
import { VENTURES } from '@/lib/ventures';
import { PRESS } from '@/lib/press';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/**
 * The Person node shared by every page (root layout) and the about page's
 * ProfilePage. Both used to carry their own copy and had already drifted: the
 * layout said he worked for division5 only, the about page listed both
 * ventures and a photo. One export keeps the entity identical everywhere,
 * which is what search engines and AI assistants reconcile against.
 */
export const PERSON = {
  '@id': `${siteUrl}/#person`,
  name: 'Engjell Rraklli',
  // The Albanian spelling is how people in Albania and Kosovo search for him,
  // and how the Albanian-language AI visibility questions ask about him.
  alternateName: ['Engjëll Rraklli'],
  // Roles, not the tagline: assistants answer "who is X" from jobTitle, and
  // event organisers search for speakers by role. Speaker and host are on the
  // record (two 2023 stage credits, 14 hosted episodes, see lib/speaking.ts).
  jobTitle: ['Founder of division5 and divisionAI', 'Speaker', 'Podcast host'],
  // The same short bio the speaker page hands out, so the entity reads the
  // same in schema as on every profile it is pasted into.
  description: BIOS.short,
  url: siteUrl,
  image: `${siteUrl}/IMG_0466.JPG`,
  nationality: { '@type': 'Country', name: 'Albania' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Tirana',
    addressCountry: 'AL',
  },
  sameAs: [
    'https://www.linkedin.com/in/engjell-rraklli-a8b20a68/',
    'https://x.com/RraklliEngjell',
    'https://www.youtube.com/@engjellrraklli',
    // His author page; he has written there under his own name since 2025.
    'https://hackernoon.com/u/engjellrraklli',
    // His Wikidata item (created 2026-11-10, sourced to The Recursive and IT
    // Logs). The strongest single link for search engines and assistants to
    // recognise him as one entity.
    'https://www.wikidata.org/wiki/Q142102097',
  ],
  knowsAbout: [...KNOWS_ABOUT],
  // Independent coverage about him (lib/press.ts). Lets crawlers and
  // assistants connect third-party articles to this entity.
  subjectOf: PRESS.map((p) => ({
    '@type': 'NewsArticle',
    headline: p.title,
    url: p.url,
    datePublished: p.date,
    publisher: { '@type': 'Organization', name: p.outlet, url: p.outletUrl },
  })),
  worksFor: VENTURES.map((v) => ({
    '@type': 'Organization',
    '@id': v.entityId,
    name: v.name,
    url: v.url,
  })),
} as const;
