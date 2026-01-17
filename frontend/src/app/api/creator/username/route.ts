import { NextRequest, NextResponse } from 'next/server';
import { verifyCreatorAuth } from '@/lib/server/creatorAuth';
import { prisma } from '@/lib/server/db';

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyCreatorAuth(request);
    if (!authResult.authenticated || !authResult.creatorId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username } = body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    // Check username format (alphanumeric, hyphens, underscores, 3-30 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username must be 3-30 characters and can only contain letters, numbers, hyphens, and underscores',
        },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUser = await prisma.creator.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== authResult.creatorId) {
      return NextResponse.json(
        { success: false, message: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Update username
    const updatedCreator = await prisma.creator.update({
      where: { id: authResult.creatorId },
      data: { username },
    });

    return NextResponse.json({
      success: true,
      data: { creator: updatedCreator },
    });
  } catch (error: any) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update username',
      },
      { status: 500 }
    );
  }
}
