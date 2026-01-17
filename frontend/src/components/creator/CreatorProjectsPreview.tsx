import Link from 'next/link';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { Project } from '@/types';
import { ArrowRight } from 'lucide-react';

interface CreatorProjectsPreviewProps {
  projects: Project[];
}

export function CreatorProjectsPreview({ projects }: CreatorProjectsPreviewProps) {
  const recentProjects = projects.slice(0, 3);

  if (projects.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-textPrimary">Your Projects</h2>
        </div>
        <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-textSecondary mb-4">You haven't created any projects yet</p>
          <Link
            href="/creator/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Create Your First Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-textPrimary">Your Projects</h2>
        {projects.length > 3 && (
          <Link
            href="/creator/projects"
            className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
