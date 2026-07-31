import Image from 'next/image';
import { Contact as ContactIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ContactForm from '@/components/ContactForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

const contactPageData = {
  name: 'Contact Engjell Rraklli',
  url: `${siteUrl}/contact`,
  description: 'Get in touch with Engjell Rraklli for speaking engagements, technical consulting, and partnership opportunities.',
  mainEntity: {
    '@type': 'Person',
    name: 'Engjell Rraklli',
    url: siteUrl,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'business inquiries',
        url: `${siteUrl}/contact`,
        areaServed: ['AL', 'EU', 'Worldwide'],
        availableLanguage: ['English', 'Albanian'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'speaking engagements',
        url: `${siteUrl}/contact`,
        areaServed: ['AL', 'EU', 'Worldwide'],
        availableLanguage: ['English', 'Albanian'],
      },
    ],
  },
};

export const metadata: Metadata = createMetadata({
  title: 'Contact Engjell Rraklli: Speaking & Consulting',
  description: 'Contact Engjell Rraklli for speaking, technical consulting, and partnership opportunities. Tech and startup advice for founders in Albania and the Balkans.',
  path: '/contact',
});

export default function Contact() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]} />
      <StructuredData type="ContactPage" data={contactPageData} />
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--rule-faint)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-meta)]">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Contact</span>
          </div>
          <div className="font-montserrat text-[11px] text-[var(--text-meta)] font-bold tracking-[0.15em] hidden md:block">
            WISH FOR OTHERS WHAT YOU WISH FOR YOURSELF.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="flex flex-col">
                <span className="page-label mb-3 block">Contact</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas mb-6">LET'S TALK</h1>
                <p className="text-sm text-[var(--primary-mint)] font-bold uppercase tracking-widest mb-6">Speaker, Builder, Consultant</p>
                
                <div className="prose prose-invert max-w-none text-[var(--text-muted)] text-base leading-[1.75]">
                  <p className="mb-6">
                    Open for speaking engagements, technical consulting, and partnership opportunities. I'm passionate about the entrepreneurial potential of Albania and the Balkans.
                  </p>

                  <p className="mb-6">
                    I work at the intersection of strategy and implementation. Whether it's technical architecture or entering the Albanian market, my goal is the same: build ventures that last. If you're a builder who sees what this region can become, let's talk.
                  </p>

                  <p className="mb-6">
                    Have a question about the nuances of building in Albania, or a venture you want to discuss? I'm all ears.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {/* Personal Image - Above the form */}
                <div className="w-full h-64 rounded-none overflow-hidden border border-[var(--border-color)] relative group">
                  <Image 
                    src="/IMG_0456.JPG"
                    alt="Engjell Rraklli smiling portrait - Available for speaking and consulting" 
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover img-classic opacity-80 group-hover:opacity-100"
                  />
                </div>
                
                <ContactForm />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
