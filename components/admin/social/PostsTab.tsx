'use client';

import { useRef, useState } from 'react';
import { Calendar, Image as ImageIcon, Send, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Linkedin, Twitter, Instagram, Rocket, Video, X, Upload, Repeat, Sparkles, Search, Filter, List } from 'lucide-react';
import Image from 'next/image';
import DateTimePicker from '@/components/DateTimePicker';
import PostsCalendarView from './PostsCalendarView';
import type { SocialPost, MediaAsset } from '@/types/admin';

interface PostsTabProps {
  posts: SocialPost[];
  loading: boolean;
  showForm: boolean;
  editingPost: SocialPost | null;
  formData: {
    content: string;
    mediaAssets: MediaAsset[];
    platforms: string[];
    scheduledFor: string;
    comments: string[];
    mentions: Array<{
      type: 'person' | 'organization';
      member?: string;
      organization?: string;
      firstName?: string;
      lastName?: string;
      headline?: string;
      name?: string;
    }>;
  };
  mentionAutocomplete: {
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
  } | null;
  selectedLinkedInOrgUrn: string;
  linkedInOrgUrns: Array<{ id: string; name: string; urn: string }>;
  uploading: boolean;
  searchQuery: string;
  statusFilter: string;
  platformFilter: string;
  expandedPosts: Set<string>;
  onShowFormChange: (show: boolean) => void;
  onEditingPostChange: (post: SocialPost | null) => void;
  onFormDataChange: (data: PostsTabProps['formData']) => void;
  onMentionAutocompleteChange: (autocomplete: PostsTabProps['mentionAutocomplete']) => void;
  onSelectedLinkedInOrgUrnChange: (urn: string) => void;
  onSearchQueryChange: (query: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onPlatformFilterChange: (filter: string) => void;
  onExpandedPostsChange: (expanded: Set<string>) => void;
  onActiveTabChange: (tab: 'connections' | 'posts' | 'ideas' | 'cron') => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleContentKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  insertMention: (mention: {
    type: 'person' | 'organization';
    member?: string;
    organization?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    name?: string;
  }) => void;
  togglePlatform: (platform: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeMediaAsset: (index: number) => void;
  handleEdit: (post: SocialPost) => void;
  handleDelete: (id: string) => void;
  handlePublishNow: (post: SocialPost) => void;
  handleRepost: (post: SocialPost) => void;
  handleScheduleDraft: (post: SocialPost) => void;
  formatDate: (dateString: string) => string;
  getPlatformIcon?: (platform: string) => JSX.Element | null;
  getStatusIcon?: (status: string) => JSX.Element;
  onRefinePost: (post: SocialPost) => void;
}

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
      return null;
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

export default function PostsTab({
  posts,
  loading,
  showForm,
  editingPost,
  formData,
  mentionAutocomplete,
  selectedLinkedInOrgUrn,
  linkedInOrgUrns,
  uploading,
  searchQuery,
  statusFilter,
  platformFilter,
  expandedPosts,
  onShowFormChange,
  onEditingPostChange,
  onFormDataChange,
  onMentionAutocompleteChange,
  onSelectedLinkedInOrgUrnChange,
  onSearchQueryChange,
  onStatusFilterChange,
  onPlatformFilterChange,
  onExpandedPostsChange,
  onActiveTabChange,
  handleSubmit,
  handleContentChange,
  handleContentKeyDown,
  insertMention,
  togglePlatform,
  handleFileSelect,
  removeMediaAsset,
  handleEdit,
  handleDelete,
  handlePublishNow,
  handleRepost,
  handleScheduleDraft,
  formatDate,
  getPlatformIcon: getPlatformIconProp,
  getStatusIcon: getStatusIconProp,
  onRefinePost,
}: PostsTabProps) {
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const getPlatformIconFn = getPlatformIconProp || getPlatformIcon;
  const getStatusIconFn = getStatusIconProp || getStatusIcon;

  const handleCloseForm = () => {
    onShowFormChange(false);
    onEditingPostChange(null);
    onFormDataChange({ content: '', mediaAssets: [], platforms: [], scheduledFor: '', comments: [], mentions: [] });
    onMentionAutocompleteChange(null);
    onSelectedLinkedInOrgUrnChange('');
  };

  return (
    <>
      {/* Schedule Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseForm();
          }
        }}>
          <div className="classic-panel p-4 md:p-6 mb-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto mt-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl text-white font-bebas">
                {editingPost ? 'EDIT POST' : 'SCHEDULE NEW POST'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-[var(--rich-black)] transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="relative">
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Content
                  {formData.platforms.includes('linkedin') && (
                    <span className="text-[8px] text-gray-600 ml-2">(Type @ to mention people or organizations)</span>
                  )}
                </label>
                <textarea
                  ref={contentTextareaRef}
                  value={formData.content}
                  onChange={handleContentChange}
                  onKeyDown={handleContentKeyDown}
                  required
                  rows={6}
                  className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-y min-h-[120px] font-montserrat"
                  placeholder="What's on your mind?"
                />
                
                {/* Mention Autocomplete Dropdown */}
                {mentionAutocomplete?.show && formData.platforms.includes('linkedin') && (selectedLinkedInOrgUrn || linkedInOrgUrns.length > 0) && mentionAutocomplete && (
                  <div
                    className="absolute z-50 bg-[var(--rich-black)] border border-[var(--border-color)] max-h-60 overflow-y-auto w-80 shadow-lg"
                    style={{
                      top: `${mentionAutocomplete.position.top}px`,
                      left: `${mentionAutocomplete.position.left}px`,
                    }}
                  >
                    {mentionAutocomplete.searching ? (
                      <div className="p-3 text-sm text-gray-400">Searching...</div>
                    ) : (mentionAutocomplete.results && mentionAutocomplete.results.length > 0) ? (
                      <div className="py-1">
                        {mentionAutocomplete.results.map((item, index) => {
                          const key = item.type === 'person' 
                            ? `person-${item.member}` 
                            : `org-${item.organization}`;
                          return (
                            <div
                              key={key}
                              className={`p-3 cursor-pointer transition-colors ${
                                index === mentionAutocomplete.selectedIndex
                                  ? 'bg-[var(--primary-mint)] text-black'
                                  : 'hover:bg-[var(--bg-dark)] text-white'
                              }`}
                              onClick={() => insertMention(item)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  {item.type === 'person' ? (
                                    <>
                                      <p className="text-sm font-semibold">
                                        {item.firstName} {item.lastName}
                                      </p>
                                      {item.headline && (
                                        <p className="text-xs opacity-75">{item.headline}</p>
                                      )}
                                      <p className="text-[10px] opacity-50 mt-1">Person</p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-sm font-semibold">{item.name}</p>
                                      <p className="text-[10px] opacity-50 mt-1">Organization</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : mentionAutocomplete.query && mentionAutocomplete.query.length >= 3 ? (
                      <div className="p-3 text-sm text-gray-400">No results found</div>
                    ) : (
                      <div className="p-3 text-sm text-gray-400">Type at least 3 characters...</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* LinkedIn Organization Selector - Only show if LinkedIn is selected */}
              {formData.platforms.includes('linkedin') && (
                <div>
                  <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                    LinkedIn Organization (Required for mentions)
                  </label>
                  {linkedInOrgUrns.length > 0 ? (
                    <select
                      value={selectedLinkedInOrgUrn}
                      onChange={(e) => onSelectedLinkedInOrgUrnChange(e.target.value)}
                      className="w-full bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat"
                    >
                      <option value="">-- Select Organization --</option>
                      {linkedInOrgUrns.map((org) => (
                        <option key={org.id} value={org.urn}>
                          {org.name} ({org.urn})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 border border-[var(--border-color)] bg-[var(--rich-black)]">
                      <p className="text-xs text-gray-400 mb-2">
                        No organizations configured. Please add organizations in the "Connected Accounts" tab.
                      </p>
                      <button
                        type="button"
                        onClick={() => onActiveTabChange('connections')}
                        className="text-xs text-[var(--primary-mint)] hover:underline"
                      >
                        Go to Connected Accounts →
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 mt-1">
                    Select the LinkedIn organization to use for @mentions in this post. Manage organizations in the "Connected Accounts" tab.
                  </p>
                </div>
              )}

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
                {formData.mediaAssets && formData.mediaAssets.length > 0 && (
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
                      {getPlatformIconFn(platform)}
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
                          onFormDataChange({ ...formData, comments: newComments });
                        }}
                        rows={2}
                        className="flex-1 bg-black border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors resize-y min-h-[60px] font-montserrat"
                        placeholder={`Comment ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newComments = formData.comments.filter((_, i) => i !== index);
                          onFormDataChange({ ...formData, comments: newComments });
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
                      onFormDataChange({ ...formData, comments: [...(formData.comments || []), ''] });
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
                  onChange={(value) => onFormDataChange({ ...formData, scheduledFor: value })}
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
                  onClick={handleCloseForm}
                  className="px-6 py-3 border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)] font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts List/Calendar */}
      <div className="classic-panel p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl text-white font-bebas">SCHEDULED POSTS</h2>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2 border border-[var(--border-color)] p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Calendar View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Calendar View */}
        {viewMode === 'calendar' ? (
          <>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Search posts by content..."
                  className="w-full pl-10 pr-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white text-sm focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
                />
              </div>
              
              {/* Filter Dropdowns */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold flex-shrink-0">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-[var(--rich-black)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors min-h-[32px]"
                  >
                    <option value="all">All</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                {/* Platform Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold flex-shrink-0">Platform:</span>
                  <select
                    value={platformFilter}
                    onChange={(e) => onPlatformFilterChange(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-[var(--rich-black)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors min-h-[32px]"
                  >
                    <option value="all">All</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="threads">Threads</option>
                  </select>
                </div>
              </div>
            </div>
            
            <PostsCalendarView
              posts={posts}
              onPostClick={handleEdit}
              formatDate={formatDate}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              platformFilter={platformFilter}
            />
          </>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search posts by content..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white text-sm focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
            />
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold flex-shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-[var(--rich-black)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors min-h-[32px]"
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            {/* Platform Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold flex-shrink-0">Platform:</span>
              <select
                value={platformFilter}
                onChange={(e) => onPlatformFilterChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-[var(--rich-black)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors min-h-[32px]"
              >
                <option value="all">All</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="threads">Threads</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No scheduled posts yet. Create your first post above!</p>
          </div>
        ) : (() => {
          // Filter posts based on search, status, and platform
          let filteredPosts = posts.filter((post) => {
            // Search filter
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase();
              const contentMatch = post.content.toLowerCase().includes(query);
              const platforms = JSON.parse(post.platforms || '[]');
              const platformMatch = platforms.some((p: string) => p.toLowerCase().includes(query));
              if (!contentMatch && !platformMatch) {
                return false;
              }
            }
            
            // Status filter
            if (statusFilter !== 'all' && post.status !== statusFilter) {
              return false;
            }
            
            // Platform filter
            if (platformFilter !== 'all') {
              const platforms = JSON.parse(post.platforms || '[]');
              if (!platforms.includes(platformFilter)) {
                return false;
              }
            }
            
            return true;
          });
          
          if (filteredPosts.length === 0) {
            return (
              <div className="text-center py-12 text-gray-400">
                <p>No posts found matching your filters.</p>
                {(searchQuery || statusFilter !== 'all' || platformFilter !== 'all') && (
                  <button
                    onClick={() => {
                      onSearchQueryChange('');
                      onStatusFilterChange('all');
                      onPlatformFilterChange('all');
                    }}
                    className="mt-4 px-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:border-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            );
          }
          
          return (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const isExpanded = expandedPosts.has(post.id);
                return (
                  <div
                    key={post.id}
                    className="p-4 md:p-6 border border-[var(--border-color)] bg-[var(--rich-black)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4 mb-4">
                      <div
                        onClick={() => {
                          const newExpanded = new Set(expandedPosts);
                          if (isExpanded) {
                            newExpanded.delete(post.id);
                          } else {
                            newExpanded.add(post.id);
                          }
                          onExpandedPostsChange(newExpanded);
                        }}
                        className="flex items-center gap-2 text-left min-w-0 flex-1 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <div className="flex-shrink-0">{getStatusIconFn(post.status)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                            {JSON.parse(post.platforms || '[]').map((platform: string) => (
                              <div key={platform} className="flex items-center gap-1 flex-shrink-0">
                                {getPlatformIconFn(platform)}
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] md:text-xs text-gray-400 break-words">
                            {formatDate(post.scheduledFor)}
                            {post.publishedAt && ` • Published: ${formatDate(post.publishedAt)}`}
                            {post.timesPosted > 0 && ` • Posted ${post.timesPosted} time${post.timesPosted > 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-gray-400">
                          {isExpanded ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">Click to expand</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap flex-shrink-0">
                        {(post.status === 'scheduled' || post.status === 'draft') && (
                          <>
                            <button
                              onClick={() => onRefinePost(post)}
                              className="p-1.5 md:p-2 border border-purple-500 hover:border-purple-400 hover:bg-purple-500 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                              title="Refine with AI"
                            >
                              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400 hover:text-white" />
                            </button>
                            {post.status === 'draft' && (
                              <button
                                onClick={() => handleScheduleDraft(post)}
                                className="p-1.5 md:p-2 border border-green-500 hover:border-green-400 hover:bg-green-500 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                                title="Schedule Post"
                              >
                                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 hover:text-white" />
                              </button>
                            )}
                            {post.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => handlePublishNow(post)}
                                  className="p-1.5 md:p-2 border border-[var(--secondary-orange)] hover:border-[var(--secondary-orange)] hover:bg-[var(--secondary-orange)] transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                                  title="Publish Now"
                                >
                                  <Rocket className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--secondary-orange)] hover:text-black" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-1.5 md:p-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                            </button>
                          </>
                        )}
                        {post.status === 'published' && (
                          <>
                            <button
                              onClick={() => onRefinePost(post)}
                              className="p-1.5 md:p-2 border border-purple-500 hover:border-purple-400 hover:bg-purple-500 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                              title="Refine with AI"
                            >
                              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400 hover:text-white" />
                            </button>
                            <button
                              onClick={() => handleEdit(post)}
                              className="p-1.5 md:p-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleRepost(post)}
                              className="p-1.5 md:p-2 border border-[var(--primary-mint)] hover:border-[var(--primary-mint)] hover:bg-[var(--primary-mint)] transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                              title="Repost"
                            >
                              <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--primary-mint)] hover:text-black" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 md:p-2 border border-[var(--border-color)] hover:border-red-400 transition-colors min-h-[36px] md:min-h-[auto] flex items-center justify-center flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <>
                        <p className="text-xs md:text-sm text-white mb-3 whitespace-pre-wrap break-words">{post.content}</p>
                        
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
                          <p className="text-[10px] md:text-xs text-red-400 mt-2 break-words">Error: {post.errorMessage}</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
          </>
        )}
      </div>
    </>
  );
}
