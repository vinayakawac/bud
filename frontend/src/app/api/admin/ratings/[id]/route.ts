import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/auth';
import { db } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
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

    const { id } = params;

    await db.rating.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: 'Failed to delete rating' },
      { status: 500 }
    );
  }
}
