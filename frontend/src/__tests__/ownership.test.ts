/**
 * Project Ownership Tests
 * 
 * Tests for project ownership and access control logic.
 * Verifies that users can only modify their own resources.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCK TYPES (simulating domain models)
// ============================================================================

interface Project {
  id: string;
  creatorId: string;
  title: string;
  isPublic: boolean;
}

interface Creator {
  id: string;
  email: string;
}

// ============================================================================
// OWNERSHIP LOGIC (extracted for testing)
// ============================================================================

/**
 * Check if a user owns a project
 */
function isProjectOwner(project: Project, creatorId: string): boolean {
  return project.creatorId === creatorId;
}

/**
 * Check if a user can view a project
 */
function canViewProject(project: Project, viewerId?: string): boolean {
  // Public projects are viewable by anyone
  if (project.isPublic) return true;
  
  // Private projects require ownership
  if (!viewerId) return false;
  
  return isProjectOwner(project, viewerId);
}

/**
 * Check if a user can edit a project
 */
function canEditProject(
  project: Project, 
  editorId: string, 
  isAdmin: boolean = false
): boolean {
  // Admins can edit any project
  if (isAdmin) return true;
  
  // Owners can edit their projects
  return isProjectOwner(project, editorId);
}

/**
 * Check if a user can delete a project
 */
function canDeleteProject(
  project: Project,
  deleterId: string,
  isAdmin: boolean = false
): boolean {
  // Admins can delete any project
  if (isAdmin) return true;
  
  // Owners can delete their projects
  return isProjectOwner(project, deleterId);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Project Ownership', () => {
  const owner: Creator = { id: 'creator-123', email: 'owner@example.com' };
  const otherUser: Creator = { id: 'creator-456', email: 'other@example.com' };
  
  const publicProject: Project = {
    id: 'project-1',
    creatorId: owner.id,
    title: 'Public Project',
    isPublic: true,
  };
  
  const privateProject: Project = {
    id: 'project-2',
    creatorId: owner.id,
    title: 'Private Project',
    isPublic: false,
  };

  describe('isProjectOwner', () => {
    it('should return true for project owner', () => {
      expect(isProjectOwner(publicProject, owner.id)).toBe(true);
    });

    it('should return false for non-owner', () => {
      expect(isProjectOwner(publicProject, otherUser.id)).toBe(false);
    });

    it('should return false for empty creator ID', () => {
      expect(isProjectOwner(publicProject, '')).toBe(false);
    });
  });

  describe('canViewProject', () => {
    it('should allow anyone to view public projects', () => {
      expect(canViewProject(publicProject)).toBe(true);
      expect(canViewProject(publicProject, otherUser.id)).toBe(true);
      expect(canViewProject(publicProject, undefined)).toBe(true);
    });

    it('should allow owner to view private projects', () => {
      expect(canViewProject(privateProject, owner.id)).toBe(true);
    });

    it('should NOT allow non-owner to view private projects', () => {
      expect(canViewProject(privateProject, otherUser.id)).toBe(false);
    });

    it('should NOT allow anonymous users to view private projects', () => {
      expect(canViewProject(privateProject)).toBe(false);
      expect(canViewProject(privateProject, undefined)).toBe(false);
    });
  });

  describe('canEditProject', () => {
    it('should allow owner to edit their project', () => {
      expect(canEditProject(publicProject, owner.id)).toBe(true);
      expect(canEditProject(privateProject, owner.id)).toBe(true);
    });

    it('should NOT allow non-owner to edit project', () => {
      expect(canEditProject(publicProject, otherUser.id)).toBe(false);
      expect(canEditProject(privateProject, otherUser.id)).toBe(false);
    });

    it('should allow admin to edit any project', () => {
      expect(canEditProject(publicProject, otherUser.id, true)).toBe(true);
      expect(canEditProject(privateProject, otherUser.id, true)).toBe(true);
    });
  });

  describe('canDeleteProject', () => {
    it('should allow owner to delete their project', () => {
      expect(canDeleteProject(publicProject, owner.id)).toBe(true);
      expect(canDeleteProject(privateProject, owner.id)).toBe(true);
    });

    it('should NOT allow non-owner to delete project', () => {
      expect(canDeleteProject(publicProject, otherUser.id)).toBe(false);
      expect(canDeleteProject(privateProject, otherUser.id)).toBe(false);
    });

    it('should allow admin to delete any project', () => {
      expect(canDeleteProject(publicProject, otherUser.id, true)).toBe(true);
      expect(canDeleteProject(privateProject, otherUser.id, true)).toBe(true);
    });
  });
});

describe('Collaboration Access', () => {
  interface ProjectWithCollaborators extends Project {
    collaboratorIds: string[];
  }

  const owner = { id: 'owner-1' };
  const collaborator = { id: 'collab-1' };
  const stranger = { id: 'stranger-1' };

  const projectWithCollab: ProjectWithCollaborators = {
    id: 'project-collab',
    creatorId: owner.id,
    title: 'Collaborative Project',
    isPublic: true,
    collaboratorIds: [collaborator.id],
  };

  function isCollaborator(project: ProjectWithCollaborators, userId: string): boolean {
    return project.collaboratorIds.includes(userId);
  }

  function canEditAsCollaborator(
    project: ProjectWithCollaborators,
    userId: string
  ): boolean {
    return project.creatorId === userId || isCollaborator(project, userId);
  }

  it('should identify collaborators correctly', () => {
    expect(isCollaborator(projectWithCollab, collaborator.id)).toBe(true);
    expect(isCollaborator(projectWithCollab, owner.id)).toBe(false); // Owner is not a collaborator
    expect(isCollaborator(projectWithCollab, stranger.id)).toBe(false);
  });

  it('should allow owner OR collaborator to edit', () => {
    expect(canEditAsCollaborator(projectWithCollab, owner.id)).toBe(true);
    expect(canEditAsCollaborator(projectWithCollab, collaborator.id)).toBe(true);
    expect(canEditAsCollaborator(projectWithCollab, stranger.id)).toBe(false);
  });
});

describe('Edge Cases', () => {
  it('should handle null/undefined values gracefully', () => {
    const project: Project = {
      id: 'test',
      creatorId: 'owner-1',
      title: 'Test',
      isPublic: true,
    };

    // These should not throw
    expect(() => isProjectOwner(project, '')).not.toThrow();
    expect(() => canViewProject(project, undefined)).not.toThrow();
  });

  it('should handle projects with no owner', () => {
    const orphanProject: Project = {
      id: 'orphan',
      creatorId: '', // Empty owner (edge case)
      title: 'Orphan Project',
      isPublic: true,
    };

    expect(isProjectOwner(orphanProject, 'any-user')).toBe(false);
    expect(canViewProject(orphanProject)).toBe(true); // Still public
  });
});

// ============================================================================
// HELPER FOR OWNERSHIP CHECK
// ============================================================================

function isProjectOwner(project: Project, creatorId: string): boolean {
  return project.creatorId === creatorId;
}

function canViewProject(project: Project, viewerId?: string): boolean {
  if (project.isPublic) return true;
  if (!viewerId) return false;
  return isProjectOwner(project, viewerId);
}

function canEditProject(project: Project, editorId: string, isAdmin = false): boolean {
  if (isAdmin) return true;
  return isProjectOwner(project, editorId);
}

function canDeleteProject(project: Project, deleterId: string, isAdmin = false): boolean {
  if (isAdmin) return true;
  return isProjectOwner(project, deleterId);
}
