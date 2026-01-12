'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '../theme/ThemeToggle';

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/admin/dashboard"
              className="text-2xl font-bold text-textPrimary hover:text-accent transition-colors"
            >
              O-Hub Admin
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/admin/projects"
                className={`transition-colors ${
                  isActive('/admin/projects')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Projects
              </Link>
              <Link
                href="/admin/creators"
                className={`transition-colors ${
                  isActive('/admin/creators')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Creators
              </Link>
              <Link
                href="/admin/comments"
                className={`transition-colors ${
                  isActive('/admin/comments')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Comments
              </Link>
              <Link
                href="/admin/ratings"
                className={`transition-colors ${
                  isActive('/admin/ratings')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Ratings
              </Link>
              <Link
                href="/admin/contacts"
                className={`transition-colors ${
                  isActive('/admin/contacts')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Contacts
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
