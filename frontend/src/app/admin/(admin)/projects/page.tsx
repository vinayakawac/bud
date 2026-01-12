'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
  creator?: {
    name: string;
  } | null;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!confirm('Are you sure you want to delete this project?')) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-textSecondary">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Manage Projects
        </h1>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-card border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">
                    No projects yet. Projects will appear here once created by admins or creators.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-bg/50">
                    <td className="px-6 py-4 text-sm text-textPrimary">
                      {project.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                      {project.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                      {project.creator?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          project.isPublic
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {project.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => togglePublic(project.id, project.isPublic)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                      >
                        {project.isPublic ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
