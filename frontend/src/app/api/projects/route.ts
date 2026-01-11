import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tech = searchParams.get('tech');
    const year = searchParams.get('year');

    const where: any = { isPublic: true };

    if (category) {
      where.category = category;
    }

    if (tech) {
      where.techStack = {
        contains: tech,
      };
    }

    if (year) {
      const yearNum = parseInt(year, 10);
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum + 1, 0, 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        techStack: true,
        category: true,
        previewImages: true,
        externalLink: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse JSON strings for PostgreSQL compatibility
    const parsedProjects = projects.map((project: any) => ({
      ...project,
      techStack: typeof project.techStack === 'string' ? JSON.parse(project.techStack) : project.techStack,
      previewImages: typeof project.previewImages === 'string' ? JSON.parse(project.previewImages) : project.previewImages,
      metadata: project.metadata && typeof project.metadata === 'string' ? JSON.parse(project.metadata) : project.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: parsedProjects,
      count: parsedProjects.length,
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}
