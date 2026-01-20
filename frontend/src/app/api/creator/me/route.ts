import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/server/db';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

// GET /api/creator/me - Get creator account info
export async function GET(request: NextRequest) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const creator = await db.creator.findUnique({
      where: { id: creatorPayload.creatorId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        isActive: true,
        termsAcceptedAt: true,
        createdAt: true,
        bio: true,
        pronouns: true,
        website: true,
        location: true,
        socialLinks: true,
        showLocalTime: true,
        timezone: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!creator) {
      return error('Creator not found', 404);
    }

    return success({
      creator: {
        ...creator,
        projectCount: creator._count.projects,
        termsAccepted: !!creator.termsAcceptedAt,
      },
    });
  } catch (err: any) {
    console.error('GET /api/creator/me error:', err);
    return error(`Failed to fetch account: ${err.message}`, 500);
  }
}

// PUT /api/creator/me - Update creator account
export async function PUT(request: NextRequest) {
  try {
    const creatorPayload = await authenticateCreator(request);

    if (!creatorPayload) {
      return error('Unauthorized', 401);
    }

    const { name, currentPassword, newPassword } = await request.json();

    const updateData: any = {};

    // Update name if provided
    if (name) {
      updateData.name = name;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const creator = await db.creator.findUnique({
        where: { id: creatorPayload.creatorId },
      });

      if (!creator) {
        return error('Creator not found', 404);
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        creator.passwordHash
      );

      if (!isPasswordValid) {
        return error('Current password is incorrect', 401);
      }

      if (newPassword.length < 8) {
        return error('New password must be at least 8 characters', 400);
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return error('No update data provided', 400);
    }

    const updatedCreator = await db.creator.update({
      where: { id: creatorPayload.creatorId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        termsAcceptedAt: true,
      },
    });

    return success({
      creator: {
        ...updatedCreator,
        termsAccepted: !!updatedCreator.termsAcceptedAt,
      },
    });
  } catch (err: any) {
    console.error('PUT /api/creator/me error:', err);
    return error(`Failed to update account: ${err.message}`, 500);
  }
}
