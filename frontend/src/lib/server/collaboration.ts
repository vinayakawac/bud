import { db } from './db';

/**
 * Check if a creator has access to edit a project
 * Returns true if:
 * - Creator is the primary owner (creatorId)
 * - Creator is an accepted collaborator
 */
export async function canEditProject(
  projectId: string,
  creatorId: string
): Promise<boolean> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { creatorId: true },
  });

  if (!project) return false;

  // Primary creator always has access
  if (project.creatorId === creatorId) return true;

  // Check if user is a collaborator
  const collaborator = await db.projectCollaborator.findFirst({
    where: {
      projectId,
      creatorId,
    },
  });

  return !!collaborator;
}

/**
 * Check if a creator is the primary owner of a project
 */
export async function isPrimaryCreator(
  projectId: string,
  creatorId: string
): Promise<boolean> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { creatorId: true },
  });

  return project?.creatorId === creatorId;
}

/**
 * Get all collaborators for a project
 */
export async function getProjectCollaborators(projectId: string) {
  return db.projectCollaborator.findMany({
    where: { projectId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      addedAt: 'asc',
    },
  });
}
