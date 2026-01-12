import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const projects = await db.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = projects.map((p: any) => ({
      ...p,
      techStack: JSON.parse(p.techStack),
      previewImages: JSON.parse(p.previewImages),
      metadata: p.metadata ? JSON.parse(p.metadata) : null,
    }));

    return success(formatted);
  } catch (err) {
    console.error('GET /api/admin/projects error:', err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const data = await request.json();

    const project = await db.project.create({
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

    return success(formatted, 201);
  } catch (err) {
    console.error('POST /api/admin/projects error:', err);
    return serverError();
  }
}
