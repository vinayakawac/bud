import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

// GET /api/creator/projects - List creator's projects
export async function GET(request: NextRequest) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    // Verify terms accepted
    const creator = await db.creator.findUnique({
      where: { id: creatorPayload.creatorId },
    });

    if (!creator?.termsAcceptedAt) {
      return error('Terms must be accepted before accessing dashboard', 403);
    }

    const projects = await db.project.findMany({
      where: { creatorId: creatorPayload.creatorId },
      orderBy: { createdAt: 'desc' },
    });

    return success({ projects });
  } catch (err: any) {
    console.error('GET /api/creator/projects error:', err);
    return error(`Failed to fetch projects: ${err.message}`, 500);
  }
}

// POST /api/creator/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    // Verify terms accepted
    const creator = await db.creator.findUnique({
      where: { id: creatorPayload.creatorId },
    });

    if (!creator?.termsAcceptedAt) {
      return error('Terms must be accepted before creating projects', 403);
    }

    const {
      title,
      description,
      techStack,
      category,
      previewImages,
      externalLink,
    } = await request.json();

    if (!title || !description || !techStack || !category) {
      return error('Title, description, tech stack, and category are required', 400);
    }

    const project = await db.project.create({
      data: {
        title,
        description,
        techStack: JSON.stringify(techStack), // Ensure array is stored as JSON
        category,
        previewImages: JSON.stringify(previewImages || []), // Ensure array is stored as JSON
        externalLink: externalLink || '',
        creatorId: creatorPayload.creatorId,
      },
    });

    return success({ project }, 201);
  } catch (err: any) {
    console.error('POST /api/creator/projects error:', err);
    return error(`Failed to create project: ${err.message}`, 500);
  }
}
