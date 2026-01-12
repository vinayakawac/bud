'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AdminNav() {
  const router = useRouter();
  const { logout, admin } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-textSecondary">
            Logged in as
          </p>
          <p className="font-medium text-textPrimary">
            {admin?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-border text-textPrimary rounded-lg hover:bg-bgSecondary transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/projects"
          className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          Manage Projects
        </Link>
        <Link
          href="/admin/contact"
          className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors"
        >
          Contact Info
        </Link>
        <Link
          href="/"
          className="px-4 py-2 border border-border text-textPrimary rounded-lg hover:bg-bgSecondary transition-colors"
        >
          View Site
        </Link>
      </div>
    </div>
  );
}
