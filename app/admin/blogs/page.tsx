'use client';

import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, Search } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-white font-bebas">BLOG MANAGEMENT</h1>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Blog
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div key={blog.id} className="classic-panel p-6 group">
            <div className="relative w-full h-48 mb-4 overflow-hidden border border-[var(--border-color)]">
              <Image
                src={blog.imageUrl}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-gray-600 px-2 py-0.5">
                {blog.category}
              </span>
              {blog.published ? (
                <span className="text-[9px] font-bold text-[var(--primary-mint)] uppercase tracking-widest">
                  Published
                </span>
              ) : (
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  Draft
                </span>
              )}
            </div>
            <h3 className="text-xl text-white font-bebas mb-2 line-clamp-2">{blog.title}</h3>
            <p className="text-xs text-gray-400 mb-4 line-clamp-2">{blog.excerpt}</p>
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <span className="text-[10px] text-gray-500">
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(blog)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={blog.published ? 'Unpublish' : 'Publish'}
                >
                  {blog.published ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => openEditModal(blog)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
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
                  Content
                </label>
                <Editor
                  content={formData.content}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Click on any image in the editor to edit its size and alignment
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
    </div>
  );
}

