import { NextRequest, NextResponse } from 'next/server';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const creator = await authenticateCreator(request);

    if (!creator) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all comments for this creator's projects
    const comments = await db.comment.findMany({
      where: {
        project: {
          creatorId: creator.creatorId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      comments,
    });
  } catch (error) {
    console.error('Error fetching creator comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
