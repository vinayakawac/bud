import { projectService } from '@/domain/project/service';
import { success, notFound, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await projectService.getPublicProjectById(params.id);

    if (!project) {
      return notFound('Project not found');
    }

    return success(project);
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err);
    return serverError();
  }
}
