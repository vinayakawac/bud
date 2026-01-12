import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreatorNavbar } from '@/components/nav/CreatorNavbar';

export default async function CreatorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('creator_token');

  if (!token) {
    redirect('/creator/login');
  }

  return (
    <>
      <CreatorNavbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
