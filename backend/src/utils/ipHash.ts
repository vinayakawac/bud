import crypto from 'crypto';

export const hashIP = (ip: string): string => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

export const getClientIP = (req: any): string => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
};
