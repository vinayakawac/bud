'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">Contacts</h1>

        <div className="flex gap-4 mb-8 border-b border-border">
          <Link
            href="/admin/contacts/settings"
            className={`px-4 py-2 font-medium transition-colors ${
              isActive('/admin/contacts/settings')
                ? 'text-accent border-b-2 border-accent'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Contact Details
          </Link>
          <Link
            href="/admin/contacts/messages"
            className={`px-4 py-2 font-medium transition-colors ${
              isActive('/admin/contacts/messages')
                ? 'text-accent border-b-2 border-accent'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Messages
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
