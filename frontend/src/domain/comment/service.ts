/**
 * Domain Service: Comment
 * 
 * Pure business logic for comment operations.
 */

import { db } from '@/lib/server/db';

export interface CreateCommentInput {
  projectId: string;
  name: string;
  email: string;
  content: string;
  parentId?: string;
  authorType?: 'user' | 'admin';
}

export const commentService = {
  /**
   * Get all comments for a project
   */
  async getByProject(projectId: string) {
    return db.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  /**
   * Get comments for creator's projects
   */
  async getForCreator(creatorId: string) {
    return db.comment.findMany({
      where: {
        project: {
          creatorId,
        },
      },
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
   * Create new comment
   */
  async create(input: CreateCommentInput) {
    return db.comment.create({
      data: {
        projectId: input.projectId,
        parentId: input.parentId,
        name: input.name,
        email: input.email,
        content: input.content,
        authorType: input.authorType || 'user',
      },
    });
  },

  /**
   * Delete comment
   */
  async delete(commentId: string) {
    return db.comment.delete({
      where: { id: commentId },
    });
  },
};
