'use client';

import { CheckCircle, Linkedin, Twitter, Instagram, Rocket } from 'lucide-react';
import type { SocialConnection } from '@/types/admin';
import LinkedInOrganizationsManager from './LinkedInOrganizationsManager';

interface ConnectionsTabProps {
  connections: SocialConnection[];
  onDisconnect: (platform: string) => void;
  onRefresh: () => void;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'linkedin':
      return <Linkedin className="w-5 h-5 text-blue-500" />;
    case 'twitter':
      return <Twitter className="w-5 h-5 text-blue-400" />;
    case 'instagram':
      return <Instagram className="w-5 h-5 text-pink-500" />;
    case 'threads':
      return <Rocket className="w-5 h-5 text-purple-500" />;
    default:
      return null;
  }
};

export default function ConnectionsTab({
  connections,
  onDisconnect,
  onRefresh,
}: ConnectionsTabProps) {
  return (
    <div className="classic-panel p-4 md:p-6 mb-8">
      <h2 className="text-xl md:text-2xl text-white font-bebas mb-4">CONNECTED ACCOUNTS</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    onClick={() => onDisconnect(platform)}
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
      
      {/* LinkedIn Organizations Management */}
      {connections.find(c => c.platform === 'linkedin' && c.isActive) && (
        <LinkedInOrganizationsManager 
          connection={connections.find(c => c.platform === 'linkedin')!}
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
}

