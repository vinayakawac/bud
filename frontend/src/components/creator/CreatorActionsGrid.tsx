import { Folder, Plus, Settings, ExternalLink } from 'lucide-react';
import { CreatorActionCard } from './CreatorActionCard';

interface CreatorActionsGridProps {
  creatorId: string;
}

export function CreatorActionsGrid({ creatorId }: CreatorActionsGridProps) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-textPrimary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CreatorActionCard
          title="Your Projects"
          description="View and manage all your projects"
          href="/creator/projects"
          icon={Folder}
        />
        <CreatorActionCard
          title="New Project"
          description="Create a new project to showcase"
          href="/creator/projects/new"
          icon={Plus}
          variant="primary"
        />
        <CreatorActionCard
          title="Account Settings"
          description="Manage your account and preferences"
          href="/creator/account"
          icon={Settings}
        />
        <CreatorActionCard
          title="View Public Profile"
          description="See how others view your profile"
          href={`/creators/${creatorId}`}
          icon={ExternalLink}
          external
        />
      </div>
    </div>
  );
}
