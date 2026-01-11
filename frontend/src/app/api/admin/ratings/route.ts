import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    authenticateAdmin(request);

    const ratings = await prisma.rating.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(ratings);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error fetching ratings:', error);
    return errorResponse('Failed to fetch ratings', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    authenticateAdmin(request);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Rating ID is required', 400);
    }

    await prisma.rating.delete({
      where: { id },
    });

    return successResponse({ message: 'Rating deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error deleting rating:', error);
    return errorResponse('Failed to delete rating', 500);
  }
}
