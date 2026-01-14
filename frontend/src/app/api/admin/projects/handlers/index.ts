import { NextRequest } from 'next/server';
import { projectService } from '@/domain/project/service';
import { verifyToken } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return unauthorized();
    }

    const payload = verifyToken(token);
    
    if (payload.role !== 'admin') {
      return unauthorized();
    }

    // Admin sees ALL projects - no isPublic filter
    const projects = await projectService.getAllProjects();

    return success({ projects });
  } catch (err) {
    console.error('GET /api/admin/projects error:', err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return unauthorized();
    }

    const payload = verifyToken(token);
    
    if (payload.role !== 'admin') {
      return unauthorized();
    }

    const data = await request.json();

    const project = await projectService.createProject({
      title: data.title,
      description: data.description,
      techStack: data.techStack || [],
      category: data.category,
      previewImages: data.previewImages || [],
      externalLink: data.externalLink || '',
      creatorId: data.creatorId,
      isPublic: data.isPublic ?? false,
    });

    return success({ project }, 201);
  } catch (err) {
    console.error('POST /api/admin/projects error:', err);
    return serverError();
  }
}
