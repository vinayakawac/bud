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

export async function GET(request: NextRequest) {
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

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON strings
    const parsedProjects = projects.map(project => ({
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

export async function POST(request: NextRequest) {
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

    // Convert arrays/objects to JSON strings
    const projectData = {
      ...body,
      techStack: JSON.stringify(body.techStack),
      previewImages: JSON.stringify(body.previewImages),
      metadata: body.metadata ? JSON.stringify(body.metadata) : '{}',
    };

    const project = await prisma.project.create({
      data: projectData,
    });

    // Parse back for response
    const parsedProject = {
      ...project,
      techStack: JSON.parse(project.techStack),
      previewImages: JSON.parse(project.previewImages),
      metadata: project.metadata ? JSON.parse(project.metadata) : null,
    };

    return NextResponse.json({
      success: true,
      data: parsedProject,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create project',
      },
      { status: 500 }
    );
  }
}
