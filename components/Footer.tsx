import Link from 'next/link';
import SubscribeForm from '@/components/SubscribeForm';

// The full map of the site lives here, so the header can stay at four links.
// Grouped by what a visitor came to do rather than by page type.
const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: 'Read',
    links: [
      { href: '/journal', label: 'Journal' },
      { href: '/podcast', label: 'Podcast' },
      { href: '/playbook', label: 'Free playbook' },
    ],
  },
  {
    title: 'Work with me',
    links: [
      { href: '/sprint', label: 'Constraint Sprint' },
      { href: '/speaking', label: 'Speaking' },
      { href: '/invest', label: 'Angel investing' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'My story' },
      { href: '/ventures', label: 'Ventures' },
      { href: 'https://division5.co', label: 'division5 ↗', external: true },
      { href: 'https://divisionai.co', label: 'divisionAI ↗', external: true },
    ],
  },
  {
    title: 'Elsewhere',
    links: [
      { href: 'https://www.linkedin.com/in/engjell-rraklli-a8b20a68/', label: 'LinkedIn ↗', external: true },
      { href: 'https://x.com/RraklliEngjell', label: 'X ↗', external: true },
      { href: 'https://www.youtube.com/@engjellrraklli', label: 'YouTube ↗', external: true },
      { href: 'mailto:info@engjellrraklli.com', label: 'Email', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="sec-deep border-t border-[var(--line)]">
      <div className="wrap pb-9 pt-16">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="max-w-[400px] flex-[1_1_320px]">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/Engjell_Rraklli_White_Logo_Mark.svg" alt="" className="h-11 w-11" />
              <span className="font-bebas text-[25px] leading-none tracking-[0.08em] text-[var(--ink)]">
                Engjell Rraklli
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text)]">
              Founder of division5 and divisionAI. Writing from Tirana about building service
              businesses that scale.
            </p>
            <div className="mt-8">
              <p className="label">
                <span className="slash">/</span>Field notes by email
              </p>
              <p className="meta mt-1">The occasional essay, sent when there is something worth reading.</p>
              <SubscribeForm variant="inline" />
            </div>
          </div>

          <div className="grid flex-[2_1_560px] grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="label mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      {l.external ? (
                        <a
                          href={l.href}
                          {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="text-sm text-[var(--ink)] transition-colors hover:text-[var(--primary-mint)]"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          className="text-sm text-[var(--ink)] transition-colors hover:text-[var(--primary-mint)]"
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-[var(--line)] pt-6 text-[12.5px] text-[var(--muted)]">
          <span>&copy; {new Date().getFullYear()} Engjell Rraklli</span>
          <span>
            <a href="mailto:info@engjellrraklli.com" className="hover:text-[var(--primary-mint)]">
              info@engjellrraklli.com
            </a>
            <span className="meta-sep" aria-hidden="true"> · </span>
            Built by{' '}
            <a
              href="https://divisionai.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-mint)] hover:underline"
            >
              divisionAI
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
