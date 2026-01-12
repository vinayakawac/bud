'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PullDetailsSection from '@/components/projects/PullDetailsSection';

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  category: string;
  previewImages: string;
  externalLink: string;
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    category: '',
    previewImages: '',
    externalLink: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleDataPulled = (pulledData: Partial<typeof formData>) => {
    setFormData({ ...formData, ...pulledData });
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/creator/projects`);

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/creator/login');
            return;
          }
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        const project = data.data.projects.find((p: Project) => p.id === params.id);

        if (!project) {
          throw new Error('Project not found');
        }

        setFormData({
          title: project.title,
          description: project.description,
          techStack: project.techStack,
          category: project.category,
          previewImages: project.previewImages || '',
          externalLink: project.externalLink || '',
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`/api/creator/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project');
      }

      router.push('/creator/projects');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
            <Link
              href="/creator/dashboard"
              className="text-xl font-bold text-textPrimary"
            >
              Creator Dashboard
            </Link>
            <Link
              href="/creator/projects"
              className="text-textSecondary hover:text-accent"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Edit Project
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <PullDetailsSection
          onDataPulled={handleDataPulled}
          currentFormData={formData}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-textPrimary mb-2 font-medium">
              Project Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-textPrimary mb-2 font-medium">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select a category</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Apps</option>
              <option value="ai-ml">AI/Machine Learning</option>
              <option value="blockchain">Blockchain</option>
              <option value="game">Game Development</option>
              <option value="iot">IoT</option>
              <option value="desktop">Desktop Apps</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-textPrimary mb-2 font-medium"
            >
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Describe your project, what problems it solves, and key features..."
            />
          </div>

          <div>
            <label
              htmlFor="techStack"
              className="block text-textPrimary mb-2 font-medium"
            >
              Tech Stack *
            </label>
            <input
              id="techStack"
              type="text"
              required
              value={formData.techStack}
              onChange={(e) =>
                setFormData({ ...formData, techStack: e.target.value })
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="React, Node.js, PostgreSQL, TypeScript"
            />
            <p className="text-textSecondary text-sm mt-1">
              Comma-separated list of technologies used
            </p>
          </div>

          <div>
            <label
              htmlFor="previewImages"
              className="block text-textPrimary mb-2 font-medium"
            >
              Preview Images
            </label>
            <input
              id="previewImages"
              type="text"
              value={formData.previewImages}
              onChange={(e) =>
                setFormData({ ...formData, previewImages: e.target.value })
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="https://example.com/image1.png,https://example.com/image2.png"
            />
            <p className="text-textSecondary text-sm mt-1">
              Optional: Comma-separated image URLs
            </p>
          </div>

          <div>
            <label
              htmlFor="externalLink"
              className="block text-textPrimary mb-2 font-medium"
            >
              External Link (GitHub, Live Demo, etc.)
            </label>
            <input
              id="externalLink"
              type="url"
              value={formData.externalLink}
              onChange={(e) =>
                setFormData({ ...formData, externalLink: e.target.value })
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="https://github.com/username/project"
            />
            <p className="text-textSecondary text-sm mt-1">
              Optional: Link to your code or live demo
            </p>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href="/creator/projects"
              className="px-8 py-3 border border-border text-textPrimary rounded-lg hover:bg-card transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
