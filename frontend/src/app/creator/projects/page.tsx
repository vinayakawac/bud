'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  category: string;
  previewImages: string;
  externalLink: string;
  createdAt: string;
}

export default function CreatorProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/creator/projects');

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/creator/login');
          return;
        }
        if (response.status === 403) {
          router.push('/creator/terms');
          return;
        }
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.data.projects);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/creator/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

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

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/creator/dashboard" className="text-xl font-bold text-textPrimary">
              Creator Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/creator/projects"
                className="text-accent font-medium"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">
              Your Projects
            </h1>
            <p className="text-textSecondary">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <Link
            href="/creator/projects/new"
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            + New Project
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-semibold text-textPrimary mb-2">
              No projects yet
            </h2>
            <p className="text-textSecondary mb-6">
              Create your first project to start building your portfolio
            </p>
            <Link
              href="/creator/projects/new"
              className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                {project.previewImages && (
                  <img
                    src={project.previewImages.split(',')[0]}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-accent bg-opacity-20 text-accent px-2 py-1 rounded">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-textPrimary mb-2">
                    {project.title}
                  </h3>
                  <p className="text-textSecondary mb-2 line-clamp-3">
                    {project.description}
                  </p>
                  <p className="text-sm text-textSecondary mb-4">
                    Tech: {project.techStack}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      href={`/creator/projects/${project.id}/edit`}
                      className="flex-1 bg-accent text-white py-2 rounded text-center hover:opacity-90 transition-opacity"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
