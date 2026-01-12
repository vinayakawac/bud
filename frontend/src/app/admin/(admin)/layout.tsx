import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminNavbar } from '@/components/nav/AdminNavbar';
import { verifyToken } from '@/lib/server/auth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') {
      redirect('/admin/login');
    }
  } catch {
    redirect('/admin/login');
  }

  return (
    <>
      <AdminNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
