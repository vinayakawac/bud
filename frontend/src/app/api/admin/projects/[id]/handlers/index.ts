import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const data = await request.json();

    const project = await db.project.update({
      where: { id: params.id },
      data: {
        ...data,
        techStack: JSON.stringify(data.techStack || []),
        previewImages: JSON.stringify(data.previewImages || []),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    const formatted = {
      ...project,
      techStack: JSON.parse(project.techStack as string),
      previewImages: JSON.parse(project.previewImages as string),
      metadata: project.metadata ? JSON.parse(project.metadata as string) : null,
    };

    return success(formatted);
  } catch (err) {
    console.error('PUT /api/admin/projects/[id] error:', err);
    return serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    await db.project.delete({ where: { id: params.id } });

    return success({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/admin/projects/[id] error:', err);
    return serverError();
  }
}
