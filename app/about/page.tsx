import { Heart, Mountain, ShieldCheck, Hourglass } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'About',
  description: 'My work is grounded in the conviction that Tirana is fertile ground for world-class technology. Building the infrastructure that allows young Albanian talents to apply their skills at a global level without leaving their homes.',
  path: '/about',
  keywords: [
    'About Engjell Rraklli',
    'Tech Entrepreneur Story',
    'Albanian Entrepreneur',
    'Tirana Technology',
    'Software Development',
    'Startup Founder',
    'Tech Leadership',
    'Albania Tech Ecosystem',
  ],
});

export default function About() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">About</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            THERE IS NO SHORTCUT TO HARD WORK.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <span className="page-label mb-3 block">My Story</span>
                <h2 className="text-5xl md:text-6xl text-white font-bebas mb-6">THE JOURNEY</h2>
                <p className="text-sm text-gray-400 mt-2 font-light">11 YEARS OF BUILDING</p>
                <div className="h-[1px] w-24 bg-gray-600 mx-auto mt-4"></div>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 font-light text-sm leading-7">
                <p className="mb-6 first-letter:text-4xl first-letter:font-bold first-letter:text-white first-letter:mr-1 first-letter:float-left">
                  My work is grounded in the conviction that Tirana is fertile ground for world-class technology. Ten years ago, I stepped away from traditional education to build my own path. As a creative at heart, I fell in love with the act of building—whether it was software development or companies. I failed more times than I succeeded, but those experiences shaped me into the tech entrepreneur and startup founder I am today.
                </p>
                <p className="mb-6">
                  Now, as the founder of division5, I apply those learnings to deliver global-standard software services. But my true focus isn't just scaling a business; it is scaling human potential. I am building the infrastructure that allows young Albanian talents to apply their skills at a global level without leaving their homes—proving that the best way to predict our country's future is to empower the youth who will build it. This is my story as an Albanian entrepreneur contributing to the Albania tech ecosystem.
                </p>
              </div>

              {/* Core Values Grid */}
              <div className="mt-8">
                <h3 className="text-2xl text-white font-bebas mb-6 tracking-wide">THE PILLARS OF MY WORK</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-white" />
                      <h4 className="text-lg text-white font-bebas tracking-wide">Kindness</h4>
                    </div>
                    <p className="text-xs text-gray-400">Business is ultimately about people. Treating every stakeholder with genuine respect and empathy is non-negotiable.</p>
                  </div>
                  <div className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                      <Mountain className="w-5 h-5 text-white" />
                      <h4 className="text-lg text-white font-bebas tracking-wide">Persistence</h4>
                    </div>
                    <p className="text-xs text-gray-400">The path is never straight. Success belongs to those who show up every day, regardless of the obstacles.</p>
                  </div>
                  <div className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <h4 className="text-lg text-white font-bebas tracking-wide">Discipline</h4>
                    </div>
                    <p className="text-xs text-gray-400">Motivation gets you started; discipline keeps you going. It is the bridge between goals and accomplishment.</p>
                  </div>
                  <div className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                      <Hourglass className="w-5 h-5 text-white" />
                      <h4 className="text-lg text-white font-bebas tracking-wide">Patience</h4>
                    </div>
                    <p className="text-xs text-gray-400">Real value takes time to build. We play the long game, focusing on sustainable growth over quick wins.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

