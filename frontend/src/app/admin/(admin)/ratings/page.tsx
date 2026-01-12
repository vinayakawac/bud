'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Rating {
  id: string;
  rating: number;
  feedback: string | null;
  createdAt: string;
}

interface ProjectRating {
  projectId: string;
  projectTitle: string;
  creatorName: string;
  isPublic: boolean;
  ratingsCount: number;
  averageRating: number | null;
  ratings: Rating[];
}

interface Stats {
  total: number;
  average: number;
  distribution: Record<number, number>;
}

export default function AdminRatingsPage() {
  const [projects, setProjects] = useState<ProjectRating[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
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
      setProjects(data.projects || []);
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
                {stats.average > 0 ? stats.average.toFixed(1) : 'N/A'} {stats.average > 0 && '/ 5'}
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
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Ratings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">
                    No projects yet. Projects will appear here once created.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <>
                    <tr key={project.projectId} className="hover:bg-bg/50">
                      <td className="px-6 py-4 text-sm text-textPrimary font-medium">
                        {project.projectTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                        {project.creatorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            project.isPublic
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}
                        >
                          {project.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                        {project.ratingsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                        {project.averageRating ? (
                          <span>{project.averageRating.toFixed(1)} ★</span>
                        ) : (
                          <span className="text-textSecondary">No ratings yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {project.ratingsCount > 0 && (
                          <button
                            onClick={() => setExpandedProject(
                              expandedProject === project.projectId ? null : project.projectId
                            )}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                          >
                            {expandedProject === project.projectId ? 'Hide' : 'View'} Details
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedProject === project.projectId && project.ratings.length > 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-bg/30">
                          <div className="space-y-3">
                            {project.ratings.map((rating) => (
                              <div key={rating.id} className="border border-border rounded p-3 bg-card flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-textPrimary">{rating.rating} ★</span>
                                    <span className="text-xs text-textSecondary">
                                      {new Date(rating.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="text-sm text-textSecondary">
                                    {rating.feedback || 'No feedback provided'}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteRating(rating.id)}
                                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
