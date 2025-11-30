'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, Eye, EyeOff, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalUsers: 0,
  });
  const [cronStatus, setCronStatus] = useState<{
    youtube: { 
      initialized: boolean; 
      running: boolean;
      nextRun?: string | null;
      schedule?: string;
    };
    socialMedia: { 
      initialized: boolean; 
      running: boolean;
      nextRun?: string | null;
      schedule?: string;
    };
  } | null>(null);
  const [initializingCron, setInitializingCron] = useState(false);

  useEffect(() => {
    fetchStats();
    // Status endpoint will auto-initialize if needed
    fetchCronStatus();
    
    // Also explicitly initialize to ensure they start
    fetch('/api/cron/init').catch(console.error);
    
    // Refresh status periodically (every 30 seconds)
    const statusInterval = setInterval(() => {
      fetchCronStatus();
    }, 30000);
    
    // Update next run times every minute for live countdown
    const timeUpdateInterval = setInterval(() => {
      if (cronStatus) {
        // Force re-render to update relative time display
        setCronStatus({ ...cronStatus });
      }
    }, 60000);
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(timeUpdateInterval);
    };
  }, []);

  const fetchCronStatus = async () => {
    try {
      // The status endpoint will auto-initialize if needed
      const response = await fetch('/api/cron/status');
      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.cronJobs);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    }
  };

  const initializeCronJobs = async () => {
    setInitializingCron(true);
    try {
      const response = await fetch('/api/cron/init');
      if (response.ok) {
        // Wait a bit then refresh status
        setTimeout(() => {
          fetchCronStatus();
          setInitializingCron(false);
        }, 500);
      } else {
        setInitializingCron(false);
      }
    } catch (error) {
      console.error('Error initializing cron jobs:', error);
      setInitializingCron(false);
    }
  };

  const formatNextRunTime = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';
    try {
      const nextRun = new Date(isoString);
      const now = new Date();
      const diffMs = nextRun.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return 'Very soon';
      } else if (diffMins < 60) {
        return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      } else if (diffHours < 24) {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (mins === 0) {
          return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        return `in ${hours}h ${mins}m`;
      } else if (diffDays < 7) {
        return `in ${diffDays} day${diffDays !== 1 ? 's' : ''} at ${nextRun.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
      } else {
        return nextRun.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    } catch {
      return 'Invalid date';
    }
  };

  const fetchStats = async () => {
    try {
      const [blogsRes, usersRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/users'),
      ]);

      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        const blogs = blogsData.blogs || [];
        setStats(prev => ({
          ...prev,
          totalBlogs: blogs.length,
          publishedBlogs: blogs.filter((b: any) => b.published).length,
          draftBlogs: blogs.filter((b: any) => !b.published).length,
        }));
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.users?.length || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-4xl text-white font-bebas mb-8">DASHBOARD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="classic-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-[var(--primary-mint)]" />
            <Link href="/admin/blogs" className="text-xs text-gray-400 hover:text-white">
              View All
            </Link>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Blogs</p>
          <p className="text-3xl font-bebas text-white">{stats.totalBlogs}</p>
        </div>

        <div className="classic-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-[var(--secondary-orange)]" />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Published</p>
          <p className="text-3xl font-bebas text-white">{stats.publishedBlogs}</p>
        </div>

        <div className="classic-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <EyeOff className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Drafts</p>
          <p className="text-3xl font-bebas text-white">{stats.draftBlogs}</p>
        </div>

        <div className="classic-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-[var(--secondary-purple)]" />
            <Link href="/admin/users" className="text-xs text-gray-400 hover:text-white">
              View All
            </Link>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Users</p>
          <p className="text-3xl font-bebas text-white">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="classic-panel p-6">
        <h2 className="text-2xl text-white font-bebas mb-4">QUICK ACTIONS</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/blogs/new"
            className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Create New Blog
          </Link>
          <Link
            href="/admin/blogs"
            className="px-6 py-3 border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)] font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Manage Blogs
          </Link>
        </div>
      </div>

      {/* Cron Jobs Status */}
      <div className="classic-panel p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl text-white font-bebas">CRON JOBS</h2>
          <button
            onClick={initializeCronJobs}
            disabled={initializingCron}
            className="px-4 py-2 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            {initializingCron ? 'Initializing...' : 'Initialize All'}
          </button>
        </div>
        
        {cronStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* YouTube Cron */}
            <div className="border border-[var(--border-color)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">YouTube Video Fetch</span>
                {cronStatus.youtube.running ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className="text-xs text-gray-400 mb-1">Schedule: Daily at 2 AM</p>
              <p className={`text-xs mb-1 ${cronStatus.youtube.running ? 'text-green-400' : 'text-red-400'}`}>
                {cronStatus.youtube.running ? 'Running' : 'Not Running'}
              </p>
              {cronStatus.youtube.running && cronStatus.youtube.nextRun && (
                <p className="text-xs text-gray-500 mt-1">
                  Next run: {formatNextRunTime(cronStatus.youtube.nextRun)}
                </p>
              )}
            </div>

            {/* Social Media Cron */}
            <div className="border border-[var(--border-color)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Social Media Publishing</span>
                {cronStatus.socialMedia.running ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <p className="text-xs text-gray-400 mb-1">Schedule: Every 5 minutes</p>
              <p className={`text-xs mb-1 ${cronStatus.socialMedia.running ? 'text-green-400' : 'text-red-400'}`}>
                {cronStatus.socialMedia.running ? 'Running' : 'Not Running'}
              </p>
              {cronStatus.socialMedia.running && cronStatus.socialMedia.nextRun && (
                <p className="text-xs text-gray-500 mt-1">
                  Next run: {formatNextRunTime(cronStatus.socialMedia.nextRun)}
                </p>
              )}
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-4">
          Cron jobs automatically initialize when you visit the admin dashboard. 
          Click "Initialize All" to manually start them if needed.
        </p>
      </div>
    </div>
  );
}

