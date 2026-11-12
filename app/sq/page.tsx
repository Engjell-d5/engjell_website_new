import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';
import { PERSON } from '@/lib/person';
import { VENTURES } from '@/lib/ventures';
import { SQ_BIOS, SQ_CHAPTERS, SQ_ESSAYS, SQ_EXPERTISE, SQ_ONE_LINE, SQ_VALUES, SQ_VENTURE_LINES } from '@/lib/sq';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

// The Albanian counterpart of /about. See lib/sq.ts for why it exists.
const profilePageData = {
  name: 'Rreth Engjëll Rraklli',
  url: `${siteUrl}/sq`,
  inLanguage: 'sq',
  mainEntity: { '@type': 'Person', ...PERSON, description: SQ_BIOS.short },
};

export const metadata: Metadata = createMetadata({
  // Both spellings: people search for either, and carrying "Engjell Rraklli"
  // stops createMetadata appending it a second time.
  title: 'Engjëll Rraklli (Engjell Rraklli), sipërmarrës teknologjie',
  description: SQ_ONE_LINE,
  path: '/sq',
  locale: 'sq_AL',
  languages: { en: '/about', sq: '/sq' },
});

export default function AboutSq() {
  return (
    <main id="main-content" lang="sq">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Shqip', url: '/sq' }]} />
      <StructuredData type="ProfilePage" data={profilePageData} />

      <PageHero
        label="Rreth meje"
        title={
          <>
            Doja të ndërtoja lojëra. <span className="text-[var(--primary-mint)]">Tregu kishte plane të tjera.</span>
          </>
        }
        lede={
          <p>
            Jam sipërmarrës shqiptar teknologjie në Tiranë. Themelova division5 në 2015 dhe divisionAI në
            2025, dhe për pjesën më të madhe të kësaj kohe isha arsyeja pse kompania ime nuk rritej. Kjo
            është si ndodhi, dhe çfarë bëra për ta ndryshuar.
          </p>
        }
        actions={
          <Link href="/about" className="btn btn-secondary" hrefLang="en" lang="en">
            English
          </Link>
        }
        image={{ src: '/photos/studio-smile.jpg', alt: 'Engjëll Rraklli në studion e podcastit' }}
      />

      <section className="sec-light" aria-label="Historia ime">
        <div className="wrap pad-y">
          <ol className="border-b border-[var(--line)]">
            {SQ_CHAPTERS.map((c) => (
              <li key={c.title} className="flex flex-wrap gap-x-12 gap-y-2 border-t border-[var(--line)] py-9">
                <p className="label mt-2 flex-[0_0_210px] !text-[var(--accent-text)]">{c.when}</p>
                <div className="min-w-0 max-w-[720px] flex-[1_1_520px]">
                  <h2 className="text-[clamp(32px,2.8vw,42px)] leading-[1.02] tracking-[0.03em]">{c.title}</h2>
                  <p className="mt-3.5 text-[17px] leading-[1.75] text-[var(--text)]">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec-light" aria-labelledby="ekspertiza">
        <div className="wrap pad-y" style={{ paddingTop: 0 }}>
          <SectionLabel>Çfarë di</SectionLabel>
          <h2 id="ekspertiza" className="h-section mt-3.5">
            Çfarë më mësuan njëmbëdhjetë vjet nga afër
          </h2>
          <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {SQ_EXPERTISE.map((e) => (
              <div key={e.name} className="border-t border-[var(--line)] py-7">
                <h3 className="text-[30px] leading-[1.02] tracking-[0.03em]">{e.name}</h3>
                <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text)]">{e.body}</p>
                {e.link.href.startsWith('http') ? (
                  <a href={e.link.href} target="_blank" rel="noopener noreferrer" className="meta mt-3 inline-block underline underline-offset-4">
                    {e.link.label} ↗
                  </a>
                ) : (
                  <Link href={e.link.href} className="meta mt-3 inline-block underline underline-offset-4">
                    {e.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--deep)] md:aspect-[21/8]">
        <Image
          src="/photos/stage-adc-room.jpg"
          alt="Engjëll Rraklli duke folur para një salle plot në Albanian Developers Conference 2023 në Prishtinë"
          fill
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <section className="sec-deep" aria-labelledby="shqiperia">
        <div className="wrap pad-y">
          <SectionLabel>Pse ndërtoj në Shqipëri</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-x-20 gap-y-10">
            <div className="min-w-0 flex-[1_1_560px]">
              <h2 id="shqiperia" className="text-balance text-[clamp(44px,4.6vw,70px)] leading-[0.96]">
                Shqipëria eksporton njerëzit e saj më të mirë. Gjithçka që ndërtoj është një bast se{' '}
                <span className="text-[var(--primary-mint)]">nuk ka pse ta bëjë.</span>
              </h2>
              <p className="mt-6 max-w-[36em] text-base leading-relaxed text-[var(--text)]">
                Një inxhinier i ri këtu nuk duhet të zgjedhë mes karrierës që do dhe vendit nga vjen. Ndërto
                këtu kompani që plotësojnë standardin botëror, dhe nuk ka më pse të zgjedhë. Kjo do të thotë
                projekte reale, njerëz me përvojë nga të cilët mëson, dhe strukturë për t’u rritur në punë të
                nivelit të lartë pa hipur në avion.
              </p>
            </div>
            <ul className="min-w-0 flex-[1_1_380px] self-end border-b border-[var(--line)]">
              {VENTURES.map((v) => (
                <li key={v.name}>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="group block border-t border-[var(--line)] py-6">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-xl font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--primary-mint)]">
                        {v.name}
                      </span>
                      <span className="meta">Themelues që nga {v.since} ↗</span>
                    </span>
                    <span className="mt-2 block text-[15px] leading-relaxed text-[var(--text)]">
                      {SQ_VENTURE_LINES[v.name] ?? v.description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sec-light" aria-labelledby="shkrime">
        <div className="wrap pad-y">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <SectionLabel>Shkrime</SectionLabel>
              <h2 id="shkrime" className="h-section mt-3.5">
                Në shqip
              </h2>
            </div>
            <Link href="/journal" className="link-rule" hrefLang="en">
              Të gjitha shkrimet, në anglisht
            </Link>
          </div>
          <ul className="mt-9 border-b border-[var(--line)]">
            {SQ_ESSAYS.map((e) => (
              <li key={e.slug} className="border-t border-[var(--line)] py-7">
                <Link href={`/sq/shkrime/${e.slug}`} className="group block">
                  <span className="block text-[clamp(28px,2.6vw,38px)] font-bebas leading-[1.02] tracking-[0.02em] text-[var(--ink)] group-hover:text-[var(--accent-text)]">
                    {e.title}
                  </span>
                  <span className="mt-2 block max-w-[46em] text-[16px] leading-relaxed text-[var(--text)]">{e.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec-dark" aria-labelledby="vlerat">
        <div className="wrap pad-y">
          <SectionLabel>Çfarë mbaj</SectionLabel>
          <h2 id="vlerat" className="h-section mt-3.5">
            Katër gjëra që i mësova me kohë
          </h2>
          <div className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-4">
            {SQ_VALUES.map((v) => (
              <div key={v.name} className="border-t border-[var(--line)] py-7">
                <h3 className="text-[34px] leading-none tracking-[0.03em]">{v.name}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--text)]">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Albanian media and podcasts, the same way /speaking hands out the English ones. */}
      <section className="sec-light" aria-labelledby="biografi">
        <div className="wrap pad-y">
          <SectionLabel>Për mediat dhe podcastet</SectionLabel>
          <h2 id="biografi" className="h-section mt-3.5">
            Biografi, gati për t’u kopjuar
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {(
              [
                ['Biografi e shkurtër', SQ_BIOS.short],
                ['Biografi e mesme', SQ_BIOS.medium],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="card">
                <p className="label">{label}</p>
                <p className="text-[15px] leading-relaxed text-[var(--ink)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-mint">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-12 gap-y-8 py-[clamp(56px,6vw,88px)]">
          <div className="min-w-0 flex-[1_1_520px]">
            <h2 className="text-balance text-[clamp(40px,4vw,62px)] leading-[0.96]">
              Për një fjalim, një ekip inxhinierësh ose një bisedë.
            </h2>
            <p className="mt-4 max-w-[40em] text-base leading-relaxed text-[var(--rich-black)]">
              Më shkruaj në shqip ose në anglisht.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:info@engjellrraklli.com" className="btn btn-dark">
              info@engjellrraklli.com
            </a>
            <Link
              href="/speaking"
              hrefLang="en"
              className="btn border-[var(--rich-black)] text-[var(--rich-black)] hover:bg-[var(--rich-black)] hover:text-[var(--primary-mint)]"
            >
              Fjalime (në anglisht)
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
