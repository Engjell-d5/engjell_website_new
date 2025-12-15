'use client';

import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Sparkles, CheckCircle, XCircle, LogOut, Search, Filter, XSquare, Trash2 } from 'lucide-react';
import type { EmailThread, EmailTask, AiIntegration } from '@/types/admin';
import EmailsTab from '@/components/admin/email/EmailsTab';
import TasksTab from '@/components/admin/email/TasksTab';
import CronTab from '@/components/admin/email/CronTab';

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<'emails' | 'tasks' | 'cron'>('emails');
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [tasks, setTasks] = useState<EmailTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [creatingExternal, setCreatingExternal] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionEmail, setConnectionEmail] = useState<string | null>(null);
  const [aiIntegrations, setAiIntegrations] = useState<AiIntegration[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [analyzedFilter, setAnalyzedFilter] = useState<'all' | 'analyzed' | 'unanalyzed'>('all');
  const [relevantFilter, setRelevantFilter] = useState<'relevant' | 'irrelevant' | 'all'>('relevant');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'not_done' | 'done' | 'all'>('not_done'); // Default to not done
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalThreads, setTotalThreads] = useState(0);
  const [unanalyzedCount, setUnanalyzedCount] = useState(0);
  
  // Cron configuration
  const [cronLoading, setCronLoading] = useState(false);
  const [cronSaving, setCronSaving] = useState(false);
  const [cronConfig, setCronConfig] = useState<{
    isEnabled: boolean;
    schedule: string;
    syncEmails: boolean;
    analyzeEmails: boolean;
    aiIntegrationId: string | null;
    nextRun?: string | null;
    lastRun?: string | null;
    lastSyncAt?: string | null;
    lastAnalyzeAt?: string | null;
  } | null>(null);
  const [cronStatus, setCronStatus] = useState<{
    running: boolean;
    initialized: boolean;
    nextRun: string | null;
    schedule: string;
    isEnabled: boolean;
  } | null>(null);
  const [cronActionLoading, setCronActionLoading] = useState(false);

  const fetchCronStatus = async () => {
    try {
      const response = await fetch('/api/cron/email');
      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.cron);
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    }
  };

  const handleCronAction = async (action: 'start' | 'stop' | 'restart') => {
    setCronActionLoading(true);
    try {
      const response = await fetch('/api/cron/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.cron);
        setMessage({
          type: 'success',
          text: data.message || `Cron job ${action}ed successfully`,
        });
        setTimeout(() => setMessage(null), 3000);
        // Refresh cron config to get updated status
        await fetchCronConfig();
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || `Failed to ${action} cron job`,
        });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(`Error ${action}ing cron:`, error);
      setMessage({
        type: 'error',
        text: `Failed to ${action} cron job`,
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setCronActionLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
    fetchEmails();
    fetchTasks();
    fetchAiIntegrations();
    fetchCronConfig();
    fetchCronStatus();
    
    // Refresh cron status every 30 seconds
    const cronStatusInterval = setInterval(fetchCronStatus, 30000);
    return () => clearInterval(cronStatusInterval);
  }, []);

  // Refetch tasks when filter changes
  useEffect(() => {
    fetchTasks();
  }, [taskStatusFilter]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/email/connection');
      if (response.ok) {
        const data = await response.json();
        setConnected(data.connected);
        setConnectionEmail(data.email || null);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const fetchEmails = async (page: number = currentPage) => {
    try {
      const params = new URLSearchParams({
        grouped: 'true',
        page: page.toString(),
        pageSize: pageSize.toString(),
        readStatus: readFilter,
        analyzedStatus: analyzedFilter,
        relevantStatus: relevantFilter,
      });
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      const response = await fetch(`/api/email?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setTotalPages(data.totalPages || 1);
        setTotalThreads(data.total || 0);
        setCurrentPage(data.page || 1);
      }
      
      // Also fetch count of unanalyzed, relevant emails for the button
      // Read status doesn't matter - we want to analyze all unanalyzed relevant emails
      const countParams = new URLSearchParams({
        grouped: 'true',
        page: '1',
        pageSize: '1',
        readStatus: 'all', // Read status doesn't matter
        analyzedStatus: 'unanalyzed', // Must be unanalyzed
        relevantStatus: 'relevant', // Must be relevant (not irrelevant)
      });
      const countResponse = await fetch(`/api/email?${countParams.toString()}`);
      if (countResponse.ok) {
        const countData = await countResponse.json();
        setUnanalyzedCount(countData.total || 0);
        // Debug log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[EmailPage] Unanalyzed count:', countData.total);
        }
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchEmails(1);
      } else {
        setCurrentPage(1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, readFilter, analyzedFilter, relevantFilter]);
  
  // Fetch when page changes
  useEffect(() => {
    if (!loading) {
      fetchEmails(currentPage);
    }
  }, [currentPage]);
  
  // Refresh unanalyzed count after syncing or analyzing operations complete
  useEffect(() => {
    if (!syncing && !analyzingAll && !analyzing) {
      // Refetch count after operations complete
      const timer = setTimeout(() => {
        const countParams = new URLSearchParams({
          grouped: 'true',
          page: '1',
          pageSize: '1',
          readStatus: 'all', // Read status doesn't matter
          analyzedStatus: 'unanalyzed',
          relevantStatus: 'relevant',
        });
        fetch(`/api/email?${countParams.toString()}`)
          .then(res => res.json())
          .then(data => {
            setUnanalyzedCount(data.total || 0);
            if (process.env.NODE_ENV === 'development') {
              console.log('[EmailPage] Refreshed unanalyzed count:', data.total);
            }
          })
          .catch(err => console.error('Error fetching unanalyzed count:', err));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [syncing, analyzingAll, analyzing]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/email/tasks');
      if (response.ok) {
        const data = await response.json();
        let filteredTasks = data.tasks || [];
        
        // Filter by done/not done status
        if (taskStatusFilter === 'not_done') {
          filteredTasks = filteredTasks.filter((task: EmailTask) => task.status !== 'completed');
        } else if (taskStatusFilter === 'done') {
          filteredTasks = filteredTasks.filter((task: EmailTask) => task.status === 'completed');
        }
        // 'all' shows all tasks
        
        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchAiIntegrations = async () => {
    try {
      const response = await fetch('/api/ai/integrations');
      if (response.ok) {
        const data = await response.json();
        setAiIntegrations(data.integrations?.filter((i: AiIntegration) => i.isActive) || []);
      }
    } catch (error) {
      console.error('Error fetching AI integrations:', error);
    }
  };

  const fetchCronConfig = async () => {
    setCronLoading(true);
    try {
      const response = await fetch('/api/email/cron');
      if (response.ok) {
        const data = await response.json();
        setCronConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching cron config:', error);
    } finally {
      setCronLoading(false);
    }
  };

  const handleSaveCronConfig = async () => {
    if (!cronConfig) return;
    
    setCronSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/email/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cronConfig),
      });

      if (response.ok) {
        const data = await response.json();
        setCronConfig(data.config);
        setMessage({
          type: 'success',
          text: cronConfig.isEnabled 
            ? 'Cron job enabled and scheduled successfully' 
            : 'Cron job disabled successfully',
        });
        await fetchCronConfig(); // Refresh to get updated nextRun
        await fetchCronStatus(); // Refresh cron status
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save cron configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save cron configuration' });
    } finally {
      setCronSaving(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/email/connect';
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/email/connection', { method: 'DELETE' });
      if (response.ok) {
        setConnected(false);
        setConnectionEmail(null);
        setMessage({ type: 'success', text: 'Disconnected from Google account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect' });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const response = await fetch('/api/email/sync', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Synced ${data.new} new emails and updated ${data.synced} existing emails`,
        });
        await fetchEmails();
        await fetchTasks();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to sync emails' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync emails' });
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async (threadId: string) => {
    if (aiIntegrations.length === 0) {
      setMessage({ type: 'error', text: 'No active AI integrations found. Please configure one first.' });
      return;
    }

    const thread = threads.find(t => t.threadId === threadId);
    if (!thread) return;

    setAnalyzing(threadId);
    setMessage(null);
    try {
      // Analyze the latest email in the thread (or first unanalyzed email)
      const emailToAnalyze = thread.emails.find(e => !e.isAnalyzed) || thread.latestEmail;
      
      const response = await fetch('/api/email/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: emailToAnalyze.id,
          aiIntegrationId: aiIntegrations[0].id, // Use first active integration
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Generated ${data.tasks?.length || 0} tasks from email thread`,
        });
        await fetchEmails();
        await fetchTasks();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to analyze email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to analyze email' });
    } finally {
      setAnalyzing(null);
    }
  };

  const handleAnalyzeAll = async () => {
    if (aiIntegrations.length === 0) {
      setMessage({ type: 'error', text: 'No active AI integrations found. Please configure one first.' });
      return;
    }

    setAnalyzingAll(true);
    setMessage(null);
    try {
      const response = await fetch('/api/email/analyze-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiIntegrationId: aiIntegrations[0].id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({
          type: 'success',
          text: `Analyzed ${data.emailsAnalyzed} emails and created ${data.tasksCreated} tasks`,
        });
        await fetchEmails();
        await fetchTasks();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to analyze emails' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to analyze emails' });
    } finally {
      setAnalyzingAll(false);
    }
  };

  const handleDelete = async (threadId: string) => {
    const thread = threads.find(t => t.threadId === threadId);
    if (!thread) return;

    if (!confirm(`Are you sure you want to delete this email thread (${thread.totalCount} message${thread.totalCount !== 1 ? 's' : ''})? This will also delete all associated tasks.`)) {
      return;
    }

    setDeleting(threadId);
    try {
      // Delete all emails in the thread
      await Promise.all(
        thread.emails.map(email => 
          fetch(`/api/email/${email.id}`, { method: 'DELETE' })
        )
      );

      setMessage({ type: 'success', text: 'Email thread deleted successfully' });
      await fetchEmails();
      await fetchTasks();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete email thread' });
    } finally {
      setDeleting(null);
    }
  };

  const toggleThreadExpansion = (threadId: string) => {
    const newExpanded = new Set(expandedThreads);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedThreads(newExpanded);
  };

  const handleMarkIrrelevant = async (threadId: string, isIrrelevant: boolean) => {
    try {
      const response = await fetch('/api/email/irrelevant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, isIrrelevant }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: isIrrelevant ? 'Thread marked as irrelevant' : 'Thread marked as relevant',
        });
        await fetchEmails(currentPage);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update thread' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update thread' });
    }
  };

  const handleMarkTaskDone = async (taskId: string) => {
    setUpdatingTask(taskId);
    setMessage(null);
    try {
      const response = await fetch(`/api/email/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task marked as completed' });
        await fetchTasks();
        await fetchEmails(currentPage);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update task' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update task' });
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setDeletingTask(taskId);
    setMessage(null);
    try {
      const response = await fetch(`/api/email/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task deleted successfully' });
        await fetchTasks();
        await fetchEmails(currentPage);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete task' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete task' });
    } finally {
      setDeletingTask(null);
    }
  };

  const handleCreateExternalTask = async (taskId: string) => {
    setCreatingExternal(taskId);
    setMessage(null);
    try {
      const url = `/api/email/tasks/${taskId}/create-external`;
      console.log('[EMAIL-PAGE] Creating external task:', url, 'Task ID:', taskId);
      const response = await fetch(url, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: data.message || 'Task created successfully on external platform' 
        });
        // Refresh tasks to show updated externalTaskId
        await fetchTasks();
      } else {
        const error = await response.json();
        setMessage({ 
          type: 'error', 
          text: error.error || error.details || 'Failed to create task on external platform' 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create task on external platform' });
    } finally {
      setCreatingExternal(null);
    }
  };

  const handleClearAllTasks = async () => {
    if (!confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
      return;
    }

    setMessage(null);
    try {
      const response = await fetch('/api/email/tasks', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'All tasks deleted successfully' });
        await fetchTasks();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete all tasks' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete all tasks' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/20 text-red-400 border-red-500';
      case 'medium':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
      case 'low':
        return 'bg-green-900/20 text-green-400 border-green-500';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/20 text-green-400 border-green-500';
      case 'in_progress':
        return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case 'cancelled':
        return 'bg-gray-900/20 text-gray-400 border-gray-500';
      default:
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-mint)] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-white font-bebas tracking-wide">Email Management</h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">Manage your emails and AI-generated tasks</p>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          <div className="text-right">
            <div className="text-xl md:text-2xl text-white font-bold">{threads.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Threads</div>
          </div>
          <div className="text-right">
            <div className="text-xl md:text-2xl text-white font-bold">{tasks.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Tasks</div>
          </div>
          {connected && unanalyzedCount > 0 && (
            <button
              onClick={handleAnalyzeAll}
              disabled={analyzingAll || aiIntegrations.length === 0}
              className="px-4 md:px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Sparkles className={`w-4 h-4 flex-shrink-0 ${analyzingAll ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{analyzingAll ? 'Analyzing...' : `Analyze All (${unanalyzedCount})`}</span>
              <span className="sm:hidden">{analyzingAll ? 'Analyzing...' : `Analyze (${unanalyzedCount})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="classic-panel bg-[var(--rich-black)] p-4 md:p-6 border border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-lg text-white font-bebas mb-1">Google Account</h2>
            {connected ? (
              <p className="text-xs md:text-sm text-gray-400 break-words">
                Connected as <span className="font-medium text-[var(--primary-mint)]">{connectionEmail}</span>
              </p>
            ) : (
              <p className="text-xs md:text-sm text-gray-400">Not connected</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 flex-shrink-0">
            {connected ? (
              <>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-4 md:px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 min-h-[44px]"
                >
                  <RefreshCw className={`w-4 h-4 flex-shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync Emails'}</span>
                  <span className="sm:hidden">{syncing ? 'Syncing...' : 'Sync'}</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-4 md:px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Disconnect</span>
                  <span className="sm:hidden">Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 md:px-6 py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Connect Google Account</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
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
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {activeTab === 'emails' && (
        <div className="classic-panel bg-[var(--rich-black)] border border-[var(--border-color)] p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails by subject, content, or sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-dark)] border border-[var(--border-color)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase tracking-widest">Filters:</span>
              </div>
              
              {/* Read Status Filter */}
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value as 'all' | 'read' | 'unread')}
                className="px-3 py-1.5 bg-[var(--bg-dark)] border border-[var(--border-color)] text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
              >
                <option value="all">All Read Status</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
              
              {/* Analyzed Status Filter */}
              <select
                value={analyzedFilter}
                onChange={(e) => setAnalyzedFilter(e.target.value as 'all' | 'analyzed' | 'unanalyzed')}
                className="px-3 py-1.5 bg-[var(--bg-dark)] border border-[var(--border-color)] text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
              >
                <option value="all">All Analyzed Status</option>
                <option value="analyzed">Analyzed</option>
                <option value="unanalyzed">Unanalyzed</option>
              </select>
              
              {/* Relevant Status Filter */}
              <select
                value={relevantFilter}
                onChange={(e) => setRelevantFilter(e.target.value as 'relevant' | 'irrelevant' | 'all')}
                className="px-3 py-1.5 bg-[var(--bg-dark)] border border-[var(--border-color)] text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
              >
                <option value="relevant">Relevant Only</option>
                <option value="irrelevant">Irrelevant Only</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="classic-panel bg-[var(--rich-black)] border border-[var(--border-color)]">
        <div className="border-b border-[var(--border-color)]">
          <nav className="flex -mb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('emails')}
                className={`px-4 md:px-6 py-3 md:py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'emails'
                    ? 'border-[var(--primary-mint)] text-[var(--primary-mint)]'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                Emails ({totalThreads})
              </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 md:px-6 py-3 md:py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'tasks'
                  ? 'border-[var(--primary-mint)] text-[var(--primary-mint)]'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('cron')}
              className={`px-4 md:px-6 py-3 md:py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'cron'
                  ? 'border-[var(--primary-mint)] text-[var(--primary-mint)]'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
              }`}
            >
              Cron Job
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
            {activeTab === 'emails' && (
              <EmailsTab
                threads={threads}
                expandedThreads={expandedThreads}
                analyzing={analyzing}
                deleting={deleting}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalThreads={totalThreads}
                onAnalyze={handleAnalyze}
                onDelete={handleDelete}
                onMarkIrrelevant={handleMarkIrrelevant}
                onToggleExpansion={toggleThreadExpansion}
                onSelectThread={setSelectedThread}
                onPageChange={setCurrentPage}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksTab
                tasks={tasks}
                taskStatusFilter={taskStatusFilter}
                updatingTask={updatingTask}
                deletingTask={deletingTask}
                creatingExternal={creatingExternal}
                onTaskStatusFilterChange={setTaskStatusFilter}
                onMarkTaskDone={handleMarkTaskDone}
                onDeleteTask={handleDeleteTask}
                onCreateExternalTask={handleCreateExternalTask}
                onClearAllTasks={handleClearAllTasks}
              />
            )}
            {activeTab === 'cron' && (
              <CronTab
                cronLoading={cronLoading}
                cronSaving={cronSaving}
                cronActionLoading={cronActionLoading}
                cronConfig={cronConfig}
                cronStatus={cronStatus}
                aiIntegrations={aiIntegrations}
                onCronConfigChange={setCronConfig}
                onCronAction={handleCronAction}
                onRefreshStatus={fetchCronStatus}
                onSaveConfig={handleSaveCronConfig}
              />
            )}
          </div>
        </div>

        {/* Thread Detail Modal */}
        {selectedThread && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="classic-panel bg-[var(--rich-black)] border border-[var(--border-color)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                <h2 className="text-xl text-white font-bebas">{selectedThread.subject}</h2>
                <button
                  onClick={() => setSelectedThread(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {selectedThread.emails.map((email, idx) => (
                  <div key={email.id} className="border-b border-[var(--border-color)] pb-6 last:border-b-0 last:pb-0">
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400">
                          <span className="font-medium text-gray-300">From:</span> {email.from}
                        </p>
                        {!email.isRead && (
                          <span className="w-2 h-2 bg-[var(--primary-mint)] rounded-full"></span>
                        )}
                      </div>
                      {email.to && (
                        <p className="text-sm text-gray-400">
                          <span className="font-medium text-gray-300">To:</span> {email.to}
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        <span className="font-medium text-gray-300">Date:</span> {formatDate(email.receivedAt)}
                      </p>
                    </div>
                    <div className="prose max-w-none text-gray-300">
                      {email.body ? (
                        <div className="blog-content" dangerouslySetInnerHTML={{ __html: email.body }} />
                      ) : email.bodyText ? (
                        <p className="whitespace-pre-wrap text-gray-300">{email.bodyText}</p>
                      ) : (
                        <p className="text-gray-400">{email.snippet}</p>
                      )}
                    </div>
                  </div>
                ))}
                {selectedThread.tasks && selectedThread.tasks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                    <h3 className="font-semibold text-white mb-3 font-bebas">Generated Tasks</h3>
                    <div className="space-y-2">
                      {selectedThread.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-[var(--rich-black)] border border-[var(--border-color)]"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-white">{task.title}</span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium uppercase tracking-widest border ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
