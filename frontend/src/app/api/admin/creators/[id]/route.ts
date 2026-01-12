import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/auth';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { isActive } = await request.json();
    const { id } = params;

    const updatedCreator = await db.creator.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ creator: updatedCreator });
  } catch (error) {
    console.error('Error updating creator:', error);
    return NextResponse.json(
      { error: 'Failed to update creator' },
      { status: 500 }
    );
  }
}
