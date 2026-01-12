'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold text-textPrimary hover:text-accent transition-colors"
            >
              O-Hub
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`transition-colors ${
                  isActive('/')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Home
              </Link>
              <Link
                href="/projects"
                className={`transition-colors ${
                  isActive('/projects') || pathname?.startsWith('/projects/')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Projects
              </Link>
              <Link
                href="/rate"
                className={`transition-colors ${
                  isActive('/rate')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Rate Us
              </Link>
              <Link
                href="/contact"
                className={`transition-colors ${
                  isActive('/contact')
                    ? 'text-accent'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/creators/apply"
              className="hidden md:block px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Become a Creator
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
