import { NextRequest } from 'next/server';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { db } from '@/lib/server/db';
import { error, success } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const creator = await authenticateCreator(request);
    if (!creator) {
      return error('Unauthorized', 401);
    }

    // Get all pending invitations for this creator
    const invites = await db.collaborationInvite.findMany({
      where: {
        receiverId: creator.creatorId,
        status: 'pending',
      },
      include: {
        sender: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get project details for each invite
    const invitesWithProjects = await Promise.all(
      invites.map(async (invite: any) => {
        const project = await db.project.findUnique({
          where: { id: invite.projectId },
          select: {
            id: true,
            title: true,
            category: true,
          },
        });

        return {
          id: invite.id,
          projectId: invite.projectId,
          projectTitle: project?.title || 'Unknown Project',
          projectCategory: project?.category,
          senderId: invite.sender.id,
          senderName: invite.sender.name,
          createdAt: invite.createdAt,
        };
      })
    );

    return success({ invites: invitesWithProjects });
  } catch (err) {
    console.error('Get invites error:', err);
    return error('Failed to fetch invitations', 500);
  }
}
