import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
