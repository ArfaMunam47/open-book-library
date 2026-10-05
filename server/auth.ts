import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'open-book-library-secret-2026';
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateToken(role: string = 'admin'): string {
  const timestamp = Date.now();
  const payload = `${role}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifyToken(token: string): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [role, timestampStr, signature] = decoded.split(':');
    if (!role || !timestampStr || !signature) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_MAX_AGE_MS) {
      return false; // expired
    }

    const payload = `${role}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (err) {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const inputBuffer = Buffer.from(password);
  const targetBuffer = Buffer.from(ADMIN_PASSWORD);
  if (inputBuffer.length !== targetBuffer.length) {
    // avoid timing leaks while comparing
    crypto.timingSafeEqual(inputBuffer, inputBuffer);
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, targetBuffer);
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  // Check authorization header
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (!token || !verifyToken(token)) {
    res.status(401).json({
      error: 'Unauthorized: Administrator access required. Please log in.'
    });
    return;
  }

  next();
}
