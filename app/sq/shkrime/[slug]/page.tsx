import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { readingTimeMinutes } from '@/lib/reading-time';
import { SQ_ESSAYS } from '@/lib/sq';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

// Albanian translations of journal essays. They live in lib/sq.ts rather than
// the posts table so they never show up in the English journal, feed or
// sitemap pagination, and each names its English original (hreflang).
export const dynamicParams = false;

export function generateStaticParams() {
  return SQ_ESSAYS.map((e) => ({ slug: e.slug }));
}

type Params = Promise<{ slug: string }> | { slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const essay = SQ_ESSAYS.find((e) => e.slug === slug);
  if (!essay) return createMetadata({ title: 'Nuk u gjet', path: `/sq/shkrime/${slug}`, noindex: true });
  return createMetadata({
    title: essay.title,
    description: essay.description,
    path: `/sq/shkrime/${essay.slug}`,
    image: `/og/journal/${essay.enSlug}`,
    type: 'article',
    locale: 'sq_AL',
    languages: { en: `/journal/${essay.enSlug}`, sq: `/sq/shkrime/${essay.slug}` },
  });
}

export default async function EssaySq({ params }: { params: Params }) {
  const { slug } = await Promise.resolve(params);
  const essay = SQ_ESSAYS.find((e) => e.slug === slug);
  if (!essay) notFound();

  const minutes = readingTimeMinutes(essay.html);
  const url = `${siteUrl}/sq/shkrime/${essay.slug}`;
  const articleData = {
    headline: essay.title,
    description: essay.description,
    image: `${siteUrl}/IMG_0425.JPG`,
    inLanguage: 'sq',
    translationOfWork: { '@type': 'BlogPosting', '@id': `${siteUrl}/journal/${essay.enSlug}` },
    author: { '@type': 'Person', '@id': `${siteUrl}/#person`, name: 'Engjëll Rraklli', url: siteUrl },
    publisher: { '@type': 'Person', '@id': `${siteUrl}/#person`, name: 'Engjell Rraklli', url: siteUrl },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    timeRequired: `PT${minutes}M`,
  };
  const others = SQ_ESSAYS.filter((e) => e.slug !== essay.slug);

  return (
    <main id="main-content" lang="sq">
      <StructuredData type="BlogPosting" data={articleData} />
      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Shqip', url: '/sq' },
          { name: essay.title, url: `/sq/shkrime/${essay.slug}` },
        ]}
      />

      <section className="sec-dark">
        <div className="wrap pb-[clamp(40px,4vw,64px)] pt-[clamp(40px,6vw,88px)]">
          <div className="mx-auto max-w-[56rem]">
            <p className="label">
              <span className="slash" aria-hidden="true">/</span>
              <Link href="/sq" className="hover:text-[var(--primary-mint)]">
                Shkrime në shqip
              </Link>
            </p>
            <h1 className="mt-5 text-balance text-[clamp(46px,5.4vw,84px)] leading-[0.94]">{essay.title}</h1>
            <p className="lede mt-6 max-w-[40em] !text-[18px]">{essay.description}</p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-[var(--line)] pt-6">
              <div className="flex items-center gap-3.5">
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--deep)]">
                  <Image src="/IMG_0466.JPG" alt="" fill quality={85} sizes="48px" className="origin-[50%_33%] scale-[2.4] object-cover" style={{ objectPosition: '50% 24%' }} />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[var(--ink)]">Engjëll Rraklli</p>
                  <p className="meta">{minutes} min lexim</p>
                </div>
              </div>
              <Link href={`/journal/${essay.enSlug}`} hrefLang="en" className="link-rule">
                Origjinali në anglisht
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-light">
        <div className="wrap pb-[clamp(56px,6vw,96px)] pt-[clamp(48px,5vw,80px)]">
          <article className="mx-auto max-w-[44rem]">
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: essay.html }} />
            <div className="mt-12 border-t border-[var(--line)] pt-6">
              <p className="meta">Më shumë në shqip</p>
              <ul className="mt-3 space-y-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/sq/shkrime/${o.slug}`} className="link-rule">
                      {o.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/sq" className="link-rule">
                    Rreth meje
                  </Link>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
