'use client';

import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { AiIntegration } from '@/types/admin';

interface CronTabProps {
  cronLoading: boolean;
  cronSaving: boolean;
  cronActionLoading: boolean;
  cronConfig: {
    isEnabled: boolean;
    schedule: string;
    syncEmails: boolean;
    analyzeEmails: boolean;
    aiIntegrationId: string | null;
    nextRun?: string | null;
    lastRun?: string | null;
    lastSyncAt?: string | null;
    lastAnalyzeAt?: string | null;
  } | null;
  cronStatus: {
    running: boolean;
    initialized: boolean;
    nextRun: string | null;
    schedule: string;
    isEnabled: boolean;
  } | null;
  aiIntegrations: AiIntegration[];
  onCronConfigChange: (config: CronTabProps['cronConfig']) => void;
  onCronAction: (action: 'start' | 'stop' | 'restart') => void;
  onRefreshStatus: () => void;
  onSaveConfig: () => void;
}

export default function CronTab({
  cronLoading,
  cronSaving,
  cronActionLoading,
  cronConfig,
  cronStatus,
  aiIntegrations,
  onCronConfigChange,
  onCronAction,
  onRefreshStatus,
  onSaveConfig,
}: CronTabProps) {
  if (cronLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-mint)] mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading cron configuration...</p>
      </div>
    );
  }

  if (!cronConfig) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load cron configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl text-white font-bebas mb-4">Email Sync & Analyze Cron Job</h2>
        <p className="text-sm text-gray-400 mb-6">
          Automatically sync emails from Gmail and analyze them for tasks on a schedule.
        </p>
      </div>

      {/* Cron Job Management */}
      <div className="border border-[var(--border-color)] p-4">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-[var(--primary-mint)]" />
          <h3 className="text-lg text-white font-bebas">Cron Job Management</h3>
        </div>

        {cronStatus ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Status:</span>
              <div className="flex items-center gap-2">
                {cronStatus.running ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-500 font-semibold">Running</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-500 font-semibold">Stopped</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Schedule:</span>
              <span className="text-white font-mono text-sm">{cronStatus.schedule || '0 */6 * * *'}</span>
            </div>

            {cronStatus.nextRun && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Next Run:</span>
                <span className="text-white text-sm">{new Date(cronStatus.nextRun).toLocaleString()}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Initialized:</span>
              {cronStatus.initialized ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Enabled:</span>
              {cronStatus.isEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => onCronAction('start')}
                disabled={cronActionLoading || cronStatus.running}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cronActionLoading ? 'Starting...' : 'Start Cron Job'}
              </button>
              <button
                onClick={() => onCronAction('stop')}
                disabled={cronActionLoading || !cronStatus.running}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cronActionLoading ? 'Stopping...' : 'Stop Cron Job'}
              </button>
              <button
                onClick={() => onCronAction('restart')}
                disabled={cronActionLoading}
                className="px-4 py-2 bg-[var(--secondary-orange)] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cronActionLoading ? 'Restarting...' : 'Restart Cron Job'}
              </button>
              <button
                onClick={onRefreshStatus}
                disabled={cronActionLoading}
                className="px-4 py-2 bg-[var(--primary-mint)] hover:bg-white text-black font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${cronActionLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>

            <div className="mt-4 p-4 bg-[var(--bg-dark)] border border-[var(--border-color)] rounded">
              <p className="text-xs text-gray-400">
                <strong className="text-white">How it works:</strong> The cron job automatically syncs emails from Gmail and analyzes them for tasks according to the schedule above. 
                You can start, stop, or restart the cron job at any time. Note: The cron job will only run if it's enabled in the configuration below.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Loading cron status...</div>
        )}
      </div>

      {/* Enable/Disable Toggle */}
      <div className="border border-[var(--border-color)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg text-white font-semibold mb-1">Enable Cron Job</h3>
            <p className="text-sm text-gray-400">
              When enabled, the cron job will automatically sync and analyze emails according to the schedule below.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cronConfig.isEnabled}
              onChange={(e) => onCronConfigChange({ ...cronConfig, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary-mint)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary-mint)]"></div>
          </label>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div className="border border-[var(--border-color)] p-4">
        <h3 className="text-lg text-white font-semibold mb-4">Schedule</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Cron Schedule (minute hour day month dayOfWeek)
            </label>
            <input
              type="text"
              value={cronConfig.schedule}
              onChange={(e) => onCronConfigChange({ ...cronConfig, schedule: e.target.value })}
              placeholder="0 */6 * * *"
              className="w-full px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border-color)] text-white placeholder-gray-500 focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              Examples: "0 */6 * * *" (every 6 hours), "0 2 * * *" (daily at 2 AM), "*/30 * * * *" (every 30 minutes)
            </p>
          </div>
          {cronConfig.nextRun && (
            <div className="p-3 bg-[var(--bg-dark)] border border-[var(--border-color)]">
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Next Run:</span>{' '}
                {new Date(cronConfig.nextRun).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="border border-[var(--border-color)] p-4">
        <h3 className="text-lg text-white font-semibold mb-4">Options</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cronConfig.syncEmails}
              onChange={(e) => onCronConfigChange({ ...cronConfig, syncEmails: e.target.checked })}
              className="w-4 h-4 text-[var(--primary-mint)] bg-[var(--bg-dark)] border-[var(--border-color)] rounded focus:ring-[var(--primary-mint)]"
            />
            <div>
              <span className="text-white font-medium">Sync Emails</span>
              <p className="text-sm text-gray-400">Fetch new emails from Gmail</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cronConfig.analyzeEmails}
              onChange={(e) => onCronConfigChange({ ...cronConfig, analyzeEmails: e.target.checked })}
              className="w-4 h-4 text-[var(--primary-mint)] bg-[var(--bg-dark)] border-[var(--border-color)] rounded focus:ring-[var(--primary-mint)]"
            />
            <div>
              <span className="text-white font-medium">Analyze Emails</span>
              <p className="text-sm text-gray-400">Automatically analyze unanalyzed emails for tasks</p>
            </div>
          </label>
          {cronConfig.analyzeEmails && (
            <div className="ml-7">
              <label className="block text-sm text-gray-300 mb-2">AI Integration</label>
              <select
                value={cronConfig.aiIntegrationId || ''}
                onChange={(e) => onCronConfigChange({ ...cronConfig, aiIntegrationId: e.target.value || null })}
                className="w-full px-4 py-2 bg-[var(--bg-dark)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors"
              >
                <option value="">Select AI Integration</option>
                {aiIntegrations.map((integration) => (
                  <option key={integration.id} value={integration.id}>
                    {integration.name} ({integration.provider})
                  </option>
                ))}
              </select>
              {aiIntegrations.length === 0 && (
                <p className="text-xs text-red-400 mt-2">
                  No active AI integrations found. Please configure one first.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Last Run Information */}
      {(cronConfig.lastRun || cronConfig.lastSyncAt || cronConfig.lastAnalyzeAt) && (
        <div className="border border-[var(--border-color)] p-4">
          <h3 className="text-lg text-white font-semibold mb-4">Last Run Information</h3>
          <div className="space-y-2 text-sm">
            {cronConfig.lastRun && (
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">Last Run:</span>{' '}
                {new Date(cronConfig.lastRun).toLocaleString()}
              </p>
            )}
            {cronConfig.lastSyncAt && (
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">Last Sync:</span>{' '}
                {new Date(cronConfig.lastSyncAt).toLocaleString()}
              </p>
            )}
            {cronConfig.lastAnalyzeAt && (
              <p className="text-gray-400">
                <span className="font-medium text-gray-300">Last Analysis:</span>{' '}
                {new Date(cronConfig.lastAnalyzeAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={onSaveConfig}
          disabled={cronSaving || (cronConfig.analyzeEmails && !cronConfig.aiIntegrationId)}
          className="px-6 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          {cronSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </div>
  );
}
