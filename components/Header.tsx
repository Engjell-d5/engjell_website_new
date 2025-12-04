'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <header className="classic-panel h-20 shrink-0 flex items-center justify-between px-4 md:px-8 sticky-header relative z-[105]">
      {/* Brand */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0 min-w-0 flex-1">
        <Link href="/" className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center hover:opacity-80 transition-opacity group flex-shrink-0">
          <img 
            src="/Engjell_Rraklli_White_Logo_Mark.svg" 
            alt="ER Logo" 
            className="w-full h-full object-contain group-hover:brightness-110 transition-all"
          />
        </Link>
        <div className="flex flex-col min-w-0">
          <div className="text-3xl md:text-2xl lg:text-3xl tracking-widest text-white leading-none mt-1 font-bebas truncate">ENGJELL RRAKLLI</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-6 md:w-8 bg-[var(--primary-mint)]"></div>
            <span className="text-[11px] md:text-[10px] text-[var(--platinum)] font-bold tracking-[0.2em] font-montserrat uppercase opacity-80 whitespace-nowrap">Tech Entrepreneur</span>
          </div>
        </div>
      </div>

      {/* Navigation - Right Aligned */}
      <nav className="hidden md:flex items-center gap-2 ml-auto">
        <Link href="/" className={`nav-btn ${isActive('/') ? 'active' : ''}`}>
          Home
        </Link>
        <Link href="/about" className={`nav-btn ${isActive('/about') ? 'active' : ''}`}>
          About
        </Link>
        <Link href="/media" className={`nav-btn ${isActive('/media') ? 'active' : ''}`}>
          Podcast
        </Link>
        <Link href="/journal" className={`nav-btn ${isActive('/journal') ? 'active' : ''}`}>
          Journal
        </Link>
        <Link href="/ventures" className={`nav-btn ${isActive('/ventures') ? 'active' : ''}`}>
          Ventures
        </Link>
        <Link href="/contact" className={`nav-btn ${isActive('/contact') ? 'active' : ''}`}>
          Contact
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white hover:text-[var(--primary-mint)] transition-colors z-50 flex-shrink-0 p-2 -mr-2"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
        suppressHydrationWarning
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </header>

    {/* Mobile Menu Dropdown */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed inset-0 top-20 z-[110] bg-[var(--panel-bg)] border-t border-[var(--border-color)] overflow-y-auto">
        <nav className="flex flex-col p-6 gap-4">
          <Link 
            href="/" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/about') ? 'active' : ''}`}
          >
            About
          </Link>
          <Link 
            href="/media" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/media') ? 'active' : ''}`}
          >
            Podcast
          </Link>
          <Link 
            href="/journal" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/journal') ? 'active' : ''}`}
          >
            Journal
          </Link>
          <Link 
            href="/ventures" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/ventures') ? 'active' : ''}`}
          >
            Ventures
          </Link>
          <Link 
            href="/contact" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/contact') ? 'active' : ''}`}
          >
            Contact
          </Link>
        </nav>
      </div>
    )}
    </>
  );
}

