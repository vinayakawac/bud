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

    // Get IP address and hash it
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const crypto = require('crypto');
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const contactMessage = await db.contactMessage.create({
      data: { name, email, message, ipHash },
    });

    return success(contactMessage, 201);
  } catch (err) {
    console.error('POST /api/contact error:', err);
    return serverError();
  }
}
