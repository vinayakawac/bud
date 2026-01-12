'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Creator {
  id: string;
  name: string;
  email: string;
  termsAccepted: boolean;
  projectCount: number;
  createdAt: string;
}

export default function CreatorAccountPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nameForm, setNameForm] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchCreator();
  }, []);

  const fetchCreator = async () => {
    try {
      const response = await fetch('/api/creator/me');

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/creator/login');
          return;
        }
        throw new Error('Failed to fetch account data');
      }

      const data = await response.json();

      if (!data.data.creator.termsAccepted) {
        router.push('/creator/terms');
        return;
      }

      setCreator(data.data.creator);
      setNameForm(data.data.creator.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/creator/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameForm }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update name');
      }

      setSuccess('Name updated successfully');
      setCreator(data.data.creator);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/creator/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setSuccess('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/creator/logout', { method: 'POST' });
    router.push('/creator/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/creator/dashboard"
              className="text-xl font-bold text-textPrimary"
            >
              Creator Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/creator/projects"
                className="text-textSecondary hover:text-accent"
              >
                Projects
              </Link>
              <Link href="/creator/account" className="text-accent font-medium">
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="text-textSecondary hover:text-accent"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Account Settings
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="space-y-8">
          {/* Account Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-textSecondary">
              <div>
                <span className="font-medium">Email:</span> {creator?.email}
              </div>
              <div>
                <span className="font-medium">Member since:</span>{' '}
                {new Date(creator?.createdAt || '').toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Projects:</span>{' '}
                {creator?.projectCount || 0}
              </div>
              <div>
                <span className="font-medium">Terms Accepted:</span>{' '}
                {creator?.termsAccepted ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Update Name */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Update Name
            </h2>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-textPrimary mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={nameForm}
                  onChange={(e) => setNameForm(e.target.value)}
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                disabled={saving || nameForm === creator?.name}
                className="bg-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          </div>

          {/* Update Password */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">
              Change Password
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-textPrimary mb-2"
                >
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-textPrimary mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-textPrimary mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
