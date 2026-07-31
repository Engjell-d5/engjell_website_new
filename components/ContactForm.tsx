'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const TOPICS = ['Speaking', 'Consulting', 'Partnership', 'Other'] as const;

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: '',
    message: '',
    website: '', // Honeypot field
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [formStartTime] = useState(Date.now()); // Track when form was loaded

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
          name: formData.name,
          email: formData.email,
          // The API stores name/email/message; carry the topic in the message
          // body so it reaches the inbox without a schema change.
          message: formData.topic
            ? `Topic: ${formData.topic}\n\n${formData.message}`
            : formData.message,
          website: formData.website,
          formStartTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSent(true);
      } else {
        setMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setMessage('Something went wrong on our side. Please try again, or email info@engjellrraklli.com directly.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="p-10 border border-[var(--border-color)] bg-[var(--rich-black)] relative flex flex-col items-center text-center gap-4">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--primary-mint)]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--primary-mint)]"></div>
        <CheckCircle2 className="w-10 h-10 text-[var(--primary-mint)]" />
        <h3 className="text-2xl text-white font-bebas tracking-wide">MESSAGE SENT</h3>
        <p className="text-sm text-[var(--text-muted)] font-light max-w-xs">
          Thank you for reaching out. I read every message and usually reply within two business days.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setFormData({ name: '', email: '', topic: '', message: '', website: '' });
          }}
          className="btn btn-tertiary"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 border border-[var(--border-color)] bg-[var(--rich-black)] relative flex flex-col">
      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--primary-mint)]"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--primary-mint)]"></div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="contact-name" className="form-label">Name</label>
          <input
            id="contact-name"
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
          <label htmlFor="contact-email" className="form-label">Email</label>
          <input
            id="contact-email"
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
          <label htmlFor="contact-topic" className="form-label">What's this about?</label>
          <select
            id="contact-topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50"
          >
            <option value="" disabled>Select a topic</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="contact-message" className="form-label">Message</label>
          <textarea
            id="contact-message"
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
        {/* Only ever an error: the success path swaps the whole form for the
            confirmation panel above, so this used to carry a dead
            "successfully" branch that could never render. */}
        {message && (
          <p role="alert" className="text-xs text-red-400">
            {message}
          </p>
        )}
        <button 
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

