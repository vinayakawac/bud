import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface CreatorJWTPayload {
  creatorId: string;
  email: string;
  role: 'creator';
}

export function signCreatorToken(payload: Omit<CreatorJWTPayload, 'role'>): string {
  return jwt.sign({ ...payload, role: 'creator' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyCreatorToken(token: string): CreatorJWTPayload {
  const payload = jwt.verify(token, JWT_SECRET) as CreatorJWTPayload;
  
  // Ensure role is creator
  if (payload.role !== 'creator') {
    throw new Error('INVALID_ROLE');
  }
  
  return payload;
}

export async function authenticateCreator(request: NextRequest): Promise<CreatorJWTPayload | null> {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      return verifyCreatorToken(token);
    } catch {
      return null;
    }
  }
  
  // Check HTTP-only cookie
  const token = request.cookies.get('creator_token')?.value;
  if (!token) return null;
  
  try {
    return verifyCreatorToken(token);
  } catch {
    return null;
  }
}

export function createCreatorCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  return `creator_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
}

export function clearCreatorCookie(): string {
  return 'creator_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
}
