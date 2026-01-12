'use client';

import { useEffect, useState } from 'react';
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

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await fetch('/api/creator/me');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/creator/login');
            return;
          }
          throw new Error('Failed to fetch creator data');
        }

        const data = await response.json();

        if (!data.data.creator.termsAccepted) {
          router.push('/creator/terms');
          return;
        }

        setCreator(data.data.creator);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [router]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-textPrimary">
              Creator Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/creator/projects"
                className="text-textSecondary hover:text-accent"
              >
                Projects
              </Link>
              <Link
                href="/creator/account"
                className="text-textSecondary hover:text-accent"
              >
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-textPrimary mb-2">
            Welcome back, {creator?.name}!
          </h2>
          <p className="text-textSecondary">
            Manage your projects and account settings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <svg className="w-10 h-10 text-accent mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-3xl font-bold text-textPrimary mb-1">
              {creator?.projectCount || 0}
            </div>
            <div className="text-textSecondary">Total Projects</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <svg className="w-10 h-10 text-accent mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-lg font-semibold text-textPrimary mb-1">
              Active
            </div>
            <div className="text-textSecondary">Account Status</div>
          </div>
svg className="w-10 h-10 text-accent mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-3">📅</div>
            <div className="text-lg font-semibold text-textPrimary mb-1">
              {new Date(creator?.createdAt || '').toLocaleDateString()}
            </div>
            <div className="text-textSecondary">Member Since</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/creator/projects"
            className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-textPrimary">
                Your Projects
              </h3>
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            <p className="text-textSecondary">
              View, edit, and manage all your projects
            </p>
          </Link>

          <Link
            href="/creator/projects/new"
            className="bg-accent bg-opacity-10 border border-accent rounded-lg p-6 hover:bg-opacity-20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-textPrimary">
                New Project
              </h3>
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <p className="text-textSecondary">Create and publish a new project</p>
          </Link>

          <Link
            href="/creator/account"
            className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-textPrimary">
                Account Settings
              </h3>
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p className="text-textSecondary">
              Update your profile and preferences
            </p>
          </Link>

          <Link
            href="/"
            className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-textPrimary">
                View Public Site
              </h3>
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
            <p className="text-textSecondary">
              See how your projects appear to visitors
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
