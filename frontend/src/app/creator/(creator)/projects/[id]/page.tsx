'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  previewImages: string[];
  externalLink: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: any;
}

export default function ViewProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/creator/projects/${params.id}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/creator/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center text-textSecondary">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-textPrimary mb-4">Project Not Found</h2>
            <Link
              href="/creator/projects"
              className="text-accent hover:underline"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/creator/projects"
            className="text-accent hover:underline flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
          <div className="flex gap-3">
            <Link
              href={`/creator/projects/${project.id}/edit`}
              className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded"
            >
              Edit Project
            </Link>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.isPublic
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
          >
            {project.isPublic ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-border">
            <h1 className="text-3xl font-bold text-textPrimary mb-2">
              {project.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-textSecondary">
              <span>Category: {project.category}</span>
              <span>•</span>
              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-8 border-b border-border">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">Description</h2>
            <p className="text-textSecondary whitespace-pre-wrap leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="p-8 border-b border-border">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Images */}
          {project.previewImages && project.previewImages.length > 0 && (
            <div className="p-8 border-b border-border">
              <h2 className="text-xl font-semibold text-textPrimary mb-4">Preview Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.previewImages.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-bg rounded-lg overflow-hidden border border-border"
                  >
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center text-textSecondary">
                            <div class="text-center">
                              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-sm">Image unavailable</p>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Link */}
          <div className="p-8 border-b border-border">
            <h2 className="text-xl font-semibold text-textPrimary mb-4">External Link</h2>
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline flex items-center gap-2"
            >
              {project.externalLink}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Metadata */}
          {project.metadata && Object.keys(project.metadata).length > 0 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-textPrimary mb-4">Additional Details</h2>
              <div className="bg-bg rounded p-4">
                <pre className="text-sm text-textSecondary overflow-auto">
                  {JSON.stringify(project.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
