'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

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

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Focus trap and auto-focus first link when menu opens
  useEffect(() => {
    if (isMobileMenuOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [isMobileMenuOpen]);

  return (
    <>
    {/* Skip to main content link for accessibility */}
    <a 
      href="#main-content" 
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--primary-mint)] focus:text-black focus:font-bold focus:rounded"
      tabIndex={0}
    >
      Skip to main content
    </a>
    
    <header className="classic-panel h-20 shrink-0 flex items-center justify-between px-8 sticky-header">
      {/* Brand */}
      <div className="flex items-center gap-5 shrink-0">
        <Link href="/" className="w-16 h-16 flex items-center justify-center" aria-label="Home">
          <Image 
            src="/Engjell_Rraklli_White_Logo_Mark.svg" 
            alt="Engjell Rraklli Logo" 
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl tracking-widest text-white leading-none mt-1 font-bebas">ENGJELL RRAKLLI</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-8 bg-gray-600"></div>
            <span className="text-[10px] text-[var(--platinum)] font-bold tracking-[0.2em] font-montserrat uppercase opacity-80">Tech Entrepreneur</span>
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
        className="md:hidden text-white z-50"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
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
      <div 
        ref={mobileMenuRef}
        className="md:hidden fixed inset-0 top-20 z-40 bg-[var(--panel-bg)] border-t border-[var(--border-color)]"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
      >
        <nav className="flex flex-col p-6 gap-4">
          <Link 
            ref={firstLinkRef}
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

