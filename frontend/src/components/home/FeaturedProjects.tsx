'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProjectCard } from '../projects/ProjectCard';
import type { Project } from '@/types';

export function FeaturedProjects() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: () => api.getProjects(),
  });

  const projects = data?.data?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-96 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project: Project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
