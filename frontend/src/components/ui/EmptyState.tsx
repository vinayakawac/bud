'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { 
  FolderOpen, 
  Users, 
  MessageSquare, 
  Star, 
  Search,
  Plus,
  LucideIcon 
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

// ============================================================================
// BASE EMPTY STATE COMPONENT
// ============================================================================

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-textSecondary" />
      </div>
      
      <h3 className="text-xl font-semibold text-textPrimary mb-2">
        {title}
      </h3>
      
      <p className="text-textSecondary max-w-sm mb-6">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {action.label}
              </button>
            )
          )}
          
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card text-textPrimary border border-border rounded-lg font-medium hover:bg-cardHover transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card text-textPrimary border border-border rounded-lg font-medium hover:bg-cardHover transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}

      {children}
    </div>
  );
}

// ============================================================================
// PRE-BUILT EMPTY STATES
// ============================================================================

export function NoProjectsEmpty({ isOwner = false }: { isOwner?: boolean }) {
  if (isOwner) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No Projects Yet"
        description="Start showcasing your work by creating your first project."
        action={{
          label: 'Create Project',
          href: '/creator/projects/new',
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={FolderOpen}
      title="No Projects Found"
      description="There are no projects to display at the moment. Check back later!"
      action={{
        label: 'Browse All Projects',
        href: '/projects',
      }}
    />
  );
}

export function NoSearchResultsEmpty({ 
  query,
  onClear 
}: { 
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={
        query 
          ? `We couldn't find anything matching "${query}". Try a different search term.`
          : "No results match your current filters. Try adjusting your search criteria."
      }
      action={onClear ? {
        label: 'Clear Filters',
        onClick: onClear,
      } : undefined}
    />
  );
}

export function NoCommentsEmpty({ canComment = true }: { canComment?: boolean }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No Comments Yet"
      description={
        canComment
          ? "Be the first to share your thoughts on this project!"
          : "No one has commented on this project yet."
      }
    />
  );
}

export function NoRatingsEmpty() {
  return (
    <EmptyState
      icon={Star}
      title="No Ratings Yet"
      description="This project hasn't been rated yet. Be the first to rate it!"
    />
  );
}

export function NoCreatorsEmpty() {
  return (
    <EmptyState
      icon={Users}
      title="No Creators Found"
      description="There are no creators to display matching your criteria."
      action={{
        label: 'Browse All',
        href: '/creators',
      }}
    />
  );
}

export function NoCollaboratorsEmpty({ canInvite = false }: { canInvite?: boolean }) {
  return (
    <EmptyState
      icon={Users}
      title="No Collaborators"
      description={
        canInvite
          ? "This project has no collaborators yet. Invite someone to collaborate!"
          : "This project doesn't have any collaborators."
      }
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="All Caught Up!"
      description="You don't have any new notifications."
    />
  );
}

// ============================================================================
// LOADING STATE
// ============================================================================

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6" />
      <p className="text-textSecondary">{message}</p>
    </div>
  );
}
