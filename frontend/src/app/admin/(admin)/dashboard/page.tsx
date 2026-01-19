'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FolderKanban, Users, Star, MessageSquare, ArrowRight } from 'lucide-react';

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
  creators?: {
    total: number;
    active: number;
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

  const stats = [
    {
      label: 'Total Projects',
      value: analytics?.projects?.total || 0,
      subtext: `${analytics?.projects?.public || 0} public`,
      icon: FolderKanban,
      href: '/admin/projects',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Creators',
      value: analytics?.creators?.total || 0,
      subtext: `${analytics?.creators?.active || 0} active`,
      icon: Users,
      href: '/admin/creators',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Reviews',
      value: analytics?.ratings?.total || 0,
      subtext: `${(analytics?.ratings?.average || 0).toFixed(1)} avg rating`,
      icon: Star,
      href: '/admin/ratings',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Messages',
      value: analytics?.messages?.total || 0,
      subtext: `${analytics?.messages?.unread || 0} unread`,
      icon: MessageSquare,
      href: '/admin/contacts',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Overview of your platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-lg p-5 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-neutral-100 rounded w-24" />
                  <div className="h-8 w-8 bg-neutral-100 rounded" />
                </div>
                <div className="h-8 bg-neutral-100 rounded w-16 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-20" />
              </div>
            ))
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-neutral-600">
                      {stat.label}
                    </span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-neutral-900 mb-1">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{stat.subtext}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="text-sm font-medium text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/projects"
            className="px-4 py-2.5 text-sm text-center bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors text-neutral-700"
          >
            View Projects
          </Link>
          <Link
            href="/admin/creators"
            className="px-4 py-2.5 text-sm text-center bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors text-neutral-700"
          >
            Manage Creators
          </Link>
          <Link
            href="/admin/ratings"
            className="px-4 py-2.5 text-sm text-center bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors text-neutral-700"
          >
            Review Ratings
          </Link>
          <Link
            href="/admin/contacts"
            className="px-4 py-2.5 text-sm text-center bg-neutral-50 hover:bg-neutral-100 rounded-md transition-colors text-neutral-700"
          >
            Check Messages
          </Link>
        </div>
      </div>
    </div>
  );
}
