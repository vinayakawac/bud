import { projectService } from '@/domain/project/service';
import { success, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [categories, technologies] = await Promise.all([
      projectService.getAvailableCategories(),
      projectService.getAvailableTechnologies(),
    ]);

    return success({ categories, technologies });
  } catch (err) {
    console.error('GET /api/projects/filter-options error:', err);
    return serverError();
  }
}
