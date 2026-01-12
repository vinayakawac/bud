'use client';

import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textPrimary">
            Admin Login
          </h1>
          <p className="mt-2 text-textSecondary">
            Access the admin dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
