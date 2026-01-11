import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    authenticateAdmin(request);

    const [totalProjects, publicProjects, totalRatings, totalMessages] =
      await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { isPublic: true } }),
        prisma.rating.count(),
        prisma.contactMessage.count(),
      ]);

    const ratings = await prisma.rating.findMany({
      select: { rating: true },
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

    return successResponse({
      totalProjects,
      publicProjects,
      draftProjects: totalProjects - publicProjects,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalMessages,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error fetching analytics:', error);
    return errorResponse('Failed to fetch analytics', 500);
  }
}
