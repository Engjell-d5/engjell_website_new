import Link from 'next/link';
import { Twitter, Linkedin, Youtube } from 'lucide-react';
import { VENTURES } from '@/lib/ventures';

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-l border-r border-b border-[var(--border-color)] bg-[var(--rich-black)] py-10 px-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-[1600px] mx-auto">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/Engjell_Rraklli_White_Logo_Mark.svg"
              alt="Engjell Rraklli logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl text-white font-bebas tracking-widest">ENGJELL RRAKLLI</span>
          </div>
          <p className="text-xs text-[var(--text-meta)] max-w-sm leading-relaxed">
            Building scalable tech and human potential in Tirana. Creative at heart, resilient by practice. Valuing discipline, persistence, kindness, and patience above all.
          </p>
        </div>
        <div>
          <h4 className="text-base text-white font-bold uppercase tracking-widest mb-4 font-bebas">Navigation</h4>
          <ul className="space-y-2 text-xs text-[var(--text-meta)]">
            <li><Link href="/" className="hover:text-[var(--primary-mint)] transition-colors">Home</Link></li>
            <li><Link href="/about" className="hover:text-[var(--primary-mint)] transition-colors">About</Link></li>
            <li><Link href="/podcast" className="hover:text-[var(--primary-mint)] transition-colors">Podcast</Link></li>
            <li><Link href="/journal" className="hover:text-[var(--primary-mint)] transition-colors">Journal</Link></li>
            <li><Link href="/ventures" className="hover:text-[var(--primary-mint)] transition-colors">Ventures</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--primary-mint)] transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-base text-white font-bold uppercase tracking-widest mb-4 font-bebas">My Ventures</h4>
          <ul className="space-y-2 text-xs text-[var(--text-meta)]">
            {VENTURES.map((v) => (
              <li key={v.name}>
                <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-mint)] transition-colors">
                  {v.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base text-white font-bold uppercase tracking-widest mb-4 font-bebas">Connect</h4>
          <div className="flex gap-4">
            <a href="https://x.com/RraklliEngjell" target="_blank" rel="noopener noreferrer" className="text-[var(--text-meta)] hover:text-[var(--primary-mint)] transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/engjell-rraklli-a8b20a68/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-meta)] hover:text-[var(--primary-mint)] transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="https://www.youtube.com/@engjellrraklli" target="_blank" rel="noopener noreferrer" className="text-[var(--text-meta)] hover:text-[var(--primary-mint)] transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
          <p className="meta mt-6">&copy; {new Date().getFullYear()} Engjell Rraklli. All rights reserved.</p>
          <p className="meta mt-2">
            Built by{' '}
            <a href="https://divisionai.co" target="_blank" rel="noopener noreferrer" className="text-[var(--primary-mint)] hover:underline">
              divisionAI
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

