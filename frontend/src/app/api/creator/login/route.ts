import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/server/db';
import { signCreatorToken, createCreatorCookie } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return error('Email and password are required', 400);
    }

    // Find creator
    const creator = await db.creator.findUnique({
      where: { email },
    });

    if (!creator) {
      return error('Invalid credentials', 401);
    }

    // Check if active
    if (!creator.isActive) {
      return error('Account is disabled', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, creator.passwordHash);

    if (!isPasswordValid) {
      return error('Invalid credentials', 401);
    }

    // Generate token
    const token = signCreatorToken({
      creatorId: creator.id,
      email: creator.email,
    });

    // Create response with cookie
    const response = success({
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        termsAccepted: !!creator.termsAcceptedAt,
      },
      token,
    });

    response.headers.set('Set-Cookie', createCreatorCookie(token));

    return response;
  } catch (err: any) {
    console.error('POST /api/creator/login error:', err);
    return error(`Login failed: ${err.message}`, 500);
  }
}
