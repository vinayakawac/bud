'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Project } from '@/types';
import { normalizeTechStack, normalizePreviewImages } from '@/lib/utils/normalize';

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-textPrimary">
            Project Not Found
          </h1>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
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

  const previewImages = normalizePreviewImages(project.previewImages);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center text-textSecondary hover:text-textPrimary mb-8 transition-colors"
        >
          <span className="mr-2">←</span> Back to Projects
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-textPrimary">
              {project.title}
            </h1>
            
            {/* Creator Attribution */}
            {project.creator && (
              <div className="mb-6 text-textSecondary">
                <span className="text-sm">Created by </span>
                <Link 
                  href={`/creators/${project.creator.id}`}
                  className="text-accent hover:underline font-medium"
                >
                  {project.creator.name}
                </Link>
                {project.collaborators && project.collaborators.length > 0 && (
                  <>
                    <span className="text-sm"> with </span>
                    {project.collaborators.map((collab: any, idx: number) => (
                      <span key={collab.id}>
                        <Link
                          href={`/creators/${collab.creator.id}`}
                          className="text-accent hover:underline font-medium"
                        >
                          {collab.creator.name}
                        </Link>
                        {idx < (project.collaborators?.length ?? 0) - 1 && ', '}
                      </span>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-card border border-border rounded-full text-sm text-textSecondary">
                {project.category}
              </span>
              {project.metadata?.version && (
                <span className="px-3 py-1 bg-card border border-border rounded-full text-sm text-textSecondary">
                  v{project.metadata.version}
                </span>
              )}
            </div>
          </div>

          {previewImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border border-border"
                >
                  <Image
                    src={image}
                    alt={`${project.title} preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <div className="markdown text-textPrimary">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-4 text-textPrimary">
              Technology Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              {normalizeTechStack(project.techStack).map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-lg font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href={project.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              View Project
            </a>
          </div>

          <div className="border-t border-border pt-8 text-sm text-textSecondary">
            <p>
              Last updated:{' '}
              {new Date(project.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
