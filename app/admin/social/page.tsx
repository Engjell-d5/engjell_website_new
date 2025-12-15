'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Lightbulb, XCircle, RefreshCw, Linkedin, Twitter, Instagram, Rocket, CheckCircle, Clock, X, Sparkles } from 'lucide-react';
import type { SocialPost, SocialConnection, MediaAsset, PostIdea } from '@/types/admin';
import ConnectionsTab from '@/components/admin/social/ConnectionsTab';
import PostsTab from '@/components/admin/social/PostsTab';
import IdeasTab from '@/components/admin/social/IdeasTab';
import CronTab from '@/components/admin/social/CronTab';

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
    mentions: [] as Array<{ 
      type: 'person' | 'organization';
      member?: string; // Person URN (urn:li:person:12345)
      organization?: string; // Organization URN (urn:li:organization:12345)
      firstName?: string;
      lastName?: string;
      headline?: string;
      name?: string; // Organization name
    }>,
  });
  const [mentionAutocomplete, setMentionAutocomplete] = useState<{
    show: boolean;
    query: string;
    results: Array<{ 
      type: 'person' | 'organization';
      member?: string;
      organization?: string;
      firstName?: string;
      lastName?: string;
      headline?: string;
      name?: string;
      photo?: string;
    }>;
    selectedIndex: number;
    position: { top: number; left: number };
    searching: boolean;
  } | null>(null);
  const [selectedLinkedInOrgUrn, setSelectedLinkedInOrgUrn] = useState('');
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get LinkedIn organizations from connection
  const linkedInConnection = connections.find(c => c.platform === 'linkedin' && c.isActive);
  const linkedInOrgUrns: Array<{ id: string; name: string; urn: string }> = linkedInConnection?.organizations 
    ? (() => {
        try {
          const parsed = JSON.parse(linkedInConnection.organizations);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    : [];
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
  const [generatingPostsFromIdea, setGeneratingPostsFromIdea] = useState<string | null>(null);
  const [postsToGenerate, setPostsToGenerate] = useState<number>(3); // Default to 3 posts
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set()); // Track which posts are expanded
  const [searchQuery, setSearchQuery] = useState(''); // Search query for posts
  const [statusFilter, setStatusFilter] = useState<string>('scheduled'); // Filter by status: 'all', 'scheduled', 'published', 'draft', 'failed'
  const [platformFilter, setPlatformFilter] = useState<string>('all'); // Filter by platform: 'all', 'linkedin', 'twitter', 'instagram', 'threads'
  const [creatingPostsFromPost, setCreatingPostsFromPost] = useState(false); // Track if creating posts from post
  const [targetPlatformForPosts, setTargetPlatformForPosts] = useState<string>('threads'); // Target platform for generated posts
  const [postsToCreateFromPost, setPostsToCreateFromPost] = useState<number>(3); // Number of posts to create
  const [adaptationPrompt, setAdaptationPrompt] = useState(''); // Prompt for adapting the post

  // Helper function to remove indentation from content
  const removeIndentationFromContent = (content: string): string => {
    if (!content) return content;
    
    // Split into lines
    const lines = content.split('\n');
    
    // Find the minimum indentation (excluding empty lines)
    let minIndent = Infinity;
    for (const line of lines) {
      if (line.trim().length > 0) {
        const indent = line.match(/^\s*/)?.[0].length || 0;
        if (indent < minIndent) {
          minIndent = indent;
        }
      }
    }
    
    // If no indentation found, return as is
    if (minIndent === Infinity || minIndent === 0) {
      return content;
    }
    
    // Remove the minimum indentation from each line
    return lines.map(line => {
      if (line.trim().length === 0) {
        return line; // Preserve empty lines
      }
      return line.substring(minIndent);
    }).join('\n');
  };

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
            mentions: JSON.stringify(formData.mentions),
          }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingPost(null);
        setFormData({ content: '', mediaAssets: [], platforms: [], scheduledFor: '', comments: [], mentions: [] });
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
    
    // Parse mentions
    let mentions: Array<{ 
      type: 'person' | 'organization';
      member?: string;
      organization?: string;
      firstName?: string;
      lastName?: string;
      headline?: string;
      name?: string;
    }> = [];
    if ((post as any).mentions) {
      try {
        const parsedMentions = JSON.parse((post as any).mentions);
        // Convert old format mentions (without type) to new format
        mentions = Array.isArray(parsedMentions) ? parsedMentions.map((m: any) => {
          if (m.type) {
            return m; // Already has type
          } else if (m.member) {
            // Old person mention format
            return {
              type: 'person' as const,
              member: m.member,
              firstName: m.firstName,
              lastName: m.lastName,
              headline: m.headline || '',
            };
          } else if (m.organization) {
            // Old organization mention format
            return {
              type: 'organization' as const,
              organization: m.organization,
              name: m.name,
            };
          }
          return m;
        }) : [];
      } catch (e) {
        console.error('Error parsing mentions:', e);
      }
    }
    
    setFormData({
      content: post.content,
      mediaAssets,
      platforms: JSON.parse(post.platforms || '[]'),
      scheduledFor: utcToLocalDateTime(post.scheduledFor),
      comments,
      mentions,
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
    // Clear mentions and selected organization if LinkedIn is deselected
    if (platform === 'linkedin' && formData.platforms.includes('linkedin')) {
      setFormData(prev => ({ ...prev, mentions: [] }));
      setMentionAutocomplete(null);
      setSelectedLinkedInOrgUrn('');
    }
  };

  const searchMentions = async (query: string) => {
    if (!selectedLinkedInOrgUrn || query.trim().length < 3) {
      // If query is less than 3 chars, still search organizations
      const orgResults = linkedInOrgUrns
        .filter(org => org.name.toLowerCase().includes(query.toLowerCase()))
        .map(org => ({
          type: 'organization' as const,
          organization: org.urn,
          name: org.name,
        }));
      return orgResults;
    }

    const results: Array<{
      type: 'person' | 'organization';
      member?: string;
      organization?: string;
      firstName?: string;
      lastName?: string;
      headline?: string;
      name?: string;
      photo?: string;
    }> = [];

    // Search organizations from the connection
    const orgResults = linkedInOrgUrns
      .filter(org => org.name.toLowerCase().includes(query.toLowerCase()))
      .map(org => ({
        type: 'organization' as const,
        organization: org.urn,
        name: org.name,
      }));
    results.push(...orgResults);

    // Search people from LinkedIn API
    // Note: This requires Partner API access or special permissions from LinkedIn
    // If unavailable, the API will return empty results and organizations will still work
    try {
      const response = await fetch(
        `/api/social/linkedin/mentions?keywords=${encodeURIComponent(query.trim())}&organizationUrn=${encodeURIComponent(selectedLinkedInOrgUrn)}`
      );

      if (response.ok) {
        const data = await response.json();
        const peopleResults = (data.people || []).map((person: any) => ({
          type: 'person' as const,
          member: person.member,
          firstName: person.firstName,
          lastName: person.lastName,
          headline: person.headline,
          photo: person.photo,
        }));
        results.push(...peopleResults);
      } else if (response.status === 400) {
        // Validation error - don't show people results for invalid queries
        const errorData = await response.json().catch(() => ({}));
        console.warn('LinkedIn people search validation error:', errorData.details);
      } else {
        // Other errors (including 403 permission errors) - silently fail
        // People search is optional, organizations will still work
        console.debug('LinkedIn people search not available or failed');
      }
    } catch (error) {
      // Network or other errors - silently fail, organizations will still work
      console.debug('Error searching people mentions:', error);
    }

    return results;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setFormData(prev => ({ ...prev, content: value }));

    // Defer mention autocomplete logic to avoid setState during render warning
    setTimeout(() => {
      // Check if we're typing after "@" for LinkedIn mentions
      const currentPlatforms = formData.platforms;
      if (currentPlatforms.includes('linkedin') && (selectedLinkedInOrgUrn || linkedInOrgUrns.length > 0)) {
      // Find the last "@" before cursor
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        // Check if there's a space or newline after @ (if so, it's not a mention)
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          const mentionQuery = textAfterAt;
          
          // Get textarea position for dropdown
          const textarea = e.target;
          const rect = textarea.getBoundingClientRect();
          const scrollTop = textarea.scrollTop;
          
          // Calculate position (approximate, based on cursor)
          const lines = textBeforeCursor.split('\n');
          const currentLine = lines.length - 1;
          const lineHeight = 20; // Approximate line height
          const top = rect.top + (currentLine * lineHeight) - scrollTop + 30;
          const left = rect.left + 10;
          
          if (mentionQuery.length > 0) {
            setMentionAutocomplete({
              show: true,
              query: mentionQuery,
              results: [],
              selectedIndex: 0,
              position: { top, left },
              searching: mentionQuery.length >= 3,
            });
            
            // Search for mentions asynchronously (organizations show immediately, people need 3+ chars)
            searchMentions(mentionQuery).then(results => {
              setMentionAutocomplete(prev => prev ? {
                ...prev,
                results,
                searching: false,
              } : null);
            });
          } else {
            setMentionAutocomplete(null);
          }
        } else {
          setMentionAutocomplete(null);
        }
      } else {
        setMentionAutocomplete(null);
      }
    } else {
      setMentionAutocomplete(null);
    }
    }, 0);
  };

  const insertMention = (mention: {
    type: 'person' | 'organization';
    member?: string;
    organization?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    name?: string;
  }) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const value = formData.content;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      let mentionText: string;
      let mentionData: any;
      
      if (mention.type === 'person' && mention.firstName && mention.lastName) {
        mentionText = `@${mention.firstName} ${mention.lastName}`;
        mentionData = {
          type: 'person' as const,
          member: mention.member,
          firstName: mention.firstName,
          lastName: mention.lastName,
          headline: mention.headline || '',
        };
      } else if (mention.type === 'organization' && mention.name && mention.organization) {
        mentionText = `@${mention.name}`;
        mentionData = {
          type: 'organization' as const,
          organization: mention.organization,
          name: mention.name,
        };
      } else {
        return; // Invalid mention data
      }
      
      // Replace from @ to cursor with the mention
      const newContent = 
        value.substring(0, lastAtIndex) + 
        mentionText + 
        value.substring(cursorPosition);
      
      // Update mentions array
      const existingMentions = formData.mentions || [];
      const isDuplicate = mention.type === 'person'
        ? existingMentions.some(m => m.type === 'person' && m.member === mention.member)
        : existingMentions.some(m => m.type === 'organization' && m.organization === mention.organization);
      
      if (!isDuplicate) {
        setFormData(prev => ({
          ...prev,
          content: newContent,
          mentions: [...existingMentions, mentionData],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          content: newContent,
        }));
      }
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newPosition = lastAtIndex + mentionText.length;
        textarea.setSelectionRange(newPosition, newPosition);
        textarea.focus();
      }, 0);
    }
    
    setMentionAutocomplete(null);
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionAutocomplete?.show && mentionAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionAutocomplete(prev => prev && prev.results ? {
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, prev.results.length - 1),
        } : null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionAutocomplete(prev => prev ? {
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        } : null);
      } else if (e.key === 'Enter' && mentionAutocomplete.results && mentionAutocomplete.results.length > 0) {
        e.preventDefault();
        const selectedPerson = mentionAutocomplete.results[mentionAutocomplete.selectedIndex];
        if (selectedPerson) {
          insertMention(selectedPerson);
        }
      } else if (e.key === 'Escape') {
        setMentionAutocomplete(null);
      }
    }
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
        return (
          <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512" className="w-4 h-4" fill="currentColor">
            <path d="M105 0h302c57.75 0 105 47.25 105 105v302c0 57.75-47.25 105-105 105H105C47.25 512 0 464.75 0 407V105C0 47.25 47.25 0 105 0z"/>
            <path fillRule="nonzero" d="M337.36 243.58c-1.46-.7-2.95-1.38-4.46-2.02-2.62-48.36-29.04-76.05-73.41-76.33-25.6-.17-48.52 10.27-62.8 31.94l24.4 16.74c10.15-15.4 26.08-18.68 37.81-18.68h.4c14.61.09 25.64 4.34 32.77 12.62 5.19 6.04 8.67 14.37 10.39 24.89-12.96-2.2-26.96-2.88-41.94-2.02-42.18 2.43-69.3 27.03-67.48 61.21.92 17.35 9.56 32.26 24.32 42.01 12.48 8.24 28.56 12.27 45.26 11.35 22.07-1.2 39.37-9.62 51.45-25.01 9.17-11.69 14.97-26.84 17.53-45.92 10.51 6.34 18.3 14.69 22.61 24.73 7.31 17.06 7.74 45.1-15.14 67.96-20.04 20.03-44.14 28.69-80.55 28.96-40.4-.3-70.95-13.26-90.81-38.51-18.6-23.64-28.21-57.79-28.57-101.5.36-43.71 9.97-77.86 28.57-101.5 19.86-25.25 50.41-38.21 90.81-38.51 40.68.3 71.76 13.32 92.39 38.69 10.11 12.44 17.73 28.09 22.76 46.33l28.59-7.63c-6.09-22.45-15.67-41.8-28.72-57.85-26.44-32.53-65.1-49.19-114.92-49.54h-.2c-49.72.35-87.96 17.08-113.64 49.73-22.86 29.05-34.65 69.48-35.04 120.16v.24c.39 50.68 12.18 91.11 35.04 120.16 25.68 32.65 63.92 49.39 113.64 49.73h.2c44.2-.31 75.36-11.88 101.03-37.53 33.58-33.55 32.57-75.6 21.5-101.42-7.94-18.51-23.08-33.55-43.79-43.48zm-76.32 71.76c-18.48 1.04-37.69-7.26-38.64-25.03-.7-13.18 9.38-27.89 39.78-29.64 3.48-.2 6.9-.3 10.25-.3 11.04 0 21.37 1.07 30.76 3.13-3.5 43.74-24.04 50.84-42.15 51.84z"/>
          </svg>
        );
      case 'all':
        return null; // No icon for "all" filter
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

  const handleRefinePost = (post: SocialPost) => {
    setPostToRefine(post);
    setRefinementPrompt('');
    setRefinedContent('');
    setAdaptationPrompt('');
    setTargetPlatformForPosts('threads');
    setPostsToCreateFromPost(3);
    setShowRefineModal(true);
  };

  // Convert UTC datetime to local datetime string for datetime-local input
  // Format: YYYY-MM-DDTHH:mm (no timezone, local time)
  const utcToLocalDateTime = (utcString: string): string => {
    const date = new Date(utcString);
    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  const handleCreatePostsFromPost = async () => {
    if (!postToRefine || !selectedAiIntegration) {
      setMessage({ type: 'error', text: 'Please select an AI integration' });
      return;
    }

    setCreatingPostsFromPost(true);
    try {
      // Determine adaptation prompt based on platform
      const currentPlatforms = JSON.parse(postToRefine.platforms || '[]');
      const currentPlatform = currentPlatforms[0] || 'linkedin';
      
      let prompt = '';
      if (currentPlatform === 'linkedin' && (targetPlatformForPosts === 'threads' || targetPlatformForPosts === 'twitter')) {
        // Break down long LinkedIn post into multiple shorter posts
        prompt = `Break down this LinkedIn post into ${postsToCreateFromPost} separate, shorter posts optimized for ${targetPlatformForPosts}. Each post should be concise, engaging, and can stand alone. ${adaptationPrompt ? `Additional instructions: ${adaptationPrompt}` : ''}`;
      } else if ((currentPlatform === 'threads' || currentPlatform === 'twitter') && targetPlatformForPosts === 'linkedin') {
        // Expand short post into longer LinkedIn post
        prompt = `Expand this ${currentPlatform} post into a more detailed, professional LinkedIn post. Make it longer and more comprehensive while maintaining the core message. ${adaptationPrompt ? `Additional instructions: ${adaptationPrompt}` : ''}`;
      } else {
        // Adapt for different platform or create variations
        prompt = `Create ${postsToCreateFromPost} ${targetPlatformForPosts} post${postsToCreateFromPost > 1 ? 's' : ''} based on this post. ${adaptationPrompt ? `Additional instructions: ${adaptationPrompt}` : ''}`;
      }

      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${prompt}\n\nOriginal post:\n${postToRefine.content}`,
          platform: targetPlatformForPosts,
          aiIntegrationId: selectedAiIntegration,
          count: postsToCreateFromPost,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate posts');
      }

      const data = await response.json();
      const generatedContents = data.contents || (data.content ? [data.content] : []); // Use contents array if available

      if (!generatedContents || generatedContents.length === 0) {
        throw new Error('No content generated. Please try again.');
      }

      // Create posts for each generated content
      const createdPosts = [];
      // Set scheduledFor to 24 hours from now for draft posts
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      for (let i = 0; i < generatedContents.length; i++) {
        let content = generatedContents[i];
        
        // Validate content is not empty
        if (!content || !content.trim()) {
          console.warn(`Skipping empty content for post ${i + 1}`);
          continue;
        }
        
        // Remove indentation from content
        content = removeIndentationFromContent(content);
        
        const postResponse = await fetch('/api/social/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: content.trim(),
            mediaAssets: JSON.stringify([]), // No media for generated posts
            platforms: JSON.stringify([targetPlatformForPosts]),
            scheduledFor: scheduledFor,
            comments: JSON.stringify([]),
            status: 'draft',
          }),
        });

        if (postResponse.ok) {
          createdPosts.push(await postResponse.json());
        } else {
          const error = await postResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to create post ${i + 1}: ${error.error || 'Unknown error'}`);
        }
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully created ${createdPosts.length} ${targetPlatformForPosts} post${createdPosts.length > 1 ? 's' : ''} as draft${createdPosts.length > 1 ? 's' : ''}!` 
      });
      setShowRefineModal(false);
      setPostToRefine(null);
      setRefinedContent('');
      setRefinementPrompt('');
      setAdaptationPrompt('');
      fetchPosts();
    } catch (error: any) {
      console.error('Error creating posts from post:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create posts' });
    } finally {
      setCreatingPostsFromPost(false);
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

    setGeneratingPostsFromIdea(idea.id);
    try {
      // Generate multiple posts from the idea
          const response = await fetch('/api/ai/generate-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${idea.prompt}\n\nIdea: ${idea.title}`,
          platform: 'linkedin', // Default platform, user can change later
              aiIntegrationId: selectedAiIntegration,
          count: postsToGenerate, // Generate multiple posts
            }),
          });

          if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate posts');
          }

          const data = await response.json();
      const generatedContents = data.contents || [data.content]; // Use contents array if available

      if (!generatedContents || generatedContents.length === 0) {
        throw new Error('No posts were generated');
      }

      // Create separate draft posts for each generated content
      const now = new Date();
      const scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const createdPosts = await Promise.all(
        generatedContents.map(async (content: string, index: number) => {
          const response = await fetch('/api/social/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: content.trim(),
              mediaAssets: JSON.stringify([]),
              platforms: JSON.stringify(['linkedin']), // Default to LinkedIn, user can add more platforms later
              scheduledFor: scheduledFor.toISOString(),
              status: 'draft',
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create post ${index + 1}`);
          }

          return response.json();
        })
      );

      setMessage({ 
        type: 'success', 
        text: `Successfully generated ${createdPosts.length} separate posts from idea and created as drafts!` 
      });
      fetchPosts();
    } catch (error: any) {
      console.error('Error generating posts from idea:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to generate posts from idea' });
    } finally {
      setGeneratingPostsFromIdea(null);
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
              setFormData({ content: '', mediaAssets: [], platforms: [], scheduledFor: '', comments: [], mentions: [] });
            setMentionAutocomplete(null);
            setSelectedLinkedInOrgUrn('');
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
        <ConnectionsTab
          connections={connections}
          onDisconnect={handleDisconnect}
          onRefresh={fetchConnections}
        />
      )}

      {/* Tab Content: Scheduled Posts */}
      {activeTab === 'posts' && (
        <PostsTab
          posts={posts}
          loading={loading}
          showForm={showForm}
          editingPost={editingPost}
          formData={formData}
          mentionAutocomplete={mentionAutocomplete}
          selectedLinkedInOrgUrn={selectedLinkedInOrgUrn}
          linkedInOrgUrns={linkedInOrgUrns}
          uploading={uploading}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          platformFilter={platformFilter}
          expandedPosts={expandedPosts}
          onShowFormChange={setShowForm}
          onEditingPostChange={setEditingPost}
          onFormDataChange={setFormData}
          onMentionAutocompleteChange={setMentionAutocomplete}
          onSelectedLinkedInOrgUrnChange={setSelectedLinkedInOrgUrn}
          onSearchQueryChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onPlatformFilterChange={setPlatformFilter}
          onExpandedPostsChange={setExpandedPosts}
          onActiveTabChange={setActiveTab}
          handleSubmit={handleSubmit}
          handleContentChange={handleContentChange}
          handleContentKeyDown={handleContentKeyDown}
          insertMention={insertMention}
          togglePlatform={togglePlatform}
          handleFileSelect={handleFileSelect}
          removeMediaAsset={removeMediaAsset}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handlePublishNow={handlePublishNow}
          handleRepost={handleRepost}
          handleScheduleDraft={handleScheduleDraft}
          formatDate={formatDate}
          onRefinePost={handleRefinePost}
        />
      )}

      {/* Tab Content: Post Ideas */}
      {activeTab === 'ideas' && (
        <IdeasTab
          postIdeas={postIdeas}
          editingIdea={editingIdea}
          editIdeaTitle={editIdeaTitle}
          postsToGenerate={postsToGenerate}
          generatingPostsFromIdea={generatingPostsFromIdea}
          onEditIdea={handleEditIdea}
          onSaveIdea={handleSaveIdea}
          onCancelEdit={() => {
            setEditingIdea(null);
            setEditIdeaTitle('');
          }}
          onDeleteIdea={handleDeleteIdea}
          onGeneratePostsFromIdea={handleGeneratePostFromIdea}
          onPostsToGenerateChange={setPostsToGenerate}
          onEditIdeaTitleChange={setEditIdeaTitle}
        />
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
                  setAdaptationPrompt('');
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
              <div className="flex gap-3">
                <button
                  onClick={handleRefine}
                  disabled={refining || !refinementPrompt || !selectedAiIntegration}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {refining ? 'Refining...' : 'Refine Post'}
                </button>
              </div>
              
              {/* Create Posts From Post Section */}
              <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-3 block">
                  Create Additional Posts
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                        Target Platform
                      </label>
                      <select
                        value={targetPlatformForPosts}
                        onChange={(e) => setTargetPlatformForPosts(e.target.value)}
                        className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter</option>
                        <option value="instagram">Instagram</option>
                        <option value="threads">Threads</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                        Number of Posts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={postsToCreateFromPost}
                        onChange={(e) => setPostsToCreateFromPost(parseInt(e.target.value) || 1)}
                        className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Additional Instructions (Optional)
                    </label>
                    <textarea
                      value={adaptationPrompt}
                      onChange={(e) => setAdaptationPrompt(e.target.value)}
                      className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-y min-h-[60px]"
                      rows={2}
                      placeholder="e.g., Make them more casual, add emojis, focus on different aspects..."
                    />
                  </div>
                  <button
                    onClick={handleCreatePostsFromPost}
                    disabled={creatingPostsFromPost || !selectedAiIntegration}
                    className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    {creatingPostsFromPost ? 'Creating Posts...' : `Create ${postsToCreateFromPost} ${targetPlatformForPosts} Post${postsToCreateFromPost > 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
              
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
        <CronTab
          cronStatus={cronStatus}
          cronLoading={cronLoading}
          cronSchedule={cronSchedule}
          editingSchedule={editingSchedule}
          savingSchedule={savingSchedule}
          onCronAction={handleCronAction}
          onUpdateSchedule={handleUpdateSchedule}
          onRefreshStatus={fetchCronStatus}
          onScheduleChange={setCronSchedule}
          onEditingScheduleChange={setEditingSchedule}
        />
      )}

    </div>
  );
}
