import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { hashIP, getClientIP } from '@/lib/utils/hash';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { rating, feedback } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if user already rated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRating = await prisma.rating.findFirst({
      where: {
        ipHash,
        createdAt: {
          gte: today,
        },
      },
    });

    if (existingRating) {
      return errorResponse('You have already submitted a rating today', 429);
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        feedback: feedback || null,
        ipHash,
      },
    });

    return successResponse(newRating, 201);
  } catch (error) {
    console.error('Error creating rating:', error);
    return errorResponse('Failed to submit rating', 500);
  }
}
