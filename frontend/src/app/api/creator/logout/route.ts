import { clearCreatorCookie } from '@/lib/server/creatorAuth';
import { success } from '@/lib/server/response';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = success({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', clearCreatorCookie());
  return response;
}
