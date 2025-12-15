'use client';

import { Mail, Sparkles, CheckCircle, Trash2, XSquare, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { EmailThread } from '@/types/admin';

interface EmailsTabProps {
  threads: EmailThread[];
  expandedThreads: Set<string>;
  analyzing: string | null;
  deleting: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalThreads: number;
  onAnalyze: (threadId: string) => void;
  onDelete: (threadId: string) => void;
  onMarkIrrelevant: (threadId: string, isIrrelevant: boolean) => void;
  onToggleExpansion: (threadId: string) => void;
  onSelectThread: (thread: EmailThread) => void;
  onPageChange: (page: number) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function EmailsTab({
  threads,
  expandedThreads,
  analyzing,
  deleting,
  currentPage,
  totalPages,
  pageSize,
  totalThreads,
  onAnalyze,
  onDelete,
  onMarkIrrelevant,
  onToggleExpansion,
  onSelectThread,
  onPageChange,
}: EmailsTabProps) {
  return (
    <div>
      {threads.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No emails found. Sync your emails to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => {
            const isExpanded = expandedThreads.has(thread.threadId);
            
            return (
              <div
                key={thread.threadId}
                className="border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors"
              >
                {/* Thread Header */}
                <div className="p-3 md:p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white text-sm md:text-base break-words">{thread.subject}</h3>
                        {!thread.isRead && (
                          <span className="w-2 h-2 bg-[var(--primary-mint)] rounded-full flex-shrink-0"></span>
                        )}
                        {thread.totalCount > 1 && (
                          <span className="px-2 py-0.5 text-xs bg-[var(--rich-black)] border border-[var(--border-color)] text-gray-400 flex-shrink-0">
                            {thread.totalCount} message{thread.totalCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {thread.unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-red-900/20 text-red-400 border border-red-500 flex-shrink-0">
                            {thread.unreadCount} unread
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-gray-400 mb-1 break-words">
                        <span className="font-medium text-gray-300">From:</span> {thread.latestEmail.from}
                      </p>
                      {thread.latestEmail.snippet && (
                        <p className="text-xs md:text-sm text-gray-500 mt-2 line-clamp-2 break-words">{thread.latestEmail.snippet}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{formatDate(thread.latestEmail.receivedAt)}</p>
                      {thread.tasks && thread.tasks.length > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {thread.tasks.length} task{thread.tasks.length !== 1 ? 's' : ''} generated
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:ml-4 flex-shrink-0">
                      <button
                        onClick={() => onSelectThread(thread)}
                        className="px-3 md:px-4 py-2 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 text-xs font-bold uppercase tracking-widest transition-colors min-h-[44px]"
                      >
                        View
                      </button>
                      {!thread.isAnalyzed && (
                        <button
                          onClick={() => onAnalyze(thread.threadId)}
                          disabled={analyzing === thread.threadId}
                          className="px-3 md:px-4 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 min-h-[44px]"
                        >
                          <Sparkles className={`w-3 h-3 flex-shrink-0 ${analyzing === thread.threadId ? 'animate-spin' : ''}`} />
                          Analyze
                        </button>
                      )}
                      {thread.isAnalyzed && (
                        <span className="px-3 py-2 text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1 min-h-[44px]">
                          <CheckCircle className="w-3 h-3 flex-shrink-0" />
                          Analyzed
                        </span>
                      )}
                      <button
                        onClick={() => onMarkIrrelevant(thread.threadId, !thread.isIrrelevant)}
                        className="px-3 md:px-4 py-2 bg-[var(--rich-black)] border border-gray-500/50 text-gray-400 hover:bg-gray-900/20 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 min-h-[44px]"
                        title={thread.isIrrelevant ? 'Mark as relevant' : 'Mark as irrelevant'}
                      >
                        <XSquare className="w-3 h-3 flex-shrink-0" />
                        <span className="hidden sm:inline">{thread.isIrrelevant ? 'Relevant' : 'Irrelevant'}</span>
                        <span className="sm:hidden">{thread.isIrrelevant ? 'Relevant' : 'Irrel'}</span>
                      </button>
                      <button
                        onClick={() => onDelete(thread.threadId)}
                        disabled={deleting === thread.threadId}
                        className="px-3 md:px-4 py-2 bg-[var(--rich-black)] border border-red-500/50 text-red-400 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 min-h-[44px]"
                      >
                        <Trash2 className={`w-3 h-3 flex-shrink-0 ${deleting === thread.threadId ? 'animate-spin' : ''}`} />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Thread */}
                  {thread.totalCount > 1 && (
                    <button
                      onClick={() => onToggleExpansion(thread.threadId)}
                      className="mt-3 text-xs text-gray-400 hover:text-[var(--primary-mint)] transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <X className="w-3 h-3" />
                          Collapse thread
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3" />
                          Show {thread.totalCount - 1} more message{thread.totalCount - 1 !== 1 ? 's' : ''} in thread
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {/* Expanded Thread Messages */}
                {isExpanded && thread.emails.length > 1 && (
                  <div className="border-t border-[var(--border-color)] bg-[var(--rich-black)]/50">
                    {thread.emails.slice(0, -1).reverse().map((email) => (
                      <div key={email.id} className="p-4 border-b border-[var(--border-color)] last:border-b-0">
                        <div className="flex items-start gap-3">
                          <div className="w-1 h-full bg-[var(--border-color)]"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs text-gray-400">
                                <span className="font-medium text-gray-300">From:</span> {email.from}
                              </p>
                              <span className="text-xs text-gray-500">{formatDate(email.receivedAt)}</span>
                              {!email.isRead && (
                                <span className="w-1.5 h-1.5 bg-[var(--primary-mint)] rounded-full"></span>
                              )}
                            </div>
                            {email.snippet && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{email.snippet}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalThreads)} of {totalThreads} threads
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[var(--primary-mint)] text-black'
                        : 'bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-[var(--rich-black)] border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
