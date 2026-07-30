import Image from 'next/image';
import { Briefcase, BrainCircuit, Cuboid, ArrowUpRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StructuredData, { Breadcrumbs } from '@/components/StructuredData';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

const VENTURES = [
  {
    name: 'division5',
    url: 'https://division5.co',
    description: 'Software development services and staff augmentation.',
  },
  {
    name: 'divisionAI',
    url: 'https://divisionai.co',
    description: 'Artificial intelligence solutions and AI-powered products.',
  },
  {
    name: 'division3D',
    url: 'https://division3d.co',
    description: 'Immersive 3D experiences and design.',
  },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
const FOUNDER = {
  '@type': 'Person',
  '@id': `${siteUrl}/#person`,
  name: 'Engjell Rraklli',
  url: siteUrl,
} as const;

export const metadata: Metadata = createMetadata({
  title: 'division5, divisionAI & division3D',
  description: 'Engjell Rraklli\'s tech ventures in Albania: division5 (software services), divisionAI (AI solutions), and division3D (3D design). Building scalable tech businesses from Tirana.',
  path: '/ventures',
});

export default function Ventures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <Breadcrumbs items={[{ name: 'Home', url: '/' }, { name: 'Ventures', url: '/ventures' }]} />
      {VENTURES.map((v) => (
        <StructuredData
          key={v.name}
          type="Organization"
          data={{
            name: v.name,
            url: v.url,
            description: v.description,
            founder: FOUNDER,
          }}
        />
      ))}
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Ventures</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-400 font-bold tracking-[0.15em] hidden md:block">
            YOU DON'T FAIL IF YOU NEVER GIVE UP.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="flex items-end justify-between mb-8 border-b border-[var(--border-color)] pb-4">
              <div>
                <span className="page-label mb-3 block">Ventures</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas">WHAT I BUILD</h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venture 1: Division5 - Main/First */}
              <a href="https://division5.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-mint)] transition-all md:col-span-2">
                <Image
                  src="/ventures-division5.jpg"
                  alt="division5 — software development services and staff augmentation"
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-[var(--border-color)]/50 flex items-center justify-center bg-[var(--rich-black)]">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-4xl text-white font-bebas mb-2">division5</h2>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-[var(--border-color)]/50 pl-3">Software development services and staff augmentation.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)]/30 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest">Visit Division5</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Venture 2: DivisionAI */}
              <a href="https://divisionai.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-mint)] transition-all">
                <Image
                  src="/ventures-divisionai.jpg"
                  alt="divisionAI — artificial intelligence solutions"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-[var(--border-color)]/50 flex items-center justify-center bg-[var(--rich-black)]">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-4xl text-white font-bebas mb-2">divisionAI</h2>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-[var(--border-color)]/50 pl-3">Artificial Intelligence solutions.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)]/30 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest">Visit DivisionAI</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Venture 3: Division3D */}
              <a href="https://division3d.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-mint)] transition-all">
                <Image
                  src="/ventures-division3d.jpg"
                  alt="division3D — immersive 3D experiences and design"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-[var(--border-color)]/50 flex items-center justify-center bg-[var(--rich-black)]">
                      <Cuboid className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-4xl text-white font-bebas mb-2">division3D</h2>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-[var(--border-color)]/50 pl-3">Immersive 3D experiences and design.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)]/30 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[10px] uppercase font-bold tracking-widest">Visit Division3D</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

