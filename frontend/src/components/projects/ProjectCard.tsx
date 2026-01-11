import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg overflow-hidden hover:border-dark-accent dark:hover:border-dark-accent light:hover:border-light-accent transition-all duration-300 h-full flex flex-col">
        {project.previewImages?.[0] && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={project.previewImages[0]}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-3">
            <span className="text-xs px-2 py-1 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border rounded text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
              {project.category}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary group-hover:text-dark-accent dark:group-hover:text-dark-accent light:group-hover:text-light-accent transition-colors">
            {project.title}
          </h3>

          <p className="text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary mb-4 line-clamp-3 flex-1">
            {project.description.split('\n')[0].replace(/^#+ /, '')}
          </p>

          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 bg-dark-accent/10 dark:bg-dark-accent/10 light:bg-light-accent/10 text-dark-accent dark:text-dark-accent light:text-light-accent rounded"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-xs px-2 py-1 text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
                +{project.techStack.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
