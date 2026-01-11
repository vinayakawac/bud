import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contact = await prisma.contact.findFirst();

    if (!contact) {
      return errorResponse('Contact information not found', 404);
    }

    const formattedContact = {
      ...contact,
      socialLinks: contact.socialLinks ? JSON.parse(contact.socialLinks as string) : {},
    };

    return successResponse(formattedContact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return errorResponse('Failed to fetch contact information', 500);
  }
}
