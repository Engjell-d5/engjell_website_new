'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlogsTab from '@/components/admin/newsletter/BlogsTab';
import SubscribersTab from '@/components/admin/newsletter/SubscribersTab';
import CampaignsTab from '@/components/admin/newsletter/CampaignsTab';
import GroupsTab from '@/components/admin/newsletter/GroupsTab';

export default function NewsletterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'blogs' | 'subscribers' | 'campaigns' | 'groups'>('blogs');

  useEffect(() => {
    // Check URL params for tab selection
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'blogs' || tab === 'subscribers' || tab === 'campaigns' || tab === 'groups') {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleTabChange = (tab: 'blogs' | 'subscribers' | 'campaigns' | 'groups') => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bebas">NEWSLETTER</h1>
      </div>

      {/* Tabs */}
      <div className="classic-panel p-0 mb-6 md:mb-8">
        <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
          <button
            onClick={() => handleTabChange('blogs')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'blogs'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Blogs
          </button>
          <button
            onClick={() => handleTabChange('subscribers')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'subscribers'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Subscribers
          </button>
          <button
            onClick={() => handleTabChange('campaigns')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'campaigns'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => handleTabChange('groups')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'groups'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'blogs' && <BlogsTab />}
      {activeTab === 'subscribers' && <SubscribersTab />}
      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'groups' && <GroupsTab />}
    </div>
  );
}
