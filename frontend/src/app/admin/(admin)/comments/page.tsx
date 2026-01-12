'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Reply {
  id: string;
  content: string;
  name: string;
  email: string;
  authorType: string;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  name: string;
  email: string;
  createdAt: string;
  authorType: string;
  replies: Reply[];
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
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

  const submitReply = async (commentId: string, projectId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch('/api/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          parentId: commentId,
          content: replyContent,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
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
          {filteredComments.length === 0 ? (
            <div className="text-center text-textSecondary py-8">
              No comments yet. Comments will appear here when users comment on projects.
            </div>
          ) : (
            filteredComments.map((comment) => (
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
                <p className="text-textSecondary mb-4">{comment.content}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 mt-4 space-y-3 border-l-2 border-border pl-4">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded ${
                          reply.authorType === 'admin'
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'bg-bg'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium text-textPrimary">
                            {reply.authorType === 'admin' ? (
                              <span className="flex items-center gap-2">
                                {reply.name}
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
                                  Admin
                                </span>
                              </span>
                            ) : (
                              reply.name
                            )}
                          </div>
                          <div className="text-xs text-textSecondary">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-textSecondary">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyingTo === comment.id ? (
                  <div className="ml-8 mt-4 border-l-2 border-accent pl-4">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full px-4 py-2 bg-bg border border-border rounded text-textPrimary mb-2"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitReply(comment.id, comment.project.id)}
                        className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded text-sm"
                      >
                        Submit Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-4 py-2 bg-card border border-border hover:bg-bg text-textPrimary rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="ml-8 mt-2 px-3 py-1 bg-accent hover:bg-accentHover text-white rounded text-sm"
                  >
                    Reply
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
