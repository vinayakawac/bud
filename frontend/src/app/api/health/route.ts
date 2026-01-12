import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    database: !!process.env.DATABASE_URL,
    jwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'not set',
  };

  const allOk = checks.database && checks.jwtSecret;

  return NextResponse.json({
    status: allOk ? 'healthy' : 'unhealthy',
    checks,
    message: allOk 
      ? 'All environment variables are configured' 
      : 'Missing required environment variables',
  }, { 
    status: allOk ? 200 : 503 
  });
}
