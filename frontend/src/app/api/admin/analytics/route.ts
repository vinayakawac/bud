import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const [
      totalProjects,
      publicProjects,
      totalRatings,
      totalMessages,
      recentProjects,
      recentRatings,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { isPublic: true } }),
      prisma.rating.count(),
      prisma.contactMessage.count(),
      prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.rating.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const ratings = await prisma.rating.findMany();
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        projects: {
          total: totalProjects,
          public: publicProjects,
          recent: recentProjects,
        },
        ratings: {
          total: totalRatings,
          average: Number(averageRating.toFixed(2)),
          recent: recentRatings,
        },
        messages: {
          total: totalMessages,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch analytics',
      },
      { status: 500 }
    );
  }
}
