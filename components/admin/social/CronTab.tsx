'use client';

import { useState } from 'react';
import { Edit, Rocket, X, RefreshCw } from 'lucide-react';

interface CronTabProps {
  cronStatus: {
    running: boolean;
    initialized: boolean;
    nextRun: string | null;
    schedule: string;
  } | null;
  cronLoading: boolean;
  cronSchedule: string;
  editingSchedule: boolean;
  savingSchedule: boolean;
  onCronAction: (action: 'start' | 'stop' | 'restart') => void;
  onUpdateSchedule: () => void;
  onRefreshStatus: () => void;
  onScheduleChange: (schedule: string) => void;
  onEditingScheduleChange: (editing: boolean) => void;
}

export default function CronTab({
  cronStatus,
  cronLoading,
  cronSchedule,
  editingSchedule,
  savingSchedule,
  onCronAction,
  onUpdateSchedule,
  onRefreshStatus,
  onScheduleChange,
  onEditingScheduleChange,
}: CronTabProps) {
  return (
    <div className="classic-panel p-4 md:p-6 mb-8">
      <h2 className="text-xl md:text-2xl text-white font-bebas mb-6">CRON JOB MANAGEMENT</h2>
      
      {cronStatus ? (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="border border-[var(--border-color)] bg-[var(--rich-black)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-white font-bebas">Social Media Publishing Cron</h3>
              <div className="flex items-center gap-2">
                {cronStatus.running ? (
                  <>
                    <div className="w-3 h-3 bg-[var(--primary-mint)] rounded-full animate-pulse"></div>
                    <span className="text-sm text-[var(--primary-mint)] font-bold">RUNNING</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-500 font-bold">STOPPED</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-gray-400">Schedule:</span>
                {editingSchedule ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cronSchedule}
                      onChange={(e) => onScheduleChange(e.target.value)}
                      placeholder="*/5 * * * *"
                      className="px-2 py-1 bg-[var(--rich-black)] border border-[var(--border-color)] text-white font-mono text-sm focus:outline-none focus:border-[var(--primary-mint)] w-32"
                    />
                    <button
                      onClick={onUpdateSchedule}
                      disabled={savingSchedule}
                      className="px-3 py-1 bg-[var(--primary-mint)] text-black hover:bg-white text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      {savingSchedule ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        onEditingScheduleChange(false);
                        onRefreshStatus(); // Reset to current schedule
                      }}
                      disabled={savingSchedule}
                      className="px-3 py-1 bg-gray-600 text-white hover:bg-gray-700 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono">{cronSchedule || cronStatus?.schedule || '*/5 * * * *'}</span>
                    <button
                      onClick={() => onEditingScheduleChange(true)}
                      className="text-[var(--primary-mint)] hover:text-white text-xs"
                      title="Edit schedule"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-gray-400">Frequency:</span>
                <span className="text-white">
                  {cronSchedule === '*/5 * * * *' ? 'Every 5 minutes' :
                   cronSchedule === '*/10 * * * *' ? 'Every 10 minutes' :
                   cronSchedule === '*/15 * * * *' ? 'Every 15 minutes' :
                   cronSchedule === '*/30 * * * *' ? 'Every 30 minutes' :
                   cronSchedule === '0 * * * *' ? 'Every hour' :
                   cronSchedule === '0 */2 * * *' ? 'Every 2 hours' :
                   cronSchedule === '0 */6 * * *' ? 'Every 6 hours' :
                   cronSchedule === '0 0 * * *' ? 'Daily at midnight' :
                   cronSchedule === '0 2 * * *' ? 'Daily at 2 AM' :
                   'Custom schedule'}
                </span>
              </div>
              {cronStatus.nextRun && (
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                  <span className="text-gray-400">Next Run:</span>
                  <span className="text-white">
                    {new Date(cronStatus.nextRun).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Initialized:</span>
                <span className={cronStatus.initialized ? 'text-[var(--primary-mint)]' : 'text-gray-500'}>
                  {cronStatus.initialized ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-4">
            {!cronStatus.running ? (
              <button
                onClick={() => onCronAction('start')}
                disabled={cronLoading}
                className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="w-4 h-4" />
                {cronLoading ? 'Starting...' : 'Start Cron Job'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => onCronAction('stop')}
                  disabled={cronLoading}
                  className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  {cronLoading ? 'Stopping...' : 'Stop Cron Job'}
                </button>
                <button
                  onClick={() => onCronAction('restart')}
                  disabled={cronLoading}
                  className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  {cronLoading ? 'Restarting...' : 'Restart Cron Job'}
                </button>
              </>
            )}
            <button
              onClick={onRefreshStatus}
              disabled={cronLoading}
              className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </button>
          </div>

          {/* Info Box */}
          <div className="border-l-4 border-[var(--primary-mint)] bg-[var(--rich-black)] p-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              <strong className="text-white">How it works:</strong> The cron job runs every 5 minutes and checks for scheduled posts. 
              Posts scheduled for the current time or earlier will be published automatically. 
              For example, a post scheduled for 8:47 will be published at the 8:50 cron run (3-minute delay).
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading cron status...</p>
        </div>
      )}
    </div>
  );
}

