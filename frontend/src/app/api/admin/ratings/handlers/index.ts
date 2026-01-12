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

    return success(ratings);
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
