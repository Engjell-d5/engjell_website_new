import Image from 'next/image';
import { Briefcase, BrainCircuit, Cuboid, ArrowUpRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Tech Ventures Albania | division5, divisionAI, division3D',
  description: 'Engjell Rraklli\'s tech ventures in Albania: division5 (software services), divisionAI (AI solutions), and division3D (3D design). Building scalable tech businesses from Tirana.',
  path: '/ventures',
  keywords: [
    'Tech Ventures Albania',
    'division5 Albania',
    'divisionAI Albania',
    'division3D Albania',
    'Software Services Albania',
    'AI Solutions Albania',
    '3D Design Albania',
    'Staff Augmentation Albania',
    'Tech Startups Tirana',
    'Albanian Tech Companies',
  ],
});

export default function Ventures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh] order-2 md:order-1">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Ventures</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
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
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                  alt="Division5 - Staff Augmentation" 
                  fill
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-[var(--border-color)]/50 flex items-center justify-center bg-[var(--rich-black)]">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-4xl text-white font-bebas mb-2">DIVISION 5</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-[var(--border-color)]/50 pl-3">Building scalable service-based businesses.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)]/30 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[9px] uppercase font-bold tracking-widest">Visit Division5</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Venture 2: DivisionAI */}
              <a href="https://divisionai.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-mint)] transition-all">
                <Image 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80" 
                  alt="DivisionAI - AI Coding" 
                  fill
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-[var(--border-color)]/50 flex items-center justify-center bg-[var(--rich-black)]">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-4xl text-white font-bebas mb-2">DIVISION AI</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-[var(--border-color)]/50 pl-3">Artificial Intelligence solutions.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)]/30 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[9px] uppercase font-bold tracking-widest">Visit DivisionAI</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Venture 3: Division3D */}
              <a href="https://division3d.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-mint)] transition-all">
                <Image 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
                  alt="Division3D - 3D Design" 
                  fill
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-[var(--border-color)]/50 flex items-center justify-center bg-[var(--rich-black)]">
                      <Cuboid className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-4xl text-white font-bebas mb-2">DIVISION 3D</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-[var(--border-color)]/50 pl-3">Immersive 3D experiences and design.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)]/30 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[9px] uppercase font-bold tracking-widest">Visit Division3D</p>
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

