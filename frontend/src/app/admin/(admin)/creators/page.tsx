'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Creator {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  projectCount: number;
  createdAt: string;
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/admin/creators', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }

      const data = await response.json();
      setCreators(data.creators || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCreatorStatus = async (creatorId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/creators/${creatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchCreators();
      }
    } catch (error) {
      console.error('Error updating creator status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-textSecondary">Loading creators...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Manage Creators
        </h1>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-card border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-bg/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                    {creator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    {creator.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    <Link
                      href={`/admin/projects?creator=${creator.id}`}
                      className="text-accent hover:underline"
                    >
                      {creator.projectCount} projects
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        creator.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {creator.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    {new Date(creator.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleCreatorStatus(creator.id, creator.isActive)}
                      className={`px-3 py-1 rounded ${
                        creator.isActive
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {creator.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
