'use client';

import { useState } from 'react';
import { Mic } from 'lucide-react';

interface PodcastApplicationFormProps {
  onSuccess?: () => void;
}

export default function PodcastApplicationForm({ onSuccess }: PodcastApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    about: '',
    businesses: '',
    industry: '',
    vision: '',
    biggestChallenge: '',
    whyPodcast: '',
    website: '', // Honeypot field
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formStartTime] = useState(Date.now()); // Track when form was loaded

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/podcast/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formStartTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Application submitted successfully!');
        setFormData({
          name: '',
          email: '',
          about: '',
          businesses: '',
          industry: '',
          vision: '',
          biggestChallenge: '',
          whyPodcast: '',
          website: '',
        });
        // Close modal after a short delay
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setMessage(data.error || 'Failed to submit application');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
        <Mic className="w-5 h-5 text-[var(--primary-mint)]" />
        <h2 className="text-xl text-white font-bebas tracking-wide">Apply to Podcast</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="about" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Tell me about yourself *
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            required
            rows={4}
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="businesses" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Your businesses *
          </label>
          <textarea
            id="businesses"
            name="businesses"
            value={formData.businesses}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Industry *
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="vision" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Your vision *
          </label>
          <textarea
            id="vision"
            name="vision"
            value={formData.vision}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="biggestChallenge" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Your biggest challenge *
          </label>
          <textarea
            id="biggestChallenge"
            name="biggestChallenge"
            value={formData.biggestChallenge}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="whyPodcast" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Why do you want to be on the podcast? *
          </label>
          <textarea
            id="whyPodcast"
            name="whyPodcast"
            value={formData.whyPodcast}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black hover:bg-[var(--primary-mint)] text-sm font-bold uppercase transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        {/* Honeypot field - hidden from users but visible to bots */}
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
          style={{ position: 'absolute', left: '-9999px' }}
          aria-hidden="true"
        />
        {message && (
          <p className={`text-sm mt-2 ${message.includes('success') ? 'text-[var(--primary-mint)]' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

