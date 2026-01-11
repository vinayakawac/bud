import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    authenticateAdmin(request);

    const data = await request.json();

    const contact = await prisma.contact.findFirst();

    if (!contact) {
      return errorResponse('Contact information not found', 404);
    }

    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: {
        ...data,
        socialLinks: data.socialLinks
          ? JSON.stringify(data.socialLinks)
          : contact.socialLinks,
      },
    });

    const formattedContact = {
      ...updated,
      socialLinks: updated.socialLinks
        ? JSON.parse(updated.socialLinks as string)
        : {},
    };

    return successResponse(formattedContact);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid token') {
      return errorResponse(error.message, 401);
    }
    console.error('Error updating contact:', error);
    return errorResponse('Failed to update contact information', 500);
  }
}
