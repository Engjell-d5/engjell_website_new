'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Clock, Calendar, Trash2 } from 'lucide-react';

interface Config {
  cronSchedule: string;
  lastVideoFetch: string | null;
}

export default function YouTubePage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/youtube/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleFetchVideos = async () => {
    setFetching(true);
    setMessage('');
    try {
      const response = await fetch('/api/youtube/fetch', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        if (data.count > 0) {
          setMessage(`✅ Successfully fetched ${data.count} videos!`);
        } else {
          setMessage(`⚠️ ${data.message || 'No videos found. Check server console for details.'}`);
        }
        fetchConfig();
      } else {
        const errorMsg = data.error || 'Failed to fetch videos';
        const details = data.details ? `\n\nDetails: ${data.details}` : '';
        setMessage(`❌ ${errorMsg}${details}`);
      }
    } catch (error: any) {
      setMessage(`❌ An error occurred: ${error.message || 'Unknown error'}`);
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    const cronSchedule = formData.get('cronSchedule') as string;

    try {
      const response = await fetch('/api/youtube/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cronSchedule }),
      });

      if (response.ok) {
        setMessage('Schedule updated successfully!');
        fetchConfig();
      } else {
        setMessage('Failed to update schedule');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearVideos = async () => {
    if (!confirm('Are you sure you want to clear all fetched videos? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    setMessage('');
    try {
      const response = await fetch('/api/youtube/videos', { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ All videos cleared successfully!');
        fetchConfig();
      } else {
        setMessage(`❌ ${data.error || 'Failed to clear videos'}`);
      }
    } catch (error: any) {
      setMessage(`❌ An error occurred: ${error.message || 'Unknown error'}`);
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h1 className="text-4xl text-white font-bebas mb-8">YOUTUBE MANAGEMENT</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="classic-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-[var(--primary-mint)]" />
            <h2 className="text-xl text-white font-bebas">Cron Schedule</h2>
          </div>
          {config && (
            <p className="text-sm text-gray-400 mb-4">
              Current: <span className="text-white font-mono">{config.cronSchedule}</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mb-4">
            Format: minute hour day month day-of-week<br />
            Example: "0 2 * * *" = Daily at 2 AM
          </p>
          <form onSubmit={handleUpdateSchedule} className="space-y-4">
            <input
              type="text"
              name="cronSchedule"
              defaultValue={config?.cronSchedule || '0 2 * * *'}
              placeholder="0 2 * * *"
              className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-mono"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary-mint)] text-black hover:bg-white font-bold py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Schedule'}
            </button>
          </form>
        </div>

        <div className="classic-panel p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-[var(--secondary-orange)]" />
            <h2 className="text-xl text-white font-bebas">Last Fetch</h2>
          </div>
          <p className="text-sm text-gray-400">
            {config ? formatDate(config.lastVideoFetch) : 'Loading...'}
          </p>
          <button
            onClick={handleFetchVideos}
            disabled={fetching}
            className="mt-6 w-full bg-white hover:bg-[var(--primary-mint)] text-black font-bold py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Fetching Videos...' : 'Fetch Videos Now'}
          </button>
          <button
            onClick={handleClearVideos}
            disabled={clearing}
            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Trash2 className={`w-4 h-4 ${clearing ? 'animate-spin' : ''}`} />
            {clearing ? 'Clearing...' : 'Clear All Videos'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`classic-panel p-4 mb-6 ${
          message.includes('Success') || message.includes('updated')
            ? 'bg-green-900/20 border-green-500 text-green-400'
            : 'bg-red-900/20 border-red-500 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="classic-panel p-6">
        <h2 className="text-xl text-white font-bebas mb-4">Cron Schedule Examples</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span className="font-mono">0 2 * * *</span>
            <span>Daily at 2 AM</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono">0 */6 * * *</span>
            <span>Every 6 hours</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono">0 0 * * 0</span>
            <span>Weekly on Sunday at midnight</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono">0 0 1 * *</span>
            <span>Monthly on the 1st at midnight</span>
          </div>
        </div>
      </div>
    </div>
  );
}

