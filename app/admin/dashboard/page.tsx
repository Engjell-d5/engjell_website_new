'use client';

import { useEffect, useState } from 'react';
import { Mail, Send, Users, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  subscribers: {
    total: number;
    active: number;
    churned: number;
    byGroup: Array<{ groupId: string | null; groupTitle: string | null; count: number }>;
  };
  campaigns: {
    total: number;
    draft: number;
    scheduled: number;
    sending: number;
    sent: number;
    byGroup: Array<{ groupId: string | null; groupTitle: string | null; count: number }>;
  };
  groups: {
    total: number;
    totalRecipients: number;
    totalActive: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [subscribersRes, campaignsRes, groupsRes] = await Promise.all([
        fetch('/api/subscribers'),
        fetch('/api/campaigns'),
        fetch('/api/groups'),
      ]);

      const subscribersData = subscribersRes.ok ? await subscribersRes.json() : { subscribers: [] };
      const campaignsData = campaignsRes.ok ? await campaignsRes.json() : { campaigns: [] };
      const groupsData = groupsRes.ok ? await groupsRes.json() : { groups: [] };

      const subscribers = subscribersData.subscribers || [];
      const campaigns = campaignsData.campaigns || [];
      const groups = groupsData.groups || [];

      // Calculate subscriber stats by group
      const subscriberGroupMap = new Map<string | null, { title: string | null; count: number }>();
      subscribers.forEach((sub: any) => {
        const groupId = sub.groupId || null;
        const groupTitle = sub.group?.title || null;
        const current = subscriberGroupMap.get(groupId) || { title: groupTitle, count: 0 };
        subscriberGroupMap.set(groupId, { ...current, count: current.count + 1 });
      });

      // Calculate campaign stats by group
      const campaignGroupMap = new Map<string | null, { title: string | null; count: number }>();
      campaigns.forEach((camp: any) => {
        const groupId = camp.groupId || null;
        // For now, we'll need to get group title from groups array
        const group = groups.find((g: any) => g.id === groupId);
        const groupTitle = group?.title || null;
        const current = campaignGroupMap.get(groupId) || { title: groupTitle, count: 0 };
        campaignGroupMap.set(groupId, { ...current, count: current.count + 1 });
      });

      setStats({
        subscribers: {
          total: subscribers.length,
          active: subscribers.filter((s: any) => s.status === 'active').length,
          churned: subscribers.filter((s: any) => s.status === 'churned').length,
          byGroup: Array.from(subscriberGroupMap.entries()).map(([groupId, data]) => ({
            groupId,
            groupTitle: data.title,
            count: data.count,
          })),
        },
        campaigns: {
          total: campaigns.length,
          draft: campaigns.filter((c: any) => c.status === 'DRAFT').length,
          scheduled: campaigns.filter((c: any) => c.status === 'SCHEDULED').length,
          sending: campaigns.filter((c: any) => c.status === 'SENDING').length,
          sent: campaigns.filter((c: any) => c.status === 'SENT').length,
          byGroup: Array.from(campaignGroupMap.entries()).map(([groupId, data]) => ({
            groupId,
            groupTitle: data.title,
            count: data.count,
          })),
        },
        groups: {
          total: groups.length,
          totalRecipients: groups.reduce((sum: number, g: any) => sum + (g.recipientCount || 0), 0),
          totalActive: groups.reduce((sum: number, g: any) => sum + (g.activeSubscribers || 0), 0),
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-white font-bebas tracking-wide">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of subscribers, campaigns, and groups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscribers Card */}
        <Link href="/admin/subscribers" className="classic-panel bg-[var(--rich-black)] p-6 hover:border-[var(--primary-mint)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-[var(--primary-mint)]" />
              <h2 className="text-xl text-white font-bebas">Subscribers</h2>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl text-white font-bold">{stats.subscribers.total}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Active</div>
                <div className="text-[var(--primary-mint)] font-bold">{stats.subscribers.active}</div>
              </div>
              <div>
                <div className="text-gray-400">Churned</div>
                <div className="text-red-400 font-bold">{stats.subscribers.churned}</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Campaigns Card */}
        <Link href="/admin/campaigns" className="classic-panel bg-[var(--rich-black)] p-6 hover:border-[var(--primary-mint)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Send className="w-8 h-8 text-[var(--primary-mint)]" />
              <h2 className="text-xl text-white font-bebas">Campaigns</h2>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl text-white font-bold">{stats.campaigns.total}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Draft</div>
                <div className="text-gray-400 font-bold">{stats.campaigns.draft}</div>
              </div>
              <div>
                <div className="text-gray-400">Sent</div>
                <div className="text-green-400 font-bold">{stats.campaigns.sent}</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Groups Card */}
        <Link href="/admin/groups" className="classic-panel bg-[var(--rich-black)] p-6 hover:border-[var(--primary-mint)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[var(--primary-mint)]" />
              <h2 className="text-xl text-white font-bebas">Groups</h2>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="text-3xl text-white font-bold">{stats.groups.total}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Recipients</div>
                <div className="text-[var(--primary-mint)] font-bold">{stats.groups.totalRecipients}</div>
              </div>
              <div>
                <div className="text-gray-400">Active</div>
                <div className="text-[var(--primary-mint)] font-bold">{stats.groups.totalActive}</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Group Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscribers by Group */}
        <div className="classic-panel bg-[var(--rich-black)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white font-bebas">Subscribers by Group</h2>
            <Link href="/admin/subscribers" className="text-xs text-[var(--primary-mint)] hover:underline uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.subscribers.byGroup.length === 0 ? (
              <p className="text-gray-400 text-sm">No group assignments yet</p>
            ) : (
              stats.subscribers.byGroup.map((item) => (
                <div key={item.groupId || 'no-group'} className="flex items-center justify-between p-3 bg-[var(--rich-black)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{item.groupTitle || 'No Group'}</span>
                  </div>
                  <span className="text-[var(--primary-mint)] font-bold">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Campaigns by Group */}
        <div className="classic-panel bg-[var(--rich-black)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white font-bebas">Campaigns by Group</h2>
            <Link href="/admin/campaigns" className="text-xs text-[var(--primary-mint)] hover:underline uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.campaigns.byGroup.length === 0 ? (
              <p className="text-gray-400 text-sm">No group assignments yet</p>
            ) : (
              stats.campaigns.byGroup.map((item) => (
                <div key={item.groupId || 'no-group'} className="flex items-center justify-between p-3 bg-[var(--rich-black)] border border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{item.groupTitle || 'No Group'}</span>
                  </div>
                  <span className="text-[var(--primary-mint)] font-bold">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

