'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const { data: contactData } = useQuery({
    queryKey: ['contact-info'],
    queryFn: () => api.getContactInfo(),
  });

  const contact = contactData?.data;

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => api.createContactMessage(data),
    onSuccess: () => {
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to send message');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
            Get in Touch
          </h1>
          <p className="text-lg text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
            Have questions or want to collaborate? We'd love to hear from you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
                Contact Information
              </h2>

              <div className="space-y-6">
                {contact?.email && (
                  <div>
                    <h3 className="font-medium mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
                      Email
                    </h3>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-dark-accent dark:text-dark-accent light:text-light-accent hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact?.phone && (
                  <div>
                    <h3 className="font-medium mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
                      Phone
                    </h3>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-dark-accent dark:text-dark-accent light:text-light-accent hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact?.socialLinks &&
                  Object.keys(contact.socialLinks).length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
                        Connect With Us
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(contact.socialLinks).map(
                          ([platform, url]) => (
                            <a
                              key={platform}
                              href={url as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary rounded-lg hover:border-dark-accent dark:hover:border-dark-accent light:hover:border-light-accent transition-colors capitalize"
                            >
                              {platform}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          <div className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border border-dark-border dark:border-dark-border light:border-light-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block font-medium mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border rounded-lg text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary focus:outline-none focus:border-dark-accent dark:focus:border-dark-accent light:focus:border-light-accent transition-colors"
                  placeholder="Your name"
                />
              </div>

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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border rounded-lg text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary focus:outline-none focus:border-dark-accent dark:focus:border-dark-accent light:focus:border-light-accent transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block font-medium mb-2 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={6}
                  className="w-full px-4 py-3 bg-dark-bg dark:bg-dark-bg light:bg-light-bg border border-dark-border dark:border-dark-border light:border-light-border rounded-lg text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary focus:outline-none focus:border-dark-accent dark:focus:border-dark-accent light:focus:border-light-accent transition-colors resize-none"
                  placeholder="Your message..."
                />
                <p className="text-sm text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary mt-2">
                  {formData.message.length}/2000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full px-8 py-4 bg-dark-accent dark:bg-dark-accent light:bg-light-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
