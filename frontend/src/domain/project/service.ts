/**
 * Domain Service: Project
 * 
 * Pure business logic for project operations.
 * No HTTP concerns, no response formatting.
 */

import { db } from '@/lib/server/db';
import { normalizeTechStack, normalizePreviewImages } from './normalizers';

export interface ProjectFilters {
  category?: string;
  tech?: string;
  year?: number;
  sort?: string;
}

export interface CreateProjectInput {
  creatorId: string;
  title: string;
  description: string;
  techStack: string[];
  category: string;
  previewImages: string[];
  externalLink: string;
  isPublic: boolean;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  techStack?: string[];
  category?: string;
  previewImages?: string[];
  externalLink?: string;
  isPublic?: boolean;
}

export const projectService = {
  /**   * Get all projects (admin view - no filters)
   */
  async getAllProjects() {
    const projects = await db.project.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        collaborators: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(this.normalizeProject);
  },

  /**   * Get all public projects with optional filters
   */
  async getPublicProjects(filters: ProjectFilters = {}) {
    const where: any = { isPublic: true };

    // Category filter
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    // Tech stack filter - check if any tech in array matches
    if (filters.tech && filters.tech !== 'all') {
      where.techStack = { 
        has: filters.tech 
      };
    }

    // Year filter
    if (filters.year && filters.year !== 0) {
      where.createdAt = {
        gte: new Date(`${filters.year}-01-01`),
        lt: new Date(`${filters.year + 1}-01-01`),
      };
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // default: latest

    if (filters.sort === 'rating') {
      orderBy = { metadata: { path: ['averageRating'], order: 'desc' } };
    } else if (filters.sort === 'views') {
      orderBy = { metadata: { path: ['views'], order: 'desc' } };
    } else if (filters.sort === 'comments') {
      orderBy = { metadata: { path: ['commentCount'], order: 'desc' } };
    }

    const projects = await db.project.findMany({
      where,
      orderBy,
      include: {
        creator: {
          select: { id: true, name: true },
        },
        collaborators: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return projects.map(this.normalizeProject);
  },

  /**
   * Get single public project by ID
   */
  async getPublicProjectById(projectId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId, isPublic: true },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        collaborators: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!project) return null;
    return this.normalizeProject(project);
  },

  /**
   * Get any project by ID (admin view - no isPublic filter)
   */
  async getProjectById(projectId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        collaborators: {
          include: {
            creator: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!project) return null;
    return this.normalizeProject(project);
  },

  /**
   * Get all projects for a creator (including non-public)
   */
  async getCreatorProjects(creatorId: string) {
    const projects = await db.project.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map(this.normalizeProject);
  },

  /**
   * Get single project by ID with creator permission check
   */
  async getCreatorProjectById(projectId: string, creatorId: string) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        collaborators: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!project) return null;

    // Check access (owner or collaborator)
    const hasAccess = await this.canEditProject(projectId, creatorId);
    if (!hasAccess) return null;

    return this.normalizeProject(project);
  },

  /**
   * Create new project
   */
  async createProject(input: CreateProjectInput) {
    const project = await db.project.create({
      data: {
        creatorId: input.creatorId,
        title: input.title,
        description: input.description,
        techStack: JSON.stringify(input.techStack),
        category: input.category,
        previewImages: JSON.stringify(input.previewImages),
        externalLink: input.externalLink,
        isPublic: input.isPublic,
      },
    });

    return this.normalizeProject(project);
  },

  /**
   * Update existing project (admin - no permission check)
   */
  async adminUpdateProject(projectId: string, input: UpdateProjectInput) {
    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.techStack !== undefined) data.techStack = JSON.stringify(input.techStack);
    if (input.category !== undefined) data.category = input.category;
    if (input.previewImages !== undefined) data.previewImages = JSON.stringify(input.previewImages);
    if (input.externalLink !== undefined) data.externalLink = input.externalLink;
    if (input.isPublic !== undefined) data.isPublic = input.isPublic;

    const project = await db.project.update({
      where: { id: projectId },
      data,
    });

    return this.normalizeProject(project);
  },

  /**
   * Update existing project
   */
  async updateProject(projectId: string, creatorId: string, input: UpdateProjectInput) {
    // Verify access
    const hasAccess = await this.canEditProject(projectId, creatorId);
    if (!hasAccess) return null;

    const data: any = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.techStack !== undefined) data.techStack = JSON.stringify(input.techStack);
    if (input.category !== undefined) data.category = input.category;
    if (input.previewImages !== undefined) data.previewImages = JSON.stringify(input.previewImages);
    if (input.externalLink !== undefined) data.externalLink = input.externalLink;
    if (input.isPublic !== undefined) data.isPublic = input.isPublic;

    const project = await db.project.update({
      where: { id: projectId },
      data,
    });

    return this.normalizeProject(project);
  },

  /**
   * Delete project (admin - no permission check)
   */
  async adminDeleteProject(projectId: string) {
    await db.project.delete({
      where: { id: projectId },
    });

    return true;
  },

  /**
   * Delete project
   */
  async deleteProject(projectId: string, creatorId: string) {
    // Verify access
    const hasAccess = await this.canEditProject(projectId, creatorId);
    if (!hasAccess) return false;

    await db.project.delete({
      where: { id: projectId },
    });

    return true;
  },

  /**
   * Check if creator can edit project (owner or collaborator)
   */
  async canEditProject(projectId: string, creatorId: string): Promise<boolean> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    if (!project) return false;

    // Primary creator always has access
    if (project.creatorId === creatorId) return true;

    // Check if user is a collaborator
    const collaborator = await db.projectCollaborator.findFirst({
      where: { projectId, creatorId },
    });

    return !!collaborator;
  },

  /**
   * Check if creator is primary owner
   */
  async isPrimaryCreator(projectId: string, creatorId: string): Promise<boolean> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    return project?.creatorId === creatorId;
  },

  /**
   * Normalize project data (handle JSON fields)
   */
  normalizeProject(project: any) {
    return {
      ...project,
      techStack: normalizeTechStack(project.techStack),
      previewImages: normalizePreviewImages(project.previewImages),
      metadata: project.metadata ? projectService.parseJSON(project.metadata) : null,
    };
  },

  /**
   * Safe JSON parse
   */
  parseJSON(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },

  /**
   * Get all available categories from public projects
   */
  async getAvailableCategories(): Promise<string[]> {
    const projects = await db.project.findMany({
      where: { isPublic: true },
      select: { category: true },
      distinct: ['category'],
    });

    return projects
      .map((p) => p.category)
      .filter((c) => c && c.trim() !== '')
      .sort();
  },

  /**
   * Get all available technologies from public projects
   */
  async getAvailableTechnologies(): Promise<string[]> {
    const projects = await db.project.findMany({
      where: { isPublic: true },
      select: { techStack: true },
    });

    // Flatten all tech stacks and get unique values
    const allTechs = projects.flatMap((p) => {
      const stack = normalizeTechStack(p.techStack);
      return Array.isArray(stack) ? stack : [];
    });

    const uniqueTechs = [...new Set(allTechs)]
      .filter((tech) => tech && tech.trim() !== '')
      .sort();

    return uniqueTechs;
  },
};
