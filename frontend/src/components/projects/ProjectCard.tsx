import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Domain services guarantee these are already arrays
  const firstImage = project.previewImages[0];
  const hasValidImage = firstImage && typeof firstImage === 'string' && (firstImage.startsWith('http://') || firstImage.startsWith('https://') || firstImage.startsWith('/'));

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group bg-card border border-border rounded-lg overflow-hidden hover:border-borderHover transition-all duration-300 h-full flex flex-col">
        {hasValidImage && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={firstImage}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-3">
            <span className="text-xs px-2 py-1 bg-bgSecondary border border-border rounded text-textSecondary">
              {project.category}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 text-textPrimary group-hover:text-accent transition-colors">
            {project.title}
          </h3>

          <p className="text-textSecondary mb-4 line-clamp-3 flex-1">
            {project.description.split('\n')[0].replace(/^#+ /, '')}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 bg-accent/10 text-accent rounded"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-xs px-2 py-1 text-textSecondary">
                +{project.techStack.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
