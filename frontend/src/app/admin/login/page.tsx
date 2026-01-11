'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            Admin Login
          </h1>
          <p className="mt-2 text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
            Access the admin dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
