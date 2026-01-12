import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { verifyToken } from '@/lib/server/auth';
import { success, error, unauthorized, serverError } from '@/lib/server/response';

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

    // Project-centric view: ALL projects with optional ratings
    // Admin must see projects with 0 ratings
    const projects = await db.project.findMany({
      include: {
        creator: {
          select: {
            name: true,
          },
        },
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform into ratings view with aggregates
    const ratingsView = projects.map(project => {
      const projectRatings = project.ratings || [];
      const total = projectRatings.length;
      const average = total > 0 
        ? projectRatings.reduce((sum, r) => sum + r.rating, 0) / total 
        : null;
      
      return {
        projectId: project.id,
        projectTitle: project.title,
        creatorName: project.creator?.name || 'Admin',
        isPublic: project.isPublic,
        ratingsCount: total,
        averageRating: average,
        ratings: projectRatings,
      };
    });

    // Overall stats across all ratings
    const allRatings = projects.flatMap(p => p.ratings);
    const totalRatings = allRatings.length;
    const overallAverage = totalRatings > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    const distribution = allRatings.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return success({ 
      projects: ratingsView,
      stats: { 
        total: totalRatings, 
        average: overallAverage, 
        distribution 
      }
    });
  } catch (err) {
    console.error('GET /api/admin/ratings error:', err);
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return unauthorized();
    }

    const payload = verifyToken(token);
    
    if (payload.role !== 'admin') {
      return unauthorized();
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return error('Rating ID is required');
    }

    await db.rating.delete({ where: { id } });

    return success({ message: 'Rating deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/admin/ratings error:', err);
    return serverError();
  }
}
