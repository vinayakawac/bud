'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  content: string;
  name: string;
  email: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    creator: {
      name: string;
    } | null;
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/admin/comments', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
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

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const filteredComments = comments.filter((comment) =>
    filter
      ? comment.project.title.toLowerCase().includes(filter.toLowerCase()) ||
        comment.project.creator?.name.toLowerCase().includes(filter.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-textSecondary">Loading comments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-textPrimary">
            Manage Comments
          </h1>
          <input
            type="text"
            placeholder="Filter by project or creator..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-textPrimary"
          />
        </div>

        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-textPrimary mb-1">
                    {comment.project.title}
                  </h3>
                  <div className="text-sm text-textSecondary">
                    Creator: {comment.project.creator?.name || 'Unknown'} • 
                    Commenter: {comment.name} ({comment.email})
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-textSecondary">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-textSecondary">{comment.content}</p>
            </div>
          ))}

          {filteredComments.length === 0 && (
            <div className="text-center text-textSecondary py-8">
              No comments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
