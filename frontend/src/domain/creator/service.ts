/**
 * Domain Service: Creator
 * 
 * Pure business logic for creator operations.
 */

import { db } from '@/lib/server/db';
import bcrypt from 'bcrypt';

export interface CreateCreatorInput {
  name: string;
  email: string;
  password: string;
}

export const creatorService = {
  /**
   * Get creator by ID
   */
  async getById(creatorId: string) {
    return db.creator.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        termsAcceptedAt: true,
        createdAt: true,
      },
    });
  },

  /**
   * Get creator by email
   */
  async getByEmail(email: string) {
    return db.creator.findUnique({
      where: { email },
    });
  },

  /**
   * Create new creator
   */
  async create(input: CreateCreatorInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);

    return db.creator.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });
  },

  /**
   * Accept terms and conditions
   */
  async acceptTerms(creatorId: string) {
    return db.creator.update({
      where: { id: creatorId },
      data: { termsAcceptedAt: new Date() },
    });
  },

  /**
   * Check if terms have been accepted
   */
  async hasAcceptedTerms(creatorId: string): Promise<boolean> {
    const creator = await db.creator.findUnique({
      where: { id: creatorId },
      select: { termsAcceptedAt: true },
    });

    return !!creator?.termsAcceptedAt;
  },

  /**
   * Get creator with projects (for public profile)
   */
  async getProfileWithProjects(creatorId: string) {
    const creator = await db.creator.findUnique({
      where: { 
        id: creatorId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        // Fetch primary projects (where creator is the owner)
        projects: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            techStack: true,
            category: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        // Fetch collaboration projects
        collaborations: {
          select: {
            id: true,
            projectId: true,
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                techStack: true,
                category: true,
                createdAt: true,
                isPublic: true,
              },
            },
          },
        },
      },
    });

    return creator;
  },
};
