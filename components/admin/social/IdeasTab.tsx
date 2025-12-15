'use client';

import { Edit, Trash2, Sparkles } from 'lucide-react';
import type { PostIdea } from '@/types/admin';

interface IdeasTabProps {
  postIdeas: PostIdea[];
  editingIdea: { id: string; title: string; prompt: string } | null;
  editIdeaTitle: string;
  postsToGenerate: number;
  generatingPostsFromIdea: string | null;
  onEditIdea: (idea: PostIdea) => void;
  onSaveIdea: () => void;
  onCancelEdit: () => void;
  onDeleteIdea: (ideaId: string) => void;
  onGeneratePostsFromIdea: (idea: PostIdea) => void;
  onPostsToGenerateChange: (count: number) => void;
  onEditIdeaTitleChange: (title: string) => void;
}

export default function IdeasTab({
  postIdeas,
  editingIdea,
  editIdeaTitle,
  postsToGenerate,
  generatingPostsFromIdea,
  onEditIdea,
  onSaveIdea,
  onCancelEdit,
  onDeleteIdea,
  onGeneratePostsFromIdea,
  onPostsToGenerateChange,
  onEditIdeaTitleChange,
}: IdeasTabProps) {
  return (
    <>
      {/* Post Ideas List */}
      {postIdeas.length > 0 && (
        <div className="classic-panel p-6 mt-8">
          <h2 className="text-2xl text-white font-bebas mb-6">Post Ideas</h2>
          <div className="space-y-3">
            {postIdeas.map((idea) => (
              <div key={idea.id} className="p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
                {editingIdea?.id === idea.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editIdeaTitle}
                      onChange={(e) => onEditIdeaTitleChange(e.target.value)}
                      className="w-full bg-[var(--rich-black)] border border-[var(--primary-mint)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all resize-none"
                      placeholder="Idea title and description..."
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={onSaveIdea}
                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-bold uppercase tracking-widest text-xs transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 font-bold uppercase tracking-widest text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm text-white font-bold mb-2 whitespace-pre-wrap">{idea.title}</h3>
                      {idea.prompt && (
                        <p className="text-xs text-gray-400 mb-2 italic">Prompt: {idea.prompt}</p>
                      )}
                      <p className="text-[10px] text-gray-500 mb-2">
                        Created: {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditIdea(idea)}
                        className="p-2 border border-[var(--border-color)] hover:border-[var(--primary-mint)] transition-colors"
                        title="Edit Idea"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={postsToGenerate}
                          onChange={(e) => onPostsToGenerateChange(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                          className="w-16 px-2 py-1 bg-[var(--rich-black)] border border-[var(--border-color)] text-white text-xs text-center focus:outline-none focus:border-[var(--primary-mint)]"
                          title="Number of posts to generate"
                        />
                        <button
                          onClick={() => onGeneratePostsFromIdea(idea)}
                          disabled={generatingPostsFromIdea === idea.id}
                          className="px-4 py-2 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className={`w-4 h-4 ${generatingPostsFromIdea === idea.id ? 'animate-spin' : ''}`} />
                          {generatingPostsFromIdea === idea.id ? 'Generating...' : 'Generate Posts'}
                        </button>
                      </div>
                      <button
                        onClick={() => onDeleteIdea(idea.id)}
                        className="p-2 border border-[var(--border-color)] hover:border-red-400 transition-colors"
                        title="Delete Idea"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {postIdeas.length === 0 && (
        <div className="classic-panel p-6">
          <div className="text-center py-12 text-gray-400">
            <p>No post ideas yet. Click "Generate Ideas" to create some!</p>
          </div>
        </div>
      )}
    </>
  );
}

