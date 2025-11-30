'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  read: boolean;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: true });
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : filter === 'unread'
    ? messages.filter(m => !m.read)
    : messages.filter(m => m.read);

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white font-bebas tracking-wide">Contact Messages</h1>
          <p className="text-gray-400 text-sm mt-1">View and manage contact form submissions</p>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-none">
            <Mail className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold">{unreadCount} unread</span>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'unread', 'read'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              filter === filterType
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] text-gray-400 hover:text-white border border-[var(--border-color)]'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)} (
              {filterType === 'all' 
                ? messages.length 
                : filterType === 'unread'
                ? messages.filter(m => !m.read).length
                : messages.filter(m => m.read).length}
            )
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No messages found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`classic-panel p-6 bg-[var(--rich-black)] cursor-pointer transition-all ${
                  selectedMessage?.id === message.id
                    ? 'border-[var(--primary-mint)]'
                    : message.read
                    ? 'border-[var(--border-color)] hover:border-gray-600'
                    : 'border-yellow-500/50 hover:border-yellow-500'
                }`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.read) {
                    markAsRead(message.id);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg text-white font-bold">{message.name}</h3>
                      {!message.read && (
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{message.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 mb-3">{message.message}</p>
                <div className="text-[10px] text-gray-500">
                  {formatDate(message.submittedAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Message Details */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            {selectedMessage ? (
              <div className="classic-panel p-6 bg-[var(--rich-black)] overflow-y-auto max-h-full">
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-[var(--border-color)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl text-white font-bebas tracking-wide">
                        {selectedMessage.name}
                      </h2>
                      {!selectedMessage.read && (
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{selectedMessage.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Message
                    </label>
                    <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Submitted
                    </label>
                    <p className="text-sm text-gray-400">{formatDate(selectedMessage.submittedAt)}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
                    <div className="flex gap-2">
                      {!selectedMessage.read ? (
                        <button
                          onClick={() => markAsRead(selectedMessage.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--primary-mint)] text-black font-bold text-xs uppercase tracking-widest hover:bg-[var(--primary-mint)]/90 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Read
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsRead(selectedMessage.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-colors"
                          disabled
                        >
                          <EyeOff className="w-4 h-4" />
                          Read
                        </button>
                      )}
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        Reply
                      </a>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="classic-panel p-6 bg-[var(--rich-black)] border border-[var(--border-color)] flex items-center justify-center h-full min-h-[400px]">
                <p className="text-gray-400">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
