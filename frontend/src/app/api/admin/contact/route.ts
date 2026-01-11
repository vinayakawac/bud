import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const existingContact = await prisma.contact.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    // Convert socialLinks to JSON string
    const contactData: any = { ...body };
    if (contactData.socialLinks) {
      contactData.socialLinks = JSON.stringify(contactData.socialLinks);
    }

    let contact;

    if (existingContact) {
      contact = await prisma.contact.update({
        where: { id: existingContact.id },
        data: contactData,
      });
    } else {
      contact = await prisma.contact.create({
        data: {
          email: contactData.email || '',
          phone: contactData.phone || null,
          socialLinks: contactData.socialLinks || JSON.stringify({}),
        },
      });
    }

    // Parse back for response
    const parsedContact = {
      ...contact,
      socialLinks: typeof contact.socialLinks === 'string' ? JSON.parse(contact.socialLinks) : contact.socialLinks,
    };

    return NextResponse.json({
      success: true,
      data: parsedContact,
    });
  } catch (error: any) {
    console.error('Error updating contact info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update contact information',
      },
      { status: 500 }
    );
  }
}
