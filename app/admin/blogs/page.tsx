'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Search, Mail, Link as LinkIcon, X, Sparkles, Linkedin, Twitter, Instagram, Rocket } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Editor from '@/components/Editor';

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  campaigns?: Array<{
    id: string;
    subject: string;
    status: string;
  }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    excerpt: '',
    hook: '',
    content: '',
    imageUrl: '',
    published: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
    },
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showLinkCampaignModal, setShowLinkCampaignModal] = useState(false);
  const [selectedBlogForLink, setSelectedBlogForLink] = useState<Blog | null>(null);
  const [showConvertToCampaignModal, setShowConvertToCampaignModal] = useState(false);
  const [selectedBlogForConvert, setSelectedBlogForConvert] = useState<Blog | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<Array<{ id: string; senderGroupId: string | null; title: string }>>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; subject: string; status: string; blogId: string | null }>>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAiGenerateModal, setShowAiGenerateModal] = useState(false);
  const [selectedBlogForAi, setSelectedBlogForAi] = useState<Blog | null>(null);
  const [aiIntegrations, setAiIntegrations] = useState<Array<{ id: string; name: string; provider: string; isActive: boolean }>>([]);
  const [aiFormData, setAiFormData] = useState({
    aiIntegrationId: '',
    prompt: '',
    platforms: [] as string[],
    platformCounts: {} as Record<string, number>, // Platform -> count mapping
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<Array<{ platform: string; content: string; images?: string[] }>>([]);
  const [blogImages, setBlogImages] = useState<string[]>([]);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    fetchBlogs();
    fetchCampaigns();
    fetchGroups();
    fetchAiIntegrations();
  }, []);

  const fetchAiIntegrations = async () => {
    try {
      const response = await fetch('/api/ai/integrations');
      if (response.ok) {
        const data = await response.json();
        setAiIntegrations(data.integrations?.filter((i: any) => i.isActive) || []);
      }
    } catch (error) {
      console.error('Error fetching AI integrations:', error);
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
    }
  };

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

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      const method = editingBlog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingBlog(null);
        setFormData({ 
          title: '', 
          slug: '',
          category: '', 
          excerpt: '', 
          hook: '',
          content: '', 
          imageUrl: '', 
          published: false,
          seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterCard: 'summary_large_image',
            twitterTitle: '',
            twitterDescription: '',
            twitterImage: '',
          },
        });
        setSlugManuallyEdited(false);
        fetchBlogs();
      } else {
        const data = await response.json();
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchBlogs();
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const togglePublish = async (blog: Blog) => {
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blog, published: !blog.published }),
      });
      if (response.ok) {
        fetchBlogs();
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prevFormData) => ({ ...prevFormData, imageUrl: data.url }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload image');
      }
    } catch (error) {
      alert('An error occurred while uploading');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      excerpt: blog.excerpt,
      hook: (blog as any).hook || '',
      content: (blog as any).content || '',
      imageUrl: blog.imageUrl,
      published: blog.published,
      seo: {
        metaTitle: blog.seo?.metaTitle || '',
        metaDescription: blog.seo?.metaDescription || '',
        keywords: blog.seo?.keywords || '',
        ogTitle: blog.seo?.ogTitle || '',
        ogDescription: blog.seo?.ogDescription || '',
        ogImage: blog.seo?.ogImage || '',
        twitterCard: blog.seo?.twitterCard || 'summary_large_image',
        twitterTitle: blog.seo?.twitterTitle || '',
        twitterDescription: blog.seo?.twitterDescription || '',
        twitterImage: blog.seo?.twitterImage || '',
      },
    });
    setSlugManuallyEdited(true);
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingBlog(null);
    setFormData({ 
      title: '', 
      slug: '', 
      category: '', 
      excerpt: '', 
      hook: '',
      content: '', 
      imageUrl: '', 
      published: false,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterCard: 'summary_large_image',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
      },
    });
    setSlugManuallyEdited(false);
    setShowModal(true);
  };

  const openConvertToCampaignModal = (blog: Blog) => {
    setSelectedBlogForConvert(blog);
    setSelectedGroupIds([]);
    setShowConvertToCampaignModal(true);
  };

  const convertToCampaign = async () => {
    if (!selectedBlogForConvert) return;

    // Validate that at least one group is selected
    if (selectedGroupIds.length === 0) {
      showMessage('error', 'Please select at least one group');
      return;
    }

    try {
      // Convert local group IDs to Sender.net group IDs
      const senderGroupIds = selectedGroupIds
        .map(localId => {
          const group = groups.find(g => g.id === localId);
          return group?.senderGroupId;
        })
        .filter((id): id is string => id !== null && id !== undefined);

      if (senderGroupIds.length === 0) {
        showMessage('error', 'Selected groups are not synced with Sender.net. Please sync groups first.');
        return;
      }

      const response = await fetch('/api/campaigns/from-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: selectedBlogForConvert.id,
          createInSender: true,
          groups: senderGroupIds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Campaign created successfully from blog');
        setShowConvertToCampaignModal(false);
        setSelectedBlogForConvert(null);
        setSelectedGroupIds([]);
        await fetchBlogs();
        await fetchCampaigns();
      } else {
        showMessage('error', data.error || 'Failed to create campaign');
      }
    } catch (error) {
      showMessage('error', 'Failed to create campaign');
    }
  };

  const linkToCampaign = async (blog: Blog, campaignId: string) => {
    try {
      const response = await fetch('/api/campaigns/link-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogId: blog.id,
          campaignId: campaignId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Blog linked to campaign successfully');
        setShowLinkCampaignModal(false);
        setSelectedBlogForLink(null);
        await fetchBlogs();
        await fetchCampaigns();
      } else {
        showMessage('error', data.error || 'Failed to link blog to campaign');
      }
    } catch (error) {
      showMessage('error', 'Failed to link blog to campaign');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const togglePlatform = (platform: string) => {
    setAiFormData(prev => {
      const isSelected = prev.platforms.includes(platform);
      const newPlatforms = isSelected
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform];
      
      // Remove count when deselecting, set default to 1 when selecting
      const newPlatformCounts = { ...prev.platformCounts };
      if (isSelected) {
        delete newPlatformCounts[platform];
      } else {
        newPlatformCounts[platform] = 1;
      }
      
      return {
        ...prev,
        platforms: newPlatforms,
        platformCounts: newPlatformCounts,
      };
    });
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

  // Extract images from HTML content
  const extractImagesFromHtml = (htmlContent: string): string[] => {
    if (!htmlContent) return [];
    
    const images: string[] = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      let src = match[1];
      
      // Skip data URIs and empty sources
      if (!src || src.startsWith('data:')) continue;
      
      // Convert relative URLs to absolute if needed
      // If it starts with /, it's already a path (will work with current domain)
      // If it starts with http/https, it's already absolute
      // Otherwise, we might need to handle it differently
      
      // Only include valid image URLs
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
        // Remove duplicates
        if (!images.includes(src)) {
          images.push(src);
        }
      }
    }
    
    return images;
  };

  const handleGeneratePosts = async () => {
    if (!selectedBlogForAi || !aiFormData.aiIntegrationId || aiFormData.platforms.length === 0 || !aiFormData.prompt) {
      showMessage('error', 'Please fill in all fields and select at least one platform');
      return;
    }

    setGenerating(true);
    setGeneratedPosts([]);

    try {
      // Fetch full blog content
      const blogResponse = await fetch(`/api/blogs/${selectedBlogForAi.id}`);
      if (!blogResponse.ok) {
        throw new Error('Failed to fetch blog content');
      }
      const blogData = await blogResponse.json();
      const fullBlog = blogData.blog;

      // Extract images from blog content
      const images = extractImagesFromHtml(fullBlog.content || '');
      // Also include the blog's main image if available
      if (fullBlog.imageUrl && !images.includes(fullBlog.imageUrl)) {
        images.unshift(fullBlog.imageUrl);
      }
      setBlogImages(images);

      // Generate posts for each platform (multiple posts per platform if count > 1)
      const posts: Array<{ platform: string; content: string; images?: string[] }> = [];
      let imageIndex = 0;
      
      for (const platform of aiFormData.platforms) {
        const count = aiFormData.platformCounts[platform] || 1;
        
        const response = await fetch('/api/ai/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blogContent: fullBlog.content,
            blogTitle: fullBlog.title,
            blogExcerpt: fullBlog.excerpt,
            prompt: aiFormData.prompt,
            platform,
            aiIntegrationId: aiFormData.aiIntegrationId,
            count,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Failed to generate posts for ${platform}`);
        }

        const data = await response.json();
        
        // If multiple posts were generated, add each one with images
        if (data.contents && Array.isArray(data.contents)) {
          data.contents.forEach((content: string) => {
            // Distribute images across posts (1 image per post, cycling through available images)
            const postImages: string[] = [];
            if (images.length > 0) {
              const imageToUse = images[imageIndex % images.length];
              postImages.push(imageToUse);
              imageIndex++;
            }
            posts.push({ platform, content, images: postImages });
          });
        } else {
          // Fallback for single post - include first image or all images if only one post
          const postImages: string[] = images.length > 0 ? [images[0]] : [];
          posts.push({ platform, content: data.content, images: postImages });
          imageIndex++;
        }
      }

      setGeneratedPosts(posts);
      showMessage('success', `Generated ${posts.length} post(s) successfully!`);
    } catch (error: any) {
      console.error('Error generating posts:', error);
      showMessage('error', error.message || 'Failed to generate posts');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreatePosts = async () => {
    if (generatedPosts.length === 0) return;

    try {
      // Create draft posts for each generated content
      const now = new Date();
      const scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      await Promise.all(
        generatedPosts.map(async (post) => {
          // Convert image URLs to mediaAssets format
          const mediaAssets = (post.images || []).map((imageUrl) => {
            // Extract filename from URL or use a default
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1] || 'image.jpg';
            
            return {
              type: 'image' as const,
              url: imageUrl,
              filename: filename,
            };
          });

          const response = await fetch('/api/social/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: post.content,
              mediaAssets: JSON.stringify(mediaAssets),
              platforms: JSON.stringify([post.platform]),
              scheduledFor: scheduledFor.toISOString(),
              status: 'draft', // Create as draft
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to create post for ${post.platform}`);
          }
        })
      );

      showMessage('success', 'Posts created successfully in draft mode!');
      setShowAiGenerateModal(false);
      setGeneratedPosts([]);
      setBlogImages([]);
      setAiFormData({ aiIntegrationId: '', prompt: '', platforms: [], platformCounts: {} });
    } catch (error: any) {
      console.error('Error creating posts:', error);
      showMessage('error', error.message || 'Failed to create posts');
    }
  };

  // Auto-generate slug from title when title changes (if not manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bebas">BLOG MANAGEMENT</h1>
        <button
          onClick={openNewModal}
          className="px-4 md:px-6 py-2 md:py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          New Blog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="classic-panel p-4 md:p-6 group">
            <div className="relative w-full h-40 md:h-48 mb-3 md:mb-4 overflow-hidden border border-[var(--border-color)]">
              <Image
                src={blog.imageUrl}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-gray-600 px-1.5 md:px-2 py-0.5 flex-shrink-0">
                {blog.category}
              </span>
              {blog.published ? (
                <span className="text-[8px] md:text-[9px] font-bold text-[var(--primary-mint)] uppercase tracking-widest flex-shrink-0">
                  Published
                </span>
              ) : (
                <span className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
                  Draft
                </span>
              )}
            </div>
            <h3 className="text-lg md:text-xl text-white font-bebas mb-2 line-clamp-2 break-words">{blog.title}</h3>
            <p className="text-[11px] md:text-xs text-gray-400 mb-3 md:mb-4 line-clamp-2 break-words">{blog.excerpt}</p>
            {blog.campaigns && blog.campaigns.length > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <Mail className="w-3 h-3 text-[var(--primary-mint)] flex-shrink-0" />
                <span className="text-[8px] md:text-[9px] text-[var(--primary-mint)] uppercase tracking-widest font-bold">
                  Linked to Campaign
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 md:pt-4 border-t border-[var(--border-color)]">
              <span className="text-[9px] md:text-[10px] text-gray-500 flex-shrink-0">
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                {!blog.campaigns || blog.campaigns.length === 0 ? (
                  <>
                    <button
                      onClick={() => openConvertToCampaignModal(blog)}
                      className="p-1.5 md:p-2 text-[var(--primary-mint)] hover:text-[var(--primary-mint)]/80 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                      title="Convert to Campaign"
                    >
                      <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBlogForLink(blog);
                        setShowLinkCampaignModal(true);
                      }}
                      className="p-1.5 md:p-2 text-blue-400 hover:text-blue-300 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                      title="Link to Existing Campaign"
                    >
                      <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedBlogForLink(blog);
                      setShowLinkCampaignModal(true);
                    }}
                    className="p-1.5 md:p-2 text-blue-400 hover:text-blue-300 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                    title="View/Change Campaign Link"
                    disabled
                  >
                    <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                )}
                <button
                  onClick={() => togglePublish(blog)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-white transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                  title={blog.published ? 'Unpublish' : 'Publish'}
                >
                  {blog.published ? (
                    <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedBlogForAi(blog);
                    setShowAiGenerateModal(true);
                    setAiFormData({ aiIntegrationId: '', prompt: '', platforms: [], platformCounts: {} });
                    setGeneratedPosts([]);
                  }}
                  className="p-1.5 md:p-2 text-purple-400 hover:text-purple-300 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                  title="Generate AI Posts"
                >
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => openEditModal(blog)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-white transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-red-400 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="classic-panel p-12 text-center">
          <p className="text-gray-400 mb-4">No blogs yet</p>
          <button
            onClick={openNewModal}
            className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Create Your First Blog
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 border z-[99999] ${
          message.type === 'success' 
            ? 'bg-green-900/20 border-green-500 text-green-400' 
            : 'bg-red-900/20 border-red-500 text-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="hover:opacity-70 ml-4">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Link Campaign Modal */}
      {showLinkCampaignModal && selectedBlogForLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
          <div className="classic-panel bg-[var(--rich-black)] max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bebas">Link Blog to Campaign</h2>
              <button
                onClick={() => {
                  setShowLinkCampaignModal(false);
                  setSelectedBlogForLink(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Select a campaign to link with <strong className="text-white">{selectedBlogForLink.title}</strong>
                </p>
                {selectedBlogForLink.campaigns && selectedBlogForLink.campaigns.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500 text-yellow-400 text-sm">
                    This blog is already linked to: <strong>{selectedBlogForLink.campaigns[0].subject}</strong>
                  </div>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {campaigns.filter(c => !c.blogId).length === 0 ? (
                  <p className="text-gray-400 text-sm">No unlinked campaigns available. All campaigns are already linked to blogs.</p>
                ) : (
                  campaigns
                    .filter(c => !c.blogId) // Only show campaigns not linked to a blog
                    .map((campaign) => (
                      <button
                        key={campaign.id}
                        onClick={() => linkToCampaign(selectedBlogForLink, campaign.id)}
                        className="w-full text-left p-4 bg-[var(--rich-black)] border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{campaign.subject}</div>
                            <div className="text-xs text-gray-400 mt-1">Status: {campaign.status}</div>
                          </div>
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto" style={{ zIndex: 99999 }}>
          <div className="classic-panel w-full max-w-4xl p-6 my-8 relative z-[99999] min-h-fit">
            <h2 className="text-2xl text-white font-bebas mb-6">
              {editingBlog ? 'EDIT BLOG' : 'CREATE BLOG'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    setSlugManuallyEdited(true);
                  }}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  placeholder="Auto-generated from title"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">URL-friendly version of the title (auto-generated, but can be edited)</p>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                    placeholder="Enter URL or upload an image"
                    required
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-3 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--primary-mint)] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 relative w-full h-32 border border-[var(--border-color)] overflow-hidden">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Hook Sentence <span className="text-gray-400">(Required - Attention-grabbing opening sentence)</span>
                </label>
                <input
                  type="text"
                  value={formData.hook}
                  onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  placeholder="e.g., What if I told you that 90% of startups fail in their first year?"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A compelling opening sentence that hooks the reader and makes them want to continue reading.
                </p>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Content
                </label>
                <Editor
                  content={formData.content}
                  onChange={(html) => {
                    // Remove leading spaces from paragraphs and ensure they start at the beginning
                    let processedHtml = html;
                    // Remove leading spaces/tabs from paragraph tags
                    processedHtml = processedHtml.replace(/<p[^>]*>\s+/g, '<p>');
                    // Remove any text-indent styles
                    processedHtml = processedHtml.replace(/text-indent:\s*[^;]+;?/gi, '');
                    // Remove padding-left from paragraphs
                    processedHtml = processedHtml.replace(/padding-left:\s*[^;]+;?/gi, '');
                    setFormData({ ...formData, content: processedHtml });
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Click on any image in the editor to edit its size and alignment. Paragraphs will automatically start at the beginning with no indentation.
                </p>
              </div>

              {/* SEO Section */}
              <div className="border-t border-[var(--border-color)] pt-4 mt-6">
                <h3 className="text-lg text-white font-bebas mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  SEO Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle}
                      onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                      className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                      placeholder="Leave empty to use blog title"
                    />
                    <p className="text-xs text-gray-500 mt-1">Title for search engines (recommended: 50-60 characters)</p>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.seo.metaDescription}
                      onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                      className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat"
                      rows={2}
                      placeholder="Leave empty to use excerpt"
                    />
                    <p className="text-xs text-gray-500 mt-1">Description for search engines (recommended: 150-160 characters)</p>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seo.keywords}
                      onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, keywords: e.target.value } })}
                      className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
                  </div>

                  <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                    <h4 className="text-sm text-white font-bold mb-3">Open Graph (Facebook, LinkedIn)</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          OG Title
                        </label>
                        <input
                          type="text"
                          value={formData.seo.ogTitle}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, ogTitle: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                          placeholder="Leave empty to use meta title"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          OG Description
                        </label>
                        <textarea
                          value={formData.seo.ogDescription}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, ogDescription: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat"
                          rows={2}
                          placeholder="Leave empty to use meta description"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          OG Image URL
                        </label>
                        <input
                          type="text"
                          value={formData.seo.ogImage}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, ogImage: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                          placeholder="Leave empty to use blog image"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                    <h4 className="text-sm text-white font-bold mb-3">Twitter Card</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          Twitter Card Type
                        </label>
                        <select
                          value={formData.seo.twitterCard}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, twitterCard: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">Summary Large Image</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          Twitter Title
                        </label>
                        <input
                          type="text"
                          value={formData.seo.twitterTitle}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, twitterTitle: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                          placeholder="Leave empty to use OG title"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          Twitter Description
                        </label>
                        <textarea
                          value={formData.seo.twitterDescription}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, twitterDescription: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none font-montserrat"
                          rows={2}
                          placeholder="Leave empty to use OG description"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                          Twitter Image URL
                        </label>
                        <input
                          type="text"
                          value={formData.seo.twitterImage}
                          onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, twitterImage: e.target.value } })}
                          className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                          placeholder="Leave empty to use OG image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm text-white">
                  Publish immediately
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--primary-mint)] text-black hover:bg-white font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                >
                  {editingBlog ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBlog(null);
                  }}
                  className="flex-1 border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)] font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Campaign Modal */}
      {showConvertToCampaignModal && selectedBlogForConvert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
          <div className="classic-panel bg-[var(--rich-black)] max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bebas">Convert Blog to Campaign</h2>
              <button
                onClick={() => {
                  setShowConvertToCampaignModal(false);
                  setSelectedBlogForConvert(null);
                  setSelectedGroupIds([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Select groups for <strong className="text-white">{selectedBlogForConvert.title}</strong>
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">
                  Groups <span className="text-red-400">*</span>
                </label>
                {groups.length === 0 ? (
                  <div className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-gray-400">
                    No groups available. Please create groups first.
                  </div>
                ) : (
                  <>
                    <select
                      multiple
                      required
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
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple groups. At least one group is required.</p>
                  </>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={convertToCampaign}
                  className="px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Create Campaign
                </button>
                <button
                  onClick={() => {
                    setShowConvertToCampaignModal(false);
                    setSelectedBlogForConvert(null);
                    setSelectedGroupIds([]);
                  }}
                  className="px-6 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Posts Modal */}
      {showAiGenerateModal && selectedBlogForAi && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto">
          <div className="classic-panel bg-[var(--rich-black)] max-w-4xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bebas">Generate AI Posts from Blog</h2>
              <button
                onClick={() => {
                  setShowAiGenerateModal(false);
                  setSelectedBlogForAi(null);
                  setGeneratedPosts([]);
                  setBlogImages([]);
                  setAiFormData({ aiIntegrationId: '', prompt: '', platforms: [], platformCounts: {} });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Generating posts for: <strong className="text-white">{selectedBlogForAi.title}</strong>
                </p>
              </div>

              {aiIntegrations.length === 0 ? (
                <div className="p-4 border border-yellow-500 bg-yellow-900/20 text-yellow-400">
                  <p className="text-sm">No active AI integrations found. Please create an AI integration first.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      AI Integration
                    </label>
                    <select
                      value={aiFormData.aiIntegrationId}
                      onChange={(e) => setAiFormData({ ...aiFormData, aiIntegrationId: e.target.value })}
                      className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                      required
                    >
                      <option value="">Select AI Integration</option>
                      {aiIntegrations.map(integration => (
                        <option key={integration.id} value={integration.id}>
                          {integration.name} ({integration.provider})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Prompt / Instructions
                    </label>
                    <textarea
                      value={aiFormData.prompt}
                      onChange={(e) => setAiFormData({ ...aiFormData, prompt: e.target.value })}
                      className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none"
                      rows={4}
                      placeholder="e.g., Create an engaging post that highlights the key takeaways, use a professional tone, include a call to action..."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                      Platforms & Post Count
                    </label>
                    <p className="text-xs text-gray-400 mb-3">
                      Select platforms and specify how many posts to generate for each (default: 1)
                    </p>
                    <div className="space-y-3">
                      {['linkedin', 'twitter', 'instagram', 'threads'].map((platform) => (
                        <div key={platform} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => togglePlatform(platform)}
                            className={`px-4 py-2 border flex items-center gap-2 transition-colors flex-shrink-0 ${
                              aiFormData.platforms.includes(platform)
                                ? 'border-[var(--primary-mint)] bg-[var(--primary-mint)] text-black'
                                : 'border-[var(--border-color)] text-white hover:border-[var(--primary-mint)]'
                            }`}
                          >
                            {getPlatformIcon(platform)}
                            <span className="text-xs font-bold uppercase">{platform}</span>
                          </button>
                          {aiFormData.platforms.includes(platform) && (
                            <div className="flex items-center gap-2 flex-1">
                              <label className="text-xs text-gray-400 whitespace-nowrap">Posts:</label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={aiFormData.platformCounts[platform] || 1}
                                onChange={(e) => {
                                  const count = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                                  setAiFormData({
                                    ...aiFormData,
                                    platformCounts: {
                                      ...aiFormData.platformCounts,
                                      [platform]: count,
                                    },
                                  });
                                }}
                                className="w-20 bg-[var(--rich-black)] border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all"
                                placeholder="1"
                              />
                              <span className="text-xs text-gray-500">(1-20)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGeneratePosts}
                    disabled={generating || !aiFormData.aiIntegrationId || aiFormData.platforms.length === 0 || !aiFormData.prompt}
                    className="w-full px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate Posts'}
                  </button>

                  {blogImages.length > 0 && (
                    <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)] rounded">
                      <p className="text-xs text-gray-400 mb-2">
                        Found {blogImages.length} image(s) from blog - will be distributed across posts
                      </p>
                    </div>
                  )}

                  {generatedPosts.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg text-white font-bebas">Generated Posts</h3>
                      {generatedPosts.map((post, index) => (
                        <div key={index} className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                          <div className="flex items-center gap-2 mb-2">
                            {getPlatformIcon(post.platform)}
                            <span className="text-sm font-bold text-white uppercase">{post.platform}</span>
                            {post.images && post.images.length > 0 && (
                              <span className="text-xs text-gray-400 ml-auto">
                                ({post.images.length} image{post.images.length > 1 ? 's' : ''})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white whitespace-pre-wrap mb-3">{post.content}</p>
                          {post.images && post.images.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                              <p className="text-xs text-gray-400 mb-2">Attached Images:</p>
                              <div className="flex flex-wrap gap-2">
                                {post.images.map((imageUrl, imgIndex) => (
                                  <div key={imgIndex} className="relative">
                                    <img
                                      src={imageUrl}
                                      alt={`Post image ${imgIndex + 1}`}
                                      className="w-20 h-20 object-cover border border-[var(--border-color)] rounded"
                                      onError={(e) => {
                                        // Hide broken images
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={handleCreatePosts}
                        className="w-full px-6 py-3 bg-green-600 text-white hover:bg-green-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Rocket className="w-4 h-4" />
                        Create Posts as Drafts
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

