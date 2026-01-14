import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';
import { canEditProject, isPrimaryCreator } from '@/lib/server/collaboration';

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

    const project = await db.project.findUnique({
      where: { id: params.id },
      include: {
        collaborators: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return error('Project not found', 404);
    }

    // Verify access (owner or collaborator)
    const hasAccess = await canEditProject(params.id, creatorPayload.creatorId);
    if (!hasAccess) {
      return error('Forbidden: You do not have access to this project', 403);
    }

    // Parse JSON fields with safe fallbacks
    let techStack, previewImages, metadata;
    try {
      techStack = JSON.parse(project.techStack as string);
    } catch {
      techStack = Array.isArray(project.techStack) ? project.techStack : [project.techStack];
    }
    try {
      previewImages = JSON.parse(project.previewImages as string);
    } catch {
      previewImages = Array.isArray(project.previewImages) ? project.previewImages : [];
    }
    try {
      metadata = project.metadata ? JSON.parse(project.metadata as string) : null;
    } catch {
      metadata = null;
    }

    const formattedProject = {
      ...project,
      techStack,
      previewImages,
      metadata,
    };

    return success({ project: formattedProject });
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

    // Verify project exists
    const existingProject = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return error('Project not found', 404);
    }

    // Check if user has edit access (owner or collaborator)
    const hasAccess = await canEditProject(params.id, creatorPayload.creatorId);
    if (!hasAccess) {
      return error('Forbidden: You do not have permission to edit this project', 403);
    }

    const project = await db.project.update({
      where: { id: params.id },
      data: {
        title,
        description,
        techStack: JSON.stringify(techStack), // Ensure array is stored as JSON
        category,
        previewImages: JSON.stringify(previewImages || []), // Ensure array is stored as JSON
        externalLink,
      },
    });

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

    // Verify project exists
    const existingProject = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return error('Project not found', 404);
    }

    // Only primary creator can delete
    const isOwner = await isPrimaryCreator(params.id, creatorPayload.creatorId);
    if (!isOwner) {
      return error('Forbidden: Only the primary creator can delete this project', 403);
    }

    await db.project.delete({
      where: { id: params.id },
    });

    return success({ message: 'Project deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/creator/projects/[id] error:', err);
    return error(`Failed to delete project: ${err.message}`, 500);
  }
}
