'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminContactsPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-textSecondary">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Contact Messages
        </h1>

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-textPrimary mb-1">
                    {message.name}
                  </h3>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {message.email}
                  </a>
                </div>
                <div className="text-sm text-textSecondary">
                  {new Date(message.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-textSecondary whitespace-pre-wrap">{message.message}</p>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center text-textSecondary py-8">
              No messages yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
