'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Edit2, Trash2, RefreshCw, X, Save, Mail, Send } from 'lucide-react';
import type { Group } from '@/types/admin';

export default function GroupsTab() {
  const router = useRouter();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl text-white font-bebas tracking-wide">Groups</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Manage subscriber groups</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-wrap flex-shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xl md:text-2xl text-white font-bold">{groups.length}</div>
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">Total</div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 md:px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 min-h-[44px] flex-1 sm:flex-initial"
          >
            <RefreshCw className={`w-4 h-4 flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">{syncing ? 'Syncing...' : 'Sync from Sender.net'}</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 md:px-6 py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 min-h-[44px] flex-1 sm:flex-initial"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">Create Group</span>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAdd}
                className="px-4 md:px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Save className="w-4 h-4 flex-shrink-0" />
                Create Group
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTitle('');
                }}
                className="px-4 md:px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors min-h-[44px]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {groups.map((group) => (
            <div key={group.id} className="classic-panel bg-[var(--rich-black)] p-4 md:p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <Users className="w-5 h-5 md:w-6 md:h-6 text-[var(--primary-mint)] flex-shrink-0" />
                  {editingId === group.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 min-w-0 bg-[var(--rich-black)] border border-[var(--border-color)] p-2 text-xs md:text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                    />
                  ) : (
                    <h3 className="text-lg md:text-xl text-white font-bebas break-words line-clamp-2">{group.title}</h3>
                  )}
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                  {editingId === group.id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(group.id)}
                        className="p-1.5 md:p-2 text-green-400 hover:text-green-300 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                        title="Save"
                      >
                        <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditTitle('');
                        }}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-white transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(group)}
                        className="p-1.5 md:p-2 text-blue-400 hover:text-blue-300 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id, group.title)}
                        className="p-1.5 md:p-2 text-red-400 hover:text-red-300 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Recipients</div>
                    <div className="text-xl md:text-2xl text-white font-bold">{group.recipientCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Active</div>
                    <div className="text-xl md:text-2xl text-[var(--primary-mint)] font-bold">{group.activeSubscribers}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 border-t border-[var(--border-color)]">
                  <div>
                    <div className="text-[10px] md:text-xs text-gray-500 mb-1">Unsubscribed</div>
                    <div className="text-xs md:text-sm text-gray-400">{group.unsubscribedCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] md:text-xs text-gray-500 mb-1">Bounced</div>
                    <div className="text-xs md:text-sm text-gray-400">{group.bouncedCount}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-[10px] md:text-xs text-gray-500">
                    <span>Created: {formatDate(group.createdAt)}</span>
                    {group.syncedAt && (
                      <span>Synced: {formatDate(group.syncedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      router.push(`/admin/newsletter?tab=subscribers&group=${group.id}`);
                    }}
                    className="flex-1 px-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--primary-mint)] hover:text-black transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">View Subscribers</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/admin/newsletter?tab=campaigns&group=${group.id}`);
                    }}
                    className="flex-1 px-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--primary-mint)] hover:text-black transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Send className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">View Campaigns</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
