'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          formStartTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          message: '',
          website: '',
        });
      } else {
        setMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 border border-[var(--border-color)] bg-[var(--rich-black)] relative flex flex-col">
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--primary-mint)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--primary-mint)]"></div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Name</label>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Message</label>
          <textarea 
            rows={4} 
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
          ></textarea>
        </div>
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
          <p className={`text-xs ${message.includes('successfully') ? 'text-[var(--primary-mint)]' : 'text-red-400'}`}>
            {message}
          </p>
        )}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-white hover:bg-[var(--primary-mint)] text-black font-bold py-4 transition-all tracking-[0.15em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

