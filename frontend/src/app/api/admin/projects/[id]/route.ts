import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    authenticateAdmin(request);

    const data = await request.json();

    const project = await prisma.project.update({
      where: { id: params.id },
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

    return successResponse(formattedProject);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error updating project:', error);
    return errorResponse('Failed to update project', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    authenticateAdmin(request);

    await prisma.project.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Project deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error deleting project:', error);
    return errorResponse('Failed to delete project', 500);
  }
}
