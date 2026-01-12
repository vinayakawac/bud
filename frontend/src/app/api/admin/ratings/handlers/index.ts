import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, error, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const ratings = await db.rating.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const total = ratings.length;
    const average = total > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;
    
    const distribution = ratings.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return success({ 
      ratings, 
      stats: { total, average, distribution }
    });
  } catch (err) {
    console.error('GET /api/admin/ratings error:', err);
    return serverError();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

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
