import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creator = await db.creator.findUnique({
      where: { 
        id: params.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        // Fetch primary projects (where creator is the owner)
        projects: {
          where: { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            techStack: true,
            category: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        // Fetch collaboration projects
        collaborations: {
          select: {
            id: true,
            projectId: true,
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                techStack: true,
                category: true,
                createdAt: true,
                isPublic: true,
              },
            },
          },
        },
      },
    });

    if (!creator) {
      return error('Creator not found', 404);
    }

    // Format the response - filter out non-public collaboration projects
    const formatted = {
      id: creator.id,
      name: creator.name,
      primaryProjects: creator.projects.map((p: any) => ({
        ...p,
        techStack: JSON.parse(p.techStack as string),
      })),
      collaborationProjects: creator.collaborations
        .map((c: any) => c.project)
        .filter((p: any) => p && p.isPublic)
        .map((p: any) => ({
          ...p,
          techStack: JSON.parse(p.techStack as string),
        })),
    };

    return success(formatted);
  } catch (err: any) {
    console.error('GET /api/creators/[id] error:', err);
    return error(`Failed to fetch creator: ${err.message}`, 500);
  }
}
