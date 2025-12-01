'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, RefreshCw, Edit2, Trash2, X, Save, Mail, Send } from 'lucide-react';
import Link from 'next/link';

interface Group {
  id: string;
  senderGroupId: string | null;
  title: string;
  recipientCount: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  bouncedCount: number;
  phoneCount: number;
  activePhoneCount: number;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
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
      showMessage('error', 'Failed to fetch groups');
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
      const response = await fetch('/api/groups?sync=true');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
        showMessage('success', 'Groups synced from Sender.net');
      } else {
        showMessage('error', 'Failed to sync groups');
      }
    } catch (error) {
      showMessage('error', 'Failed to sync groups');
    } finally {
      setSyncing(false);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      showMessage('error', 'Group title is required');
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          createInSender: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Group created successfully');
        setNewTitle('');
        setShowAddForm(false);
        await fetchGroups();
      } else {
        showMessage('error', data.error || 'Failed to create group');
      }
    } catch (error) {
      showMessage('error', 'Failed to create group');
    }
  };

  const handleEdit = (group: Group) => {
    setEditingId(group.id);
    setEditTitle(group.title);
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) {
      showMessage('error', 'Group title is required');
      return;
    }

    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Group updated successfully');
        setEditingId(null);
        await fetchGroups();
      } else {
        showMessage('error', data.error || 'Failed to update group');
      }
    } catch (error) {
      showMessage('error', 'Failed to update group');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete it from Sender.net.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Group deleted successfully');
        await fetchGroups();
      } else {
        showMessage('error', data.error || 'Failed to delete group');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete group');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white font-bebas tracking-wide">Groups</h1>
          <p className="text-gray-400 text-sm mt-1">Manage subscriber groups</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl text-white font-bold">{groups.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Total</div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Sender.net'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
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
        <div className="classic-panel bg-[var(--rich-black)] p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white font-bebas">Create New Group</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Group Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter group name"
                className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Group
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTitle('');
                }}
                className="px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No groups found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="classic-panel bg-[var(--rich-black)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-[var(--primary-mint)]" />
                  {editingId === group.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-[var(--rich-black)] border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                    />
                  ) : (
                    <h3 className="text-xl text-white font-bebas">{group.title}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId === group.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(group.id)}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditTitle('');
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(group)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id, group.title)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Recipients</div>
                    <div className="text-2xl text-white font-bold">{group.recipientCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Active</div>
                    <div className="text-2xl text-[var(--primary-mint)] font-bold">{group.activeSubscribers}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border-color)]">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Unsubscribed</div>
                    <div className="text-sm text-gray-400">{group.unsubscribedCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Bounced</div>
                    <div className="text-sm text-gray-400">{group.bouncedCount}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(group.createdAt)}</span>
                    {group.syncedAt && (
                      <span>Synced: {formatDate(group.syncedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                  <Link
                    href={`/admin/subscribers?group=${group.id}`}
                    className="flex-1 px-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--primary-mint)] hover:text-black transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    View Subscribers
                  </Link>
                  <Link
                    href={`/admin/campaigns?group=${group.id}`}
                    className="flex-1 px-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--primary-mint)] hover:text-black transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    View Campaigns
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

