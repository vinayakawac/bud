import Link from 'next/link';
import Image from 'next/image';
import { Star, Eye, Clock } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Filter valid images
  const validImages = project.previewImages.filter(
    (img) => img && typeof img === 'string' && img.length > 0 && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/'))
  );
  const firstImage = validImages[0];

  // Calculate stats
  const rating = project.metadata?.averageRating ?? 0;
  const views = project.metadata?.views ?? 0;

  // Extract first line of description, clean it
  const shortDesc = project.description
    .split('\n')[0]
    .replace(/^#+\s*/, '')
    .replace(/[*_~`]/g, '')
    .substring(0, 120);

  // Format date
  const updatedDate = new Date(project.updatedAt).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <article className="group bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-[420px]">
        
        {/* Fixed Thumbnail Section */}
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-accent/20 to-purple-600/20 flex-shrink-0">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-white/20">
                {project.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[0.6875rem] px-2.5 py-1 bg-black/80 backdrop-blur-sm border border-white/20 rounded text-white font-medium uppercase tracking-wide">
              {project.category}
            </span>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title - Single Line */}
          <h3 className="text-[1.0625rem] font-bold text-textPrimary group-hover:text-accent transition-colors truncate mb-1.5">
            {project.title}
          </h3>

          {/* Author */}
          {project.creator && (
            <p className="text-[0.8125rem] text-textSecondary mb-3">
              by <span className="text-textPrimary">{project.creator.name}</span>
            </p>
          )}

          {/* Description - Fixed 2 Lines */}
          <p className="text-[0.875rem] text-textSecondary leading-[1.45] line-clamp-2 mb-auto">
            {shortDesc}
          </p>
        </div>

        {/* Fixed Footer Stats Bar */}
        <div className="h-11 px-4 flex items-center gap-4 text-[0.75rem] text-textSecondary border-t border-border/60 bg-bgSecondary/30 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </span>
          
          <span className="text-border">|</span>
          
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{views.toLocaleString()}</span>
          </span>
          
          <span className="text-border">|</span>
          
          <span className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>{updatedDate}</span>
          </span>
        </div>
      </article>
    </Link>
  );
}
