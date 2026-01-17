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
    const {
      name,
      bio,
      pronouns,
      website,
      location,
      socialLinks,
      showLocalTime,
      timezone
    } = body;

    // Update creator profile
    const updatedCreator = await prisma.creator.update({
      where: { id: authResult.creatorId },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        pronouns: pronouns || undefined,
        website: website || undefined,
        location: location || undefined,
        socialLinks: socialLinks || undefined,
        showLocalTime: showLocalTime ?? undefined,
        timezone: timezone || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: { creator: updatedCreator },
    });
  } catch (error: any) {
    console.error('Error updating creator profile:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
