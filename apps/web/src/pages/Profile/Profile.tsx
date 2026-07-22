import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeApi } from '../../services/api';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [image, setImage] = useState(user?.image || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await employeeApi.updateEmployee(user.id, { phone, image });
      await refreshUser();
      setSuccess('Profile details updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm overflow-y-auto font-sans">
      {/* Header */}
      <header className="px-6 py-5 border-b border-zinc-800/80 bg-zinc-950/40">
        <h1 className="text-xl font-bold tracking-tight bg-linear-to-b from-white to-zinc-300 bg-clip-text text-transparent">
          My Employee Profile
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal contact details & inspect your employee record
        </p>
      </header>

      {/* Main Container */}
      <main className="p-6 max-w-4xl w-full mx-auto space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Top Hero Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center gap-6 shadow-xl">
            <img
              src={
                image ||
                user?.image ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
              }
              alt={user?.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-indigo-500/30 shadow-lg"
            />

            <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold w-fit mx-auto sm:mx-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium">
                {user?.designation} • {user?.department}
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">Employee ID: {user?.employeeId}</p>
            </div>
          </div>

          {/* Feedback messages */}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              ⚠ {error}
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md space-y-6">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-3">
              Editable Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Contact Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-white outline-hidden"
                />
              </div>

              {/* Profile Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Profile Image Avatar URL</span>
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-white outline-hidden"
                />
              </div>
            </div>

            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-3 pt-2">
              Read-Only Organization Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Work Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Work Email</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-3 py-2.5 text-xs text-zinc-400 disabled:opacity-70 font-mono"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  value={user?.department || ''}
                  disabled
                  className="w-full bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-3 py-2.5 text-xs text-zinc-400 disabled:opacity-70"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Designation</span>
                </label>
                <input
                  type="text"
                  value={user?.designation || ''}
                  disabled
                  className="w-full bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-3 py-2.5 text-xs text-zinc-400 disabled:opacity-70"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Employment Status</span>
                </label>
                <input
                  type="text"
                  value={user?.status?.toUpperCase() || 'ACTIVE'}
                  disabled
                  className="w-full bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-semibold disabled:opacity-70"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-zinc-800/80 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
