import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { success, error, serverError } from '@/lib/server/response';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, feedback } = body;

    if (!rating || rating < 1 || rating > 5) {
      return error('Rating must be between 1 and 5');
    }

    const ipHash = hashIP(getClientIP(request));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db.rating.findFirst({
      where: { ipHash, createdAt: { gte: today } },
    });

    if (existing) {
      return error('You have already submitted a rating today', 429);
    }

    const newRating = await db.rating.create({
      data: { rating, feedback: feedback || null, ipHash },
    });

    return success(newRating, 201);
  } catch (err) {
    console.error('POST /api/ratings error:', err);
    return serverError();
  }
}
