'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../theme/ThemeToggle';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-dark-bg/95 dark:bg-dark-bg/95 light:bg-light-bg/95 backdrop-blur-sm border-b border-dark-border dark:border-dark-border light:border-light-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary hover:text-dark-accent dark:hover:text-dark-accent light:hover:text-light-accent transition-colors"
            >
              O-Hub
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`transition-colors ${
                  isActive('/')
                    ? 'text-dark-accent dark:text-dark-accent light:text-light-accent'
                    : 'text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary hover:text-dark-text-primary dark:hover:text-dark-text-primary light:hover:text-light-text-primary'
                }`}
              >
                Home
              </Link>
              <Link
                href="/projects"
                className={`transition-colors ${
                  isActive('/projects') || pathname?.startsWith('/projects/')
                    ? 'text-dark-accent dark:text-dark-accent light:text-light-accent'
                    : 'text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary hover:text-dark-text-primary dark:hover:text-dark-text-primary light:hover:text-light-text-primary'
                }`}
              >
                Projects
              </Link>
              <Link
                href="/rate"
                className={`transition-colors ${
                  isActive('/rate')
                    ? 'text-dark-accent dark:text-dark-accent light:text-light-accent'
                    : 'text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary hover:text-dark-text-primary dark:hover:text-dark-text-primary light:hover:text-light-text-primary'
                }`}
              >
                Rate Us
              </Link>
              <Link
                href="/contact"
                className={`transition-colors ${
                  isActive('/contact')
                    ? 'text-dark-accent dark:text-dark-accent light:text-light-accent'
                    : 'text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary hover:text-dark-text-primary dark:hover:text-dark-text-primary light:hover:text-light-text-primary'
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
