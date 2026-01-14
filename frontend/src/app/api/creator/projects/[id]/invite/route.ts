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

    const projectId = params.id;
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return error('Email is required', 400);
    }

    // Verify the project exists and user is the primary creator
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true, title: true },
    });

    if (!project) {
      return error('Project not found', 404);
    }

    if (project.creatorId !== creator.creatorId) {
      return error('Only the primary creator can invite collaborators', 403);
    }

    // Find the creator to invite by email
    const invitee = await db.creator.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (!invitee) {
      return error('Creator not found with that email', 404);
    }

    if (!invitee.isActive) {
      return error('This creator account is not active', 400);
    }

    // Cannot invite yourself
    if (invitee.id === creator.creatorId) {
      return error('Cannot invite yourself as a collaborator', 400);
    }

    // Check if already a collaborator
    const existingCollaborator = await db.projectCollaborator.findUnique({
      where: {
        projectId_creatorId: {
          projectId,
          creatorId: invitee.id,
        },
      },
    });

    if (existingCollaborator) {
      return error('This creator is already a collaborator', 400);
    }

    // Check for existing pending invitation
    const existingInvite = await db.collaborationInvite.findUnique({
      where: {
        projectId_receiverId: {
          projectId,
          receiverId: invitee.id,
        },
      },
    });

    if (existingInvite) {
      if (existingInvite.status === 'pending') {
        return error('Invitation already sent to this creator', 400);
      }
      // If rejected before, update to pending
      await db.collaborationInvite.update({
        where: { id: existingInvite.id },
        data: {
          status: 'pending',
          respondedAt: null,
        },
      });
      return success({ 
        message: 'Invitation re-sent',
        invite: { id: existingInvite.id, receiverName: invitee.name },
      });
    }

    // Create new invitation
    const invite = await db.collaborationInvite.create({
      data: {
        projectId,
        senderId: creator.creatorId,
        receiverId: invitee.id,
        status: 'pending',
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return success({
      message: 'Invitation sent successfully',
      invite: {
        id: invite.id,
        receiverId: invite.receiver.id,
        receiverName: invite.receiver.name,
        receiverEmail: invite.receiver.email,
        createdAt: invite.createdAt,
      },
    });
  } catch (err) {
    console.error('Invite collaborator error:', err);
    return error('Failed to send invitation', 500);
  }
}
