import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const [totalProjects, publicProjects, totalRatings, totalMessages] = await Promise.all([
      db.project.count(),
      db.project.count({ where: { isPublic: true } }),
      db.rating.count(),
      db.contactMessage.count(),
    ]);

    const ratings = await db.rating.findMany({ select: { rating: true } });
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      : 0;

    return success({
      totalProjects,
      publicProjects,
      draftProjects: totalProjects - publicProjects,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalMessages,
    });
  } catch (err) {
    console.error('GET /api/admin/analytics error:', err);
    return serverError();
  }
}
