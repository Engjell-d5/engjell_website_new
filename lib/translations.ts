/**
 * Which English page each Albanian page translates. Kept apart from lib/sq.ts
 * so the header's language switch (a client component) can read the pairs
 * without shipping the translated essays' HTML to every visitor.
 */

/** Essay slugs: lib/sq.ts builds SQ_ESSAYS on these, so the two never disagree. */
export const SQ_ESSAY_SLUGS = [
  { slug: 'permbyse-vete-biznesin-tend-me-ai', enSlug: 'put-yourself-out-of-business-with-ai' },
  { slug: 'beje-rrugetimin-tend-me-qellim', enSlug: 'make-your-journey-purposeful' },
] as const;

const PAIRS: { en: string; sq: string }[] = [
  { en: '/about', sq: '/sq' },
  // Literal rather than imported from lib/ai-guide.ts, which this client
  // module would otherwise pull into every page's bundle along with its copy.
  { en: '/ai-guide', sq: '/sq/udhezuesi-ai' },
  ...SQ_ESSAY_SLUGS.map((e) => ({ en: `/journal/${e.enSlug}`, sq: `/sq/shkrime/${e.slug}` })),
];

export function isAlbanianPath(pathname: string): boolean {
  return pathname === '/sq' || pathname.startsWith('/sq/');
}

/**
 * Where the language switch goes from this page: its translation when there
 * is one, otherwise the other language's front door (/sq or /).
 */
export function otherLanguagePath(pathname: string): string {
  if (isAlbanianPath(pathname)) return PAIRS.find((p) => p.sq === pathname)?.en ?? '/';
  return PAIRS.find((p) => p.en === pathname)?.sq ?? '/sq';
}
