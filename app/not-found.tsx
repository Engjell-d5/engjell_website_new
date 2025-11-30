import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function NotFound() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <main id="main-content" className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">404</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            NOT ALL WHO WANDER ARE LOST.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10 md:p-16 lg:p-20">
          <div className="animate-slide-up text-center max-w-2xl mx-auto">
            <h1 className="text-8xl md:text-9xl text-white font-bebas mb-6">404</h1>
            <h2 className="text-3xl md:text-4xl text-white font-bebas mb-4 tracking-wide">
              PAGE NOT FOUND
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed font-light">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="bg-white text-black hover:bg-[var(--primary-mint)] px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2"
              >
                Go Home
              </Link>
              <Link 
                href="/journal" 
                className="border border-[var(--border-color)] text-white hover:border-[var(--primary-mint)] hover:text-[var(--primary-mint)] px-8 py-3 text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2"
              >
                Browse Journal
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
