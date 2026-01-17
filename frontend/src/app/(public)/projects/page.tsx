'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { api } from '@/lib/api';
import type { Project } from '@/types';

function ProjectsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract filters from URL
  const category = searchParams.get('category') || '';
  const tech = searchParams.get('tech') || '';
  const year = searchParams.get('year') || '';
  const sort = searchParams.get('sort') || 'latest';

  const filters = { category, tech, year, sort };

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => api.getProjects(filters),
  });

  // Fetch dynamic filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: () => api.getFilterOptions(),
  });

  const projects = data?.data || [];
  const categories = filterOptions?.data?.categories || [];
  const techs = filterOptions?.data?.technologies || [];

  const handleFilterChange = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.tech) params.set('tech', newFilters.tech);
    if (newFilters.year) params.set('year', newFilters.year);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-textPrimary">
            Browse Projects
          </h1>
          <p className="text-textSecondary">
            Discover {projects.length} cutting-edge projects from our community
          </p>
        </div>

        {/* Sidebar + Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <ProjectFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            categories={categories}
            technologies={techs}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-card border border-border rounded-lg animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-red-400 mb-2">Failed to load projects</p>
                <p className="text-sm text-textSecondary">
                  Please try again later
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && projects.length === 0 && (
              <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
                <p className="text-lg text-textPrimary mb-2">No projects found</p>
                <p className="text-sm text-textSecondary">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}

            {/* Project Grid */}
            {!isLoading && !error && projects.length > 0 && (
              <>
                <div className="mb-4 text-sm text-textSecondary">
                  Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map((project: Project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-textSecondary">Loading...</div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
