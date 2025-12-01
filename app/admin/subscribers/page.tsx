'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle, XCircle, Plus, Edit2, Trash2, RefreshCw, X, Save } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  syncedToSender: boolean;
  status: 'active' | 'churned';
  groupId?: string | null;
  group?: {
    id: string;
    title: string;
  } | null;
  groups?: Array<{
    id: string;
    title: string;
  }>;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'synced' | 'unsynced' | 'active' | 'churned'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newStatus, setNewStatus] = useState<'active' | 'churned'>('active');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'churned'>('active');
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);
  const [newGroupId, setNewGroupId] = useState<string | null>(null);
  const [newGroupIds, setNewGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<Array<{ id: string; title: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSubscribers();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      showMessage('error', 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/subscribers/sync', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', data.message || `Synced ${data.synced} subscriber(s)`);
        await fetchSubscribers();
      } else {
        showMessage('error', data.error || 'Failed to sync subscribers');
      }
    } catch (error) {
      showMessage('error', 'Failed to sync subscribers');
    } finally {
      setSyncing(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      showMessage('error', 'Valid email is required');
      return;
    }

    try {
      const groupIdsToUse = newGroupIds.length > 0 ? newGroupIds : (newGroupId ? [newGroupId] : []);
      
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: newEmail, 
          status: newStatus, 
          groupId: newGroupId,
          groupIds: groupIdsToUse,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Subscriber added successfully');
        setNewEmail('');
        setNewStatus('active');
        setShowAddForm(false);
        await fetchSubscribers();
      } else {
        showMessage('error', data.error || 'Failed to add subscriber');
      }
    } catch (error) {
      showMessage('error', 'Failed to add subscriber');
    }
  };

  const handleEdit = (subscriber: Subscriber) => {
    setEditingId(subscriber.id);
    setEditEmail(subscriber.email);
    setEditStatus(subscriber.status);
    setEditGroupId(subscriber.groupId || null);
    setEditGroupIds(subscriber.groups?.map(g => g.id) || []);
  };

  const handleUpdate = async (id: string) => {
    if (!editEmail || !editEmail.includes('@')) {
      showMessage('error', 'Valid email is required');
      return;
    }

    try {
      // Always use editGroupIds (even if empty array to remove all groups)
      // The multi-select will always have editGroupIds set, so we use that
      const groupsToUpdate = editGroupIds;
      
      const response = await fetch(`/api/subscribers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: editEmail, 
          status: editStatus, 
          groupId: editGroupIds.length > 0 ? editGroupIds[0] : null, // First group for backward compatibility
          groupIds: groupsToUpdate, // Update multiple groups in local DB (can be empty array)
          groups: groupsToUpdate, // Also send groups array for Sender.net update (can be empty array)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Subscriber updated successfully');
        setEditingId(null);
        await fetchSubscribers();
      } else {
        showMessage('error', data.error || 'Failed to update subscriber');
      }
    } catch (error) {
      showMessage('error', 'Failed to update subscriber');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/subscribers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Subscriber deleted successfully');
        await fetchSubscribers();
      } else {
        showMessage('error', data.error || 'Failed to delete subscriber');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete subscriber');
    }
  };

  const filteredSubscribers = filter === 'all'
    ? subscribers
    : filter === 'synced'
    ? subscribers.filter(s => s.syncedToSender)
    : filter === 'unsynced'
    ? subscribers.filter(s => !s.syncedToSender)
    : filter === 'active'
    ? subscribers.filter(s => s.status === 'active')
    : subscribers.filter(s => s.status === 'churned');

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const churnedCount = subscribers.filter(s => s.status === 'churned').length;
  const unsyncedCount = subscribers.filter(s => !s.syncedToSender && s.status === 'active').length;

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-2xl md:text-3xl text-white font-bebas tracking-wide">Subscribers</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Manage email subscribers</p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 w-full lg:w-auto">
          <div className="text-right flex-shrink-0">
            <div className="text-xl md:text-2xl text-white font-bold">{subscribers.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Total</div>
          </div>
          <div className="admin-buttons-container flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full lg:w-auto px-4 md:px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">{syncing ? 'Syncing...' : unsyncedCount > 0 ? `Sync to Sender.net (${unsyncedCount})` : 'Sync with Sender.net'}</span>
              <span className="lg:hidden">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full lg:w-auto px-4 md:px-6 py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden lg:inline">Add Subscriber</span>
              <span className="lg:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 border ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-500 text-green-400' 
            : 'bg-red-900/20 border-red-500 text-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="classic-panel bg-[var(--rich-black)] p-4 md:p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white font-bebas">Add New Subscriber</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="subscriber@example.com"
                className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'active' | 'churned')}
                className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
              >
                <option value="active">Active</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Groups (Optional)</label>
              <select
                multiple
                value={newGroupIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setNewGroupIds(selected);
                  // Also set newGroupId to first selected for backward compatibility
                  setNewGroupId(selected.length > 0 ? selected[0] : null);
                }}
                className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all min-h-[120px]"
                size={Math.min(groups.length + 1, 5)}
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.title}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple groups</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 md:px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Save className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Subscriber</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewEmail('');
                setNewStatus('active');
                setNewGroupId(null);
                setNewGroupIds([]);
              }}
              className="px-4 md:px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All', count: subscribers.length },
          { key: 'active', label: 'Active', count: activeCount },
          { key: 'churned', label: 'Churned', count: churnedCount },
          { key: 'synced', label: 'Synced', count: subscribers.filter(s => s.syncedToSender).length },
          { key: 'unsynced', label: 'Not Synced', count: unsyncedCount },
        ] as const).map((filterType) => (
          <button
            key={filterType.key}
            onClick={() => setFilter(filterType.key as typeof filter)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              filter === filterType.key
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] text-gray-400 hover:text-white border border-[var(--border-color)]'
            }`}
          >
            {filterType.label} ({filterType.count})
          </button>
        ))}
      </div>

      {/* Subscribers Table */}
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
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Email
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Subscribed At
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Group
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Sync Status
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--rich-black)]/50 transition-colors"
                  >
                    <td className="p-4">
                      {editingId === subscriber.id ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                        />
                      ) : (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{subscriber.email}</span>
                      </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                    <td className="p-4">
                      {editingId === subscriber.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as 'active' | 'churned')}
                          className="bg-[var(--rich-black)] border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                        >
                          <option value="active">Active</option>
                          <option value="churned">Churned</option>
                        </select>
                      ) : (
                        <div className={`flex items-center gap-2 ${
                          subscriber.status === 'active' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {subscriber.status === 'active' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-xs font-bold uppercase tracking-widest">
                            {subscriber.status}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === subscriber.id ? (
                        <select
                          multiple
                          value={editGroupIds}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setEditGroupIds(selected);
                            // Also set editGroupId to first selected for backward compatibility
                            setEditGroupId(selected.length > 0 ? selected[0] : null);
                          }}
                          className="bg-[var(--rich-black)] border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all min-h-[80px]"
                          size={Math.min(groups.length + 1, 4)}
                        >
                          {groups.map(group => (
                            <option key={group.id} value={group.id}>{group.title}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {subscriber.groups && subscriber.groups.length > 0 ? (
                            subscriber.groups.map(group => (
                              <span 
                                key={group.id} 
                                className="text-xs px-2 py-1 bg-[var(--primary-mint)]/20 text-[var(--primary-mint)] border border-[var(--primary-mint)]/30"
                              >
                                {group.title}
                              </span>
                            ))
                          ) : subscriber.group ? (
                            <span className="text-gray-400 text-sm">{subscriber.group.title}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">No Group</span>
                          )}
                        </div>
                      )}
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
                    <td className="p-4">
                      {editingId === subscriber.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdate(subscriber.id)}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditEmail('');
                              setEditStatus('active');
                              setEditGroupId(null);
                              setEditGroupIds([]);
                            }}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(subscriber)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subscriber.id, subscriber.email)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
