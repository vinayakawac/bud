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
    <div className="bg-card border border-border rounded-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block font-medium mb-2 text-textPrimary"
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
            className="w-full px-4 py-3 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block font-medium mb-2 text-textPrimary"
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
            className="w-full px-4 py-3 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full px-8 py-4 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
