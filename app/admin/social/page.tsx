'use client';

import { useEffect, useState } from 'react';
import { Calendar, Image as ImageIcon, Send, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Linkedin, Twitter, Instagram, Rocket, Video, X, Upload, Repeat, RefreshCw, Sparkles, Lightbulb } from 'lucide-react';
import Image from 'next/image';
import DateTimePicker from '@/components/DateTimePicker';

interface MediaAsset {
  type: 'image' | 'video';
  url: string;
  filename?: string;
}

interface SocialPost {
  id: string;
  content: string;
  mediaAssets: string | null; // JSON string of MediaAsset[]
  platforms: string;
  scheduledFor: string;
  publishedAt: string | null;
  status: string;
  publishedOn: string | null;
  errorMessage: string | null;
  timesPosted: number;
  comments: string | null; // JSON string of string[]
  createdAt: string;
}

interface SocialConnection {
  id: string;
  platform: string;
  isActive: boolean;
  username: string | null;
  profileImage: string | null;
}

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'posts' | 'ideas' | 'cron'>('posts');
  const [cronStatus, setCronStatus] = useState<{
    running: boolean;
    initialized: boolean;
    nextRun: string | null;
    schedule: string;
  } | null>(null);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronSchedule, setCronSchedule] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    mediaAssets: [] as MediaAsset[],
    platforms: [] as string[],
    scheduledFor: '',
    comments: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [postToRefine, setPostToRefine] = useState<SocialPost | null>(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [refinedContent, setRefinedContent] = useState('');
  const [aiIntegrations, setAiIntegrations] = useState<Array<{ id: string; name: string; provider: string; isActive: boolean }>>([]);
  const [selectedAiIntegration, setSelectedAiIntegration] = useState('');
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [ideasPrompt, setIdeasPrompt] = useState('');
  const [ideasCount, setIdeasCount] = useState(5);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [postIdeas, setPostIdeas] = useState<Array<{ id: string; title: string; prompt: string; status: string; createdAt: string }>>([]);
  const [editingIdea, setEditingIdea] = useState<{ id: string; title: string; prompt: string } | null>(null);
  const [editIdeaTitle, setEditIdeaTitle] = useState('');

  const fetchCronStatus = async () => {
    try {
      const response = await fetch('/api/cron/social');
      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.cron);
        if (data.schedule) {
          setCronSchedule(data.schedule);
        }
      }
    } catch (error) {
      console.error('Error fetching cron status:', error);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!cronSchedule.trim()) {
      setMessage({ type: 'error', text: 'Schedule cannot be empty' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate schedule format
    const parts = cronSchedule.trim().split(/\s+/);
    if (parts.length !== 5) {
      setMessage({ type: 'error', text: 'Invalid cron schedule format. Expected format: "minute hour day month dayOfWeek"' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSavingSchedule(true);
    try {
      const response = await fetch('/api/cron/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSchedule', schedule: cronSchedule.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.cron);
        setEditingSchedule(false);
        setMessage({ type: 'success', text: data.message || 'Schedule updated successfully' });
        setTimeout(() => setMessage(null), 3000);
        await fetchCronStatus(); // Refresh to get updated next run time
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update schedule' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      setMessage({ type: 'error', text: 'Failed to update schedule' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleCronAction = async (action: 'start' | 'stop' | 'restart') => {
    setCronLoading(true);
    try {
      const response = await fetch('/api/cron/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setCronStatus(data.cron);
        setMessage({ type: 'success', text: data.message || `Cron job ${action}ed successfully` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || `Failed to ${action} cron job` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error(`Error ${action}ing cron:`, error);
      setMessage({ type: 'error', text: `Failed to ${action} cron job` });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setCronLoading(false);
    }
  };

  useEffect(() => {
    console.log('[SOCIAL-PAGE] Page loaded, initializing...');
    fetchPosts();
    fetchConnections();
    fetchAiIntegrations();
    fetchPostIdeas();
    fetchCronStatus();
    
    // Initialize cron jobs when social media page loads
    console.log('[SOCIAL-PAGE] Initializing cron jobs...');
    fetch('/api/cron/init')
      .then(res => {
        console.log('[SOCIAL-PAGE] Cron init response:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('[SOCIAL-PAGE] Cron init result:', data);
        fetchCronStatus(); // Refresh status after init
      })
      .catch(err => {
        console.error('[SOCIAL-PAGE] Error initializing cron:', err);
      });

    // Refresh cron status every 30 seconds
    const cronStatusInterval = setInterval(fetchCronStatus, 30000);
    return () => clearInterval(cronStatusInterval);
    
    // Check for URL parameters (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    
    if (connected) {
      setMessage({ type: 'success', text: `Successfully connected ${connected}!` });
      // Clean URL
      window.history.replaceState({}, '', '/admin/social');
    } else if (error) {
      setMessage({ type: 'error', text: `Connection error: ${error}` });
      window.history.replaceState({}, '', '/admin/social');
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/social/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchAiIntegrations = async () => {
    try {
      const response = await fetch('/api/ai/integrations');
      if (response.ok) {
        const data = await response.json();
        setAiIntegrations(data.integrations?.filter((i: any) => i.isActive) || []);
        if (data.integrations?.filter((i: any) => i.isActive).length > 0) {
          setSelectedAiIntegration(data.integrations.filter((i: any) => i.isActive)[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching AI integrations:', error);
    }
  };

  const fetchPostIdeas = async () => {
    try {
      const response = await fetch('/api/ai/ideas');
      if (response.ok) {
        const data = await response.json();
        setPostIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error('Error fetching post ideas:', error);
    }
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/social/connections?platform=${platform}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Successfully disconnected ${platform} account` });
        fetchConnections(); // Refresh connections list
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || `Failed to disconnect ${platform} account` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setMessage({ type: 'error', text: `Failed to disconnect ${platform} account` });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingPost ? `/api/social/posts/${editingPost.id}` : '/api/social/posts';
    const method = editingPost ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            mediaAssets: JSON.stringify(formData.mediaAssets),
            platforms: JSON.stringify(formData.platforms),
            comments: JSON.stringify(formData.comments),
          }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingPost(null);
        setFormData({ content: '', mediaAssets: [], platforms: [], scheduledFor: '', comments: [] });
        setMessage({ type: 'success', text: editingPost ? 'Post updated successfully!' : 'Post scheduled successfully!' });
        fetchPosts();
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update post' }));
        const errorText = errorData.error || errorData.details || 'Failed to save post';
        setMessage({ type: 'error', text: errorText });
        console.error('Update failed:', errorData);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving the post' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/social/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePublishNow = async (post: SocialPost) => {
    if (!confirm(`Publish this post to ${JSON.parse(post.platforms || '[]').join(', ')} now?`)) return;

    console.log(`[SOCIAL-PAGE] Publishing post ${post.id} immediately`);
    setMessage({ type: 'success', text: 'Publishing post...' });

    try {
      const response = await fetch(`/api/social/posts/${post.id}/publish`, {
        method: 'POST',
      });

      const data = await response.json();
      console.log(`[SOCIAL-PAGE] Publish now result:`, data);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Post published successfully!' });
        fetchPosts(); // Refresh posts list
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to publish post' });
      }
    } catch (error) {
      console.error('[SOCIAL-PAGE] Error publishing post:', error);
      setMessage({ type: 'error', text: 'An error occurred while publishing the post' });
    }
  };

  const handleRetry = async (post: SocialPost) => {
    const platforms = JSON.parse(post.platforms || '[]');
    if (!confirm(`Retry publishing this post to ${platforms.join(', ')}?`)) return;

    console.log(`[SOCIAL-PAGE] Retrying failed post ${post.id}`);
    setMessage({ type: 'success', text: 'Retrying to publish post...' });

    try {
      const response = await fetch(`/api/social/posts/${post.id}/publish`, {
        method: 'POST',
      });

      const data = await response.json();
      console.log(`[SOCIAL-PAGE] Retry result:`, data);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Post published successfully!' });
        fetchPosts(); // Refresh posts list
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to retry publishing post' });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('[SOCIAL-PAGE] Error retrying post:', error);
      setMessage({ type: 'error', text: 'An error occurred while retrying to publish the post' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRepost = async (post: SocialPost) => {
    const platforms = JSON.parse(post.platforms || '[]');
    if (!confirm(`Repost this content to ${platforms.join(', ')} now?`)) return;
    
    console.log('[SOCIAL-PAGE] Reposting:', post.id);
    setMessage({ type: 'success', text: 'Reposting...' });
    
    // Parse media assets from the original post
    let mediaAssets: MediaAsset[] = [];
    if (post.mediaAssets) {
      try {
        mediaAssets = JSON.parse(post.mediaAssets);
      } catch (e) {
        console.error('Error parsing mediaAssets:', e);
      }
    }
    
    // Create a new post with the same content and media, scheduled for immediate publishing
    const now = new Date();
    const scheduledFor = new Date(now.getTime() + 60000); // 1 minute from now to ensure it's in the future
    
    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: post.content,
          mediaAssets: JSON.stringify(mediaAssets),
          platforms: JSON.stringify(platforms),
          scheduledFor: scheduledFor.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newPostId = data.post?.id;
        
        if (newPostId) {
          // Immediately publish the newly created post
          const publishResponse = await fetch(`/api/social/posts/${newPostId}/publish`, {
            method: 'POST',
          });
          
          if (publishResponse.ok) {
            setMessage({ type: 'success', text: 'Post republished successfully!' });
            fetchPosts(); // Refresh posts list
            setTimeout(() => setMessage(null), 3000);
          } else {
            const errorData = await publishResponse.json();
            setMessage({ type: 'error', text: errorData.error || 'Post created but failed to publish' });
            setTimeout(() => setMessage(null), 3000);
          }
        } else {
          setMessage({ type: 'error', text: 'Failed to create repost' });
          setTimeout(() => setMessage(null), 3000);
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to repost' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('[SOCIAL-PAGE] Error reposting:', error);
      setMessage({ type: 'error', text: 'An error occurred while reposting' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      const newAsset: MediaAsset = {
        type: data.type || (file.type.startsWith('video/') ? 'video' : 'image'),
        url: data.url,
        filename: data.filename,
      };

      setFormData(prev => ({
        ...prev,
        mediaAssets: [...prev.mediaAssets, newAsset],
      }));
    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload file' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      handleFileUpload(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeMediaAsset = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaAssets: prev.mediaAssets.filter((_, i) => i !== index),
    }));
  };

  const handleScheduleDraft = async (post: SocialPost) => {
    try {
      // Set scheduled date to 24 hours from now (or keep existing if it's in the future)
      const now = new Date();
      const existingDate = new Date(post.scheduledFor);
      const scheduledFor = existingDate > now ? existingDate : new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const response = await fetch(`/api/social/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: post.content,
          mediaAssets: post.mediaAssets,
          platforms: post.platforms,
          scheduledFor: scheduledFor.toISOString(),
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post scheduled successfully!' });
        fetchPosts();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to schedule post' });
      }
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      setMessage({ type: 'error', text: 'Failed to schedule post' });
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    
    // Parse media assets
    let mediaAssets: MediaAsset[] = [];
    if (post.mediaAssets) {
      try {
        mediaAssets = JSON.parse(post.mediaAssets);
      } catch (e) {
        console.error('Error parsing mediaAssets:', e);
      }
    }
    
    // Parse comments
    let comments: string[] = [];
    if (post.comments) {
      try {
        comments = JSON.parse(post.comments);
      } catch (e) {
        console.error('Error parsing comments:', e);
      }
    }
    
    setFormData({
      content: post.content,
      mediaAssets,
      platforms: JSON.parse(post.platforms || '[]'),
      scheduledFor: new Date(post.scheduledFor).toISOString().slice(0, 16),
      comments,
    });
    setShowForm(true);
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'threads':
        return <Twitter className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefine = async () => {
    if (!postToRefine || !refinementPrompt || !selectedAiIntegration) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setRefining(true);
    try {
      const response = await fetch('/api/ai/refine-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postToRefine.content,
          refinementPrompt,
          aiIntegrationId: selectedAiIntegration,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to refine post');
      }

      const data = await response.json();
      setRefinedContent(data.content);
      setMessage({ type: 'success', text: 'Post refined successfully!' });
    } catch (error: any) {
      console.error('Error refining post:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to refine post' });
    } finally {
      setRefining(false);
    }
  };

  const handleApplyRefinement = async () => {
    if (!postToRefine || !refinedContent) return;

    try {
      const response = await fetch(`/api/social/posts/${postToRefine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: refinedContent,
          mediaAssets: postToRefine.mediaAssets,
          platforms: postToRefine.platforms,
          scheduledFor: postToRefine.scheduledFor,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post updated with refined content!' });
        setShowRefineModal(false);
        setPostToRefine(null);
        setRefinedContent('');
        setRefinementPrompt('');
        fetchPosts();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update post' });
      }
    } catch (error) {
      console.error('Error applying refinement:', error);
      setMessage({ type: 'error', text: 'Failed to update post' });
    }
  };

  const handleGenerateIdeas = async () => {
    if (!ideasPrompt || !selectedAiIntegration) {
      setMessage({ type: 'error', text: 'Please fill in the prompt and select an AI integration' });
      return;
    }

    setGeneratingIdeas(true);
    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: ideasPrompt,
          aiIntegrationId: selectedAiIntegration,
          count: ideasCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      // Refresh ideas list to show new ones
      await fetchPostIdeas();
      setMessage({ type: 'success', text: `Generated ${data.ideas.length} post ideas!` });
      setShowIdeasModal(false);
      setIdeasPrompt('');
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to generate ideas' });
    } finally {
      setGeneratingIdeas(false);
    }
  };

  const handleEditIdea = (idea: { id: string; title: string; prompt: string }) => {
    setEditingIdea(idea);
    setEditIdeaTitle(idea.title);
  };

  const handleSaveIdea = async () => {
    if (!editingIdea || !editIdeaTitle.trim()) {
      setMessage({ type: 'error', text: 'Idea title cannot be empty' });
      return;
    }

    try {
      const response = await fetch(`/api/ai/ideas?id=${editingIdea.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editIdeaTitle }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Idea updated successfully!' });
        setEditingIdea(null);
        setEditIdeaTitle('');
        await fetchPostIdeas();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update idea' });
      }
    } catch (error) {
      console.error('Error updating idea:', error);
      setMessage({ type: 'error', text: 'Failed to update idea' });
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      const response = await fetch(`/api/ai/ideas?id=${ideaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Idea deleted successfully!' });
        await fetchPostIdeas();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete idea' });
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
      setMessage({ type: 'error', text: 'Failed to delete idea' });
    }
  };

  const handleGeneratePostFromIdea = async (idea: { id: string; title: string; prompt: string }) => {
    if (!selectedAiIntegration) {
      setMessage({ type: 'error', text: 'Please select an AI integration first' });
      return;
    }

    try {
      // Generate post for each platform
      const platforms = ['linkedin', 'twitter'];
      const posts = await Promise.all(
        platforms.map(async (platform) => {
          const response = await fetch('/api/ai/generate-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${idea.prompt}\n\nIdea: ${idea.title}`,
              platform,
              aiIntegrationId: selectedAiIntegration,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate post for ${platform}`);
          }

          const data = await response.json();
          return { platform, content: data.content };
        })
      );

      // Create draft posts
      const now = new Date();
      const scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await Promise.all(
        posts.map(async (post) => {
          const response = await fetch('/api/social/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: post.content,
              mediaAssets: JSON.stringify([]),
              platforms: JSON.stringify([post.platform]),
              scheduledFor: scheduledFor.toISOString(),
              status: 'draft',
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create post for ${post.platform}`);
          }
        })
      );

      setMessage({ type: 'success', text: 'Posts generated from idea and created as drafts!' });
      fetchPosts();
    } catch (error: any) {
      console.error('Error generating post from idea:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to generate posts from idea' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-white font-bebas">SOCIAL MEDIA</h1>
        <div className="flex items-center gap-3">
          {activeTab === 'posts' && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingPost(null);
              setFormData({ content: '', mediaAssets: [], platforms: [], scheduledFor: '', comments: [] });
            }}
            className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
          )}
          {activeTab === 'ideas' && (
            <button
              onClick={() => {
                setShowIdeasModal(true);
                setIdeasPrompt('');
                setIdeasCount(5);
              }}
              className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              Generate Ideas
            </button>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div
          className={`mb-6 p-4 border ${
            message.type === 'success'
              ? 'border-[var(--primary-mint)] bg-[var(--rich-black)] text-[var(--primary-mint)]'
              : 'border-red-400 bg-[var(--rich-black)] text-red-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="classic-panel p-0 mb-8">
        <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'connections'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Connected Accounts
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'posts'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Scheduled Posts
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'ideas'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Post Ideas
          </button>
          <button
            onClick={() => setActiveTab('cron')}
            className={`px-4 md:px-6 py-3 md:py-4 font-bebas text-xs md:text-sm uppercase tracking-widest transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'cron'
                ? 'bg-[var(--primary-mint)] text-black border-b-2 border-black'
                : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
            }`}
          >
            Cron Job
          </button>
        </div>
      </div>

      {/* Tab Content: Connected Accounts */}
      {activeTab === 'connections' && (
      <div className="classic-panel p-4 md:p-6 mb-8">
        <h2 className="text-xl md:text-2xl text-white font-bebas mb-4">CONNECTED ACCOUNTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['linkedin', 'twitter', 'instagram', 'threads'].map((platform) => {
            const connection = connections.find(c => c.platform === platform);
            return (
              <div
                key={platform}
                className={`p-4 border ${
                  connection?.isActive
                    ? 'border-[var(--primary-mint)] bg-[var(--rich-black)]'
                    : 'border-[var(--border-color)] bg-[var(--rich-black)] opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getPlatformIcon(platform)}
                  <span className="text-sm font-bold text-white uppercase">{platform}</span>
                </div>
                {connection?.isActive ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-[var(--primary-mint)]" />
                      <span className="text-xs text-gray-400">Connected</span>
                    </div>
                    {connection.username && (
                      <p className="text-[10px] text-gray-500 truncate mb-2">
                        {connection.platform === 'instagram' && connection.username.includes('|')
                          ? connection.username.split('|')[0]
                          : connection.username}
                      </p>
                    )}
                    <button
                      onClick={() => handleDisconnect(platform)}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <a
                    href={`/api/social/connect/${platform}`}
                    className="text-xs text-[var(--primary-mint)] hover:underline"
                  >
                    Connect Account
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* Tab Content: Scheduled Posts */}
      {activeTab === 'posts' && (
        <>
      {/* Schedule Post Form */}
      {showForm && (
        <div className="classic-panel p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl text-white font-bebas mb-4 md:mb-6">
            {editingPost ? 'EDIT POST' : 'SCHEDULE NEW POST'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
                className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                Media Assets (Images & Videos) - Optional
              </label>
              
              {/* File Upload Input */}
              <div className="mb-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Upload Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <span className="ml-3 text-xs text-gray-400">Uploading...</span>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                  Supported: Images (JPEG, PNG, GIF, WebP - max 20MB) and Videos (MP4, MOV, AVI, WebM - max 200MB)
                </p>
              </div>

              {/* Media Preview Grid */}
              {formData.mediaAssets.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.mediaAssets.map((asset, index) => (
                    <div
                      key={index}
                      className="relative group border border-[var(--border-color)] aspect-square overflow-hidden"
                    >
                      {asset.type === 'image' ? (
                        <Image
                          src={asset.url}
                          alt={`Media ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <video
                          src={asset.url}
                          className="w-full h-full object-cover"
                          controls={false}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMediaAsset(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-2 py-1 bg-black bg-opacity-75 text-xs">
                        {asset.type === 'video' ? (
                          <Video className="w-3 h-3 inline mr-1" />
                        ) : (
                          <ImageIcon className="w-3 h-3 inline mr-1" />
                        )}
                        {asset.type}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                Platforms
              </label>
              <div className="flex flex-wrap gap-3">
                {['linkedin', 'twitter', 'instagram', 'threads'].map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`px-4 py-2 border flex items-center gap-2 transition-colors ${
                      formData.platforms.includes(platform)
                        ? 'border-[var(--primary-mint)] bg-[var(--primary-mint)] text-black'
                        : 'border-[var(--border-color)] text-white hover:border-[var(--primary-mint)]'
                    }`}
                  >
                    {getPlatformIcon(platform)}
                    <span className="text-xs font-bold uppercase">{platform}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                Comments (Optional) - Posted after the main post
              </label>
              <p className="text-[10px] text-gray-500 mb-2">
                Add comments that will be posted as replies to your main post after it's published. Each comment will be posted separately.
              </p>
              <div className="space-y-3">
                {(formData.comments || []).map((comment, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <textarea
                      value={comment}
                      onChange={(e) => {
                        const newComments = [...(formData.comments || [])];
                        newComments[index] = e.target.value;
                        setFormData({ ...formData, comments: newComments });
                      }}
                      rows={2}
                      className="flex-1 bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-none font-montserrat"
                      placeholder={`Comment ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newComments = formData.comments.filter((_, i) => i !== index);
                        setFormData({ ...formData, comments: newComments });
                      }}
                      className="p-2 border border-red-500 hover:border-red-400 hover:bg-red-500 transition-colors"
                      title="Remove comment"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, comments: [...(formData.comments || []), ''] });
                  }}
                  className="px-4 py-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] text-white hover:bg-[var(--rich-black)] transition-colors flex items-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Comment
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                Schedule For
              </label>
              <DateTimePicker
                value={formData.scheduledFor}
                onChange={(value) => setFormData({ ...formData, scheduledFor: value })}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 md:px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                {editingPost ? 'Update Post' : 'Schedule Post'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPost(null);
                  setFormData({ content: '', mediaAssets: [], platforms: [], scheduledFor: '', comments: [] });
                }}
                className="px-6 py-3 border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)] font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="classic-panel p-6">
        <h2 className="text-2xl text-white font-bebas mb-6">SCHEDULED POSTS</h2>
        
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No scheduled posts yet. Create your first post above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-6 border border-[var(--border-color)] bg-[var(--rich-black)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(post.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {JSON.parse(post.platforms || '[]').map((platform: string) => (
                          <div key={platform} className="flex items-center gap-1">
                            {getPlatformIcon(platform)}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatDate(post.scheduledFor)}
                        {post.publishedAt && ` • Published: ${formatDate(post.publishedAt)}`}
                        {post.timesPosted > 0 && ` • Posted ${post.timesPosted} time${post.timesPosted > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(post.status === 'scheduled' || post.status === 'draft') && (
                      <>
                        <button
                          onClick={() => {
                            setPostToRefine(post);
                            setRefinementPrompt('');
                            setRefinedContent('');
                            setShowRefineModal(true);
                          }}
                          className="p-2 border border-purple-500 hover:border-purple-400 hover:bg-purple-500 transition-colors"
                          title="Refine with AI"
                        >
                          <Sparkles className="w-4 h-4 text-purple-400 hover:text-white" />
                        </button>
                        {post.status === 'draft' && (
                          <button
                            onClick={() => handleScheduleDraft(post)}
                            className="p-2 border border-green-500 hover:border-green-400 hover:bg-green-500 transition-colors"
                            title="Schedule Post"
                          >
                            <Calendar className="w-4 h-4 text-green-400 hover:text-white" />
                          </button>
                        )}
                    {post.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handlePublishNow(post)}
                          className="p-2 border border-[var(--secondary-orange)] hover:border-[var(--secondary-orange)] hover:bg-[var(--secondary-orange)] transition-colors"
                          title="Publish Now"
                        >
                          <Rocket className="w-4 h-4 text-[var(--secondary-orange)] hover:text-black" />
                        </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                      </>
                    )}
                    {post.status === 'published' && (
                      <>
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleRepost(post)}
                          className="p-2 border border-[var(--primary-mint)] hover:border-[var(--primary-mint)] hover:bg-[var(--primary-mint)] transition-colors"
                          title="Repost"
                        >
                          <Repeat className="w-4 h-4 text-[var(--primary-mint)] hover:text-black" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 border border-[var(--border-color)] hover:border-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white mb-3 whitespace-pre-wrap">{post.content}</p>
                
                {/* Display Media Assets */}
                {(() => {
                  let mediaAssets: MediaAsset[] = [];
                  if (post.mediaAssets) {
                    try {
                      mediaAssets = JSON.parse(post.mediaAssets);
                    } catch (e) {
                      console.error('Error parsing mediaAssets:', e);
                    }
                  }

                  if (mediaAssets.length > 0) {
                    return (
                      <div className={`grid gap-3 mb-3 ${mediaAssets.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                        {mediaAssets.map((asset, index) => (
                          <div
                            key={index}
                            className={`relative border border-[var(--border-color)] aspect-square overflow-hidden ${
                              mediaAssets.length === 1 ? 'max-w-md mx-auto' : 'w-full'
                            }`}
                          >
                            {asset.type === 'image' ? (
                              <Image
                                src={asset.url}
                                alt={`Media ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes={mediaAssets.length === 1 ? "512px" : "(max-width: 768px) 50vw, 33vw"}
                              />
                            ) : (
                              <video
                                src={asset.url}
                                className="w-full h-full object-cover"
                                controls
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                            <div className="absolute top-1 right-1 px-2 py-1 bg-black bg-opacity-75 text-xs">
                              {asset.type === 'video' ? (
                                <Video className="w-3 h-3 inline mr-1" />
                              ) : (
                                <ImageIcon className="w-3 h-3 inline mr-1" />
                              )}
                              {asset.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
                {post.errorMessage && (
                  <p className="text-xs text-red-400 mt-2">Error: {post.errorMessage}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Tab Content: Post Ideas */}
      {activeTab === 'ideas' && (
        <>
      {/* Post Ideas List */}
      {postIdeas.length > 0 && (
        <div className="classic-panel p-6 mt-8">
          <h2 className="text-2xl text-white font-bebas mb-6">Post Ideas</h2>
          <div className="space-y-3">
            {postIdeas.map((idea) => (
              <div key={idea.id} className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                {editingIdea?.id === idea.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editIdeaTitle}
                      onChange={(e) => setEditIdeaTitle(e.target.value)}
                      className="w-full bg-[var(--rich-black)] border border-[var(--primary-mint)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none"
                      placeholder="Idea title and description..."
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveIdea}
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-bold uppercase tracking-widest text-xs transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingIdea(null);
                          setEditIdeaTitle('');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 font-bold uppercase tracking-widest text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm text-white font-bold mb-2 whitespace-pre-wrap">{idea.title}</h3>
                      {idea.prompt && (
                        <p className="text-xs text-gray-400 mb-2 italic">Prompt: {idea.prompt}</p>
                      )}
                      <p className="text-[10px] text-gray-500 mb-2">
                        Created: {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditIdea(idea)}
                        className="p-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors"
                        title="Edit Idea"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleGeneratePostFromIdea(idea)}
                        className="px-4 py-2 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate Posts
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="p-2 border border-[var(--border-color)] hover:border-red-400 transition-colors"
                        title="Delete Idea"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {postIdeas.length === 0 && (
        <div className="classic-panel p-6">
          <div className="text-center py-12 text-gray-400">
            <p>No post ideas yet. Click "Generate Ideas" to create some!</p>
          </div>
        </div>
      )}
        </>
      )}

      {/* Refine Post Modal */}
      {showRefineModal && postToRefine && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto">
          <div className="classic-panel bg-[var(--rich-black)] max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bebas">Refine Post with AI</h2>
              <button
                onClick={() => {
                  setShowRefineModal(false);
                  setPostToRefine(null);
                  setRefinedContent('');
                  setRefinementPrompt('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  AI Integration
                </label>
                <select
                  value={selectedAiIntegration}
                  onChange={(e) => setSelectedAiIntegration(e.target.value)}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                >
                  {aiIntegrations.map(integration => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name} ({integration.provider})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Original Post
                </label>
                <div className="p-3 bg-[var(--rich-black)] border border-[var(--border-color)] text-sm text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {postToRefine.content}
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Refinement Instructions
                </label>
                <textarea
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none"
                  rows={3}
                  placeholder="e.g., Make it more engaging, add a call to action, shorten it, make it more professional..."
                />
              </div>
              <button
                onClick={handleRefine}
                disabled={refining || !refinementPrompt || !selectedAiIntegration}
                className="w-full px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {refining ? 'Refining...' : 'Refine Post'}
              </button>
              {refinedContent && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Refined Post
                    </label>
                    <div className="p-3 bg-[var(--rich-black)] border border-[var(--primary-mint)] text-sm text-white whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {refinedContent}
                    </div>
                  </div>
                  <button
                    onClick={handleApplyRefinement}
                    className="w-full px-6 py-3 bg-green-600 text-white hover:bg-green-700 font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Apply Refinement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Ideas Modal */}
      {showIdeasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto">
          <div className="classic-panel bg-[var(--rich-black)] max-w-3xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bebas">Generate Post Ideas</h2>
              <button
                onClick={() => {
                  setShowIdeasModal(false);
                  setIdeasPrompt('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  AI Integration
                </label>
                <select
                  value={selectedAiIntegration}
                  onChange={(e) => setSelectedAiIntegration(e.target.value)}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                >
                  {aiIntegrations.map(integration => (
                    <option key={integration.id} value={integration.id}>
                      {integration.name} ({integration.provider})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Prompt
                </label>
                <textarea
                  value={ideasPrompt}
                  onChange={(e) => setIdeasPrompt(e.target.value)}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none"
                  rows={4}
                  placeholder="e.g., Generate ideas about tech entrepreneurship, productivity tips, business growth..."
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Number of Ideas
                </label>
                <input
                  type="number"
                  value={ideasCount}
                  onChange={(e) => setIdeasCount(parseInt(e.target.value) || 5)}
                  min={1}
                  max={10}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                />
              </div>
              <button
                onClick={handleGenerateIdeas}
                disabled={generatingIdeas || !ideasPrompt || !selectedAiIntegration}
                className="w-full px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lightbulb className="w-4 h-4" />
                {generatingIdeas ? 'Generating...' : 'Generate Ideas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Cron Job Management */}
      {activeTab === 'cron' && (
        <div className="classic-panel p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl text-white font-bebas mb-6">CRON JOB MANAGEMENT</h2>
          
          {cronStatus ? (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="border border-[var(--border-color)] bg-[var(--rich-black)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-white font-bebas">Social Media Publishing Cron</h3>
                  <div className="flex items-center gap-2">
                    {cronStatus.running ? (
                      <>
                        <div className="w-3 h-3 bg-[var(--primary-mint)] rounded-full animate-pulse"></div>
                        <span className="text-sm text-[var(--primary-mint)] font-bold">RUNNING</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm text-gray-500 font-bold">STOPPED</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                    <span className="text-gray-400">Schedule:</span>
                    {editingSchedule ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={cronSchedule}
                          onChange={(e) => setCronSchedule(e.target.value)}
                          placeholder="*/5 * * * *"
                          className="px-2 py-1 bg-[var(--rich-black)] border border-[var(--border-color)] text-white font-mono text-sm focus:outline-none focus:border-[var(--primary-mint)] w-32"
                        />
                        <button
                          onClick={handleUpdateSchedule}
                          disabled={savingSchedule}
                          className="px-3 py-1 bg-[var(--primary-mint)] text-black hover:bg-white text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          {savingSchedule ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSchedule(false);
                            fetchCronStatus(); // Reset to current schedule
                          }}
                          disabled={savingSchedule}
                          className="px-3 py-1 bg-gray-600 text-white hover:bg-gray-700 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">{cronSchedule || cronStatus?.schedule || '*/5 * * * *'}</span>
                        <button
                          onClick={() => setEditingSchedule(true)}
                          className="text-[var(--primary-mint)] hover:text-white text-xs"
                          title="Edit schedule"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                    <span className="text-gray-400">Frequency:</span>
                    <span className="text-white">
                      {cronSchedule === '*/5 * * * *' ? 'Every 5 minutes' :
                       cronSchedule === '*/10 * * * *' ? 'Every 10 minutes' :
                       cronSchedule === '*/15 * * * *' ? 'Every 15 minutes' :
                       cronSchedule === '*/30 * * * *' ? 'Every 30 minutes' :
                       cronSchedule === '0 * * * *' ? 'Every hour' :
                       cronSchedule === '0 */2 * * *' ? 'Every 2 hours' :
                       cronSchedule === '0 */6 * * *' ? 'Every 6 hours' :
                       cronSchedule === '0 0 * * *' ? 'Daily at midnight' :
                       cronSchedule === '0 2 * * *' ? 'Daily at 2 AM' :
                       'Custom schedule'}
                    </span>
                  </div>
                  {cronStatus.nextRun && (
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                      <span className="text-gray-400">Next Run:</span>
                      <span className="text-white">
                        {new Date(cronStatus.nextRun).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Initialized:</span>
                    <span className={cronStatus.initialized ? 'text-[var(--primary-mint)]' : 'text-gray-500'}>
                      {cronStatus.initialized ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap gap-4">
                {!cronStatus.running ? (
                  <button
                    onClick={() => handleCronAction('start')}
                    disabled={cronLoading}
                    className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-4 h-4" />
                    {cronLoading ? 'Starting...' : 'Start Cron Job'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleCronAction('stop')}
                      disabled={cronLoading}
                      className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      {cronLoading ? 'Stopping...' : 'Stop Cron Job'}
                    </button>
                    <button
                      onClick={() => handleCronAction('restart')}
                      disabled={cronLoading}
                      className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {cronLoading ? 'Restarting...' : 'Restart Cron Job'}
                    </button>
                  </>
                )}
                <button
                  onClick={fetchCronStatus}
                  disabled={cronLoading}
                  className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Status
                </button>
              </div>

              {/* Info Box */}
              <div className="border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)] p-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">How it works:</strong> The cron job runs every 5 minutes and checks for scheduled posts. 
                  Posts scheduled for the current time or earlier will be published automatically. 
                  For example, a post scheduled for 8:47 will be published at the 8:50 cron run (3-minute delay).
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading cron status...</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
