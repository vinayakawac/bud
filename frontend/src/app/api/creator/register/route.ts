import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/server/db';
import { signCreatorToken, createCreatorCookie } from '@/lib/server/creatorAuth';
import { success, error } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, username } = await request.json();

    if (!name || !email || !password || !username) {
      return error('Name, email, username, and password are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error('Invalid email format', 400);
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return error('Username must be 3-30 characters and can only contain letters, numbers, hyphens, and underscores', 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return error('Password must be at least 8 characters', 400);
    }

    // Check if email already exists
    const existingCreator = await db.creator.findUnique({
      where: { email },
    });

    if (existingCreator) {
      return error('Email already registered', 409);
    }

    // Check if username already exists
    const existingUsername = await db.creator.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return error('Username already taken', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create creator
    const creator = await db.creator.create({
      data: {
        name,
        email,
        username,
        passwordHash,
        isActive: true,
      },
    });

    // Generate token
    const token = signCreatorToken({
      creatorId: creator.id,
      email: creator.email,
    });

    // Create response with cookie
    const response = success(
      {
        creator: {
          id: creator.id,
          name: creator.name,
          email: creator.email,
          termsAccepted: !!creator.termsAcceptedAt,
        },
        token,
      },
      201
    );

    response.headers.set('Set-Cookie', createCreatorCookie(token));

    return response;
  } catch (err: any) {
    console.error('POST /api/creator/register error:', err);
    return error(`Registration failed: ${err.message}`, 500);
  }
}
