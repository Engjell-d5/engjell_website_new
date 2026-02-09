import Image from 'next/image';
import { Contact as ContactIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ContactForm from '@/components/ContactForm';
import { createMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createMetadata({
  title: 'Contact Engjell Rraklli | Speaking, Consulting, Partnerships',
  description: 'Contact Engjell Rraklli for speaking engagements, technical consultation, and business partnership opportunities. Available for tech consulting and entrepreneurship advice in Albania and the Balkans.',
  path: '/contact',
  keywords: [
    'Contact Engjell Rraklli',
    'Tech Consulting Albania',
    'Speaking Engagements Albania',
    'Business Partnership Albania',
    'Entrepreneurship Advice Albania',
    'Technical Consultation Albania',
    'Startup Consulting Albania',
  ],
});

export default function Contact() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[var(--text-silver)] font-medium uppercase tracking-widest font-montserrat text-[11px]">Contact</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            WISH FOR OTHERS WHAT YOU WISH FOR YOURSELF.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="flex flex-col">
                <span className="page-label mb-3 block">Contact</span>
                <h1 className="text-5xl md:text-6xl text-white font-bebas mb-6">LET'S TALK</h1>
                <p className="text-sm text-[var(--primary-mint)] font-bold uppercase tracking-widest mb-6">Speaker, Builder, Consultant</p>
                
                <div className="prose prose-invert max-w-none text-gray-300 font-light text-sm leading-7">
                  <p className="mb-6">
                    Open for speaking engagements, technical consultation, and business partnership opportunities. I am passionate about the entrepreneurial potential of Albania and the Balkans, and I'm here to provide tech consulting and entrepreneurship advice.
                  </p>
                  
                  <p className="mb-6">
                    I work at the intersection of strategy and implementation. Whether I am consulting on technical architecture or advising on market entry for Albania business opportunities, my goal is to build resilient, scalable ventures. I am eager to connect with fellow builders who see the potential in this market through startup consulting.
                  </p>
                  
                  <p className="mb-6">
                    Whether you have a question about the nuances of building in Albania or want to discuss a potential venture, I'm all ears. Contact me for speaking engagements, technical consultation, or partnership discussions.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {/* Personal Image - Above the form */}
                <div className="w-full h-64 rounded-none overflow-hidden border border-[var(--border-color)] relative group">
                  <Image 
                    src="/IMG_0456 (1).JPG" 
                    alt="Engjell Rraklli smiling portrait - Available for speaking and consulting" 
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover img-classic opacity-80 group-hover:opacity-100"
                  />
                </div>
                
                <ContactForm />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}
