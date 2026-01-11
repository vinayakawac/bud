'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { api } from '@/lib/api';
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded w-3/4" />
            <div className="h-96 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded" />
            <div className="space-y-4">
              <div className="h-4 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded w-full" />
              <div className="h-4 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded w-5/6" />
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
          <h1 className="text-3xl font-bold mb-4 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            Project Not Found
          </h1>
          <p className="text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary mb-8">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/projects"
            className="px-6 py-3 bg-dark-accent dark:bg-dark-accent light:bg-light-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity inline-block"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary hover:text-dark-text-primary dark:hover:text-dark-text-primary light:hover:text-light-text-primary mb-8 transition-colors"
        >
          <span className="mr-2">←</span> Back to Projects
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-full text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
                {project.category}
              </span>
              {project.metadata?.version && (
                <span className="px-3 py-1 bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-full text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
                  v{project.metadata.version}
                </span>
              )}
            </div>
          </div>

          {project.previewImages && project.previewImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.previewImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border border-dark-border dark:border-dark-border light:border-light-border"
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
            <div className="markdown text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
          </div>

          <div className="border-t border-dark-border dark:border-dark-border light:border-light-border pt-8">
            <h2 className="text-2xl font-bold mb-4 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              Technology Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-dark-accent/10 dark:bg-dark-accent/10 light:bg-light-accent/10 border border-dark-accent/30 dark:border-dark-accent/30 light:border-light-accent/30 text-dark-accent dark:text-dark-accent light:text-light-accent rounded-lg font-medium"
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
              className="px-8 py-3 bg-dark-accent dark:bg-dark-accent light:bg-light-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              View Project
            </a>
          </div>

          <div className="border-t border-dark-border dark:border-dark-border light:border-light-border pt-8 text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
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
