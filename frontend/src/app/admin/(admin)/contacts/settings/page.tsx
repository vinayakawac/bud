'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContactInfo {
  email: string;
  phone: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export default function ContactSettingsPage() {
  const router = useRouter();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    social: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/contact', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setContactInfo(data.contact || { email: '', phone: '', social: {} });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(contactInfo),
      });

      if (response.ok) {
        setMessage('Contact details saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save contact details');
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      setMessage('Failed to save contact details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center text-textSecondary">Loading contact details...</div>;
  }

  return (
    <div className="max-w-2xl">
      <p className="text-textSecondary mb-6">
        Edit the contact information displayed on the public Contact page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Email
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
              className="w-full px-4 py-2 bg-bg border border-border rounded text-textPrimary"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
              className="w-full px-4 py-2 bg-bg border border-border rounded text-textPrimary"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-textPrimary mb-4">Social Links</h3>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              GitHub
            </label>
            <input
              type="url"
              value={contactInfo.social.github || ''}
              onChange={(e) =>
                setContactInfo({
                  ...contactInfo,
                  social: { ...contactInfo.social, github: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-bg border border-border rounded text-textPrimary"
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={contactInfo.social.linkedin || ''}
              onChange={(e) =>
                setContactInfo({
                  ...contactInfo,
                  social: { ...contactInfo.social, linkedin: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-bg border border-border rounded text-textPrimary"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-textPrimary mb-2">
              Twitter
            </label>
            <input
              type="url"
              value={contactInfo.social.twitter || ''}
              onChange={(e) =>
                setContactInfo({
                  ...contactInfo,
                  social: { ...contactInfo.social, twitter: e.target.value },
                })
              }
              className="w-full px-4 py-2 bg-bg border border-border rounded text-textPrimary"
              placeholder="https://twitter.com/username"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-accent hover:bg-accentHover text-white rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {message && (
            <span
              className={`text-sm ${
                message.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
