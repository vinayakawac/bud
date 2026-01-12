import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { authenticateAdmin } from '@/lib/server/auth';
import { success, notFound, unauthorized, serverError } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    if (!auth) return unauthorized();

    const data = await request.json();
    const contact = await db.contact.findFirst();

    if (!contact) {
      return notFound('Contact information not found');
    }

    const updated = await db.contact.update({
      where: { id: contact.id },
      data: {
        ...data,
        socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : contact.socialLinks,
      },
    });

    const formatted = {
      ...updated,
      socialLinks: updated.socialLinks ? JSON.parse(updated.socialLinks as string) : {},
    };

    return success(formatted);
  } catch (err) {
    console.error('PUT /api/admin/contact error:', err);
    return serverError();
  }
}
