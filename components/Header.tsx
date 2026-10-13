'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Four destinations and one action. The old bar carried nine links plus a
// button, which asked a first-time visitor to choose between every audience
// the site serves before they knew what it was. Everything else lives one
// click down: the offers under Work with me, the rest in the footer.
const NAV = [
  { href: '/journal', label: 'Journal', match: ['/journal'] },
  { href: '/podcast', label: 'Podcast', match: ['/podcast'] },
  { href: '/about', label: 'About', match: ['/about', '/ventures'] },
  { href: '/work', label: 'Work with me', match: ['/work', '/sprint', '/speaking', '/invest', '/contact'] },
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
            {/* Kept from the original header: the descriptor is part of the brand. */}
            <span className="flex items-center gap-2 text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-[var(--muted)] sm:text-[10px] sm:tracking-[0.16em]">
              <span className="block h-px w-6 shrink-0 bg-[var(--primary-mint)]" aria-hidden="true" />
              <span>Homegrown Albanian tech entrepreneur</span>
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
          <Link href="/playbook" className="btn btn-primary ml-3 min-h-[46px] px-5 text-[13px]">
            Free playbook
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
            <Link href="/playbook" className="btn btn-primary mt-8">
              Get the free playbook
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
