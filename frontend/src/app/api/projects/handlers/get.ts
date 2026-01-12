import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { success, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const tech = searchParams.get('tech');
    const year = searchParams.get('year');

    const where: any = { isPublic: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (tech && tech !== 'all') {
      where.techStack = { contains: tech };
    }

    if (year && year !== 'all') {
      const yearNum = parseInt(year);
      where.createdAt = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`),
      };
    }

    const projects = await db.project.findMany({
      where,
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
    console.error('GET /api/projects error:', err);
    return serverError();
  }
}
