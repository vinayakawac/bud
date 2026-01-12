import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/auth';
import { db } from '@/lib/server/db';

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

    const creators = await db.creator.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedCreators = creators.map((creator) => ({
      id: creator.id,
      name: creator.name,
      email: creator.email,
      isActive: creator.isActive,
      projectCount: creator._count.projects,
      createdAt: creator.createdAt,
    }));

    return NextResponse.json({ creators: formattedCreators });
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}
