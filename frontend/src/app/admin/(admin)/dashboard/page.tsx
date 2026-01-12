'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Analytics {
  projects: {
    total: number;
    public: number;
  };
  ratings: {
    total: number;
    average: number;
  };
  messages: {
    total: number;
    unread: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary">
            Admin Dashboard
          </h1>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-textPrimary">
            Analytics Overview
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-card rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2 text-textSecondary">
                  Total Projects
                </h3>
                <p className="text-4xl font-bold text-textPrimary">
                  {analytics?.projects.total || 0}
                </p>
                <p className="text-sm text-textSecondary mt-2">
                  {analytics?.projects.public || 0} public
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2 text-textSecondary">
                  Total Ratings
                </h3>
                <p className="text-4xl font-bold text-textPrimary">
                  {analytics?.ratings.total || 0}
                </p>
                <p className="text-sm text-textSecondary mt-2">
                  Average: {analytics?.ratings.average.toFixed(1) || '0.0'} ★
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2 text-textSecondary">
                  Total Messages
                </h3>
                <p className="text-4xl font-bold text-textPrimary">
                  {analytics?.messages.total || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
