'use client';

import { useState } from 'react';
import { Mic, Send } from 'lucide-react';

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          {/* Matches every other label in this form; it was the only one at a
              different size, and the only one with an asterisk even though all
              eight fields are required. */}
          <label htmlFor="about" className="form-label">
            Tell me about yourself
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            required
            rows={4}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="businesses" className="form-label">
            Your businesses
          </label>
          <textarea
            id="businesses"
            name="businesses"
            value={formData.businesses}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="industry" className="form-label">
            Industry
          </label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            required
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="vision" className="form-label">
            Your vision
          </label>
          <textarea
            id="vision"
            name="vision"
            value={formData.vision}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="biggestChallenge" className="form-label">
            Your biggest challenge
          </label>
          <textarea
            id="biggestChallenge"
            name="biggestChallenge"
            value={formData.biggestChallenge}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="whyPodcast" className="form-label">
            Why do you want to be on the podcast?
          </label>
          <textarea
            id="whyPodcast"
            name="whyPodcast"
            value={formData.whyPodcast}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          <Send className="w-4 h-4" />
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
          <p
            role="status"
            className={`text-sm mt-2 ${message.includes('success') ? 'text-[var(--primary-mint)]' : 'text-red-400'}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

