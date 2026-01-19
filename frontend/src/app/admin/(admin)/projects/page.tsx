'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTableFilters } from '@/components/admin/AdminTableFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminTableActions, Eye, Edit, Ban, Trash2 } from '@/components/admin/AdminTableActions';

interface Project {
  id: string;
  title: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
  } | null;
}

interface FilterOptions {
  categories: string[];
  creators: { id: string; name: string }[];
}

interface ApiResponse {
  success: boolean;
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
  filterOptions: FilterOptions;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 0 });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    creators: [],
  });

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [creator, setCreator] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (category) params.set('category', category);
      if (creator) params.set('creator', creator);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const result: ApiResponse = await response.json();
        setProjects(Array.isArray(result.data) ? result.data : []);
        setMeta(result.meta || { total: 0, page: 1, limit: 10, pageCount: 0 });
        setFilterOptions(result.filterOptions || { categories: [], creators: [] });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, creator, page, limit, router]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProjects();
    }, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [fetchProjects, search]);

  const togglePublic = async (projectId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublic: !currentStatus }),
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setCreator('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || status || category || creator);

  const getStatusBadge = (isPublic: boolean) => {
    if (isPublic) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Public
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600">
        Private
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
        <h1 className="text-2xl font-semibold text-neutral-900">Projects</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage all projects in the system
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
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Private' },
            ],
            value: status,
            onChange: (v) => {
              setStatus(v);
              setPage(1);
            },
          },
          {
            key: 'category',
            label: 'Filter by category',
            options: filterOptions?.categories?.map((c) => ({ value: c, label: c })) || [],
            value: category,
            onChange: (v) => {
              setCategory(v);
              setPage(1);
            },
          },
          {
            key: 'creator',
            label: 'Filter by creator',
            options: filterOptions?.creators?.map((c) => ({ value: c.id, label: c.name })) || [],
            value: creator,
            onChange: (v) => {
              setCreator(v);
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
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded w-32 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-5 bg-neutral-100 rounded w-16 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded w-20 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded w-24 animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-neutral-100 rounded w-8 ml-auto animate-pulse" />
                  </td>
                </tr>
              ))
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500 text-sm">
                  {hasActiveFilters
                    ? 'No projects match your filters'
                    : 'No projects yet'}
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/projects/${project.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-neutral-900 font-medium">
                    {project.title}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(project.isPublic)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {project.creator?.name || 'Admin'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {project.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {formatDate(project.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminTableActions
                      actions={[
                        {
                          label: 'View',
                          icon: <Eye className="w-4 h-4" />,
                          onClick: () => router.push(`/admin/projects/${project.id}`),
                        },
                        {
                          label: 'Edit',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: () => router.push(`/admin/projects/${project.id}/edit`),
                        },
                        {
                          label: project.isPublic ? 'Make Private' : 'Make Public',
                          icon: <Ban className="w-4 h-4" />,
                          onClick: () => togglePublic(project.id, project.isPublic),
                        },
                        {
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => deleteProject(project.id),
                          variant: 'danger',
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
