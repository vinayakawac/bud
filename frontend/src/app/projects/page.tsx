'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { api } from '@/lib/api';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    category: '',
    tech: '',
    year: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => api.getProjects(filters),
  });

  const projects = data?.data || [];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            All Projects
          </h1>
          <p className="text-lg text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
            Explore our complete collection of projects
          </p>
        </div>

        <ProjectFilters filters={filters} onFilterChange={setFilters} />

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-dark-surface dark:bg-dark-surface light:bg-light-surface rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Failed to load projects. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
              No projects found matching your criteria.
            </p>
          </div>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
