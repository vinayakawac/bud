import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface CreatorActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary';
  external?: boolean;
}

export function CreatorActionCard({ 
  title, 
  description, 
  href, 
  icon: Icon,
  variant = 'default',
  external = false
}: CreatorActionCardProps) {
  const isPrimary = variant === 'primary';
  
  const content = (
    <div className={`
      group relative rounded-lg p-6 border transition-all
      ${isPrimary 
        ? 'bg-accent border-accent hover:bg-accent/90' 
        : 'bg-card border-border hover:border-accent/50'
      }
    `}>
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-6 h-6 ${isPrimary ? 'text-white' : 'text-accent'}`} />
        {external && (
          <svg className={`w-4 h-4 ${isPrimary ? 'text-white/60' : 'text-textSecondary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </div>
      <h3 className={`text-lg font-semibold mb-2 ${isPrimary ? 'text-white' : 'text-textPrimary'}`}>
        {title}
      </h3>
      <p className={`text-sm ${isPrimary ? 'text-white/80' : 'text-textSecondary'}`}>
        {description}
      </p>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}
