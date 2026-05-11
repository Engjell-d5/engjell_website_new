import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { getBlogs } from '@/lib/data';
import { toCategorySlug } from '@/lib/category-slug';

export const revalidate = 300;

export const metadata: Metadata = createMetadata({
  title: 'Journal | Field Notes on Tech & Entrepreneurship',
  description: 'Engjell Rraklli\'s field notes on building tech ventures, scaling startups, and software development in Albania. Articles on entrepreneurship and leadership.',
  path: '/journal',
  keywords: [
    'Tech Blog Albania',
    'Entrepreneurship Articles',
    'Startup Advice',
    'Software Development Blog',
    'Albanian Tech Writer',
    'Engjell Rraklli Articles',
  ],
});

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

export default async function Journal() {
  const all = await getBlogs();
  const blogs = all
    .filter((b) => b.published)
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

  // Distinct categories for the topic-pill nav, each linking to its own category page.
  // Deduplicate by slug so two categories that slugify to the same value (rare) merge into one pill.
  const categories = Array.from(
    new Map(
      blogs
        .filter((b) => b.category)
        .map((b) => [toCategorySlug(b.category), b.category])
    ).entries()
  ).map(([slug, name]) => ({ slug, name }));

  // "Read next" picks: top 3 most recent posts not the very first card on the page
  const readNext = blogs.slice(1, 4);

  const collectionData = {
    name: 'Engjell Rraklli — Field Notes',
    description: 'Articles on tech entrepreneurship, software development, and building startups in Albania.',
    url: `${siteUrl}/journal`,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', url: siteUrl, name: 'Engjell Rraklli' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: blogs.slice(0, 20).map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/journal/${b.slug}`,
        name: b.title,
      })),
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Journal', url: '/journal' }]} />
      <StructuredData type="CollectionPage" data={collectionData} />
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] order-2 md:order-1">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Journal</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
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
              </div>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No blog posts yet. Check back soon!</p>
              </div>
            ) : (
              <>
              {categories.length > 1 && (
                <nav aria-label="Browse by topic" className="mb-8">
                  <h2 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">Browse by topic</h2>
                  <ul className="flex flex-wrap gap-2">
                    {categories.map(({ slug, name }) => (
                      <li key={slug}>
                        <Link
                          href={`/journal/category/${slug}`}
                          className="text-[10px] text-gray-300 hover:text-[var(--primary-mint)] uppercase tracking-widest border border-[var(--border-color)] px-3 py-1 transition-colors"
                        >
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className="grid gap-6">
                {blogs.map((blog, idx) => (
                  <article key={blog.id}>
                    <Link
                      href={`/journal/${blog.slug}`}
                      className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-all cursor-pointer group flex flex-col md:flex-row gap-8"
                    >
                      <div className="w-full md:w-56 h-36 bg-black shrink-0 overflow-hidden border border-[var(--border-color)]/30 relative">
                        <Image
                          src={blog.imageUrl}
                          alt={`${blog.title} - ${blog.category} article`}
                          fill
                          sizes="(min-width: 768px) 224px, 100vw"
                          className="object-cover img-classic"
                          priority={idx === 0}
                        />
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-[var(--border-color)] px-2 py-0.5">
                            {blog.category}
                          </span>
                          {blog.publishedAt && (
                            <time
                              dateTime={new Date(blog.publishedAt).toISOString()}
                              className="text-[10px] text-gray-500 uppercase tracking-widest"
                            >
                              {formatDate(blog.publishedAt)}
                            </time>
                          )}
                        </div>
                        <h2 className="text-3xl text-white font-bebas mb-3 group-hover:text-[var(--primary-mint)] transition-colors">
                          {blog.title}
                        </h2>
                        <p className="text-sm text-gray-400 leading-relaxed font-light">
                          {blog.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              {readNext.length > 0 && (
                <aside className="mt-16 pt-8 border-t border-[var(--border-color)]">
                  <h2 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-4">Read next</h2>
                  <ul className="grid gap-2 md:grid-cols-3">
                    {readNext.map((b) => (
                      <li key={b.id}>
                        <Link
                          href={`/journal/${b.slug}`}
                          className="block p-4 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-all"
                        >
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">{b.category}</span>
                          <span className="text-sm text-white font-medium leading-snug block">{b.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
              </>
            )}
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
