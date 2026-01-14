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

    const formatted = {
      ...project,
      techStack: JSON.parse(project.techStack as string),
      previewImages: JSON.parse(project.previewImages as string),
      metadata: project.metadata ? JSON.parse(project.metadata as string) : null,
    };

    return success(formatted);
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err);
    return serverError();
  }
}
