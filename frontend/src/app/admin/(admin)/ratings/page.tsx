'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Rating {
  id: string;
  rating: number;
  feedback: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  average: number;
  distribution: Record<number, number>;
}

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/admin/ratings', {
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setRatings(data.ratings || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRating = async (ratingId: string) => {
    if (!confirm('Are you sure you want to delete this rating?')) return;

    try {
      const response = await fetch(`/api/admin/ratings/${ratingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchRatings();
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-textSecondary">Loading ratings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-textPrimary mb-8">
          Manage Ratings
        </h1>

        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-textSecondary mb-1">Total Ratings</div>
              <div className="text-3xl font-bold text-textPrimary">{stats.total}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-textSecondary mb-1">Average Rating</div>
              <div className="text-3xl font-bold text-textPrimary">
                {stats.average.toFixed(1)} / 5
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-textSecondary mb-2">Distribution</div>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm mb-1">
                  <span className="text-textSecondary">{star}★:</span>
                  <span className="text-textPrimary">{stats.distribution[star] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-card border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ratings.map((rating) => (
                <tr key={rating.id} className="hover:bg-bg/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-textPrimary font-semibold">{rating.rating}</span>
                      <span className="text-accent ml-1">★</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-textSecondary max-w-md truncate">
                    {rating.feedback || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => deleteRating(rating.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
