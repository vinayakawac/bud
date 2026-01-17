interface CreatorHeaderProps {
  creatorName: string;
}

export function CreatorHeader({ creatorName }: CreatorHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-textPrimary mb-2">
        Welcome back, {creatorName}
      </h1>
      <p className="text-textSecondary">
        Manage your projects and account settings
      </p>
    </div>
  );
}
