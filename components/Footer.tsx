import Link from 'next/link';
import { Twitter, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-l border-r border-b border-[#1a3a4a] bg-[#02141d] py-10 px-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-[1600px] mx-auto">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/Engjell_Rraklli_White_Logo_Mark.svg" 
              alt="ER Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-xl text-white font-bebas tracking-widest">ENGJELL RRAKLLI</span>
          </div>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            Building scalable tech and human potential in Tirana. Creative at heart, resilient by practice. Valuing discipline, persistence, kindness, and patience above all.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] text-white font-bold uppercase tracking-widest mb-4">Navigation</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><Link href="/" className="hover:text-[var(--primary-mint)] transition-colors">Overview</Link></li>
            <li><Link href="/media" className="hover:text-[var(--primary-mint)] transition-colors">Podcast</Link></li>
            <li><Link href="/journal" className="hover:text-[var(--primary-mint)] transition-colors">Journal</Link></li>
            <li><Link href="/ventures" className="hover:text-[var(--primary-mint)] transition-colors">Ventures</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] text-white font-bold uppercase tracking-widest mb-4">My Ventures</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><a href="https://division5.co" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-mint)] transition-colors">Division5</a></li>
            <li><a href="https://divisionai.co" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-mint)] transition-colors">DivisionAI</a></li>
            <li><a href="https://division3d.co" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary-mint)] transition-colors">Division3D</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] text-white font-bold uppercase tracking-widest mb-4">Connect</h4>
          <div className="flex gap-4">
            <a href="https://x.com/RraklliEngjell" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/engjell-rraklli-a8b20a68/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="https://www.youtube.com/@engjellrraklli" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
          <p className="text-[10px] text-gray-600 mt-6">&copy; 2025 Engjell Rraklli. All rights reserved.</p>
          <p className="text-[10px] text-gray-600 mt-2">
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

