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

    // Fetch top-level comments with replies
    const comments = await db.comment.findMany({
      where: {
        parentId: null, // Only root comments
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                name: true,
              },
            },
          },
        },
        replies: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST endpoint for admin replies
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId, parentId, content } = await request.json();

    if (!projectId || !parentId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const reply = await db.comment.create({
      data: {
        projectId,
        parentId,
        authorType: 'admin',
        name: 'Admin',
        email: 'admin@system',
        content,
      },
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
