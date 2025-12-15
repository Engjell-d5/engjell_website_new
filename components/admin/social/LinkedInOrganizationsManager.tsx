'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SocialConnection } from '@/types/admin';

interface LinkedInOrganizationsManagerProps {
  connection: SocialConnection;
  onUpdate: () => void;
}

export default function LinkedInOrganizationsManager({ connection, onUpdate }: LinkedInOrganizationsManagerProps) {
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; urn: string }>>([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgUrn, setNewOrgUrn] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (connection.organizations) {
      try {
        const parsed = JSON.parse(connection.organizations);
        setOrganizations(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Error parsing organizations:', e);
        setOrganizations([]);
      }
    } else {
      setOrganizations([]);
    }
  }, [connection.organizations]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/social/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'linkedin',
          organizations,
        }),
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save organizations');
      }
    } catch (error) {
      console.error('Error saving organizations:', error);
      alert('Failed to save organizations');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (newOrgName.trim() && newOrgUrn.trim()) {
      const newOrg = {
        id: Date.now().toString(),
        name: newOrgName.trim(),
        urn: newOrgUrn.trim(),
      };
      setOrganizations([...organizations, newOrg]);
      setNewOrgName('');
      setNewOrgUrn('');
    }
  };

  const handleRemove = (id: string) => {
    setOrganizations(organizations.filter((o) => o.id !== id));
  };

  return (
    <div className="mt-6 p-4 border border-[var(--border-color)] bg-[var(--rich-black)]">
      <h3 className="text-lg text-white font-bebas mb-4">LinkedIn Organizations for Mentions</h3>
      <p className="text-xs text-gray-400 mb-4">
        Add LinkedIn organization URNs to enable @mention functionality when creating posts. These organizations will be available when you select LinkedIn as a platform.
      </p>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organization Name (e.g., My Company)"
            className="flex-1 bg-black border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat"
          />
          <input
            type="text"
            value={newOrgUrn}
            onChange={(e) => setNewOrgUrn(e.target.value)}
            placeholder="urn:li:organization:12345"
            className="flex-1 bg-black border border-[var(--border-color)] p-2 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-colors font-montserrat"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/80 transition-colors text-xs font-bold uppercase"
          >
            Add
          </button>
        </div>
        
        {organizations.length > 0 && (
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-2 bg-black border border-[var(--border-color)]">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-white">{org.name}</span>
                  <span className="text-[10px] text-gray-400 ml-2">{org.urn}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(org.id)}
                  className="ml-2 p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-[var(--primary-mint)] text-black hover:bg-[var(--primary-mint)]/80 transition-colors text-xs font-bold uppercase disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Organizations'}
      </button>
    </div>
  );
}

