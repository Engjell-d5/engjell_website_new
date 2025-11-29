'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mic, PenTool, CalendarPlus, History, ListVideo, Contact, Mail, MapPin, Clock, Linkedin, Twitter, Play, Heart, Mountain, ShieldCheck, Hourglass, Briefcase, BrainCircuit, Cuboid } from 'lucide-react';

function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully subscribed!');
        setEmail('');
      } else {
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[var(--rich-black)] border border-[var(--border-color)] p-6">
        <h4 className="text-xl text-white font-bebas tracking-wide mb-3">SUBSCRIBE</h4>
        <p className="text-xs text-gray-400 leading-relaxed mb-4 font-light">Get my weekly tech trends.</p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-[var(--border-color)] p-2 text-xs text-white mb-2 focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat" 
            required
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-white text-black hover:bg-[var(--primary-mint)] text-[10px] font-bold uppercase transition-colors disabled:opacity-50"
          >
            {loading ? 'Subscribing...' : 'Join'}
          </button>
          {message && (
            <p className={`text-[10px] mt-2 ${message.includes('Success') ? 'text-[var(--primary-mint)]' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  channelTitle: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string | null;
}

const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [latestVideo, setLatestVideo] = useState<YouTubeVideo | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [latestBlog, setLatestBlog] = useState<Blog | null>(null);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loadingRelatedBlogs, setLoadingRelatedBlogs] = useState(true);

  useEffect(() => {
    if (pathname === '/') {
      fetchLatestVideo();
      fetchLatestBlog();
    }
    if (pathname.startsWith('/journal/')) {
      fetchRelatedBlogs();
    }
  }, [pathname]);

  const fetchLatestVideo = async () => {
    try {
      const response = await fetch('/api/youtube/videos');
      if (response.ok) {
        const data = await response.json();
        const videos = data.videos || [];
        if (videos.length > 0) {
          setLatestVideo(videos[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching latest video:', error);
    } finally {
      setLoadingVideo(false);
    }
  };

  const fetchLatestBlog = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        // Filter published blogs and sort by publishedAt, most recent first
        const publishedBlogs = (data.blogs || [])
          .filter((blog: Blog) => blog.published)
          .sort((a: Blog, b: Blog) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
        if (publishedBlogs.length > 0) {
          setLatestBlog(publishedBlogs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching latest blog:', error);
    } finally {
      setLoadingBlog(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        // Get current blog slug from pathname
        const currentSlug = pathname.split('/journal/')[1];
        
        // Filter published blogs, exclude current blog, and sort by publishedAt, most recent first
        const publishedBlogs = (data.blogs || [])
          .filter((blog: Blog) => blog.published && blog.slug !== currentSlug)
          .sort((a: Blog, b: Blog) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
        
        // Take first 3
        setRelatedBlogs(publishedBlogs.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    } finally {
      setLoadingRelatedBlogs(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <aside className={`classic-panel md:col-span-3 ${pathname === '/about' ? 'flex' : 'hidden md:flex'} flex-col p-6 gap-6 bg-[var(--bg-dark)] sticky-sidebar`}>
      {/* HOME SIDEBAR */}
      {pathname === '/' && (
        <div className="flex flex-col gap-6">
          {/* Quick Action - Book Me for Events */}
          <Link href="/contact" className="w-full py-3 bg-white text-black hover:bg-[var(--primary-mint)] text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            Book Me for Events
          </Link>

          {/* Latest Video */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latest Video</span>
              <Play className="w-4 h-4 text-gray-500" />
            </div>
            {loadingVideo ? (
              <div className="animate-pulse">
                <div className="aspect-video bg-gray-800 border border-[var(--border-color)] mb-2 rounded"></div>
                <div className="h-4 w-full bg-gray-800 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-800 rounded"></div>
              </div>
            ) : latestVideo ? (
              <a
                href={`https://www.youtube.com/watch?v=${latestVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer block"
              >
                <div className="aspect-video bg-black border border-[var(--border-color)] mb-2 overflow-hidden relative group-hover:border-[var(--primary-mint)] transition-colors">
                  <Image 
                    src={latestVideo.thumbnailUrl} 
                    alt={latestVideo.title} 
                    fill
                    className="object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[var(--primary-mint)] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2">
                  {latestVideo.title}
                </p>
                <p className="text-[9px] text-gray-500 mt-1">
                  {formatDuration(latestVideo.duration)} • YouTube
                </p>
              </a>
            ) : (
              <div className="aspect-video bg-black border border-[var(--border-color)] flex items-center justify-center">
                <p className="text-gray-500 text-xs">No videos available</p>
              </div>
            )}
          </div>

          {/* Latest Blog */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latest Blog</span>
              <PenTool className="w-4 h-4 text-gray-500" />
            </div>
            {loadingBlog ? (
              <div className="animate-pulse">
                <div className="aspect-[2/1] bg-gray-800 border border-[var(--border-color)] mb-2 rounded"></div>
                <div className="h-4 w-full bg-gray-800 rounded mb-1"></div>
                <div className="h-3 w-32 bg-gray-800 rounded"></div>
              </div>
            ) : latestBlog ? (
              <Link
                href={`/journal/${latestBlog.slug}`}
                className="group block"
              >
                <div className="aspect-[2/1] bg-black border border-[var(--border-color)] mb-2 overflow-hidden relative group-hover:border-[var(--primary-mint)] transition-colors">
                  <Image 
                    src={latestBlog.imageUrl} 
                    alt={latestBlog.title} 
                    fill
                    className="object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                  />
                </div>
                <p className="text-xs text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2">
                  {latestBlog.title}
                </p>
                <p className="text-[9px] text-gray-500 mt-1">
                  {formatDate(latestBlog.publishedAt)} • {latestBlog.category}
                </p>
              </Link>
            ) : (
              <div className="aspect-[2/1] bg-black border border-[var(--border-color)] flex items-center justify-center">
                <p className="text-gray-500 text-xs">No blog posts available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABOUT SIDEBAR */}
      {pathname === '/about' && (
        <div className="flex flex-col gap-6">
          <div className="w-full h-48 rounded-sm overflow-hidden border border-[var(--border-color)] relative group">
            <Image 
              src="/IMG_0466.JPG" 
              alt="About Portrait" 
              width={600}
              height={192}
              className="w-full h-full object-cover img-classic group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timeline</span>
              <History className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div className="relative pl-4 border-l border-[var(--border-color)]">
                <div className="absolute -left-1 top-1 w-2 h-2 bg-[var(--primary-mint)] rounded-full"></div>
                <p className="text-[9px] text-gray-400 mb-1">2025</p>
                <p className="text-xs text-white font-bold">Expanding Global Reach</p>
              </div>
              <div className="relative pl-4 border-l border-[var(--border-color)]">
                <div className="absolute -left-1 top-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                <p className="text-[9px] text-gray-400 mb-1">2022</p>
                <p className="text-xs text-white font-bold">Launched DivisionAI</p>
              </div>
              <div className="relative pl-4 border-l border-[var(--border-color)]">
                <div className="absolute -left-1 top-1 w-2 h-2 bg-[var(--primary-mint)] rounded-full"></div>
                <p className="text-[9px] text-gray-400 mb-1">2014</p>
                <p className="text-xs text-white font-bold">First Venture Founded</p>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Years Active</p>
              <p className="text-2xl font-bebas text-white">11+</p>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA SIDEBAR */}
      {pathname === '/media' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Curated Playlists</span>
            <ListVideo className="w-4 h-4 text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="relative group cursor-pointer border border-[var(--border-color)] aspect-[16/9] hover:border-white transition-colors">
              <Image 
                src="/_DSC0048.JPG" 
                alt="Playlist" 
                width={400}
                height={225}
                className="w-full h-full object-cover img-classic opacity-60 group-hover:opacity-90"
              />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[10px] font-bold text-white uppercase tracking-wider">Startup 101</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JOURNAL SIDEBAR */}
      {(pathname === '/journal' || pathname.startsWith('/journal/')) && (
        <div className="flex flex-col gap-6">
        <SubscribeForm />
          
          {/* Related Articles - Only show on single blog post pages */}
          {pathname.startsWith('/journal/') && (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Related Articles</span>
                <PenTool className="w-4 h-4 text-gray-500" />
              </div>
              {loadingRelatedBlogs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/1] bg-gray-800 border border-[var(--border-color)] mb-2 rounded"></div>
                      <div className="h-4 w-full bg-gray-800 rounded mb-1"></div>
                      <div className="h-3 w-32 bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : relatedBlogs.length > 0 ? (
                <div className="space-y-4">
                  {relatedBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/journal/${blog.slug}`}
                      className="group block"
                    >
                      <div className="aspect-[2/1] bg-black border border-[var(--border-color)] mb-2 overflow-hidden relative group-hover:border-[var(--primary-mint)] transition-colors">
                        <Image 
                          src={blog.imageUrl} 
                          alt={blog.title} 
                          fill
                          className="object-cover opacity-60 group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <p className="text-xs text-white font-bold leading-tight group-hover:text-[var(--primary-mint)] transition-colors line-clamp-2">
                        {blog.title}
                      </p>
                      <p className="text-[9px] text-gray-500 mt-1">
                        {formatDate(blog.publishedAt)} • {blog.category}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="aspect-[2/1] bg-black border border-[var(--border-color)] flex items-center justify-center">
                  <p className="text-gray-500 text-xs">No related articles</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VENTURES SIDEBAR */}
      {pathname === '/ventures' && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Quick Stats</span>
              <Briefcase className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-3">
              <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Experience</p>
                <p className="text-2xl font-bebas text-white">11+ Years</p>
              </div>
              <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Active Ventures</p>
                <p className="text-2xl font-bebas text-white">3</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Categories</span>
              <BrainCircuit className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="p-3 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-[var(--primary-mint)] transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-bold">Services</span>
                </div>
                <p className="text-[9px] text-gray-400">Staff augmentation & solutions</p>
              </div>
              <div className="p-3 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-white transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <BrainCircuit className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-bold">Technology</span>
                </div>
                <p className="text-[9px] text-gray-400">AI-powered solutions</p>
              </div>
              <div className="p-3 border border-[var(--border-color)] bg-[var(--rich-black)] hover:border-white transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <Cuboid className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-bold">Creative</span>
                </div>
                <p className="text-[9px] text-gray-400">3D experiences & design</p>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm font-bebas text-white">Tirana, Albania</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT SIDEBAR */}
      {pathname === '/contact' && (
        <div className="flex flex-col gap-6">
          <div className="border border-[var(--border-color)] bg-[var(--rich-black)] p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Contact Details</span>
              <Contact className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[var(--primary-mint)] mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                  <a href="mailto:info@engjellrraklli.com" className="text-xs text-white hover:text-[var(--primary-mint)] transition-colors">info@engjellrraklli.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Location</p>
                  <p className="text-xs text-white">Tirana, Albania</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[var(--primary-mint)] mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Office Hours</p>
                  <p className="text-xs text-white">Mon - Fri, 9AM - 5PM CET</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex gap-2">
              <a href="https://www.linkedin.com/in/engjell-rraklli-a8b20a68/" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-[var(--border-color)] hover:bg-white hover:text-black rounded-sm flex items-center justify-center text-gray-400 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://x.com/RraklliEngjell" target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-[var(--border-color)] hover:bg-white hover:text-black rounded-sm flex items-center justify-center text-gray-400 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

