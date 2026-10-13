import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import Pagination from '@/components/Pagination';
import JournalList from '@/components/site/JournalList';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { getBlogs } from '@/lib/data';
import { toCategorySlug } from '@/lib/category-slug';
import { readingTimeMinutes } from '@/lib/reading-time';
import { formatDateShort } from '@/lib/format';
import { POSTS_PER_PAGE, START_HERE_SLUG } from '@/lib/site';

// Rendered per request. ISR (revalidate) is wedged in the deployed
// standalone/proxy environment: pages prerendered empty at build (no
// DATABASE_URL in CI) kept serving the empty fallback and never revalidated.
// Force-dynamic matches the previously-deployed, known-good behavior.
export const dynamic = 'force-dynamic';

// POSTS_PER_PAGE and START_HERE_SLUG live in lib/site.ts because app/sitemap.ts
// needs the same numbers to emit the right set of ?page= URLs.

type SearchParams = { page?: string };

function parsePage(searchParams?: SearchParams): number {
  const raw = Number(searchParams?.page);
  return Number.isFinite(raw) && raw > 1 ? Math.floor(raw) : 1;
}

export async function generateMetadata(
  { searchParams }: { searchParams?: SearchParams }
): Promise<Metadata> {
  const page = parsePage(searchParams);
  // Each paginated page canonicalises to itself (rel=prev/next is no longer
  // used by Google); only page 1 owns the bare /journal URL.
  return createMetadata({
    title: page > 1 ? `Journal, Page ${page}` : 'Journal: Field Notes on Building Tech',
    description:
      "Engjell Rraklli's field notes on building and scaling a service business in Albania: founders, AI in operations, growth and culture.",
    path: page > 1 ? `/journal?page=${page}` : '/journal',
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

async function loadBlogsSafe() {
  // Build runs without DATABASE_URL; treat as empty in that case.
  if (!process.env.DATABASE_URL) return [];
  try {
    return await getBlogs();
  } catch (err) {
    console.error('[journal] getBlogs failed; falling back to empty list:', err);
    return [];
  }
}

export default async function Journal({ searchParams }: { searchParams?: SearchParams }) {
  const all = await loadBlogsSafe();
  const blogs = all
    .filter((b) => b.published)
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

  // Pull the pinned post out of the date-sorted list so it can't appear twice.
  // Undefined when it isn't published yet, which collapses the whole feature.
  const startHere = blogs.find((b) => b.slug === START_HERE_SLUG);
  const feed = startHere ? blogs.filter((b) => b.slug !== START_HERE_SLUG) : blogs;

  const totalPages = Math.max(1, Math.ceil(feed.length / POSTS_PER_PAGE));
  const page = Math.min(parsePage(searchParams), totalPages);
  const pageBlogs = feed.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // Distinct categories for the topic nav, built from every post so the nav is
  // stable across pages; deduplicated by slug.
  const categories = Array.from(
    new Map(
      blogs
        .filter((b) => b.category)
        .map((b) => [toCategorySlug(b.category), b.category])
    ).entries()
  ).map(([slug, name]) => ({ slug, name }));

  const collectionData = {
    name: 'Engjell Rraklli: Field Notes',
    description: 'Articles on building and scaling a service business, AI in operations, and building tech companies in Albania.',
    url: page > 1 ? `${siteUrl}/journal?page=${page}` : `${siteUrl}/journal`,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Engjell Rraklli' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: pageBlogs.map((b, i) => ({
        '@type': 'ListItem',
        position: (page - 1) * POSTS_PER_PAGE + i + 1,
        url: `${siteUrl}/journal/${b.slug}`,
        name: b.title,
      })),
    },
  };

  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Journal', url: '/journal' }]} />
      <StructuredData type="CollectionPage" data={collectionData} />

      <section className="sec-dark">
        <div className="wrap pb-[clamp(48px,5vw,80px)] pt-[clamp(40px,6vw,96px)]">
          <SectionLabel>Journal</SectionLabel>
          <h1 className="mt-5 max-w-[14em] text-balance text-[clamp(48px,5.6vw,86px)] leading-[0.94]">
            Notes from inside a <span className="text-[var(--primary-mint)]">service business</span>
          </h1>
          <p className="lede mt-6 max-w-[38em]">
            Essays on building and scaling a service business, written from inside one. What worked,
            what did not, and what it cost.
            {blogs.length > 0 && ` ${blogs.length} so far.`}
          </p>
          {categories.length > 1 && (
            <nav aria-label="Browse by topic" className="mt-9">
              <ul className="flex flex-wrap gap-2">
                {categories.map(({ slug, name }) => (
                  <li key={slug}>
                    <Link
                      href={`/journal/category/${slug}`}
                      className="inline-flex min-h-[40px] items-center border border-[var(--line)] px-4 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--primary-mint)] hover:text-[var(--primary-mint)]"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      {/* Pinned reference piece, page 1 only. */}
      {startHere && page === 1 && (
        <section className="sec-deep" aria-labelledby="start-here">
          <div className="wrap py-[clamp(48px,6vw,88px)]">
            <Link href={`/journal/${startHere.slug}`} className="group flex flex-wrap items-center gap-x-14 gap-y-8">
              {startHere.imageUrl && (
                <div className="relative aspect-[16/10] min-w-0 flex-[1_1_420px] overflow-hidden bg-[var(--deep)]">
                  <Image
                    src={startHere.imageUrl}
                    alt=""
                    fill
                    quality={85}
                    priority
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="min-w-0 flex-[1_1_440px]">
                <SectionLabel as="h2" id="start-here">
                  Start here
                </SectionLabel>
                <p className="mt-4 font-bebas text-[clamp(40px,3.8vw,58px)] leading-[0.98] tracking-[0.02em] text-[var(--ink)] transition-colors group-hover:text-[var(--primary-mint)]">
                  {startHere.title}
                </p>
                {startHere.excerpt && (
                  <p className="mt-4 max-w-[36em] text-base leading-relaxed text-[var(--text)]">{startHere.excerpt}</p>
                )}
                <p className="meta mt-5">
                  {formatDateShort(startHere.publishedAt)}
                  {startHere.content ? ` · ${readingTimeMinutes(startHere.content)} min read` : ''}
                </p>
                <span className="link-rule mt-3">Read the essay</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="sec-light" aria-label="All essays">
        <div className="wrap pad-y">
          {blogs.length === 0 ? (
            <p className="text-[var(--text)]">New essays are on the way.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionLabel as="h2">{page > 1 ? `Page ${page} of ${totalPages}` : 'Latest'}</SectionLabel>
                {totalPages > 1 && <p className="meta">{feed.length} essays</p>}
              </div>
              <div className="mt-6">
                <JournalList items={pageBlogs} priorityFirst={page === 1 && !startHere} />
              </div>
              <Pagination basePath="/journal" page={page} totalPages={totalPages} />
            </>
          )}
        </div>
      </section>

    </main>
  );
}
