import { NextRequest } from 'next/server';
import { projectService } from '@/domain/project/service';
import { success, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    const category = searchParams.get('category');
    const tech = searchParams.get('tech');
    const yearParam = searchParams.get('year');
    
    const filters = {
      category: category || undefined,
      tech: tech || undefined,
      year: yearParam ? parseInt(yearParam) : undefined,
    };

    const projects = await projectService.getPublicProjects(filters);

    return success(projects);
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return serverError();
  }
}
