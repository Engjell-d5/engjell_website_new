import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { AI_GUIDE_COPY, AI_GUIDE_PATHS, AI_GUIDE_PDFS, type GuideLocale } from '@/lib/ai-guide';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

/** The guide, drawn: rich black cover on a mint offset, like PlaybookCover. Decorative. */
function GuideCover({ locale }: { locale: GuideLocale }) {
  const c = AI_GUIDE_COPY[locale];
  return (
    <div className="relative aspect-[3/4] w-full max-w-[280px]" aria-hidden="true">
      <div className="absolute inset-0 translate-x-[14px] translate-y-[14px] bg-[var(--primary-mint)]" />
      <div className="absolute inset-0 flex flex-col border border-[rgba(229,229,229,0.12)] bg-[var(--rich-black)] p-[26px] text-[#E5E5E5]">
        <img src="/Engjell_Rraklli_White_Logo_Mark.svg" alt="" className="h-[34px] w-[34px]" />
        <p className="mt-5 font-bebas text-[40px] leading-[0.95] tracking-[0.03em] text-white">
          {c.titleBefore}
          <span className="text-[var(--primary-mint)]">{c.titleMint}</span>
          {c.titleAfter}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#CBD5E1]">{c.coverLine}</p>
        <p className="mt-auto text-[10px] font-bold uppercase tracking-[0.16em] text-[#8FA5AE]">Engjell Rraklli</p>
      </div>
    </div>
  );
}

export default function AiGuidePage({ locale }: { locale: GuideLocale }) {
  const c = AI_GUIDE_COPY[locale];
  const other: GuideLocale = locale === 'en' ? 'sq' : 'en';
  const path = AI_GUIDE_PATHS[locale];

  const guideData = {
    name: `${c.titleBefore}${c.titleMint}${c.titleAfter}`,
    author: { '@type': 'Person', '@id': `${siteUrl}/#person`, name: 'Engjell Rraklli' },
    inLanguage: locale,
    url: `${siteUrl}${path}`,
    encodingFormat: 'application/pdf',
    isAccessibleForFree: true,
    description: c.metaDescription,
  };

  const crumbs =
    locale === 'en'
      ? [
          { name: 'Home', url: '/' },
          { name: 'AI guide', url: path },
        ]
      : [
          { name: 'Home', url: '/' },
          { name: 'Shqip', url: '/sq' },
          { name: 'Udhëzuesi AI', url: path },
        ];

  return (
    <main id="main-content" lang={locale}>
      <Breadcrumbs items={crumbs} />
      <StructuredData type="DigitalDocument" data={guideData} />

      <PageHero
        label={c.label}
        title={
          <>
            {c.titleBefore}
            <span className="text-[var(--primary-mint)]">{c.titleMint}</span>
            {c.titleAfter}
          </>
        }
        lede={<p>{c.lede}</p>}
        actions={
          <>
            <a href={AI_GUIDE_PDFS[locale]} download className="btn btn-primary">
              <Download size={18} aria-hidden="true" />
              {c.download}
            </a>
            <Link href={AI_GUIDE_PATHS[other]} className="btn btn-secondary" hrefLang={other} lang={other}>
              {c.otherLanguage}
            </Link>
          </>
        }
        aside={
          <div className="flex justify-center py-4">
            <GuideCover locale={locale} />
          </div>
        }
      />

      <section className="sec-light" aria-labelledby="inside">
        <div className="wrap pad-y">
          <SectionLabel>{c.insideLabel}</SectionLabel>
          <h2 id="inside" className="h-section mt-3.5">
            {c.insideTitle}
          </h2>
          <ol className="mt-12 grid gap-x-12 sm:grid-cols-2">
            {c.steps.map(([title, note], i) => (
              <li key={title} className="flex gap-6 border-t border-[var(--line)] py-7">
                <span className="font-bebas text-[44px] leading-none text-[var(--accent-text)]" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[30px] leading-[1.02] tracking-[0.03em]">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--text)]">{note}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-[46em] text-[17px] leading-relaxed text-[var(--text)]">{c.hard}</p>
        </div>
      </section>

      <section className="sec-deep" aria-labelledby="help">
        <div className="wrap flex flex-wrap gap-x-20 gap-y-10 py-[clamp(56px,6vw,96px)]">
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionLabel>{c.helpLabel}</SectionLabel>
            <h2 id="help" className="mt-3.5 text-[clamp(36px,3.4vw,50px)] leading-[0.98]">
              {c.helpTitle}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text)]">{c.aiSprint}</p>
            <Link href="/ai-sprint" className="btn btn-primary mt-6" hrefLang="en">
              {c.aiSprintLink}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="min-w-0 flex-[1_1_480px]">
            <SectionLabel>{c.serviceTitle}</SectionLabel>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text)]">{c.service}</p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-bold">
              <Link href="/sprint" className="text-link" hrefLang="en">
                {c.serviceLink}
              </Link>
              <Link href="/playbook" className="text-link" hrefLang="en">
                Productize and Scale
              </Link>
            </p>
            {c.englishNote && <p className="mt-4 text-sm text-[var(--muted)]">{c.englishNote}</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
