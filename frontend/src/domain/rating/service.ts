/**
 * Domain Service: Rating
 * 
 * Pure business logic for rating operations.
 */

import { db } from '@/lib/server/db';

export interface CreateRatingInput {
  projectId?: string;
  rating: number;
  feedback?: string;
  ipHash: string;
}

export const ratingService = {
  /**
   * Get all ratings
   */
  async getAll() {
    return db.rating.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },

  /**
   * Get rating stats (average, count)
   */
  async getStats(projectId?: string) {
    const where = projectId ? { projectId } : {};

    const ratings = await db.rating.findMany({ where });

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    return {
      average: Math.round(average * 10) / 10,
      count: ratings.length,
    };
  },

  /**
   * Create new rating
   */
  async create(input: CreateRatingInput) {
    return db.rating.create({
      data: {
        projectId: input.projectId,
        rating: input.rating,
        feedback: input.feedback,
        ipHash: input.ipHash,
      },
    });
  },

  /**
   * Delete rating
   */
  async delete(ratingId: string) {
    return db.rating.delete({
      where: { id: ratingId },
    });
  },
};
