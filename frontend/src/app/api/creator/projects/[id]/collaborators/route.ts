import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';
import { getProjectCollaborators } from '@/lib/server/collaboration';

export const dynamic = 'force-dynamic';

// GET /api/creator/projects/[id]/collaborators - Get all collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const projectId = params.id;

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    if (!project) {
      return error('Project not found', 404);
    }

    // Only primary creator can view collaborators list
    if (project.creatorId !== creatorPayload.creatorId) {
      return error('Forbidden: Only the primary creator can view collaborators', 403);
    }

    const collaborators = await getProjectCollaborators(projectId);

    return success({ collaborators });
  } catch (err: any) {
    console.error('GET /api/creator/projects/[id]/collaborators error:', err);
    return error(`Failed to fetch collaborators: ${err.message}`, 500);
  }
}

// DELETE /api/creator/projects/[id]/collaborators?creatorId=xxx - Remove collaborator
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const projectId = params.id;
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('creatorId');

    if (!collaboratorId) {
      return error('Missing creatorId query parameter', 400);
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    if (!project) {
      return error('Project not found', 404);
    }

    // Only primary creator can remove collaborators
    if (project.creatorId !== creatorPayload.creatorId) {
      return error('Forbidden: Only the primary creator can remove collaborators', 403);
    }

    // Cannot remove yourself (the primary creator)
    if (collaboratorId === creatorPayload.creatorId) {
      return error('Cannot remove primary creator from project', 400);
    }

    // Remove the collaborator
    const deleted = await db.projectCollaborator.deleteMany({
      where: {
        projectId,
        creatorId: collaboratorId,
      },
    });

    if (deleted.count === 0) {
      return error('Collaborator not found', 404);
    }

    return success({ message: 'Collaborator removed successfully' });
  } catch (err: any) {
    console.error('DELETE /api/creator/projects/[id]/collaborators error:', err);
    return error(`Failed to remove collaborator: ${err.message}`, 500);
  }
}
