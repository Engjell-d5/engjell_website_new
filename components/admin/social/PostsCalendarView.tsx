'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Linkedin, Twitter, Instagram } from 'lucide-react';
import type { SocialPost } from '@/types/admin';

interface PostsCalendarViewProps {
  posts: SocialPost[];
  onPostClick: (post: SocialPost) => void;
  formatDate: (dateString: string) => string;
  searchQuery?: string;
  statusFilter?: string;
  platformFilter?: string;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'linkedin':
      return <Linkedin className="w-3 h-3" />;
    case 'twitter':
      return <Twitter className="w-3 h-3" />;
    case 'instagram':
      return <Instagram className="w-3 h-3" />;
    case 'threads':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-3 h-3" fill="currentColor">
          <path d="M105 0h302c57.75 0 105 47.25 105 105v302c0 57.75-47.25 105-105 105H105C47.25 512 0 464.75 0 407V105C0 47.25 47.25 0 105 0z"/>
          <path fillRule="nonzero" d="M337.36 243.58c-1.46-.7-2.95-1.38-4.46-2.02-2.62-48.36-29.04-76.05-73.41-76.33-25.6-.17-48.52 10.27-62.8 31.94l24.4 16.74c10.15-15.4 26.08-18.68 37.81-18.68h.4c14.61.09 25.64 4.34 32.77 12.62 5.19 6.04 8.67 14.37 10.39 24.89-12.96-2.2-26.96-2.88-41.94-2.02-42.18 2.43-69.3 27.03-67.48 61.21.92 17.35 9.56 32.26 24.32 42.01 12.48 8.24 28.56 12.27 45.26 11.35 22.07-1.2 39.37-9.62 51.45-25.01 9.17-11.69 14.97-26.84 17.53-45.92 10.51 6.34 18.3 14.69 22.61 24.73 7.31 17.06 7.74 45.1-15.14 67.96-20.04 20.03-44.14 28.69-80.55 28.96-40.4-.3-70.95-13.26-90.81-38.51-18.6-23.64-28.21-57.79-28.57-101.5.36-43.71 9.97-77.86 28.57-101.5 19.86-25.25 50.41-38.21 90.81-38.51 40.68.3 71.76 13.32 92.39 38.69 10.11 12.44 17.73 28.09 22.76 46.33l28.59-7.63c-6.09-22.45-15.67-41.8-28.72-57.85-26.44-32.53-65.1-49.19-114.92-49.54h-.2c-49.72.35-87.96 17.08-113.64 49.73-22.86 29.05-34.65 69.48-35.04 120.16v.24c.39 50.68 12.18 91.11 35.04 120.16 25.68 32.65 63.92 49.39 113.64 49.73h.2c44.2-.31 75.36-11.88 101.03-37.53 33.58-33.55 32.57-75.6 21.5-101.42-7.94-18.51-23.08-33.55-43.79-43.48zm-76.32 71.76c-18.48 1.04-37.69-7.26-38.64-25.03-.7-13.18 9.38-27.89 39.78-29.64 3.48-.2 6.9-.3 10.25-.3 11.04 0 21.37 1.07 30.76 3.13-3.5 43.74-24.04 50.84-42.15 51.84z"/>
        </svg>
      );
    default:
      return null;
  }
};

export default function PostsCalendarView({ posts, onPostClick, formatDate, searchQuery = '', statusFilter = 'all', platformFilter = 'all' }: PostsCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter posts based on search, status, and platform
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Must have scheduledFor date
      if (!post.scheduledFor) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const contentMatch = post.content.toLowerCase().includes(query);
        const platforms = Array.isArray(post.platforms) ? post.platforms : JSON.parse(post.platforms || '[]');
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
        const platforms = Array.isArray(post.platforms) ? post.platforms : JSON.parse(post.platforms || '[]');
        if (!platforms.includes(platformFilter)) {
          return false;
        }
      }
      
      return true;
    });
  }, [posts, searchQuery, statusFilter, platformFilter]);

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, SocialPost[]> = {};
    filteredPosts.forEach(post => {
      const date = new Date(post.scheduledFor);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(post);
    });
    return grouped;
  }, [filteredPosts]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of the week (0 = Sunday)
    const startDay = firstDay.getDay();
    // Total days in month
    const daysInMonth = lastDay.getDate();
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; posts: SocialPost[] }> = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({
        date,
        isCurrentMonth: false,
        posts: postsByDate[dateKey] || [],
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({
        date,
        isCurrentMonth: true,
        posts: postsByDate[dateKey] || [],
      });
    }
    
    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      days.push({
        date,
        isCurrentMonth: false,
        posts: postsByDate[dateKey] || [],
      });
    }
    
    return days;
  }, [currentDate, postsByDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="classic-panel bg-[var(--rich-black)] p-4 md:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-[var(--bg-dark)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-xl md:text-2xl text-white font-bebas">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-[var(--bg-dark)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] text-sm text-white transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-gray-400 font-bold uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const { date, isCurrentMonth, posts } = dayInfo;
          const dayPosts = posts || [];
          const today = isToday(date);

          return (
            <div
              key={index}
              className={`min-h-[80px] md:min-h-[100px] border border-[var(--border-color)] p-1 md:p-2 ${
                isCurrentMonth ? 'bg-[var(--bg-dark)]' : 'bg-black opacity-50'
              } ${today ? 'ring-2 ring-[var(--primary-mint)]' : ''}`}
            >
              <div className={`text-xs md:text-sm mb-1 ${isCurrentMonth ? 'text-white' : 'text-gray-600'} ${today ? 'font-bold text-[var(--primary-mint)]' : ''}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayPosts.slice(0, 2).map((post) => {
                  const postDate = new Date(post.scheduledFor);
                  const timeStr = postDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                  
                  return (
                    <button
                      key={post.id}
                      onClick={() => onPostClick(post)}
                      className="w-full text-left p-1 bg-[var(--rich-black)] border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors group"
                      title={`${timeStr} - ${post.content.substring(0, 50)}...`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-2.5 h-2.5 text-gray-400" />
                        <span className="text-[10px] text-gray-400">{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(Array.isArray(post.platforms) ? post.platforms : JSON.parse(post.platforms || '[]')).map((platform: string) => (
                          <span key={platform} className="text-[var(--primary-mint)]">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-300 truncate mt-1 group-hover:text-white">
                        {post.content.substring(0, 30)}
                        {post.content.length > 30 ? '...' : ''}
                      </p>
                    </button>
                  );
                })}
                {dayPosts.length > 2 && (
                  <div className="text-[10px] text-gray-500 text-center py-1">
                    +{dayPosts.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-[var(--primary-mint)]"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Scheduled time</span>
          </div>
        </div>
      </div>
    </div>
  );
}

