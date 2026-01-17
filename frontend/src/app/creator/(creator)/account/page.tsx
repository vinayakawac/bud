'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  const [profileForm, setProfileForm] = useState({
    name: '',
    publicEmail: '',
    bio: '',
    pronouns: 'they/them',
    url: '',
    location: '',
    showLocalTime: true,
    timezone: '(GMT +05:30) Mumbai',
    socialLinks: ['', '', '', '']
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

      const creator = data.data.creator;
      setCreator(creator);
      setProfileForm({
        name: creator.name || '',
        publicEmail: creator.email || '',
        bio: creator.bio || '',
        pronouns: creator.pronouns || 'they/them',
        url: creator.website || '',
        location: creator.location || '',
        showLocalTime: creator.showLocalTime ?? true,
        timezone: creator.timezone || '(GMT +05:30) Mumbai',
        socialLinks: creator.socialLinks || ['', '', '', '']
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => i === index ? value : link)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/creator/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileForm.name,
          bio: profileForm.bio,
          pronouns: profileForm.pronouns,
          website: profileForm.url,
          location: profileForm.location,
          socialLinks: profileForm.socialLinks,
          showLocalTime: profileForm.showLocalTime,
          timezone: profileForm.timezone
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Sidebar */}
      <aside className="w-96 border-r border-border bg-bg flex-shrink-0">
        <div className="p-6">
          {/* User Profile Section */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-start gap-3 mb-2">
              <div className="relative w-12 h-12 rounded-full bg-neutral-900 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                <span className="text-xl font-bold text-accent">O</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-textPrimary truncate">
                  {creator?.name || 'oFive'}
                </h2>
                <p className="text-xs text-textSecondary">
                  (vinayakawac)
                </p>
              </div>
            </div>
            <p className="text-xs text-textSecondary">Your personal account</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <a
              href="/creator/account"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-textPrimary bg-neutral-900/50 border-l-2 border-accent rounded-r transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Public profile
            </a>
            <a
              href="/creator/account/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-neutral-900/30 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Account
            </a>
            <a
              href="/creator/account/appearance"
              className="flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-neutral-900/30 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Appearance
            </a>
            <a
              href="/creator/account/accessibility"
              className="flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-neutral-900/30 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Accessibility
            </a>
            <a
              href="/creator/account/notifications"
              className="flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-neutral-900/30 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-textPrimary">Public profile</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-16">
              {/* Left Column - Form Fields */}
              <div className="flex-1 max-w-2xl space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  />
                </div>

                {/* Pronouns */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Pronouns</label>
                  <select
                    value={profileForm.pronouns}
                    onChange={(e) => handleInputChange('pronouns', e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="">Don't specify</option>
                    <option value="they/them">they/them</option>
                    <option value="she/her">she/her</option>
                    <option value="he/him">he/him</option>
                  </select>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">URL</label>
                  <input
                    type="url"
                    value={profileForm.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                {/* Social accounts */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Social accounts</label>
                  <div className="space-y-2">
                    {profileForm.socialLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-textSecondary">🔗</span>
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                          placeholder={`Link to social profile ${index + 1}`}
                          className="flex-1 px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>

              {/* Right Column - Profile Picture */}
              <div className="w-80 flex-shrink-0">
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-4">Profile picture</label>
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 rounded-full bg-neutral-900 border border-border flex items-center justify-center overflow-hidden mb-4">
                      <span className="text-8xl font-bold text-accent">O</span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-border text-textPrimary rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>

          {/* Submit button */}
          <div className="pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-500 max-w-2xl">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-sm text-green-500 max-w-2xl">
                {success}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors"
            >
              {saving ? 'Updating...' : 'Update profile'}
            </button>
          </div>
        </form>
      </div>
    </main>
    </div>
  );
}
