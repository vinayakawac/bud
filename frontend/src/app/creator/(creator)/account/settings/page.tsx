'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Creator {
  id: string;
  name: string;
  email: string;
  username: string;
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Change username modal state
  const [showUsernameWarning, setShowUsernameWarning] = useState(false);
  const [showUsernameChange, setShowUsernameChange] = useState(false);
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
      setCreator(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching creator:', err);
      setLoading(false);
    }
  };

  const handleChangeUsernameClick = () => {
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    // Show confirmation modal directly
    setShowUsernameConfirm(true);
  };

  const handleUsernameChangeConfirm = async () => {
    // Call API to change username
    try {
      const response = await fetch('/api/creator/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change username');
      }

      const data = await response.json();
      setCreator(data.data.creator);
      
      // Close all modals and reset
      setShowUsernameConfirm(false);
      setNewUsername('');
      
      alert('Username changed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to change username');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmUsername !== creator?.username || deleteConfirmText !== 'delete my account') {
      return;
    }

    // Here you would call your API to delete account
    console.log('Deleting account');
    
    // For now, just close the modal
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Sidebar */}
      <aside className="w-80 border-r border-border bg-bg flex-shrink-0">
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
                  ({creator?.username || 'vinayakawac'})
                </p>
              </div>
            </div>
            <p className="text-xs text-textSecondary">Your personal account</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <a
              href="/creator/account"
              className="flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-neutral-900/30 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Public profile
            </a>
            <a
              href="/creator/account/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-textPrimary bg-neutral-900/50 border-l-2 border-accent rounded-r transition-colors"
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
          <h1 className="text-2xl font-bold text-textPrimary mb-6">Change username</h1>

          {/* Change username section */}
          <div className="mb-12">
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Enter a new username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => {
                setNewUsername(e.target.value);
                setUsernameError('');
              }}
              className="w-full max-w-md px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Enter new username"
            />
            {usernameError && (
              <p className="mb-4 text-xs text-red-500">{usernameError}</p>
            )}
            <div>
              <button
                onClick={handleChangeUsernameClick}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Change username
              </button>
            </div>
          </div>

          {/* Delete account section */}
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-bold text-red-500 mb-4">Delete account</h2>
            <p className="text-sm text-textSecondary mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Delete your account
            </button>
          </div>
        </div>
      </main>

      {/* Username Warning Modal */}
      {showUsernameWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-2xl w-full border border-border">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-textPrimary">Really change your username?</h2>
                <button
                  onClick={() => setShowUsernameWarning(false)}
                  className="text-textSecondary hover:text-textPrimary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-red-950/30 border border-red-500/30 rounded-md p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-textPrimary font-semibold">
                    Unexpected bad things will happen if you don't read this!
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-6 text-sm text-textPrimary">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>We <strong>will not</strong> set up redirects for your old profile page.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>We <strong>will not</strong> set up redirects for Pages sites.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>We <strong>will</strong> create redirects for your repositories (web and git access).</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Renaming may take a few minutes to complete.</span>
                </li>
              </ul>

              <button
                onClick={handleUsernameChangeConfirm}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                I understand, let's change my username
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Username Modal */}
      {showUsernameChange && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-xl w-full border border-border">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-textPrimary">Change username</h2>
                <button
                  onClick={() => {
                    setShowUsernameChange(false);
                    setNewUsername('');
                    setUsernameError('');
                  }}
                  className="text-textSecondary hover:text-textPrimary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-textPrimary mb-2">
                  Enter a new username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    setUsernameError('');
                  }}
                  className="w-full px-3 py-2 bg-bg border border-blue-500 rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new username"
                />
                {usernameError && (
                  <p className="mt-2 text-xs text-red-500">{usernameError}</p>
                )}
              </div>

              <button
                onClick={() => setShowUsernameChange(true)}
                className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Change username
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Username Change Confirmation Modal */}
      {showUsernameConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-md w-full border border-border">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-textPrimary mb-4">Are you sure?</h2>
              <p className="text-sm text-textSecondary mb-6">
                Do you want to change your username to <strong className="text-textPrimary">{newUsername}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUsernameConfirm(false)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUsernameChangeConfirm}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg max-w-2xl w-full border border-border">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-textPrimary">Are you sure you want to do this?</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmUsername('');
                    setDeleteConfirmText('');
                  }}
                  className="text-textSecondary hover:text-textPrimary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-red-950/30 border border-red-500/30 rounded-md p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-textPrimary font-semibold">
                    This is extremely important.
                  </p>
                </div>
              </div>

              <div className="mb-6 space-y-4 text-sm text-textPrimary">
                <p>
                  We will <strong>immediately delete all of your projects and data</strong>, along with all of your ratings, comments, and collaboration requests.
                </p>
                <p>
                  You will no longer be billed, and after 90 days your username will be available to anyone on the platform.
                </p>
                <p>
                  This action is permanent and cannot be undone. Please be certain before proceeding.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    Your username or email:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmUsername}
                    onChange={(e) => setDeleteConfirmUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={creator?.username || 'vinayakawac'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-2">
                    To verify, type <em className="font-semibold">delete my account</em> exactly as it appears:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded-md text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="delete my account"
                  />
                </div>
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmUsername !== (creator?.username || 'vinayakawac') || deleteConfirmText !== 'delete my account'}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors"
              >
                Cancel plan and delete this account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
