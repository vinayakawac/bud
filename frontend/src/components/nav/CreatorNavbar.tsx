'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <header className="sticky top-0 z-50 bg-bg border-b border-border">
      <nav className="max-w-[1920px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/creator/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/favicon.ico"
              alt="O-Hub Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-2xl font-bold text-textPrimary">O-Hub</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/creator/projects"
              className={`text-sm transition-colors ${
                isActive('/creator/projects')
                  ? 'text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              My Projects
            </Link>
            <Link
              href="/creator/comments"
              className={`text-sm transition-colors ${
                isActive('/creator/comments')
                  ? 'text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Comments
            </Link>
            <Link
              href="/creator/account"
              className={`text-sm transition-colors ${
                isActive('/creator/account')
                  ? 'text-textPrimary font-medium'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-textSecondary hover:text-textPrimary transition-colors"
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
