import Link from 'next/link';
import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import BlogCard from '@/components/BlogCard';
import Pagination from '@/components/Pagination';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { getBlogs } from '@/lib/data';
import { toCategorySlug } from '@/lib/category-slug';

// Rendered per request. ISR (revalidate) is wedged in the deployed
// standalone/proxy environment: pages prerendered empty at build (no
// DATABASE_URL in CI) kept serving the empty fallback and never revalidated.
// Force-dynamic matches the previously-deployed, known-good behavior.
export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 10;

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
    title: page > 1 ? `Journal — Page ${page}` : 'Journal — Field Notes on Building Tech',
    description:
      "Engjell Rraklli's field notes on building tech ventures, scaling startups, and software development in Albania. Articles on entrepreneurship and leadership.",
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

  const totalPages = Math.max(1, Math.ceil(blogs.length / POSTS_PER_PAGE));
  const page = Math.min(parsePage(searchParams), totalPages);
  const pageBlogs = blogs.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // Distinct categories for the topic-pill nav, each linking to its own category page.
  // Built from every post, not just this page, so the nav is stable across pages.
  // Deduplicate by slug so two categories that slugify to the same value (rare) merge into one pill.
  const categories = Array.from(
    new Map(
      blogs
        .filter((b) => b.category)
        .map((b) => [toCategorySlug(b.category), b.category])
    ).entries()
  ).map(([slug, name]) => ({ slug, name }));

  const collectionData = {
    name: 'Engjell Rraklli — Field Notes',
    description: 'Articles on tech entrepreneurship, software development, and building startups in Albania.',
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Journal', url: '/journal' }]} />
      <StructuredData type="CollectionPage" data={collectionData} />
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-meta)]">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Journal</span>
          </div>
          <div className="font-montserrat text-[10px] text-[var(--text-meta)] font-bold tracking-[0.15em] hidden md:block">
            A KIND WORLD IS A BETTER WORLD.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="flex items-end justify-between mb-8 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="page-label mb-3 block">Journal</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas">FIELD NOTES</h1>
                {blogs.length > 0 && (
                  <p className="text-xs text-[var(--text-meta)] mt-2 uppercase tracking-widest">
                    {blogs.length} article{blogs.length === 1 ? '' : 's'}
                    {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
                  </p>
                )}
              </div>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--text-muted)]">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <>
                {categories.length > 1 && (
                  <nav aria-label="Browse by topic" className="mb-8">
                    <h2 className="text-[10px] text-[var(--text-meta)] uppercase font-bold tracking-widest mb-3">Browse by topic</h2>
                    <ul className="flex flex-wrap gap-2">
                      {categories.map(({ slug, name }) => (
                        <li key={slug}>
                          <Link
                            href={`/journal/category/${slug}`}
                            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--primary-mint)] uppercase tracking-widest border border-[var(--border-color)] px-3 py-1 transition-colors"
                          >
                            {name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
                <div className="grid gap-6">
                  {pageBlogs.map((blog, idx) => (
                    <BlogCard key={blog.id} blog={blog} priority={page === 1 && idx === 0} />
                  ))}
                </div>
                <Pagination basePath="/journal" page={page} totalPages={totalPages} />
              </>
            )}
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
