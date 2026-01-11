'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { adminApi, api } from '@/lib/api';
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminContactPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  const { data: contactData, isLoading } = useQuery({
    queryKey: ['admin-contact'],
    queryFn: () => api.getContactInfo(),
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateContactInfo(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
      alert('Contact information updated successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.error || 'Failed to update contact info'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      socialLinks: {
        github: formData.get('github') as string,
        linkedin: formData.get('linkedin') as string,
        twitter: formData.get('twitter') as string,
      },
    };

    updateMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return null;
  }

  const contact = contactData?.data;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-text-primary">Contact Information</h1>
        </div>

        <AdminNav />

        <div className="mt-8 max-w-3xl">
          {isLoading ? (
            <div className="text-dark-text-secondary">Loading contact information...</div>
          ) : (
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-dark-text-primary">
                Update Contact Details
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-text-primary">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={contact?.email}
                    required
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-accent"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-text-primary">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={contact?.phone || ''}
                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-accent"
                    placeholder="+1234567890"
                  />
                </div>

                <div className="border-t border-dark-border pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-dark-text-primary">
                    Social Media Links
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-text-primary">
                        GitHub Profile
                      </label>
                      <input
                        type="url"
                        name="github"
                        defaultValue={contact?.socialLinks?.github || ''}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-accent"
                        placeholder="https://github.com/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-text-primary">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        defaultValue={contact?.socialLinks?.linkedin || ''}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-accent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-dark-text-primary">
                        Twitter Profile
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        defaultValue={contact?.socialLinks?.twitter || ''}
                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-dark-accent"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-6 py-3 bg-dark-accent hover:bg-dark-accent/80 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update Contact Information'}
                  </button>
                </div>
              </form>

              {contact && (
                <div className="mt-8 pt-6 border-t border-dark-border">
                  <h3 className="text-lg font-semibold mb-4 text-dark-text-primary">
                    Current Contact Information
                  </h3>
                  <div className="space-y-2 text-sm text-dark-text-secondary">
                    <p>
                      <span className="font-medium">Email:</span> {contact.email}
                    </p>
                    {contact.phone && (
                      <p>
                        <span className="font-medium">Phone:</span> {contact.phone}
                      </p>
                    )}
                    {contact.socialLinks && (
                      <div className="mt-3">
                        <p className="font-medium mb-2">Social Links:</p>
                        <ul className="space-y-1 ml-4">
                          {contact.socialLinks.github && (
                            <li>GitHub: {contact.socialLinks.github}</li>
                          )}
                          {contact.socialLinks.linkedin && (
                            <li>LinkedIn: {contact.socialLinks.linkedin}</li>
                          )}
                          {contact.socialLinks.twitter && (
                            <li>Twitter: {contact.socialLinks.twitter}</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
