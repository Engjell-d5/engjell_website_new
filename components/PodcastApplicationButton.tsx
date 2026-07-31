'use client';

import { useState } from 'react';
import { Mic, X } from 'lucide-react';
import PodcastApplicationForm from '@/components/PodcastApplicationForm';

export default function PodcastApplicationButton() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowApplicationModal(true)}
        className="btn btn-primary w-full"
      >
        <Mic className="w-4 h-4 flex-shrink-0" />
        Apply to Podcast
      </button>

      {/* Podcast Application Modal */}
      {showApplicationModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-[99999] flex items-start justify-center overflow-y-auto p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowApplicationModal(false);
            }
          }}
        >
          <div className="classic-panel bg-[var(--rich-black)] w-full max-w-2xl my-8 relative">
            <button
              onClick={() => setShowApplicationModal(false)}
              className="absolute top-4 right-4 text-[var(--text-meta)] hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <PodcastApplicationForm onSuccess={() => setShowApplicationModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

