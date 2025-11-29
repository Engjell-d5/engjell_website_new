'use client';

import { useState } from 'react';

export default function SubscribeFormInline() {
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
    <div className="blog-subscribe-snippet-inline my-8 flex justify-center">
      <div>
        <form onSubmit={handleSubmit} className="flex items-center">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black border border-[var(--border-color)] border-r-0 p-2 text-xs text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors h-10 font-montserrat" 
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
            className="h-10 px-6 bg-white text-black hover:bg-[var(--primary-mint)] text-[10px] font-bold uppercase transition-colors disabled:opacity-50 whitespace-nowrap border border-[var(--border-color)] border-l-0"
          >
            {loading ? 'Subscribing...' : 'Join'}
          </button>
        </form>
        {message && (
          <p className={`text-[10px] mt-2 text-center ${message.includes('Success') ? 'text-[var(--primary-mint)]' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
