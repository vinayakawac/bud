import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

// POST /api/creator/accept-terms - Accept terms and conditions
export async function POST(request: NextRequest) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const creator = await db.creator.findUnique({
      where: { id: creatorPayload.creatorId },
    });

    if (!creator) {
      return error('Creator not found', 404);
    }

    if (creator.termsAcceptedAt) {
      return error('Terms already accepted', 400);
    }

    const updatedCreator = await db.creator.update({
      where: { id: creatorPayload.creatorId },
      data: {
        termsAcceptedAt: new Date(),
      },
    });

    return success({
      message: 'Terms accepted successfully',
      termsAcceptedAt: updatedCreator.termsAcceptedAt,
    });
  } catch (err: any) {
    console.error('POST /api/creator/accept-terms error:', err);
    return error(`Failed to accept terms: ${err.message}`, 500);
  }
}
