import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
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
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar />
      <main className="ml-60 min-h-screen">{children}</main>
    </div>
  );
}
