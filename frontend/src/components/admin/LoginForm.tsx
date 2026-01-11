'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: (data: typeof credentials) => adminApi.login(data),
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.admin);
      toast.success('Login successful');
      router.push('/admin/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(credentials);
  };

  return (
    <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block font-medium mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border rounded-lg text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary focus:outline-none focus:border-dark-accent dark:focus:border-dark-accent light:focus:border-light-accent transition-colors"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-medium mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border rounded-lg text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary focus:outline-none focus:border-dark-accent dark:focus:border-dark-accent light:focus:border-light-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full px-8 py-4 bg-dark-accent dark:bg-dark-accent light:bg-light-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
