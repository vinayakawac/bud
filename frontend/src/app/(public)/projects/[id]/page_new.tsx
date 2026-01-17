'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Tabs } from '@/components/ui/Tabs';
import type { Project } from '@/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.getProjectById(id),
    enabled: !!id,
  });

  const project: Project | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-card rounded w-3/4" />
            <div className="h-96 bg-card rounded" />
            <div className="space-y-4">
              <div className="h-4 bg-card rounded w-full" />
              <div className="h-4 bg-card rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-textPrimary">
            Project Not Found
          </h1>
          <p className="text-textSecondary mb-8">
            The project you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/projects"
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // Filter valid images
  const validPreviewImages = project.previewImages.filter(
    (img) => img && typeof img === 'string' && img.length > 0 && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/'))
  );

  const rating = project.metadata?.averageRating ?? 0;
  const ratingCount = project.metadata?.ratingCount ?? 0;
  const views = project.metadata?.views ?? 0;
  const commentCount = project.metadata?.commentCount ?? 0;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'images', label: 'Images', count: validPreviewImages.length },
    { id: 'feedback', label: 'Feedback', count: commentCount },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-card/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            href="/projects"
            className="text-sm text-textSecondary hover:text-textPrimary transition-colors"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent/10 via-purple-600/10 to-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Main Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-accent/20 border border-accent/30 rounded text-accent text-sm font-medium">
                  {project.category}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">★</span>
                  <span className="text-textPrimary font-medium">{rating.toFixed(1)}</span>
                  {ratingCount > 0 && (
                    <span className="text-textSecondary">({ratingCount})</span>
                  )}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-textPrimary">
                {project.title}
              </h1>

              {project.creator && (
                <Link
                  href={`/creators/${project.creator.id}`}
                  className="inline-flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary transition-colors mb-4"
                >
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-white">
                    {project.creator.name.charAt(0).toUpperCase()}
                  </div>
                  <span>by {project.creator.name}</span>
                </Link>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-textSecondary mb-6">
                <span>Updated: {new Date(project.updatedAt).toDateString()}</span>
                <span>•</span>
                <span>{views} views</span>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-wrap gap-3">
                {project.externalLink && (
                  <a
                    href={project.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
                  >
                    Visit Live Site
                  </a>
                )}
              </div>
            </div>

            {/* Hero Image */}
            {validPreviewImages[0] && (
              <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border shadow-xl">
                  <Image
                    src={validPreviewImages[0]}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs tabs={tabs} defaultTab="overview">
              {(activeTab) => (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Description */}
                      <section>
                        <h2 className="text-xl font-bold mb-4 text-textPrimary">
                          Description
                        </h2>
                        <div className="prose prose-invert max-w-none bg-card border border-border rounded-lg p-6">
                          <ReactMarkdown className="text-textSecondary">
                            {project.description}
                          </ReactMarkdown>
                        </div>
                      </section>

                      {/* Tech Stack */}
                      <section>
                        <h2 className="text-xl font-bold mb-4 text-textPrimary">
                          Technology Stack
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1.5 text-sm rounded bg-white/5 text-blue-400 border border-white/10 hover:border-blue-400/50 transition-colors cursor-pointer"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Images Tab */}
                  {activeTab === 'images' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4 text-textPrimary">
                        Gallery
                      </h2>
                      {validPreviewImages.length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
                          <p className="text-textSecondary">
                            No preview images available for this project
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {validPreviewImages.map((img, index) => (
                            <div
                              key={index}
                              className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-accent/50 transition-colors group cursor-pointer"
                            >
                              <Image
                                src={img}
                                alt={`${project.title} preview ${index + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feedback Tab */}
                  {activeTab === 'feedback' && (
                    <div className="space-y-6">
                      <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-textPrimary">
                          Ratings
                        </h2>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="text-4xl font-bold text-textPrimary">
                            {rating.toFixed(1)}
                          </div>
                          <div>
                            <div className="flex text-yellow-500 text-xl">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                  {i < Math.round(rating) ? '★' : '☆'}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-textSecondary">
                              {ratingCount} rating{ratingCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/rate"
                          className="text-sm text-accent hover:text-accent/80"
                        >
                          Rate this project →
                        </Link>
                      </div>

                      <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-textPrimary">
                          Comments
                        </h2>
                        <p className="text-textSecondary text-center py-8">
                          Be the first to comment on this project
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats Tab */}
                  {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-accent mb-2">
                          {views}
                        </div>
                        <div className="text-sm text-textSecondary">Views</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-accent mb-2">
                          {ratingCount}
                        </div>
                        <div className="text-sm text-textSecondary">Ratings</div>
                      </div>
                      <div className="bg-card border border-border rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-accent mb-2">
                          {commentCount}
                        </div>
                        <div className="text-sm text-textSecondary">Comments</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Creator Card */}
              {project.creator && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold mb-4 text-textPrimary">
                    Creator
                  </h3>
                  <Link
                    href={`/creators/${project.creator.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg font-semibold text-white">
                      {project.creator.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-textPrimary group-hover:text-accent transition-colors">
                        {project.creator.name}
                      </div>
                      <div className="text-xs text-textSecondary">
                        View profile →
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Collaborators */}
              {project.collaborators && project.collaborators.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-sm font-semibold mb-4 text-textPrimary">
                    Collaborators
                  </h3>
                  <div className="space-y-3">
                    {project.collaborators.map((collab: any) => (
                      <Link
                        key={collab.id}
                        href={`/creators/${collab.creator.id}`}
                        className="flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-accent/70 flex items-center justify-center text-xs font-semibold text-white">
                          {collab.creator.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{collab.creator.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-semibold mb-4 text-textPrimary">
                  Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-bgSecondary rounded transition-colors text-left">
                    Share project
                  </button>
                  <button className="w-full px-4 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-bgSecondary rounded transition-colors text-left">
                    Report issue
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
