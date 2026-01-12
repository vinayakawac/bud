import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
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

    const project = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return error('Project not found', 404);
    }

    // Verify ownership
    if (project.creatorId !== creatorPayload.creatorId) {
      return error('Forbidden: You do not own this project', 403);
    }

    // Parse JSON fields
    const formattedProject = {
      ...project,
      techStack: JSON.parse(project.techStack as string),
      previewImages: JSON.parse(project.previewImages as string),
      metadata: project.metadata ? JSON.parse(project.metadata as string) : null,
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

    // Verify ownership
    const existingProject = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return error('Project not found', 404);
    }

    if (existingProject.creatorId !== creatorPayload.creatorId) {
      return error('Forbidden: You do not own this project', 403);
    }

    const project = await db.project.update({
      where: { id: params.id },
      data: {
        title,
        description,
        techStack,
        category,
        previewImages,
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

    // Verify ownership
    const existingProject = await db.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return error('Project not found', 404);
    }

    if (existingProject.creatorId !== creatorPayload.creatorId) {
      return error('Forbidden: You do not own this project', 403);
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
