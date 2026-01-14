import { NextRequest } from 'next/server';
import { creatorService } from '@/domain/creator/service';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creatorProfile = await creatorService.getProfileWithProjects(params.id);

    if (!creatorProfile) {
      return error('Creator not found', 404);
    }

    return success(creatorProfile);
  } catch (err: any) {
    console.error('GET /api/creators/[id] error:', err);
    return error(`Failed to fetch creator: ${err.message}`, 500);
  }
}
