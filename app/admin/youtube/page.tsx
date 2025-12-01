'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Clock, Calendar, Trash2, Star, StarOff, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface Config {
  cronSchedule: string;
  lastVideoFetch: string | null;
}

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  channelTitle: string;
  fetchedAt: string;
  featured?: boolean;
  removed?: boolean;
}

export default function YouTubePage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [showRemoved, setShowRemoved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
    fetchVideos();
  }, [showRemoved]);

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

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const response = await fetch(`/api/youtube/videos?includeRemoved=${showRemoved}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingVideos(false);
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
        fetchVideos();
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
        fetchVideos();
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

  const formatVideoDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (duration: string) => {
    // Parse ISO 8601 duration (PT4M13S -> 4:13)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoAction = async (videoId: string, action: 'setFeatured' | 'unsetFeatured' | 'remove' | 'restore') => {
    try {
      const response = await fetch('/api/youtube/videos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, action }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${data.message || 'Action completed successfully'}`);
        fetchVideos();
      } else {
        setMessage(`❌ ${data.error || 'Failed to perform action'}`);
      }
    } catch (error: any) {
      setMessage(`❌ An error occurred: ${error.message || 'Unknown error'}`);
    }
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

      <div className="classic-panel p-6 mb-8">
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

      <div className="classic-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-white font-bebas">VIDEOS</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRemoved(!showRemoved)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              {showRemoved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showRemoved ? 'Hide Removed' : 'Show Removed'}
            </button>
            <button
              onClick={fetchVideos}
              disabled={loadingVideos}
              className="text-sm bg-[var(--primary-mint)] text-black hover:bg-white font-bold px-4 py-2 uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingVideos ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loadingVideos ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-400">Loading videos...</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No videos found. Fetch videos to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`border border-[var(--border-color)] p-4 ${
                  video.featured ? 'bg-[var(--primary-mint)]/10 border-[var(--primary-mint)]' : ''
                } ${video.removed ? 'opacity-50' : ''}`}
              >
                <div className="flex gap-4">
                  <div className="relative w-32 h-20 flex-shrink-0 bg-black border border-[var(--border-color)]">
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                    {video.featured && (
                      <div className="absolute top-1 left-1 bg-[var(--primary-mint)] text-black px-2 py-0.5 text-xs font-bold">
                        FEATURED
                      </div>
                    )}
                    {video.removed && (
                      <div className="absolute top-1 right-1 bg-red-600 text-white px-2 py-0.5 text-xs font-bold">
                        REMOVED
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {formatDuration(video.duration)} • {formatVideoDate(video.publishedAt)} • {parseInt(video.viewCount).toLocaleString()} views
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {!video.removed ? (
                        <>
                          {video.featured ? (
                            <button
                              onClick={() => handleVideoAction(video.videoId, 'unsetFeatured')}
                              className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-3 py-1.5 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                            >
                              <StarOff className="w-3 h-3" />
                              Unfeature
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVideoAction(video.videoId, 'setFeatured')}
                              className="text-xs bg-[var(--primary-mint)] hover:bg-white text-black font-bold px-3 py-1.5 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                            >
                              <Star className="w-3 h-3" />
                              Set Featured
                            </button>
                          )}
                          <button
                            onClick={() => handleVideoAction(video.videoId, 'remove')}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleVideoAction(video.videoId, 'restore')}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3 h-3" />
                          Restore
                        </button>
                      )}
                      <a
                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-[var(--primary-mint)] transition-colors"
                      >
                        View on YouTube →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

