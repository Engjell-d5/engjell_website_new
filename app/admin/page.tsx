'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchStats();
    // Initialize cron job on admin dashboard load
    fetch('/api/cron/init').catch(console.error);
  }, []);

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
    </div>
  );
}

