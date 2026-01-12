'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme/ThemeToggle';

export function CreatorNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/creator/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/creator/dashboard"
            className="text-2xl font-bold text-textPrimary hover:text-accent transition-colors"
          >
            O-Hub
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/creator/projects"
              className={`transition-colors ${
                isActive('/creator/projects')
                  ? 'text-accent'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              My Projects
            </Link>
            <Link
              href="/creator/comments"
              className={`transition-colors ${
                isActive('/creator/comments')
                  ? 'text-accent'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Comments
            </Link>
            <Link
              href="/creator/account"
              className={`transition-colors ${
                isActive('/creator/account')
                  ? 'text-accent'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Account Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-textSecondary hover:text-textPrimary transition-colors"
            >
              Logout
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
