'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/contacts/messages');
  }, [router]);

  return null;
}
