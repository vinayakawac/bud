import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const contact = await prisma.contact.findFirst();

    if (!contact) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact information not found',
        },
        { status: 404 }
      );
    }

    // Parse JSON string for PostgreSQL compatibility
    const parsedContact = {
      ...contact,
      socialLinks: typeof contact.socialLinks === 'string' ? JSON.parse(contact.socialLinks) : contact.socialLinks,
    };

    return NextResponse.json({
      success: true,
      data: parsedContact,
    });
  } catch (error: any) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch contact information',
      },
      { status: 500 }
    );
  }
}
