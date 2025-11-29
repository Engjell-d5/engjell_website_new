'use client';

import { useEffect, useState } from 'react';
import { Mic, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface PodcastApplication {
  id: string;
  name: string;
  email: string;
  about: string;
  businesses: string;
  industry: string;
  vision: string;
  biggestChallenge: string;
  whyPodcast: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export default function PodcastApplicationsPage() {
  const [applications, setApplications] = useState<PodcastApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<PodcastApplication | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/podcast/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: PodcastApplication['status']) => {
    try {
      const response = await fetch('/api/podcast/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        fetchApplications();
        if (selectedApplication?.id === id) {
          setSelectedApplication({ ...selectedApplication, status });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: PodcastApplication['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'reviewed':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: PodcastApplication['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

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
          <h1 className="text-3xl text-white font-bebas tracking-wide">Podcast Applications</h1>
          <p className="text-gray-400 text-sm mt-1">Manage guest applications for your podcast</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'reviewed', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              filter === status
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] text-gray-400 hover:text-white border border-[#1a3a4a]'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? applications.length : applications.filter(a => a.status === status).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No applications found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className={`classic-panel p-6 bg-[var(--rich-black)] cursor-pointer transition-all ${
                  selectedApplication?.id === application.id
                    ? 'border-[var(--primary-mint)]'
                    : 'border-[#1a3a4a] hover:border-gray-600'
                }`}
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg text-white font-bold mb-1">{application.name}</h3>
                    <p className="text-xs text-gray-400">{application.email}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded border text-xs font-bold ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="uppercase">{application.status}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Industry: {application.industry}
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 mb-3">{application.about}</p>
                <div className="text-[10px] text-gray-500">
                  Submitted: {formatDate(application.submittedAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Application Details */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            {selectedApplication ? (
              <div className="classic-panel p-6 bg-[var(--rich-black)] overflow-y-auto max-h-full">
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#1a3a4a]">
                  <div>
                    <h2 className="text-2xl text-white font-bebas tracking-wide mb-1">
                      {selectedApplication.name}
                    </h2>
                    <p className="text-sm text-gray-400">{selectedApplication.email}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded border text-xs font-bold ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    <span className="uppercase">{selectedApplication.status}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Industry
                    </label>
                    <p className="text-sm text-white">{selectedApplication.industry}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      About
                    </label>
                    <p className="text-sm text-white leading-relaxed">{selectedApplication.about}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Businesses
                    </label>
                    <p className="text-sm text-white leading-relaxed">{selectedApplication.businesses}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Vision
                    </label>
                    <p className="text-sm text-white leading-relaxed">{selectedApplication.vision}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Biggest Challenge
                    </label>
                    <p className="text-sm text-white leading-relaxed">{selectedApplication.biggestChallenge}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Why Podcast
                    </label>
                    <p className="text-sm text-white leading-relaxed">{selectedApplication.whyPodcast}</p>
                  </div>

                  <div className="pt-4 border-t border-[#1a3a4a]">
                    <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">
                      Submitted
                    </label>
                    <p className="text-sm text-gray-400">{formatDate(selectedApplication.submittedAt)}</p>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="pt-4 border-t border-[#1a3a4a] space-y-2">
                    <label className="block text-xs text-gray-400 mb-3 uppercase tracking-widest">
                      Update Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateStatus(selectedApplication.id, 'pending')}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${
                          selectedApplication.status === 'pending'
                            ? 'bg-yellow-500 text-black'
                            : 'bg-[var(--rich-black)] text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updateStatus(selectedApplication.id, 'reviewed')}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${
                          selectedApplication.status === 'reviewed'
                            ? 'bg-blue-500 text-black'
                            : 'bg-[var(--rich-black)] text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
                        }`}
                      >
                        Reviewed
                      </button>
                      <button
                        onClick={() => updateStatus(selectedApplication.id, 'approved')}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${
                          selectedApplication.status === 'approved'
                            ? 'bg-green-500 text-black'
                            : 'bg-[var(--rich-black)] text-green-400 border border-green-500/30 hover:bg-green-500/20'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(selectedApplication.id, 'rejected')}
                        className={`px-4 py-2 text-xs font-bold uppercase transition-colors ${
                          selectedApplication.status === 'rejected'
                            ? 'bg-red-500 text-black'
                            : 'bg-[var(--rich-black)] text-red-400 border border-red-500/30 hover:bg-red-500/20'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="classic-panel p-6 bg-[var(--rich-black)] text-center">
                <Mic className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Select an application to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

