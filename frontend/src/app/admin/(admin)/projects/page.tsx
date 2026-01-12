'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { adminApi, api } from '@/lib/api';
import { AdminNav } from '@/components/admin/AdminNav';
import { Project } from '@/types';

export default function AdminProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuthStore();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.getProjects(),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createProject(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setShowForm(false);
      alert('Project created successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error || 'Failed to create project'}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateProject(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      setEditingProject(null);
      setShowForm(false);
      alert('Project updated successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error || 'Failed to update project'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProject(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      alert('Project deleted successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error || 'Failed to delete project'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      techStack: (formData.get('techStack') as string).split(',').map((t) => t.trim()),
      externalLink: formData.get('externalLink') as string,
      previewImages: (formData.get('previewImages') as string)
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
      isPublic: formData.get('isPublic') === 'on',
      metadata: {
        version: formData.get('version') as string,
        year: parseInt(formData.get('year') as string),
      },
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingProject(null);
    setShowForm(false);
  };

  const handlePullGitHubDetails = async () => {
    const linkInput = document.getElementById('externalLink') as HTMLInputElement;
    const githubUrl = linkInput?.value;

    if (!githubUrl) {
      alert('Please enter a GitHub URL first');
      return;
    }

    // Extract owner and repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      alert('Invalid GitHub URL. Format should be: https://github.com/owner/repo');
      return;
    }

    const [, owner, repoName] = match;
    const cleanRepoName = repoName.replace(/\.git$/, '');

    try {
      // Show loading state
      const pullButton = document.querySelector('button[type="button"]') as HTMLButtonElement;
      const originalText = pullButton.textContent;
      pullButton.textContent = 'Pulling...';
      pullButton.disabled = true;

      // Fetch repository details
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepoName}`);
      if (!repoResponse.ok) {
        throw new Error('Repository not found');
      }
      const repoData = await repoResponse.json();

      // Fetch languages
      const langsResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepoName}/languages`);
      const langsData = await langsResponse.json();
      const languages = Object.keys(langsData);

      // Fetch README
      let readmeContent = '';
      try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepoName}/readme`, {
          headers: { Accept: 'application/vnd.github.v3.raw' },
        });
        if (readmeResponse.ok) {
          readmeContent = await readmeResponse.text();
        }
      } catch (e) {
        console.log('Could not fetch README');
      }

      // Fetch latest release for version
      let version = '';
      try {
        const releaseResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepoName}/releases/latest`);
        if (releaseResponse.ok) {
          const releaseData = await releaseResponse.json();
          version = releaseData.tag_name.replace(/^v/, '');
        }
      } catch (e) {
        // Try to extract from README if release fails
        const versionMatch = readmeContent.match(/version[:\s]+v?(\d+\.\d+\.\d+)/i);
        if (versionMatch) {
          version = versionMatch[1];
        }
      }

      // Extract images from README
      const imageUrls: string[] = [];
      const imageMatches = readmeContent.matchAll(/!\[.*?\]\((https?:\/\/[^\)]+)\)/g);
      for (const match of imageMatches) {
        imageUrls.push(match[1]);
      }

      // Auto-fill form fields
      const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
      const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
      const techStackInput = document.querySelector('input[name="techStack"]') as HTMLInputElement;
      const previewImagesInput = document.querySelector('input[name="previewImages"]') as HTMLInputElement;
      const versionInput = document.querySelector('input[name="version"]') as HTMLInputElement;
      const yearInput = document.querySelector('input[name="year"]') as HTMLInputElement;

      // Fill title
      if (titleInput) {
        titleInput.value = repoData.name.replace(/-/g, ' ').replace(/_/g, ' ') || '';
      }

      // Build simplified description
      if (descriptionInput) {
        let description = `# ${repoData.name}\n\n`;
        
        if (repoData.description) {
          description += `${repoData.description}\n\n`;
        }

        // Add brief stats
        description += `## Overview\n\n`;
        description += `Stars: ${repoData.stargazers_count.toLocaleString()} | `;
        description += `Forks: ${repoData.forks_count.toLocaleString()} | `;
        description += `Last Updated: ${new Date(repoData.updated_at).toLocaleDateString()}\n\n`;

        // Extract and simplify features from README
        const featuresMatch = readmeContent.match(/##\s*Features?([\s\S]*?)(?=##|$)/i);
        if (featuresMatch) {
          const features = featuresMatch[1].trim();
          const featureLines = features.split('\n').filter(line => line.trim()).slice(0, 5);
          if (featureLines.length > 0) {
            description += `## Key Features\n\n${featureLines.join('\n')}\n\n`;
          }
        }

        // Tech stack summary
        description += `## Technologies\n\n`;
        if (languages.length > 0) {
          description += `Built with ${languages.slice(0, 5).join(', ')}.\n\n`;
        } else if (repoData.language) {
          description += `Built with ${repoData.language}.\n\n`;
        }

        // Links
        description += `## Links\n\n`;
        description += `- Repository: ${repoData.html_url}\n`;
        if (repoData.homepage) {
          description += `- Demo: ${repoData.homepage}\n`;
        }
        if (repoData.license) {
          description += `- License: ${repoData.license.name}\n`;
        }

        descriptionInput.value = description;
      }

      // Fill tech stack
      if (techStackInput) {
        const techs = new Set<string>();
        
        // Add primary language
        if (repoData.language) techs.add(repoData.language);
        
        // Add other languages
        languages.forEach(lang => techs.add(lang));
        
        // Add relevant topics
        if (repoData.topics && repoData.topics.length > 0) {
          repoData.topics.slice(0, 8).forEach((topic: string) => techs.add(topic));
        }

        techStackInput.value = Array.from(techs).slice(0, 10).join(', ');
      }

      // Fill preview images
      if (previewImagesInput && imageUrls.length > 0) {
        previewImagesInput.value = imageUrls.slice(0, 5).join(', ');
      }

      // Fill version
      if (versionInput && version) {
        versionInput.value = version;
      }

      // Fill year
      if (yearInput) {
        yearInput.value = new Date(repoData.created_at).getFullYear().toString();
      }

      // Restore button
      pullButton.textContent = originalText;
      pullButton.disabled = false;

      alert(`Successfully pulled details from ${repoData.name}!\n\n` +
            `Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count}\n` +
            `Languages: ${languages.length} detected\n` +
            `Images: ${imageUrls.length} found` +
            (version ? `\nVersion: ${version}` : ''));
    } catch (error) {
      console.error('Error fetching GitHub details:', error);
      const pullButton = document.querySelector('button[type="button"]') as HTMLButtonElement;
      pullButton.textContent = 'Pull Details';
      pullButton.disabled = false;
      alert('Failed to fetch repository details.\n\nPlease check:\n- The URL is correct\n- The repository is public\n- You have internet connection');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textPrimary">Manage Projects</h1>
        </div>

        <AdminNav />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-textPrimary">All Projects</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-accent hover:opacity-90 text-white rounded-lg transition-opacity"
            >
              {showForm ? 'Cancel' : '+ Add New Project'}
            </button>
          </div>

          {showForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 text-textPrimary">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-textPrimary">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingProject?.title}
                    required
                    className="w-full h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-textPrimary">
                    Description (Markdown) *
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingProject?.description}
                    required
                    rows={6}
                    className="w-full px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-textPrimary">
                      Category *
                    </label>
                    <select
                      name="category"
                      defaultValue={editingProject?.category}
                      required
                      className="w-full h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="Desktop App">Desktop App</option>
                      <option value="API/Backend">API/Backend</option>
                      <option value="Library/Package">Library/Package</option>
                      <option value="Tool/Utility">Tool/Utility</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-textPrimary">
                      External Link (GitHub URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        name="externalLink"
                        id="externalLink"
                        defaultValue={editingProject?.externalLink}
                        placeholder="https://github.com/username/repo"
                        className="flex-1 h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={handlePullGitHubDetails}
                        className="px-4 h-[42px] bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors whitespace-nowrap"
                      >
                        Pull Details
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-textPrimary">
                    Tech Stack (comma-separated) *
                  </label>
                  <input
                    type="text"
                    name="techStack"
                    defaultValue={editingProject?.techStack.join(', ')}
                    required
                    placeholder="React, Node.js, PostgreSQL"
                    className="w-full h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-textPrimary">
                    Preview Images (comma-separated URLs)
                  </label>
                  <input
                    type="text"
                    name="previewImages"
                    defaultValue={editingProject?.previewImages.join(', ')}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    className="w-full h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-textPrimary">
                      Version
                    </label>
                    <input
                      type="text"
                      name="version"
                      defaultValue={editingProject?.metadata?.version}
                      placeholder="1.0.0"
                      className="w-full h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-textPrimary">
                      Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      defaultValue={editingProject?.metadata?.year || new Date().getFullYear()}
                      placeholder="2024"
                      className="w-full h-[42px] px-4 py-2 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    id="isPublic"
                    defaultChecked={editingProject?.isPublic ?? true}
                    className="w-4 h-4 text-accent bg-inputBg border-inputBorder rounded focus:ring-accent"
                  />
                  <label htmlFor="isPublic" className="ml-2 text-sm text-textPrimary">
                    Make project public
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-6 py-2 bg-accent hover:opacity-90 text-white rounded-lg transition-opacity disabled:opacity-50"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                  {editingProject && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 bg-card border border-border hover:bg-bgSecondary text-textPrimary rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="text-textSecondary">Loading projects...</div>
          ) : (
            <div className="grid gap-4">
              {projectsData?.data.map((project: Project) => (
                <div
                  key={project.id}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-textPrimary mb-2">
                        {project.title}
                      </h3>
                      <p className="text-textSecondary mb-3 line-clamp-2">
                        {project.description.substring(0, 150)}...
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                          {project.category}
                        </span>
                        {project.techStack.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-1 bg-accent/10 text-textSecondary rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {!project.isPublic && (
                          <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors"
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
    </div>
  );
}
