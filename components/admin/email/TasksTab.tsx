'use client';

import { CheckCircle, Trash2, ExternalLink, Filter, XSquare } from 'lucide-react';
import type { EmailTask } from '@/types/admin';

interface TasksTabProps {
  tasks: EmailTask[];
  taskStatusFilter: 'not_done' | 'done' | 'all';
  updatingTask: string | null;
  deletingTask: string | null;
  creatingExternal: string | null;
  onTaskStatusFilterChange: (filter: 'not_done' | 'done' | 'all') => void;
  onMarkTaskDone: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateExternalTask: (taskId: string) => void;
  onClearAllTasks: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-900/20 text-red-400 border-red-500';
    case 'medium':
      return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
    case 'low':
      return 'bg-green-900/20 text-green-400 border-green-500';
    default:
      return 'bg-gray-900/20 text-gray-400 border-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-900/20 text-green-400 border-green-500';
    case 'in_progress':
      return 'bg-blue-900/20 text-blue-400 border-blue-500';
    case 'cancelled':
      return 'bg-gray-900/20 text-gray-400 border-gray-500';
    default:
      return 'bg-yellow-900/20 text-yellow-400 border-yellow-500';
  }
};

export default function TasksTab({
  tasks,
  taskStatusFilter,
  updatingTask,
  deletingTask,
  creatingExternal,
  onTaskStatusFilterChange,
  onMarkTaskDone,
  onDeleteTask,
  onCreateExternalTask,
  onClearAllTasks,
}: TasksTabProps) {
  return (
    <div>
      {/* Task Status Filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <label className="text-sm text-gray-400 font-medium">Filter by status:</label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onTaskStatusFilterChange('not_done')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              taskStatusFilter === 'not_done'
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] border border-[var(--border-color)] text-gray-400 hover:text-white'
            }`}
          >
            Not Done
          </button>
          <button
            onClick={() => onTaskStatusFilterChange('done')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              taskStatusFilter === 'done'
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] border border-[var(--border-color)] text-gray-400 hover:text-white'
            }`}
          >
            Done
          </button>
          <button
            onClick={() => onTaskStatusFilterChange('all')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              taskStatusFilter === 'all'
                ? 'bg-[var(--primary-mint)] text-black'
                : 'bg-[var(--rich-black)] border border-[var(--border-color)] text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={onClearAllTasks}
            className="ml-auto px-4 py-2 bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
          >
            <XSquare className="w-4 h-4" />
            Clear All Tasks
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">
            {taskStatusFilter === 'not_done' 
              ? 'No incomplete tasks found.' 
              : taskStatusFilter === 'done'
              ? 'No completed tasks found.'
              : 'No tasks found. Analyze emails to generate tasks.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`border border-[var(--border-color)] p-3 md:p-4 hover:border-[var(--primary-mint)] transition-colors ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className={`font-semibold text-sm md:text-base break-words ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium uppercase tracking-widest border flex-shrink-0 ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium uppercase tracking-widest border flex-shrink-0 ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.externalTaskId && (
                      <span className="px-2 py-1 text-xs font-medium uppercase tracking-widest border border-green-500/50 bg-green-900/20 text-green-400 flex-shrink-0 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        Sent to External
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className={`text-xs md:text-sm mb-2 break-words ${task.status === 'completed' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {task.description}
                    </p>
                  )}
                  {task.email && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                      <p className="text-xs text-gray-500 break-words">
                        <span className="font-medium text-gray-300">From email:</span> {task.email.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 break-words">From: {task.email.from}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{formatDate(task.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2 md:ml-4 md:flex-nowrap flex-shrink-0">
                  {task.externalTaskId ? (
                    <button
                      disabled
                      className="px-3 md:px-4 py-2 bg-green-900/20 border border-green-500/50 text-green-400 disabled:opacity-100 disabled:cursor-default text-xs font-bold uppercase tracking-widest flex items-center gap-1 min-h-[44px]"
                      title={`Already sent to external platform (ID: ${task.externalTaskId})`}
                    >
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="hidden sm:inline">Sent to External</span>
                      <span className="sm:hidden">Sent</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onCreateExternalTask(task.id)}
                      disabled={creatingExternal === task.id}
                      className="px-3 md:px-4 py-2 bg-[var(--rich-black)] border border-blue-500/50 text-blue-400 hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 min-h-[44px]"
                      title="Create task on external platform"
                    >
                      <ExternalLink className={`w-3 h-3 flex-shrink-0 ${creatingExternal === task.id ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{creatingExternal === task.id ? 'Creating...' : 'Create External'}</span>
                      <span className="sm:hidden">External</span>
                    </button>
                  )}
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => onMarkTaskDone(task.id)}
                      disabled={updatingTask === task.id}
                      className="px-3 md:px-4 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 min-h-[44px]"
                      title="Mark as completed"
                    >
                      <CheckCircle className={`w-3 h-3 flex-shrink-0 ${updatingTask === task.id ? 'animate-spin' : ''}`} />
                      Done
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    disabled={deletingTask === task.id}
                    className="px-3 md:px-4 py-2 bg-[var(--rich-black)] border border-red-500/50 text-red-400 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 min-h-[44px]"
                    title="Delete task"
                  >
                    <Trash2 className={`w-3 h-3 flex-shrink-0 ${deletingTask === task.id ? 'animate-spin' : ''}`} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
