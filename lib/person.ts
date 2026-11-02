import { KNOWS_ABOUT } from '@/lib/site';
import { VENTURES } from '@/lib/ventures';

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
  // A role, not the tagline: assistants answer "who is X" from jobTitle.
  jobTitle: 'Founder of division5 and divisionAI',
  description:
    'Albanian tech entrepreneur in Tirana, founder of division5 and divisionAI. Builds vetted software engineering teams across the Balkans, runs AI agents inside his own operations, writes about scaling service businesses, and backs founders in Albania and Kosovo.',
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
  ],
  knowsAbout: [...KNOWS_ABOUT],
  worksFor: VENTURES.map((v) => ({
    '@type': 'Organization',
    name: v.name,
    url: v.url,
  })),
} as const;
