import Image from 'next/image';
import { Briefcase, BrainCircuit, Cuboid, ArrowUpRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Ventures',
  description: 'Portfolio of ventures including division5, divisionAI, and division3D. Building scalable service-based businesses, AI solutions, and immersive 3D experiences from Tirana, Albania.',
  path: '/ventures',
  keywords: [
    'division5',
    'divisionAI',
    'division3D',
    'Software Services',
    'AI Solutions',
    '3D Design',
    'Staff Augmentation',
    'Digital Agencies',
    'Web3D',
    'Tech Ventures',
  ],
});

export default function Ventures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
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
                <span className="page-label">Ventures</span>
                <h2 className="text-5xl text-white mt-1">WHAT I BUILD</h2>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-gray-300 font-light text-sm leading-7 mb-8">
              <p className="mb-6">
                I specialize in scaling next-generation digital agencies. Through division5, divisionAI, and division3D, I deliver software services, AI solutions, and 3D design experiences.
              </p>
              <p className="mb-6">
                From assembling elite software engineering teams and deploying AI-driven workflows to pushing the boundaries of the immersive web (Web3D), I turn technical expertise into scalable business models. These tech ventures represent my approach to building digital agencies that combine staff augmentation, artificial intelligence, and creative 3D experiences. Explore my current ventures:
              </p>
            </div>

            {/* Personal Image Injection */}
            <div className="mb-10 w-full h-64 rounded-sm overflow-hidden border border-[var(--border-color)] relative group">
              <Image 
                src="/IMG_7944.jpeg" 
                alt="Working" 
                fill
                className="object-cover img-classic opacity-60 group-hover:opacity-80"
              />
              <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-[var(--rich-black)] to-transparent w-full">
                <p className="text-[10px] text-[var(--primary-mint)] font-bold uppercase tracking-widest mb-1">On Location</p>
                <p className="text-xl text-white font-bebas">Building scalable solutions from Tirana.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venture 1: Division5 */}
              <a href="https://division5.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-[var(--primary-mint)] transition-all">
                <Image 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                  alt="Division5 - Staff Augmentation" 
                  fill
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-[var(--rich-black)]">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--primary-mint)] uppercase tracking-widest border border-[var(--primary-mint)] px-2 py-1">Services</span>
                  </div>
                  <h3 className="text-4xl text-white font-bebas mb-2">DIVISION 5</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-white/20 pl-3">Building scalable service-based businesses.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[9px] uppercase font-bold tracking-widest">Visit Site</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Venture 2: DivisionAI */}
              <a href="https://divisionai.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-white transition-all">
                <Image 
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80" 
                  alt="DivisionAI - AI Coding" 
                  fill
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-[var(--rich-black)]">
                      <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-600 px-2 py-1 group-hover:text-white transition-colors">Technology</span>
                  </div>
                  <h3 className="text-4xl text-white font-bebas mb-2">DIVISION AI</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-white/20 pl-3">Artificial Intelligence solutions.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[9px] uppercase font-bold tracking-widest">Visit Site</p>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Venture 3: Division3D */}
              <a href="https://division3d.co" target="_blank" rel="noopener noreferrer" className="group relative h-[300px] border border-[var(--border-color)] overflow-hidden hover:border-white transition-all md:col-span-2">
                <Image 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
                  alt="Division3D - 3D Design" 
                  fill
                  className="object-cover img-classic opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--rich-black)] via-[var(--rich-black)]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 h-full flex flex-col justify-end p-8">
                  <div className="flex justify-between items-end mb-4">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center bg-[var(--rich-black)]">
                      <Cuboid className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-600 px-2 py-1 group-hover:text-white transition-colors">Creative</span>
                  </div>
                  <h3 className="text-4xl text-white font-bebas mb-2">DIVISION 3D</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light border-l border-white/20 pl-3">Immersive 3D experiences and design.</p>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Role</p>
                      <p className="text-xs text-white">Founder</p>
                    </div>
                    <div className="flex items-center gap-1 group-hover:text-[var(--primary-mint)] transition-colors">
                      <p className="text-[9px] uppercase font-bold tracking-widest">Visit Site</p>
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

