'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="classic-panel h-20 shrink-0 flex items-center justify-between px-8 sticky-header">
      {/* Brand */}
      <div className="flex items-center gap-5 shrink-0">
        <Link href="/" className="w-16 h-16 flex items-center justify-center">
          <img 
            src="/Engjell_Rraklli_White_Logo_Mark.svg" 
            alt="ER Logo" 
            className="w-full h-full object-contain"
          />
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl tracking-widest text-white leading-none mt-1">ENGJELL RRAKLLI</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-8 bg-gray-600"></div>
            <span className="text-[10px] text-[var(--platinum)] font-bold tracking-[0.2em] font-montserrat uppercase opacity-80">Tech Entrepreneur</span>
          </div>
        </div>
      </div>

      {/* Navigation - Right Aligned */}
      <nav className="hidden md:flex items-center gap-2 ml-auto">
        <Link href="/" className={`nav-btn ${isActive('/') ? 'active' : ''}`}>
          Engjell Rraklli
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
      <div className="md:hidden fixed inset-0 top-20 z-40 bg-[var(--panel-bg)] border-t border-[#1a3a4a]">
        <nav className="flex flex-col p-6 gap-4">
          <Link 
            href="/" 
            onClick={closeMobileMenu}
            className={`nav-btn text-lg py-3 ${isActive('/') ? 'active' : ''}`}
          >
            Engjell Rraklli
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

