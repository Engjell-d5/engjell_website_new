'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'editor' as 'admin' | 'editor',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser && !formData.password 
        ? { ...formData, password: undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ email: '', name: '', password: '', role: 'editor' });
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'An error occurred');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingUser(null);
    setFormData({ email: '', name: '', password: '', role: 'editor' });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl text-white font-bebas">USER MANAGEMENT</h1>
        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-[var(--primary-mint)] text-black hover:bg-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="classic-panel overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-left p-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Name</th>
              <th className="text-left p-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Email</th>
              <th className="text-left p-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Role</th>
              <th className="text-left p-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Created</th>
              <th className="text-right p-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--rich-black)]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-[var(--border-color)] rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400 text-sm">{user.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 uppercase tracking-widest ${
                    user.role === 'admin' 
                      ? 'bg-[var(--primary-mint)] text-black' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[99999] p-4 overflow-y-auto" style={{ zIndex: 99999 }}>
          <div className="classic-panel w-full max-w-md p-6 my-8 relative z-[99999] min-h-fit">
            <h2 className="text-2xl text-white font-bebas mb-6">
              {editingUser ? 'EDIT USER' : 'CREATE USER'}
            </h2>
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
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  required
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' })}
                  className="w-full bg-[var(--rich-black)] border border-[var(--border-color)] p-3 text-sm text-white focus:outline-none focus:border-[var(--primary-mint)] transition-all font-montserrat"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--primary-mint)] text-black hover:bg-white font-bold py-3 uppercase tracking-widest text-xs transition-colors"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
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

