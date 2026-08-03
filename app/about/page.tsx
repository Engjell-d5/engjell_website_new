import Image from 'next/image';
import Link from 'next/link';
import { Heart, Mountain, ShieldCheck, Hourglass, Play } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import { yearsOfBuilding, yearsOfHiring, KNOWS_ABOUT } from '@/lib/site';
import { VENTURES } from '@/lib/ventures';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

const profilePageData = {
  name: 'About Engjell Rraklli',
  url: `${siteUrl}/about`,
  mainEntity: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
    jobTitle: 'Tech Entrepreneur',
    description: 'Albanian tech entrepreneur and startup founder building scalable technology in Tirana.',
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
  },
};

export const metadata: Metadata = createMetadata({
  title: 'About Engjell Rraklli, Albanian Tech Entrepreneur',
  description: 'Engjell Rraklli is an Albanian tech entrepreneur and startup founder building world-class software in Tirana, and thousands of job opportunities for young Albanians over the past decade.',
  path: '/about',
});

export default function About() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]} />
      <StructuredData type="ProfilePage" data={profilePageData} />
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--rule-faint)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-meta)]">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">About</span>
          </div>
          <div className="font-montserrat text-[11px] text-[var(--text-meta)] font-bold tracking-[0.15em] hidden md:block">
            THERE IS NO SHORTCUT TO HARD WORK.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <span className="page-label mb-3 block">My Story</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas mb-6">THE JOURNEY</h1>
                <p className="text-sm text-[var(--text-meta)] mt-2 font-light">{yearsOfBuilding()} YEARS OF BUILDING</p>
                <div className="h-[1px] w-24 bg-gray-600 mx-auto mt-4"></div>
              </div>
              
              {/* Image and First Paragraph Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                {/* Image Column */}
                <div className="md:col-span-5 h-64 md:h-auto relative overflow-hidden group">
                  <Image 
                    src="/IMG_0466.JPG" 
                    alt="Engjell Rraklli - About page portrait, tech entrepreneur in Tirana" 
                    fill
                    priority
                    sizes="(min-width: 768px) 42vw, 100vw"
                    className="object-cover img-classic group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Text Column */}
                <div className="md:col-span-7 flex flex-col justify-center">
              <div className="prose prose-invert max-w-none text-[var(--text-muted)] text-base leading-[1.75]">
                <p className="mb-6 first-letter:text-4xl first-letter:font-bold first-letter:text-white first-letter:mr-1 first-letter:float-left">
                  My work is grounded in the conviction that Tirana is fertile ground for world-class technology. Over a decade ago, I stepped away from traditional education to build my own path. As a creative at heart, I fell in love with the act of building, whether it was software development or companies. I failed more times than I succeeded, but those experiences shaped me into the tech entrepreneur and startup founder I am today.
                </p>
                    <p className="mb-0">
                  Now, as the founder of division5, I apply those learnings to deliver global-standard software services. But my true focus isn't just scaling a business; it is scaling human potential. I am building the infrastructure that allows young Albanian talents to apply their skills at a global level without leaving their homes, proving that the best way to predict our country's future is to empower the youth who will build it.
                </p>
                {/* Same evidence as the homepage mission block, in the second
                    place the claim is made. */}
                <p className="mt-6 mb-0 pl-4 border-l-2 border-[var(--primary-mint)] text-white text-sm font-medium not-prose">
                  <span className="font-bebas text-2xl tracking-wide text-[var(--primary-mint)] mr-2">THOUSANDS</span>
                  of job opportunities created for young Albanians over the past {yearsOfHiring()} years.
                </p>
                  </div>
                </div>
              </div>

              {/* Core Values Grid */}
              <div className="mt-8">
                <h2 className="text-2xl text-white font-bebas mb-6 tracking-wide">What I Value</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 panel-inset panel-inset-interactive group">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-white" />
                      <h3 className="text-lg text-white font-bebas tracking-wide">Kindness</h3>
                    </div>
                    <p className="text-xs text-[var(--text-meta)]">Business is ultimately about people. Treating every stakeholder with genuine respect and empathy is non-negotiable.</p>
                  </div>
                  <div className="p-6 panel-inset panel-inset-interactive group">
                    <div className="flex items-center gap-3 mb-2">
                      <Mountain className="w-5 h-5 text-white" />
                      <h3 className="text-lg text-white font-bebas tracking-wide">Persistence</h3>
                    </div>
                    <p className="text-xs text-[var(--text-meta)]">The path is never straight. Success belongs to those who show up every day, regardless of the obstacles.</p>
                  </div>
                  <div className="p-6 panel-inset panel-inset-interactive group">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <h3 className="text-lg text-white font-bebas tracking-wide">Discipline</h3>
                    </div>
                    <p className="text-xs text-[var(--text-meta)]">Motivation gets you started; discipline keeps you going. It is the bridge between goals and accomplishment.</p>
                  </div>
                  <div className="p-6 panel-inset panel-inset-interactive group">
                    <div className="flex items-center gap-3 mb-2">
                      <Hourglass className="w-5 h-5 text-white" />
                      <h3 className="text-lg text-white font-bebas tracking-wide">Patience</h3>
                    </div>
                    <p className="text-xs text-[var(--text-meta)]">Real value takes time to build. We play the long game, focusing on sustainable growth over quick wins.</p>
                  </div>
                </div>
              </div>

              {/* End-of-story CTA */}
              <div className="mt-10 p-8 panel-inset text-center">
                <h2 className="text-3xl text-white font-bebas tracking-wide mb-3">LET'S BUILD SOMETHING</h2>
                <p className="text-sm text-[var(--text-muted)] font-light max-w-md mx-auto mb-6">
                  If any of this resonates, whether you want to work together or just hear more of the story, here's where to go next.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href="/contact" className="btn btn-primary">
                    Work With Me
                  </Link>
                  <Link href="/podcast" className="btn btn-secondary-on-image">
                    <Play className="w-4 h-4" />
                    Listen to the Podcast
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

