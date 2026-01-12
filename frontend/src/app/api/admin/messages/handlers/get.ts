import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return success(messages);
  } catch (err) {
    console.error('GET /api/admin/messages error:', err);
    return serverError();
  }
}
