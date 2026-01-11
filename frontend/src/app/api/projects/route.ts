import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tech = searchParams.get('tech');
    const year = searchParams.get('year');

    const where: any = { isPublic: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (tech && tech !== 'all') {
      where.techStack = {
        contains: tech,
      };
    }

    if (year && year !== 'all') {
      where.createdAt = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${parseInt(year) + 1}-01-01`),
      };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      techStack: JSON.parse(project.techStack as string),
      previewImages: JSON.parse(project.previewImages as string),
      metadata: project.metadata ? JSON.parse(project.metadata as string) : null,
    }));

    return successResponse(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return errorResponse('Failed to fetch projects', 500);
  }
}
