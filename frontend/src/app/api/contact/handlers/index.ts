import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { success, error, notFound, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contact = await db.contact.findFirst();

    if (!contact) {
      return notFound('Contact information not found');
    }

    const formatted = {
      ...contact,
      socialLinks: contact.socialLinks ? JSON.parse(contact.socialLinks as string) : {},
    };

    return success(formatted);
  } catch (err) {
    console.error('GET /api/contact error:', err);
    return serverError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return error('All fields are required');
    }

    const contactMessage = await db.contactMessage.create({
      data: { name, email, message },
    });

    return success(contactMessage, 201);
  } catch (err) {
    console.error('POST /api/contact error:', err);
    return serverError();
  }
}
