'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function CreatorProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['creator', id],
    queryFn: async () => {
      const response = await axios.get(`/api/creators/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const creator = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-card rounded w-1/4" />
            <div className="space-y-4">
              <div className="h-32 bg-card rounded" />
              <div className="h-32 bg-card rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-textPrimary">
            Creator Not Found
          </h1>
          <p className="text-textSecondary mb-8">
            The creator profile you&apos;re looking for doesn&apos;t exist.
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
          {/* Creator Header */}
          <div className="border-b border-border pb-6">
            <h1 className="text-4xl font-bold text-textPrimary mb-2">
              {creator.name}
            </h1>
            <p className="text-textSecondary">Creator Profile</p>
          </div>

          {/* Primary Projects */}
          {creator.primaryProjects && creator.primaryProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-textPrimary">
                Created Projects ({creator.primaryProjects.length})
              </h2>
              <div className="grid gap-4">
                {creator.primaryProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors"
                  >
                    <h3 className="text-xl font-semibold mb-2 text-textPrimary">
                      {project.title}
                    </h3>
                    <p className="text-textSecondary text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-accent/10 text-accent text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-2 py-1 text-textSecondary text-xs">
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration Projects */}
          {creator.collaborationProjects && creator.collaborationProjects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-textPrimary">
                Collaborated On ({creator.collaborationProjects.length})
              </h2>
              <div className="grid gap-4">
                {creator.collaborationProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block p-6 bg-card border border-border rounded-lg hover:border-accent transition-colors"
                  >
                    <h3 className="text-xl font-semibold mb-2 text-textPrimary">
                      {project.title}
                    </h3>
                    <p className="text-textSecondary text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-accent/10 text-accent text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-2 py-1 text-textSecondary text-xs">
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Projects */}
          {(!creator.primaryProjects || creator.primaryProjects.length === 0) &&
            (!creator.collaborationProjects || creator.collaborationProjects.length === 0) && (
              <div className="text-center py-12">
                <p className="text-textSecondary">
                  This creator hasn&apos;t published any projects yet.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
