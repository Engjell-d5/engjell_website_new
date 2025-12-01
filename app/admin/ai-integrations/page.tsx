'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Sparkles, CheckCircle, XCircle } from 'lucide-react';

interface AiIntegration {
  id: string;
  name: string;
  provider: string;
  model: string | null;
  isActive: boolean;
  apiKeyPreview: string;
  createdAt: string;
  updatedAt: string;
}

export default function AiIntegrationsPage() {
  const [integrations, setIntegrations] = useState<AiIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<AiIntegration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'openai',
    apiKey: '',
    model: '',
    isActive: true,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/ai/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingIntegration 
        ? `/api/ai/integrations/${editingIntegration.id}` 
        : '/api/ai/integrations';
      const method = editingIntegration ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingIntegration(null);
        setFormData({ name: '', provider: 'openai', apiKey: '', model: '', isActive: true });
        showMessage('success', editingIntegration ? 'Integration updated successfully!' : 'Integration created successfully!');
        fetchIntegrations();
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'An error occurred');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const response = await fetch(`/api/ai/integrations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showMessage('success', 'Integration deleted successfully!');
        fetchIntegrations();
      } else {
        showMessage('error', 'Failed to delete integration');
      }
    } catch (error) {
      showMessage('error', 'An error occurred');
    }
  };

  const openEditModal = (integration: AiIntegration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      provider: integration.provider,
      apiKey: '', // Don't pre-fill API key for security
      model: integration.model || '',
      isActive: integration.isActive,
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingIntegration(null);
    setFormData({ name: '', provider: 'openai', apiKey: '', model: '', isActive: true });
    setShowModal(true);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI (ChatGPT)';
      case 'google':
        return 'Google (Gemini)';
      case 'anthropic':
        return 'Anthropic (Claude)';
      default:
        return provider;
    }
  };

  const getDefaultModel = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'gpt-4';
      case 'google':
        return 'gemini-pro'; // Stable, widely supported model (or use gemini-1.5-pro-latest for newer)
      case 'anthropic':
        return 'claude-3-opus-20240229';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-white font-bebas">AI INTEGRATIONS</h1>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Integration
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 border ${
          message.type === 'success' 
            ? 'border-[var(--primary-mint)] bg-[var(--rich-black)] text-[var(--primary-mint)]' 
            : 'border-red-400 bg-[var(--rich-black)] text-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="classic-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--primary-mint)]" />
                <h3 className="text-xl text-white font-bebas">{integration.name}</h3>
              </div>
              {integration.isActive ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="space-y-2 mb-4">
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Provider</span>
                <p className="text-sm text-white">{getProviderDisplayName(integration.provider)}</p>
              </div>
              {integration.model && (
                <div>
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Model</span>
                  <p className="text-sm text-white">{integration.model}</p>
                </div>
              )}
              <div>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">API Key</span>
                <p className="text-sm text-gray-400 font-mono">{integration.apiKeyPreview}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
              <span className="text-[10px] text-gray-500">
                {new Date(integration.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(integration)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(integration.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="classic-panel p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No AI integrations yet</p>
          <button
            onClick={openNewModal}
            className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors"
          >
            Create Your First Integration
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto">
          <div className="classic-panel w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white font-bebas">
                {editingIntegration ? 'EDIT INTEGRATION' : 'CREATE INTEGRATION'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingIntegration(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  placeholder="e.g., My ChatGPT, Gemini Pro"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => {
                    const newProvider = e.target.value;
                    setFormData({ 
                      ...formData, 
                      provider: newProvider,
                      model: getDefaultModel(newProvider),
                    });
                  }}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  required
                >
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="google">Google (Gemini)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat font-mono"
                  placeholder={editingIntegration ? 'Leave empty to keep current key' : 'Enter API key'}
                  required={!editingIntegration}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingIntegration 
                    ? 'Leave empty to keep the current API key unchanged' 
                    : 'Your API key is stored securely and never exposed'}
                </p>
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Model (Optional)
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  placeholder={getDefaultModel(formData.provider)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: {getDefaultModel(formData.provider)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-white">
                  Active (available for use)
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--primary-mint)] text-black hover:bg-white font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                >
                  {editingIntegration ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingIntegration(null);
                  }}
                  className="flex-1 border border-[var(--border-color)] text-white hover:bg-[var(--rich-black)] font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
