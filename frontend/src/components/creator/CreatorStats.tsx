import { BarChart3, CheckCircle, Calendar } from 'lucide-react';

interface CreatorStatsProps {
  totalProjects: number;
  accountStatus: 'active' | 'warning';
  memberSince: string;
}

export function CreatorStats({ totalProjects, accountStatus, memberSince }: CreatorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Projects */}
      <div className="bg-card border border-border rounded-lg p-6 hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-textSecondary">Total Projects</span>
        </div>
        <div className="text-3xl font-bold text-textPrimary">{totalProjects}</div>
      </div>

      {/* Account Status */}
      <div className="bg-card border border-border rounded-lg p-6 hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className={`w-5 h-5 ${accountStatus === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
          <span className="text-sm font-medium text-textSecondary">Account Status</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            accountStatus === 'active' 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-yellow-500/10 text-yellow-500'
          }`}>
            {accountStatus === 'active' ? 'Active' : 'Warning'}
          </span>
        </div>
      </div>

      {/* Member Since */}
      <div className="bg-card border border-border rounded-lg p-6 hover:translate-y-[-2px] transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-textSecondary">Member Since</span>
        </div>
        <div className="text-xl font-semibold text-textPrimary">
          {new Date(memberSince).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
}
