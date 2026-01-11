'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => adminApi.getAnalytics(token!),
    enabled: isAuthenticated,
  });

  const analytics = analyticsData?.data;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            Admin Dashboard
          </h1>
        </div>

        <AdminNav />

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            Analytics Overview
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2 text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
                  Total Projects
                </h3>
                <p className="text-4xl font-bold text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
                  {analytics?.projects.total || 0}
                </p>
                <p className="text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary mt-2">
                  {analytics?.projects.public || 0} public
                </p>
              </div>

              <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2 text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
                  Total Ratings
                </h3>
                <p className="text-4xl font-bold text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
                  {analytics?.ratings.total || 0}
                </p>
                <p className="text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary mt-2">
                  Average: {analytics?.ratings.average.toFixed(1) || '0.0'} ★
                </p>
              </div>

              <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2 text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
                  Total Messages
                </h3>
                <p className="text-4xl font-bold text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
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
