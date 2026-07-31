import Link from 'next/link';
import { Twitter, Linkedin, Youtube, Mail } from 'lucide-react';
import { VENTURES } from '@/lib/ventures';
import SubscribeForm from '@/components/SubscribeForm';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/journal', label: 'Journal' },
  { href: '/ventures', label: 'Ventures' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    // --surface-0, not --rich-black. The footer is page furniture, so it should
    // sit behind the panels rather than level with them. At panel tone it read
    // as one more panel stacked at the bottom of every page.
    <footer className="mt-6 border border-[var(--rule-faint)] bg-[var(--surface-0)] py-12 px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 max-w-[1600px] mx-auto">
        {/* Brand + the signup that was missing from every page */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/Engjell_Rraklli_White_Logo_Mark.svg"
              alt="Engjell Rraklli logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl text-white font-bebas tracking-widest">ENGJELL RRAKLLI</span>
          </div>
          <p className="meta max-w-sm leading-relaxed">
            Building scalable tech and human potential in Tirana. Creative at heart, resilient by
            practice. Valuing discipline, persistence, kindness, and patience above all.
          </p>

          {/* Subscribe existed only in the sidebar and at the end of articles.
              The footer is the one block on every page, so it belongs here. */}
          <div className="mt-8">
            <p className="section-label mb-1">Field notes</p>
            <p className="meta mb-2">Sent when there is something worth reading.</p>
            <SubscribeForm variant="inline" />
          </div>
        </div>

        <nav className="md:col-span-2" aria-label="Footer">
          <h2 className="section-label mb-4">Navigation</h2>
          <ul className="space-y-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="meta hover:text-[var(--primary-mint)] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="section-label mb-4">Ventures</h2>
          <ul className="space-y-2.5">
            {VENTURES.map((v) => (
              <li key={v.name}>
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meta hover:text-[var(--primary-mint)] transition-colors"
                >
                  {v.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="section-label mb-4">Connect</h2>

          {/* The address was only on the contact page's sidebar. The footer is
              where people actually look for it. */}
          <a
            href="mailto:info@engjellrraklli.com"
            className="meta inline-flex items-center gap-2 hover:text-[var(--primary-mint)] transition-colors"
          >
            <Mail className="w-4 h-4 shrink-0" />
            info@engjellrraklli.com
          </a>

          <div className="flex gap-4 mt-4">
            <a
              href="https://x.com/RraklliEngjell"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Engjell Rraklli on X"
              className="text-[var(--text-meta)] hover:text-[var(--primary-mint)] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/engjell-rraklli-a8b20a68/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Engjell Rraklli on LinkedIn"
              className="text-[var(--text-meta)] hover:text-[var(--primary-mint)] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/@engjellrraklli"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Engjell Rraklli on YouTube"
              className="text-[var(--text-meta)] hover:text-[var(--primary-mint)] transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>

          <p className="meta mt-8">&copy; {new Date().getFullYear()} Engjell Rraklli</p>
          <p className="meta mt-1">
            Built by{' '}
            <a
              href="https://divisionai.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-mint)] hover:underline"
            >
              divisionAI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
