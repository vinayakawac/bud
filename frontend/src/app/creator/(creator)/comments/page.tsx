'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  name: string;
  email: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
  };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/creator/comments', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/creator/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-textSecondary">Loading comments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Project Comments
        </h1>

        {comments.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="text-textSecondary mb-4">
              No comments yet on your projects
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Link
                key={comment.id}
                href={`/creator/projects/${comment.project.id}?tab=comments`}
                className="block bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-textPrimary mb-1">
                      {comment.project.title}
                    </h3>
                    <div className="text-sm text-textSecondary">
                      by {comment.name} • {comment.email}
                    </div>
                  </div>
                  <div className="text-sm text-textSecondary">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-textSecondary">{comment.content}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
