import { NextRequest } from 'next/server';
import { projectService } from '@/domain/project/service';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

// GET /api/creator/projects/[id] - Get single project with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const project = await projectService.getCreatorProjectById(params.id, creatorPayload.creatorId);

    if (!project) {
      return error('Project not found', 404);
    }

    return success({ project });
  } catch (err: any) {
    console.error('GET /api/creator/projects/[id] error:', err);
    return error(`Failed to fetch project: ${err.message}`, 500);
  }
}

// PUT /api/creator/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const {
      title,
      description,
      techStack,
      category,
      previewImages,
      externalLink,
    } = await request.json();

    // Check if user has edit access
    const hasAccess = await projectService.canEditProject(params.id, creatorPayload.creatorId);
    if (!hasAccess) {
      return error('Forbidden: You do not have permission to edit this project', 403);
    }

    const project = await projectService.updateProject(params.id, creatorPayload.creatorId, {
      title,
      description,
      techStack,
      category,
      previewImages: previewImages || [],
      externalLink,
    });

    if (!project) {
      return error('Project not found', 404);
    }

    return success({ project });
  } catch (err: any) {
    console.error('PUT /api/creator/projects/[id] error:', err);
    return error(`Failed to update project: ${err.message}`, 500);
  }
}

// DELETE /api/creator/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    // Only primary creator can delete
    const isOwner = await projectService.isPrimaryCreator(params.id, creatorPayload.creatorId);
    if (!isOwner) {
      return error('Forbidden: Only the primary creator can delete this project', 403);
    }

    const deleted = await projectService.deleteProject(params.id, creatorPayload.creatorId);

    if (!deleted) {
      return error('Project not found', 404);
    }

    return success({ message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/creator/projects/[id] error:', err);
    return error(`Failed to delete project: ${err.message}`, 500);
  }
}
