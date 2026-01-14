import { NextRequest } from 'next/server';
import { authenticateCreator } from '@/lib/server/creatorAuth';
import { db } from '@/lib/server/db';
import { error, success } from '@/lib/server/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creator = await authenticateCreator(request);
    if (!creator) {
      return error('Unauthorized', 401);
    }

    const inviteId = params.id;
    const { action } = await request.json();

    if (!action || !['accept', 'reject'].includes(action)) {
      return error('Invalid action. Must be "accept" or "reject"', 400);
    }

    // Verify the invitation exists and is for this creator
    const invite = await db.collaborationInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return error('Invitation not found', 404);
    }

    if (invite.receiverId !== creator.creatorId) {
      return error('This invitation is not for you', 403);
    }

    if (invite.status !== 'pending') {
      return error(`Invitation already ${invite.status}`, 400);
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update invitation status
    await db.collaborationInvite.update({
      where: { id: inviteId },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    // If accepted, add collaborator to project
    if (action === 'accept') {
      await db.projectCollaborator.create({
        data: {
          projectId: invite.projectId,
          creatorId: creator.creatorId,
          role: 'collaborator',
        },
      });
    }

    return success({
      message: `Invitation ${newStatus}`,
      status: newStatus,
    });
  } catch (err) {
    console.error('Respond to invite error:', err);
    return error('Failed to respond to invitation', 500);
  }
}
