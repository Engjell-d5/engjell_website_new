'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formStartTime] = useState(Date.now()); // Track when form was loaded

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, formStartTime }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully subscribed!');
        setEmail('');
        setWebsite('');
      } else {
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-subscribe-snippet my-8">
      <div className="bg-[var(--rich-black)] border border-[var(--border-color)] p-6">
        <h4 className="text-xl text-white font-bebas tracking-wide mb-3">SUBSCRIBE</h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4 font-light">Get my weekly tech trends.</p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-[var(--border-color)] p-2 text-xs text-white mb-2 focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat" 
            required
            disabled={loading}
          />
          {/* Honeypot field */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{ position: 'absolute', left: '-9999px' }}
            aria-hidden="true"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-[10px] font-bold uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {loading ? 'Subscribing...' : 'Join'}
          </button>
          {message && (
            <p className={`text-[10px] mt-2 ${message.includes('Success') ? 'text-[var(--primary-mint)]' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

