import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const project = await prisma.project.findUnique({
      where: { id: params.id },
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

    // Convert arrays/objects to JSON strings if present
    const updateData: any = { ...body };
    if (updateData.techStack) {
      updateData.techStack = JSON.stringify(updateData.techStack);
    }
    if (updateData.previewImages) {
      updateData.previewImages = JSON.stringify(updateData.previewImages);
    }
    if (updateData.metadata) {
      updateData.metadata = JSON.stringify(updateData.metadata);
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
    });

    // Parse back for response
    const parsedProject = {
      ...updatedProject,
      techStack: JSON.parse(updatedProject.techStack),
      previewImages: JSON.parse(updatedProject.previewImages),
      metadata: updatedProject.metadata ? JSON.parse(updatedProject.metadata) : null,
    };

    return NextResponse.json({
      success: true,
      data: parsedProject,
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update project',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
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

    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete project',
      },
      { status: 500 }
    );
  }
}
