import { NextRequest } from 'next/server';
import { db } from '@/lib/server/db';
import { signToken } from '@/lib/server/auth';
import { success, error } from '@/lib/server/response';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return error('Server configuration error', 500);
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return error('Server configuration error', 500);
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return error('Email and password are required');
    }

    const admin = await db.admin.findUnique({ where: { email } });

    if (!admin) {
      return error('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isPasswordValid) {
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
  } catch (err: any) {
    console.error('POST /api/admin/login error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    return error(`Authentication failed: ${err.message}`, 500);
  }
}
