import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { signToken } from '@/lib/server/auth';
import { success, error, serverError } from '@/lib/server/response';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return error('Email and password are required');
    }

    const admin = await db.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return error('Invalid credentials', 401);
    }

    const token = signToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return success({
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error('POST /api/admin/login error:', err);
    return serverError();
  }
}
