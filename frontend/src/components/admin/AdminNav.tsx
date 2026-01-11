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
    <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
            Logged in as
          </p>
          <p className="font-medium text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            {admin?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-dark-border dark:border-dark-border light:border-light-border text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary rounded-lg hover:bg-dark-bg dark:hover:bg-dark-bg light:hover:bg-light-bg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 bg-dark-accent/10 dark:bg-dark-accent/10 light:bg-light-accent/10 text-dark-accent dark:text-dark-accent light:text-light-accent rounded-lg hover:bg-dark-accent/20 dark:hover:bg-dark-accent/20 light:hover:bg-light-accent/20 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/projects"
          className="px-4 py-2 bg-dark-accent/10 dark:bg-dark-accent/10 light:bg-light-accent/10 text-dark-accent dark:text-dark-accent light:text-light-accent rounded-lg hover:bg-dark-accent/20 dark:hover:bg-dark-accent/20 light:hover:bg-light-accent/20 transition-colors"
        >
          Manage Projects
        </Link>
        <Link
          href="/admin/contact"
          className="px-4 py-2 bg-dark-accent/10 dark:bg-dark-accent/10 light:bg-light-accent/10 text-dark-accent dark:text-dark-accent light:text-light-accent rounded-lg hover:bg-dark-accent/20 dark:hover:bg-dark-accent/20 light:hover:bg-light-accent/20 transition-colors"
        >
          Contact Info
        </Link>
        <Link
          href="/"
          className="px-4 py-2 border border-dark-border dark:border-dark-border light:border-light-border text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary rounded-lg hover:bg-dark-bg dark:hover:bg-dark-bg light:hover:bg-light-bg transition-colors"
        >
          View Site
        </Link>
      </div>
    </div>
  );
}
