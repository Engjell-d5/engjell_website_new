'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, LogOut, Home, Mic, Mail, MessageSquare, Share2, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';
import PushNotificationManager from '@/components/PushNotificationManager';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Only redirect if not already on login page
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    } catch (error) {
      // Only redirect if not already on login page
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // If on login page, just render children without auth check
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <div className="classic-panel sticky-header">
        <div className="h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-[var(--primary-mint)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <Link href="/admin" className="text-xl md:text-2xl text-white font-bebas tracking-widest">
              ADMIN PANEL
            </Link>
            <div className="hidden md:block h-6 w-px bg-[var(--border-color)]"></div>
            <span className="hidden md:inline text-xs text-gray-400">Welcome, {user.name}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative">
            <div className="relative z-10">
              <PushNotificationManager />
            </div>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile, shown as drawer when menu is open */}
        <aside
          className={`
            fixed md:static
            top-16 left-0
            w-64 h-[calc(100vh-4rem)]
            classic-panel
            p-6
            border-r border-[var(--border-color)]
            z-50
            transform transition-transform duration-300 ease-in-out
            overflow-y-auto
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <nav className="space-y-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/dashboard' || pathname === '/admin'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">Dashboard</span>
            </Link>
            {user.role === 'admin' && (
              <Link
                href="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                  pathname === '/admin/users'
                    ? 'bg-[var(--primary-mint)] text-black'
                    : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
                }`}
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-bold uppercase tracking-widest">Users</span>
              </Link>
            )}
            <Link
              href="/admin/podcast"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/podcast' || pathname === '/admin/youtube' || pathname === '/admin/podcast-applications'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <Mic className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">Podcast</span>
            </Link>
            <Link
              href="/admin/email"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/email'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">Email</span>
            </Link>
            <Link
              href="/admin/newsletter"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/newsletter' || pathname === '/admin/subscribers' || pathname === '/admin/groups' || pathname === '/admin/campaigns'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">Newsletter</span>
            </Link>
            <Link
              href="/admin/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/contact'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">Contact Messages</span>
            </Link>
            <Link
              href="/admin/social"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/social'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <Share2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">Social Media</span>
            </Link>
            <Link
              href="/admin/ai-integrations"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors ${
                pathname === '/admin/ai-integrations'
                  ? 'bg-[var(--primary-mint)] text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[var(--rich-black)]'
              }`}
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-bold uppercase tracking-widest">AI Integrations</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

