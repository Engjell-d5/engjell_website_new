'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Contact as ContactIcon, Mail, MapPin, Clock, Linkedin, Twitter } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function Contact() {
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--bg-dark)] min-h-[80vh]">
        {/* Breadcrumbs / Top Bar */}
        <div className="h-14 border-b border-[#1a3a4a] flex items-center justify-between px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-white font-medium uppercase tracking-widest font-montserrat text-[11px]">Inquiries</span>
          </div>
          <div className="font-montserrat text-[10px] text-gray-500 font-bold tracking-[0.15em] hidden md:block">
            WISH FOR OTHERS WHAT YOU WISH FOR YOURSELF.
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          <section className="animate-slide-up h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-white font-bold uppercase tracking-[0.2em] mb-2 block">Connect</span>
                <h2 className="text-5xl text-white font-bebas mb-6">LET'S TALK</h2>
                <p className="text-sm text-gray-400 mb-8 font-light leading-relaxed">
                  Open for speaking engagements, technical consultation, and partnership opportunities. Whether you have a question about building in Albania or want to discuss a potential venture, I'm all ears.
                </p>
                
                {/* Personal Image Injection */}
                <div className="w-full h-64 rounded-sm overflow-hidden border border-[#1a3a4a] relative group mb-6">
                  <Image 
                    src="/IMG_0456 (1).JPG" 
                    alt="Smiling Portrait" 
                    fill
                    className="object-cover img-classic opacity-80 group-hover:opacity-100"
                  />
                </div>
              </div>
              <div className="p-10 border border-[#1a3a4a] bg-[var(--rich-black)] relative flex flex-col justify-center">
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--primary-mint)]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--primary-mint)]"></div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full bg-[var(--rich-black)] border border-[#1a3a4a] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full bg-[var(--rich-black)] border border-[#1a3a4a] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat disabled:opacity-50" 
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
                      className="w-full bg-[var(--rich-black)] border border-[#1a3a4a] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat disabled:opacity-50"
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
                    className="w-full bg-white hover:bg-[var(--primary-mint)] text-black font-bold py-4 transition-all tracking-[0.15em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Sidebar />
    </div>
  );
}

