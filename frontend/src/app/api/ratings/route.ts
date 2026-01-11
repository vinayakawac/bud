import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, feedback } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating must be between 1 and 5',
        },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check if user has already rated today
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
      return NextResponse.json(
        {
          success: false,
          error: 'You have already submitted a rating today',
        },
        { status: 429 }
      );
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        feedback: feedback || null,
        ipHash,
      },
    });

    return NextResponse.json({
      success: true,
      data: newRating,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit rating',
      },
      { status: 500 }
    );
  }
}
