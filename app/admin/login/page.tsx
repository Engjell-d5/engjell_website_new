'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4">
      <div className="classic-panel w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 border border-[var(--primary-mint)] flex items-center justify-center">
            <Lock className="w-8 h-8 text-[var(--primary-mint)]" />
          </div>
        </div>
        <h1 className="text-4xl text-white font-bebas text-center mb-2">ADMIN LOGIN</h1>
        <p className="text-sm text-gray-400 text-center mb-8">Enter your credentials to access the admin panel</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
              required
            />
          </div>
          <div>
            <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-[var(--primary-mint)] text-black font-bold py-4 transition-all tracking-[0.15em] uppercase text-xs disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

