'use client';

import { useEffect, useState } from 'react';
import { Mail, Plus, RefreshCw, Send, Calendar, X, Trash2, Eye, Edit2, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Campaign {
  id: string;
  senderCampaignId: string | null;
  blogId: string | null;
  title: string | null;
  subject: string;
  from: string;
  preheader: string | null;
  replyTo: string;
  contentType: string;
  content: string;
  status: string;
  scheduleTime: string | null;
  sentTime: string | null;
  recipientCount: number;
  sentCount: number;
  opens: number;
  clicks: number;
  bouncesCount: number;
  createdAt: string;
  updatedAt: string;
  groups?: string | null;
  groupId?: string | null;
  group?: {
    id: string;
    title: string;
  } | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<Array<{ id: string; senderGroupId: string | null; title: string }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);
  const [loadingCampaignDetails, setLoadingCampaignDetails] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchBlogs();
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

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      showMessage('error', 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const syncCampaigns = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/campaigns?sync=true');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        showMessage('success', 'Campaigns synced from Sender.net');
      } else {
        showMessage('error', 'Failed to sync campaigns');
      }
    } catch (error) {
      showMessage('error', 'Failed to sync campaigns');
    } finally {
      setSyncing(false);
    }
  };

  const createCampaignFromBlog = async (blogId: string) => {
    try {
      // Convert local group IDs to Sender.net group IDs
      const senderGroupIds = selectedGroupIds
        .map(localId => {
          const group = groups.find(g => g.id === localId);
          return group?.senderGroupId;
        })
        .filter((id): id is string => id !== null && id !== undefined);

      const response = await fetch('/api/campaigns/from-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId,
          createInSender: true,
          groups: senderGroupIds.length > 0 ? senderGroupIds : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Campaign created successfully');
        setShowCreateForm(false);
        setSelectedBlogId('');
        setSelectedGroupIds([]);
        await fetchCampaigns();
      } else {
        showMessage('error', data.error || 'Failed to create campaign');
      }
    } catch (error) {
      showMessage('error', 'Failed to create campaign');
    }
  };

  const sendCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${id}/send`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Campaign sent successfully');
        await fetchCampaigns();
      } else {
        showMessage('error', data.error || 'Failed to send campaign');
      }
    } catch (error) {
      showMessage('error', 'Failed to send campaign');
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will also delete it from Sender.net.')) {
      return;
    }

    try {
      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Campaign deleted successfully');
        await fetchCampaigns();
      } else {
        showMessage('error', data.error || 'Failed to delete campaign');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete campaign');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredCampaigns = filter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === filter);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'text-green-400';
      case 'SENDING':
        return 'text-blue-400';
      case 'SCHEDULED':
        return 'text-yellow-400';
      case 'DRAFT':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4" />;
      case 'SENDING':
        return <Clock className="w-4 h-4" />;
      case 'SCHEDULED':
        return <Calendar className="w-4 h-4" />;
      case 'DRAFT':
        return <FileText className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white font-bebas tracking-wide">Campaigns</h1>
          <p className="text-gray-400 text-sm mt-1">Manage email campaigns</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl text-white font-bold">{campaigns.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Total</div>
          </div>
          <button
            onClick={syncCampaigns}
            disabled={syncing}
            className="px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from Sender.net'}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create from Blog
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

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="classic-panel bg-[var(--rich-black)] p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-white font-bebas">Create Campaign from Blog Post</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Select Blog Post</label>
              <select
                value={selectedBlogId}
                onChange={(e) => setSelectedBlogId(e.target.value)}
                className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
              >
                <option value="">-- Select a blog post --</option>
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Select Groups (Optional)</label>
              <select
                multiple
                value={selectedGroupIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setSelectedGroupIds(selected);
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
            <div className="flex gap-2">
              <button
                onClick={() => selectedBlogId && createCampaignFromBlog(selectedBlogId)}
                disabled={!selectedBlogId}
                className="px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Create Campaign
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedBlogId('');
                  setSelectedGroupIds([]);
                }}
                className="px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'All', count: campaigns.length },
          { key: 'DRAFT', label: 'Draft', count: campaigns.filter(c => c.status === 'DRAFT').length },
          { key: 'SCHEDULED', label: 'Scheduled', count: campaigns.filter(c => c.status === 'SCHEDULED').length },
          { key: 'SENDING', label: 'Sending', count: campaigns.filter(c => c.status === 'SENDING').length },
          { key: 'SENT', label: 'Sent', count: campaigns.filter(c => c.status === 'SENT').length },
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

      {/* Campaigns Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading campaigns...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No campaigns found.</p>
        </div>
      ) : (
        <div className="classic-panel bg-[var(--rich-black)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Subject
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Group
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Recipients
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Opens / Clicks
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Created
                  </th>
                  <th className="text-left p-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-[var(--border-color)] hover:bg-[var(--rich-black)]/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-white font-medium">{campaign.subject}</div>
                          {campaign.title && (
                            <div className="text-xs text-gray-500">{campaign.title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {campaign.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm">
                        {(() => {
                          try {
                            const campaignGroups = campaign.groups ? JSON.parse(campaign.groups) : [];
                            if (Array.isArray(campaignGroups) && campaignGroups.length > 0) {
                              // Find group titles from groups list
                              const groupTitles = campaignGroups
                                .map((senderGroupId: string) => {
                                  const group = groups.find(g => g.senderGroupId === senderGroupId);
                                  return group?.title;
                                })
                                .filter((title): title is string => title !== undefined);
                              return groupTitles.length > 0 ? groupTitles.join(', ') : campaignGroups.length + ' group(s)';
                            }
                            return campaign.group ? campaign.group.title : 'No Group';
                          } catch {
                            return campaign.group ? campaign.group.title : 'No Group';
                          }
                        })()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {campaign.recipientCount > 0 ? (
                        <>
                          {campaign.sentCount} / {campaign.recipientCount}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {campaign.opens} / {campaign.clicks}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {campaign.status === 'DRAFT' && campaign.senderCampaignId && (
                          <button
                            onClick={() => sendCampaign(campaign.id)}
                            className="p-2 text-green-400 hover:text-green-300 transition-colors"
                            title="Send Campaign"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            // Show modal with campaign from list (which has content)
                            // Only sync if campaign doesn't have content locally
                            setViewingCampaign(campaign);
                            
                            // Only sync if local content is missing or empty
                            if (!campaign.content || !campaign.content.trim()) {
                              setLoadingCampaignDetails(true);
                              try {
                                // Fetch campaign details with sync to get content from Sender.net
                                const response = await fetch(`/api/campaigns/${campaign.id}?sync=true`);
                                if (response.ok) {
                                  const data = await response.json();
                                  // Only update if we got content, otherwise keep local
                                  if (data.campaign.content && data.campaign.content.trim()) {
                                    setViewingCampaign(data.campaign);
                                  }
                                }
                              } catch (error) {
                                console.error('Error fetching campaign details:', error);
                              } finally {
                                setLoadingCampaignDetails(false);
                              }
                            }
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="View Details"
                          disabled={loadingCampaignDetails}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {viewingCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="classic-panel bg-[var(--rich-black)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-2xl text-white font-bebas">Campaign Details</h2>
              <button
                onClick={() => setViewingCampaign(null)}
                className="text-gray-400 hover:text-white"
                disabled={loadingCampaignDetails}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {loadingCampaignDetails ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading campaign details...</p>
              </div>
            ) : (
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Subject</label>
                <p className="text-white mt-1">{viewingCampaign.subject}</p>
              </div>
              {viewingCampaign.title && (
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Title</label>
                  <p className="text-white mt-1">{viewingCampaign.title}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">From</label>
                  <p className="text-white mt-1">{viewingCampaign.from}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Reply To</label>
                  <p className="text-white mt-1">{viewingCampaign.replyTo}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Status</label>
                <p className={`mt-1 ${getStatusColor(viewingCampaign.status)}`}>{viewingCampaign.status}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Recipients</label>
                  <p className="text-white mt-1">{viewingCampaign.recipientCount}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Opens</label>
                  <p className="text-white mt-1">{viewingCampaign.opens}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Clicks</label>
                  <p className="text-white mt-1">{viewingCampaign.clicks}</p>
                </div>
              </div>
              {viewingCampaign.scheduleTime && (
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Scheduled For</label>
                  <p className="text-white mt-1">{formatDate(viewingCampaign.scheduleTime)}</p>
                </div>
              )}
              {viewingCampaign.sentTime && (
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Sent At</label>
                  <p className="text-white mt-1">{formatDate(viewingCampaign.sentTime)}</p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Content Preview</label>
                {viewingCampaign.content && viewingCampaign.content.trim() ? (
                  <div 
                    className="mt-2 p-4 bg-[var(--rich-black)] border border-[var(--border-color)] text-sm text-gray-300 max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: viewingCampaign.content }}
                  />
                ) : (
                  <div className="mt-2 p-4 bg-[var(--rich-black)] border border-[var(--border-color)] text-sm text-gray-500">
                    {viewingCampaign.senderCampaignId ? (
                      <p>Content preview is not available. The campaign content may need to be synced from Sender.net.</p>
                    ) : (
                      <p>No content available for this campaign.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
