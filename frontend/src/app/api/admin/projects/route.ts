import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    authenticateAdmin(request);

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedProjects = projects.map((project) => ({
      ...project,
      techStack: JSON.parse(project.techStack as string),
      previewImages: JSON.parse(project.previewImages as string),
      metadata: project.metadata ? JSON.parse(project.metadata as string) : null,
    }));

    return successResponse(formattedProjects);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error fetching admin projects:', error);
    return errorResponse('Failed to fetch projects', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    authenticateAdmin(request);

    const data = await request.json();

    const project = await prisma.project.create({
      data: {
        ...data,
        techStack: JSON.stringify(data.techStack || []),
        previewImages: JSON.stringify(data.previewImages || []),
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    const formattedProject = {
      ...project,
      techStack: JSON.parse(project.techStack as string),
      previewImages: JSON.parse(project.previewImages as string),
      metadata: project.metadata ? JSON.parse(project.metadata as string) : null,
    };

    return successResponse(formattedProject, 201);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error creating project:', error);
    return errorResponse('Failed to create project', 500);
  }
}
