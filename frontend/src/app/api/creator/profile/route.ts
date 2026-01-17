import { NextRequest, NextResponse } from 'next/server';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { db } from '@/lib/server/db';

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authPayload = await authenticateCreator(request);
    if (!authPayload) {
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
    const updatedCreator = await db.creator.update({
      where: { id: authPayload.creatorId },
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
