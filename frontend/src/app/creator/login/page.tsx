'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/creator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to terms page if not accepted
      if (!data.data.creator.termsAccepted) {
        router.push('/creator/terms');
      } else {
        router.push('/creator/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-2">
            Creator Sign In
          </h1>
          <p className="text-textSecondary mb-6">
            Access your creator dashboard
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-textPrimary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="creator@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-textPrimary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-textSecondary text-center mt-6">
            Don't have an account?{' '}
            <Link
              href="/creator/register"
              className="text-accent hover:underline"
            >
              Create Account
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-border">
            <Link
              href="/creators/apply"
              className="text-textSecondary hover:text-accent text-sm block text-center"
            >
              Learn about creator rules & terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
