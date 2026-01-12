import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server/db';
import { verifyToken } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = request.cookies.get('admin_token')?.value;
    
    if (!authHeader?.startsWith('Bearer ') && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenToVerify = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : token;

    if (!tokenToVerify) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(tokenToVerify);
    
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    return NextResponse.json({
      projects: {
        total: totalProjects,
        public: publicProjects,
      },
      ratings: {
        total: totalRatings,
        average: Math.round(averageRating * 10) / 10,
      },
      messages: {
        total: totalMessages,
        unread: 0,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/analytics error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
