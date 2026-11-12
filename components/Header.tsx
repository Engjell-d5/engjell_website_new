'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TAGLINE } from '@/lib/bio';
import { isAlbanianPath, otherLanguagePath } from '@/lib/translations';

/**
 * EN · SQ, the current language marked and the other a link to this page's
 * translation (or the other language's front door). Text, not flags: flags
 * name countries, and Albanian is as much Kosovo's language as Albania's.
 */
function LanguageSwitch({ pathname, className = '' }: { pathname: string; className?: string }) {
  const sq = isAlbanianPath(pathname);
  const other = otherLanguagePath(pathname);
  const item = (code: 'EN' | 'SQ', current: boolean, name: string) =>
    current ? (
      <span aria-current="true" className="text-[var(--primary-mint)]">
        {code}
      </span>
    ) : (
      <Link
        href={other}
        hrefLang={code.toLowerCase()}
        lang={code.toLowerCase()}
        aria-label={name}
        className="text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
      >
        {code}
      </Link>
    );
  return (
    <span className={`flex items-center gap-2 text-[13px] font-bold tracking-[0.12em] ${className}`}>
      {item('EN', !sq, 'English')}
      <span aria-hidden="true" className="text-[var(--muted)]">
        ·
      </span>
      {item('SQ', sq, 'Shqip')}
    </span>
  );
}

// Four destinations and one action. The old bar carried nine links plus a
// button, which asked a first-time visitor to choose between every audience
// the site serves before they knew what it was. Everything else lives one
// click down: the offers under Work with me, the rest in the footer.
const NAV = [
  { href: '/journal', label: 'Journal', match: ['/journal'] },
  { href: '/podcast', label: 'Podcast', match: ['/podcast'] },
  { href: '/about', label: 'About', match: ['/about', '/ventures'] },
  { href: '/work', label: 'Work with me', match: ['/work', '/ai-sprint', '/sprint', '/speaking', '/invest', '/contact'] },
];

export default function Header() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);

  // Close the menu on navigation, and stop the page scrolling under it.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (match: string[]) => match.some((m) => pathname === m || pathname.startsWith(m + '/'));

  return (
    <>
      <header className="site-header">
        <div className="wrap flex min-h-[76px] items-center justify-between gap-6">
          <Link href="/" className="flex min-h-[48px] min-w-0 items-center gap-3.5" aria-label="Engjell Rraklli, home">
            <img
              src="/Engjell_Rraklli_White_Logo_Mark.svg"
              alt=""
              className="h-11 w-11 shrink-0 md:h-12 md:w-12"
            />
            <span className="flex min-w-0 flex-col gap-[3px]">
              <span className="font-bebas text-[25px] leading-none tracking-[0.08em] text-[var(--ink)] md:text-[27px]">
                Engjell Rraklli
              </span>
              {/* The descriptor is part of the brand: the one idea, from lib/bio.ts. */}
              <span className="flex items-center gap-2 text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-[var(--muted)] sm:text-[10px] sm:tracking-[0.16em]">
                <span className="block h-px w-6 shrink-0 bg-[var(--primary-mint)]" aria-hidden="true" />
                <span>{TAGLINE}</span>
              </span>
            </span>
          </Link>
  
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.match) ? 'active' : ''}`}
                aria-current={isActive(item.match) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
            <LanguageSwitch pathname={pathname} className="ml-3 min-h-[46px] px-2" />
            <Link href="/ai-guide" className="btn btn-primary ml-3 min-h-[46px] px-5 text-[13px]">
              Free AI guide
            </Link>
          </nav>
  
          <button
            type="button"
            className="-mr-2 flex h-12 w-12 shrink-0 items-center justify-center text-[var(--ink)] transition-colors hover:text-[var(--primary-mint)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter makes it the containing
          block for fixed descendants, which collapsed this panel to 1px tall. */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[77px] z-[110] overflow-y-auto border-t border-[var(--line)] bg-[var(--deep)] lg:hidden"
        >
          <nav aria-label="Main" className="wrap flex flex-col py-6">
            {[{ href: '/', label: 'Home', match: ['/'] }, ...NAV].map((item) => {
              const active = item.href === '/' ? pathname === '/' : isActive(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b border-[var(--line-soft)] py-4 font-bebas text-[34px] leading-none tracking-[0.04em] ${
                    active ? 'text-[var(--primary-mint)]' : 'text-[var(--ink)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <LanguageSwitch pathname={pathname} className="mt-8 min-h-[48px] text-[16px]" />
            <Link href="/ai-guide" className="btn btn-primary mt-4">
              Get the free AI guide
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
