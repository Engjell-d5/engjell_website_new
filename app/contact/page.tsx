import Link from 'next/link';
import { Linkedin, Mail, MapPin, Youtube } from 'lucide-react';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import PageHero from '@/components/site/PageHero';
import SectionLabel from '@/components/site/SectionLabel';
import { createMetadata } from '@/lib/metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

const contactPageData = {
  name: 'Contact Engjell Rraklli',
  url: `${siteUrl}/contact`,
  description: 'Get in touch with Engjell Rraklli about the Constraint Sprint, speaking, investment, or anything else.',
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
  title: 'Contact Engjell Rraklli',
  description:
    'Contact Engjell Rraklli about the Constraint Sprint, a talk, an investment, or anything else. He reads every message and usually replies within two business days.',
  path: '/contact',
});

// Faster routes for the three things most messages are about.
const ROUTES = [
  { href: '/sprint', q: 'Stuck on growth?', a: 'The Constraint Sprint' },
  { href: '/speaking', q: 'Booking a talk?', a: 'Topics, formats and bios' },
  { href: '/invest', q: 'Raising?', a: 'What I invest in' },
];

export default function Contact() {
  return (
    <main id="main-content">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]} />
      <StructuredData type="ContactPage" data={contactPageData} />

      <PageHero
        label="Contact"
        size="md"
        title={
          <>
            Tell me what you are <span className="text-[var(--primary-mint)]">working on.</span>
          </>
        }
        lede={
          <p>
            I read every message myself and usually reply within two business days, in English or
            Albanian. If it is one of these, the page will answer most of your questions first.
          </p>
        }
        aside={
          <ul className="border-b border-[var(--line)]">
            {ROUTES.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="group flex items-baseline justify-between gap-4 border-t border-[var(--line)] py-5">
                  <span className="text-[15px] text-[var(--text)]">{r.q}</span>
                  <span className="text-right font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--primary-mint)]">
                    {r.a} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        }
      />

      <section className="sec-light" aria-labelledby="write">
        <div className="wrap pad-y flex flex-wrap gap-x-20 gap-y-12">
          <div className="min-w-0 flex-[1_1_320px]">
            <SectionLabel>Write to me</SectionLabel>
            <h2 id="write" className="h-section mt-3.5">
              A paragraph is enough
            </h2>
            <ul className="mt-8 flex flex-col gap-5 text-[15px]">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                <a href="mailto:info@engjellrraklli.com" className="font-semibold text-[var(--ink)] hover:text-[var(--accent-text)]">
                  info@engjellrraklli.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                <span className="text-[var(--ink)]">Tirana, Albania. Working with founders anywhere.</span>
              </li>
              <li className="flex items-start gap-3">
                <Linkedin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                <a
                  href="https://www.linkedin.com/in/engjell-rraklli-a8b20a68/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--ink)] hover:text-[var(--accent-text)]"
                >
                  LinkedIn
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Youtube className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                <a
                  href="https://www.youtube.com/@engjellrraklli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--ink)] hover:text-[var(--accent-text)]"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
          <div className="min-w-0 flex-[1_1_560px]">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
