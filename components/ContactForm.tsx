'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const TOPICS = ['Constraint sprint', 'Speaking', 'Consulting', 'Partnership', 'Other'] as const;

// The sprint page preselects its own topic so those enquiries arrive tagged
// rather than as generic consulting, which is the difference between a lead
// you can price and one you have to interrogate first.
type Topic = (typeof TOPICS)[number];

export default function ContactForm({ defaultTopic }: { defaultTopic?: Topic } = {}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: defaultTopic ?? '',
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
      <div className="panel-inset flex flex-col items-center gap-4 p-8 text-center md:p-10">
        <CheckCircle2 className="h-10 w-10 text-[var(--accent-text)]" aria-hidden="true" />
        <h3 className="text-[36px] leading-none tracking-[0.03em]">Message sent</h3>
        <p className="max-w-xs text-sm text-[var(--text)]">
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
    <div className="panel-inset flex flex-col p-7 md:p-10">
      
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
            className="w-full field p-3 text-sm font-montserrat disabled:opacity-50"
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
            className="w-full field p-3 text-sm font-montserrat disabled:opacity-50"
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
            className="w-full field p-3 text-sm font-montserrat disabled:opacity-50"
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
            className="w-full field p-3 text-sm resize-none font-montserrat disabled:opacity-50"
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
          <p role="alert" className="text-sm text-[var(--secondary-orange)]">
            {message}
          </p>
        )}
        <button 
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {loading ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}

