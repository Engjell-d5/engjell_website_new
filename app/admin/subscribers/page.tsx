'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  syncedToSender: boolean;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'synced' | 'unsynced'>('all');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = filter === 'all'
    ? subscribers
    : filter === 'synced'
    ? subscribers.filter(s => s.syncedToSender)
    : subscribers.filter(s => !s.syncedToSender);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white font-bebas tracking-wide">Subscribers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage email subscribers</p>
        </div>
        <div className="text-right">
          <div className="text-2xl text-white font-bold">{subscribers.length}</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest">Total</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'synced', 'unsynced'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              filter === filterType
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] text-gray-400 hover:text-white border border-[#1a3a4a]'
            }`}
          >
            {filterType === 'all' ? 'All' : filterType === 'synced' ? 'Synced' : 'Not Synced'} (
            {filterType === 'all'
              ? subscribers.length
              : filterType === 'synced'
              ? subscribers.filter(s => s.syncedToSender).length
              : subscribers.filter(s => !s.syncedToSender).length}
            )
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading subscribers...</p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No subscribers found.</p>
        </div>
      ) : (
        <div className="classic-panel bg-[var(--rich-black)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a3a4a]">
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Email
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Subscribed At
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-[#1a3a4a] hover:bg-[var(--rich-black)]/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                    <td className="p-4">
                      {subscriber.syncedToSender ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Synced</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Pending</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

