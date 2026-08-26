'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckSquare, Inbox, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

/**
 * What this site still runs itself.
 *
 * The newsletter, contact messages, podcast applications, blog posts and
 * video curation all moved to d5, so their panels and their stats went
 * with them; keeping hollow tiles here would imply this is still the
 * place to manage them. What remains is the inbox and its tasks, plus
 * links out to where the rest now lives.
 */
interface DashboardStats {
  tasks: { total: number; incomplete: number };
  emails: { unread: number };
}

const D5_URL = 'https://app.division5.co';

const MOVED_TO_D5 = [
  { label: 'Newsletter and subscribers', href: `${D5_URL}/content/newsletter` },
  { label: 'Contact and podcast enquiries', href: `${D5_URL}/admin/contact-requests` },
  { label: 'Blog posts', href: `${D5_URL}/content/blogs` },
  { label: 'Podcast videos', href: `${D5_URL}/settings/companies` },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, emailsRes] = await Promise.all([
          fetch('/api/email/tasks'),
          fetch('/api/email?grouped=true&readStatus=unread&pageSize=1'),
        ]);
        const tasksData = tasksRes.ok ? await tasksRes.json() : { tasks: [] };
        const emailsData = emailsRes.ok ? await emailsRes.json() : { total: 0 };
        const tasks = tasksData.tasks || [];
        setStats({
          tasks: {
            total: tasks.length,
            incomplete: tasks.filter((t: any) => t.status !== 'completed').length,
          },
          emails: { unread: emailsData.total || 0 },
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-widest text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">
          Inbox and tasks live here. Everything else moved to d5.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          href="/admin/email"
          className="classic-panel bg-[var(--rich-black)] p-6 transition-colors hover:border-[var(--primary-mint)]"
        >
          <div className="flex items-center justify-between">
            <Inbox className="h-5 w-5 text-[var(--primary-mint)]" />
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">
            {loading ? '—' : stats?.emails.unread ?? 0}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">Unread emails</div>
        </Link>

        <Link
          href="/admin/email"
          className="classic-panel bg-[var(--rich-black)] p-6 transition-colors hover:border-[var(--primary-mint)]"
        >
          <div className="flex items-center justify-between">
            <CheckSquare className="h-5 w-5 text-[var(--primary-mint)]" />
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </div>
          <div className="mt-4 text-3xl font-bold text-white">
            {loading ? '—' : stats?.tasks.incomplete ?? 0}
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-gray-400">
            Open tasks{stats ? ` of ${stats.tasks.total}` : ''}
          </div>
        </Link>
      </div>

      <div className="classic-panel bg-[var(--rich-black)] p-6">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[var(--primary-mint)]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Managed in d5</h2>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          One place per job: d5 owns the audience, the content and the enquiries for every brand.
        </p>
        <ul className="mt-4 space-y-2">
          {MOVED_TO_D5.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-[var(--primary-mint)]"
              >
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
