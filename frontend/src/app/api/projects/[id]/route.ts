import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        isPublic: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      );
    }

    // Parse JSON strings for PostgreSQL compatibility
    const parsedProject = {
      ...project,
      techStack: typeof project.techStack === 'string' ? JSON.parse(project.techStack) : project.techStack,
      previewImages: typeof project.previewImages === 'string' ? JSON.parse(project.previewImages) : project.previewImages,
      metadata: project.metadata && typeof project.metadata === 'string' ? JSON.parse(project.metadata) : project.metadata,
    };

    return NextResponse.json({
      success: true,
      data: parsedProject,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch project',
      },
      { status: 500 }
    );
  }
}
