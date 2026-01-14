import { NextRequest } from 'next/server';
import { projectService } from '@/domain/project/service';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const project = await projectService.getProjectById(params.id);

    if (!project) {
      return serverError('Project not found');
    }

    return success(project);
  } catch (err) {
    console.error('GET /api/admin/projects/[id] error:', err);
    return serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const data = await request.json();

    const project = await projectService.adminUpdateProject(params.id, {
      title: data.title,
      description: data.description,
      techStack: data.techStack || [],
      category: data.category,
      previewImages: data.previewImages || [],
      externalLink: data.externalLink,
    });

    if (!project) {
      return serverError('Project not found');
    }

    return success(project);
  } catch (err) {
    console.error('PUT /api/admin/projects/[id] error:', err);
    return serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const deleted = await projectService.adminDeleteProject(params.id);

    if (!deleted) {
      return serverError('Project not found');
    }

    return success({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/admin/projects/[id] error:', err);
    return serverError();
  }
}
