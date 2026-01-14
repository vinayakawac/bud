import { db } from '@/lib/server/db';
import { success, notFound, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id, isPublic: true },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        collaborators: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return notFound('Project not found');
    }

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

    const formatted = {
      ...project,
      techStack,
      previewImages,
      metadata,
    };

    return success(formatted);
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err);
    return serverError();
  }
}
