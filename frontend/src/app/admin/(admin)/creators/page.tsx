'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminTableActions, Eye, Ban } from '@/components/admin/AdminTableActions';
import { AdminTableFilters } from '@/components/admin/AdminTableFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface Creator {
  id: string;
  name: string;
  email: string;
  username: string;
  isActive: boolean;
  projectCount: number;
  createdAt: string;
}

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 0 });
  const router = useRouter();

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/creators?${params.toString()}`, {
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
      setCreators(data.creators || data.data || []);
      if (data.meta) {
        setMeta(data.meta);
      } else {
        setMeta({ total: data.creators?.length || 0, page: 1, limit: 10, pageCount: 1 });
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit, router]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchCreators();
    }, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [fetchCreators, search]);

  const toggleCreatorStatus = async (creatorId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this creator account?`)) return;

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

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || status);

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
        Inactive
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Creators</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage creator accounts
        </p>
      </div>

      {/* Filters */}
      <AdminTableFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filters={[
          {
            key: 'status',
            label: 'Filter by status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
          },
        ]}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 bg-neutral-100 rounded w-24 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-neutral-100 rounded w-20 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-neutral-100 rounded w-32 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-neutral-100 rounded w-12 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-5 bg-neutral-100 rounded w-16 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-neutral-100 rounded w-24 animate-pulse" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-neutral-100 rounded w-8 ml-auto animate-pulse" /></td>
                </tr>
              ))
            ) : creators.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500 text-sm">
                  {hasActiveFilters ? 'No creators match your filters' : 'No creators yet'}
                </td>
              </tr>
            ) : (
              creators.map((creator) => (
                <tr
                  key={creator.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-neutral-900 font-medium">
                    {creator.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    @{creator.username}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {creator.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/projects?creator=${creator.id}`}
                      className="text-orange-600 hover:underline"
                    >
                      {creator.projectCount}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(creator.isActive)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {formatDate(creator.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminTableActions
                      actions={[
                        {
                          label: 'View Profile',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => router.push(`/creators/${creator.id}`),
                        },
                        {
                          label: creator.isActive ? 'Deactivate' : 'Activate',
                          icon: <Ban className="w-4 h-4" />,
                          onClick: () => toggleCreatorStatus(creator.id, creator.isActive),
                          variant: creator.isActive ? 'danger' : 'default',
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <AdminPagination
            page={meta.page}
            pageCount={meta.pageCount}
            total={meta.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
